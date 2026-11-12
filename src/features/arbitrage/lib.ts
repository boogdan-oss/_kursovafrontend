import type { HistoryItem, OpportunityHistoryItem, OpportunityItem } from '@/shared/api/types'
import { formatCrypto, formatFiat, formatNumber, plural } from '@/shared/lib/format'
import type { BadgeProps } from '@/shared/ui/badge'
import { exchangeName } from '@/shared/ui/exchange-label'
import type { TagTone } from '@/shared/ui/tag'

export type Kind = OpportunityItem['kind']
export type KindFilter = Kind | 'all'
export type Period = 'day' | 'week' | 'month'

export const KIND_FILTERS: KindFilter[] = ['all', 'cross_exchange', 'spread', 'chain']
export const PERIODS: Period[] = ['day', 'week', 'month']

export const KIND_LABELS: Record<Kind, string> = {
  cross_exchange: 'Міжбіржовий',
  spread: 'На біржі',
  chain: 'Ланцюжок',
}

export const KIND_BADGES: Record<Kind, BadgeProps['variant']> = {
  cross_exchange: 'accent',
  spread: 'neutral',
  chain: 'warning',
}

export const KIND_TAGS: Record<Kind, string> = {
  cross_exchange: 'Між біржами',
  spread: 'На біржі',
  chain: 'Ланцюжок',
}

export const KIND_TONES: Record<Kind, TagTone> = {
  cross_exchange: 'accent',
  spread: 'neutral',
  chain: 'warning',
}

export const KIND_TAB_LABELS: Record<KindFilter, string> = {
  all: 'Усі',
  cross_exchange: 'Між біржами',
  spread: 'На біржі',
  chain: 'Ланцюжки',
}

export const KIND_DESCRIPTIONS: Record<Kind, string> = {
  cross_exchange: 'міжбіржовий арбітраж',
  spread: 'спред усередині біржі',
  chain: 'ланцюжок угод',
}

export const PERIOD_LABELS: Record<Period, string> = {
  day: '24Г',
  week: '7Д',
  month: '30Д',
}

export const PERIOD_HOURS: Record<Period, number> = { day: 24, week: 168, month: 720 }

export const HISTORY_LIMIT = 500
export const ACTIVE_WINDOW_MS = 90_000

const STEP_FORMS = ['крок', 'кроки', 'кроків'] as const

type Route = Pick<OpportunityItem, 'kind' | 'asset' | 'buy_exchange' | 'sell_exchange'>

export function routeKey(item: Route) {
  return `${item.kind}:${item.asset}:${item.buy_exchange}:${item.sell_exchange}`
}

export function opportunityKey(item: OpportunityItem) {
  const steps = item.steps.map((step) => `${step.exchange}.${step.action}.${step.asset}`)
  return `${routeKey(item)}:${steps.join('>')}`
}

export interface Thresholds {
  minNet: number
  minAiScore: number
  minVolume: number | null
  liquidOnly: boolean
}

export function passesThresholds(item: OpportunityItem, thresholds: Thresholds) {
  const { minNet, minAiScore, minVolume, liquidOnly } = thresholds
  if (Number(item.net_spread_pct) < minNet) return false
  if (minAiScore > 0 && (item.ai_score ?? -1) < minAiScore) return false
  if (minVolume !== null && Number(item.max_volume) < minVolume) return false
  if (liquidOnly && item.investment != null) {
    return Number(item.max_volume) * Number(item.buy_price) >= Number(item.investment)
  }
  return true
}

export function usesExchanges(item: OpportunityItem, exchanges: readonly string[]) {
  return item.steps.every((step) => exchanges.includes(step.exchange))
}

export function involvesAsset(item: OpportunityItem, asset: string) {
  return item.steps.some((step) => step.asset === asset)
}

export function sortByNet<Item extends OpportunityItem>(items: Item[]) {
  return [...items].sort((a, b) => Number(b.net_spread_pct) - Number(a.net_spread_pct))
}

export function countByKind(items: OpportunityItem[]) {
  const counts: Record<KindFilter, number> = {
    all: items.length,
    cross_exchange: 0,
    spread: 0,
    chain: 0,
  }
  for (const item of items) counts[item.kind] += 1
  return counts
}

function historyEnd(item: OpportunityHistoryItem) {
  return new Date(item.detected_at).getTime() + (item.duration_sec ?? 0) * 1000
}

export function isStillActive(item: OpportunityHistoryItem, now: number) {
  return now - historyEnd(item) <= ACTIVE_WINDOW_MS
}

export function activeStarts(history: OpportunityHistoryItem[], now: number) {
  const starts = new Map<string, number>()
  for (const item of history) {
    const key = routeKey(item)
    if (!starts.has(key) && isStillActive(item, now)) {
      starts.set(key, new Date(item.detected_at).getTime())
    }
  }
  return starts
}

export function startsByOpportunity(items: OpportunityItem[], starts: Map<string, number>) {
  const result = new Map<string, number>()
  const seen = new Set<string>()
  for (const item of sortByNet(items)) {
    const route = routeKey(item)
    const start = starts.get(route)
    if (start !== undefined && !seen.has(route)) result.set(opportunityKey(item), start)
    seen.add(route)
  }
  return result
}

export function assetPath(item: OpportunityItem) {
  const path: string[] = []
  for (const step of item.steps) {
    if (path[path.length - 1] !== step.asset) path.push(step.asset)
  }
  return path
}

export function routeSummary(item: OpportunityItem) {
  const buy = formatNumber(item.buy_price, { minDigits: 2 })
  const sell = formatFiat(item.sell_price, item.fiat)
  if (item.kind === 'spread') return `купівля ${buy} → продаж ${sell}`
  if (item.kind === 'cross_exchange') return `${buy} → ${sell}`

  const path = assetPath(item)
  const count = item.steps.length
  const steps = `${count} ${plural(count, STEP_FORMS)}`
  return path.length > 1
    ? `${path.join(' → ')} · ${steps}`
    : `${path[0]} через іншу валюту · ${steps}`
}

export function formatVolume(value: string | number | null | undefined, asset: string) {
  const digits = Math.abs(Number(value)) >= 100 ? 0 : 4
  return formatCrypto(value, asset, { minDigits: 0, maxDigits: digits })
}

const CSV_COLUMNS: [string, (item: OpportunityItem) => string | number][] = [
  ['Тип', (item) => KIND_LABELS[item.kind]],
  ['Актив', (item) => item.asset],
  ['Фіат', (item) => item.fiat],
  ['Біржа купівлі', (item) => exchangeName(item.buy_exchange)],
  ['Біржа продажу', (item) => exchangeName(item.sell_exchange)],
  ['Ціна купівлі', (item) => item.buy_price],
  ['Ціна продажу', (item) => item.sell_price],
  ['Спред, %', (item) => item.spread_pct],
  ['Net, %', (item) => item.net_spread_pct],
  ['Прибуток', (item) => item.estimated_profit],
  ['Сума угоди', (item) => item.investment ?? ''],
  ['Обсяг', (item) => item.max_volume],
  ['RR', (item) => item.rr ?? ''],
  ['AI Score', (item) => item.ai_score ?? ''],
]

function csvCell(value: string | number) {
  const text = String(value)
  return /[";\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
}

export function toCsv(items: OpportunityItem[]) {
  const rows = [
    CSV_COLUMNS.map(([title]) => title),
    ...items.map((item) => CSV_COLUMNS.map(([, read]) => read(item))),
  ]
  return rows.map((row) => row.map(csvCell).join(';')).join('\n')
}

export function downloadCsv(filename: string, csv: string) {
  const bom = String.fromCharCode(0xfeff)
  const url = URL.createObjectURL(new Blob([bom, csv], { type: 'text/csv;charset=utf-8' }))
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}

export interface SpreadPoint {
  time: string
  value: number
}

export function spreadSeries(buy: HistoryItem[], sell: HistoryItem[]): SpreadPoint[] {
  const sellByTime = new Map(sell.map((item) => [item.time, item.sell_price]))
  const points: SpreadPoint[] = []
  for (const item of buy) {
    const buyPrice = Number(item.buy_price)
    const sellPrice = Number(sellByTime.get(item.time))
    if (!item.buy_price || !buyPrice || !Number.isFinite(sellPrice) || !sellPrice) continue
    points.push({ time: item.time, value: ((sellPrice - buyPrice) / buyPrice) * 100 })
  }
  return points
}
