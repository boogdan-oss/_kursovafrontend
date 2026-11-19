import type { UserHit } from '@/shared/api/community-types'
import type { PairItem } from '@/shared/api/types'
import { EXCHANGES, type ExchangeCode } from '@/store/useFiltersStore'

export const POPULAR_ASSETS = ['USDT', 'BTC', 'ETH', 'USDC', 'BNB', 'SOL']
export const PAIR_LIMIT = 6
export const USER_QUERY_MIN = 2
export const PAIR_PAGES = ['/', '/offers', '/arbitrage']
export const RECENT_KEY = 'upars-recent-pairs'
const RECENT_LIMIT = 5
const EXCHANGE_PREFIX_MIN = 3

export interface PairContext {
  asset: string
  fiat: string
}

export interface ParsedQuery {
  words: string[]
  exchanges: ExchangeCode[]
  user: string | null
  usersOnly: boolean
}

export type SearchItem =
  | { kind: 'pair'; key: string; pair: PairItem; recent: boolean; scope: ExchangeCode[] }
  | { kind: 'exchange'; key: string; exchange: ExchangeCode; pairs: number }
  | { kind: 'user'; key: string; user: UserHit }

export function optionId(listId: string, index: number) {
  return `${listId}-${index}`
}

export function pairKey(pair: PairContext) {
  return `${pair.asset}/${pair.fiat}`
}

function matchExchange(token: string, currencies: ReadonlySet<string>) {
  if (currencies.has(token.toUpperCase())) return undefined
  const exact = EXCHANGES.find((code) => code === token)
  if (exact) return exact
  if (token.length < EXCHANGE_PREFIX_MIN) return undefined
  const matches = EXCHANGES.filter((code) => code.startsWith(token))
  return matches.length === 1 ? matches[0] : undefined
}

export function parseQuery(query: string, currencies: ReadonlySet<string>): ParsedQuery {
  const text = query.trim().toLowerCase()
  if (text.startsWith('@')) {
    const name = text.slice(1).trim()
    return {
      words: [],
      exchanges: [],
      user: name.length >= USER_QUERY_MIN ? name : null,
      usersOnly: true,
    }
  }

  const words: string[] = []
  const exchanges: ExchangeCode[] = []
  for (const token of text.split(/[\s/\\,|]+/).filter(Boolean)) {
    const exchange = matchExchange(token, currencies)
    if (!exchange) words.push(token)
    else if (!exchanges.includes(exchange)) exchanges.push(exchange)
  }
  const user = exchanges.length === 0 && text.length >= USER_QUERY_MIN ? text : null
  return { words, exchanges, user, usersOnly: false }
}

function codeScore(word: string, code: string) {
  const lower = code.toLowerCase()
  if (lower === word) return 4
  return lower.startsWith(word) ? 2 : 0
}

function both(first: number, second: number) {
  return first > 0 && second > 0 ? first + second : 0
}

function joinedScore(word: string, pair: PairItem) {
  const asset = pair.asset.toLowerCase()
  if (word.length <= asset.length || !word.startsWith(asset)) return 0
  return both(4, codeScore(word.slice(asset.length), pair.fiat))
}

function wordScore(words: string[], pair: PairItem) {
  if (words.length === 0) return 0
  if (words.length > 2) return null
  const [first, second] = words
  const score =
    second === undefined
      ? Math.max(
          codeScore(first, pair.asset),
          codeScore(first, pair.fiat),
          joinedScore(first, pair),
        )
      : Math.max(
          both(codeScore(first, pair.asset), codeScore(second, pair.fiat)),
          both(codeScore(first, pair.fiat), codeScore(second, pair.asset)),
        )
  return score > 0 ? score : null
}

function rank(pair: PairItem, base: number, context: PairContext) {
  let score = base + pair.exchanges.length / 2
  if (pair.fiat === context.fiat) score += 3
  if (pair.asset === context.asset) score += 1
  if (POPULAR_ASSETS.includes(pair.asset)) score += 2
  if (pair.collected) score += 2
  return score
}

export function searchPairs(
  pairs: PairItem[],
  parsed: ParsedQuery,
  context: PairContext,
  limit = PAIR_LIMIT,
) {
  if (parsed.usersOnly || (parsed.words.length === 0 && parsed.exchanges.length === 0)) return []
  const scored: { pair: PairItem; score: number }[] = []
  for (const pair of pairs) {
    if (parsed.exchanges.some((code) => !pair.exchanges.includes(code))) continue
    const base = wordScore(parsed.words, pair)
    if (base === null) continue
    scored.push({ pair, score: rank(pair, base, context) })
  }
  return scored
    .sort((a, b) => b.score - a.score || pairKey(a.pair).localeCompare(pairKey(b.pair)))
    .slice(0, limit)
    .map((item) => item.pair)
}

export function readRecentPairs(): string[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(RECENT_KEY) ?? '[]')
    if (!Array.isArray(saved)) return []
    return saved.filter((item): item is string => typeof item === 'string').slice(0, RECENT_LIMIT)
  } catch {
    return []
  }
}

export function rememberPair(pair: PairContext) {
  const key = pairKey(pair)
  try {
    const next = [key, ...readRecentPairs().filter((item) => item !== key)].slice(0, RECENT_LIMIT)
    localStorage.setItem(RECENT_KEY, JSON.stringify(next))
  } catch {
    return
  }
}

interface BuildInput {
  pairs: PairItem[]
  parsed: ParsedQuery
  context: PairContext
  users: UserHit[]
  recent: string[]
}

export function buildItems({ pairs, parsed, context, users, recent }: BuildInput): SearchItem[] {
  const empty = parsed.words.length === 0 && parsed.exchanges.length === 0 && !parsed.usersOnly
  if (empty) {
    const known = new Map(pairs.map((pair) => [pairKey(pair), pair]))
    return recent.map((key) => {
      const [asset = '', fiat = ''] = key.split('/')
      const pair = known.get(key) ?? { asset, fiat, exchanges: [], collected: true }
      return { kind: 'pair', key: `recent:${key}`, pair, recent: true, scope: [] }
    })
  }

  const exchanges: SearchItem[] = parsed.exchanges.map((exchange) => ({
    kind: 'exchange',
    key: `exchange:${exchange}`,
    exchange,
    pairs: pairs.filter((pair) => pair.exchanges.includes(exchange)).length,
  }))
  const found: SearchItem[] = searchPairs(pairs, parsed, context).map((pair) => ({
    kind: 'pair',
    key: `pair:${pairKey(pair)}`,
    pair,
    recent: false,
    scope: parsed.exchanges,
  }))
  const people: SearchItem[] = users.map((user) => ({
    kind: 'user',
    key: `user:${user.username}`,
    user,
  }))
  return [...exchanges, ...found, ...people]
}
