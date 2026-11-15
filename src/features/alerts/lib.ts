import type { AlertChannel, AlertRule, AlertRuleInput } from '@/shared/api/types'
import { formatNumber } from '@/shared/lib/format'
import { exchangeName } from '@/shared/ui/exchange-label'

export const CHANNELS: AlertChannel[] = ['in_app', 'telegram', 'email']

export const CHANNEL_LABELS: Record<AlertChannel, string> = {
  in_app: 'У застосунку',
  telegram: 'Telegram',
  email: 'Email',
}

export const CHANNEL_TAGS: Record<AlertChannel, string> = {
  in_app: 'App',
  telegram: 'Telegram',
  email: 'Email',
}

export const ANY_EXCHANGE = 'any'
export const TITLE_MAX = 100

export interface RuleDraft {
  asset: string
  fiat: string
  exchange: string
  minSpread: number | null
  minNetSpread: number | null
  minAiScore: number | null
  title: string
}

export function emptyDraft(asset: string, fiat: string): RuleDraft {
  return {
    asset,
    fiat,
    exchange: ANY_EXCHANGE,
    minSpread: null,
    minNetSpread: null,
    minAiScore: null,
    title: '',
  }
}

export function hasThreshold(draft: RuleDraft) {
  return draft.minSpread !== null || draft.minNetSpread !== null || draft.minAiScore !== null
}

export function draftToInput(draft: RuleDraft, channels: AlertChannel[]): AlertRuleInput {
  return {
    asset: draft.asset,
    fiat: draft.fiat,
    exchange: draft.exchange === ANY_EXCHANGE ? null : draft.exchange,
    title: draft.title.trim() || null,
    min_spread: draft.minSpread === null ? null : String(draft.minSpread),
    min_net_spread: draft.minNetSpread === null ? null : String(draft.minNetSpread),
    min_ai_score: draft.minAiScore,
    channels,
    enabled: true,
  }
}

export function pairText(item: { asset: string; fiat: string; exchange?: string | null }) {
  const where = item.exchange ? exchangeName(item.exchange) : 'усі біржі'
  return `${item.asset}/${item.fiat} · ${where}`
}

export function ruleConditions(rule: AlertRule) {
  const percent = (value: string) => `${formatNumber(value, { maxDigits: 2 })}%`
  const parts: string[] = []
  if (rule.min_spread != null) parts.push(`Спред ≥ ${percent(rule.min_spread)}`)
  if (rule.min_net_spread != null) parts.push(`Net ≥ ${percent(rule.min_net_spread)}`)
  if (rule.min_ai_score != null) parts.push(`AI Score ≥ ${rule.min_ai_score}`)
  if (rule.min_rr != null) parts.push(`RR ≥ ${formatNumber(rule.min_rr, { maxDigits: 2 })}`)
  if (rule.min_net_profit != null) {
    parts.push(`Прибуток ≥ ${formatNumber(rule.min_net_profit, { maxDigits: 0 })} ${rule.fiat}`)
  }
  return parts
}

export function ruleTitle(rule: AlertRule) {
  return rule.title?.trim() || pairText(rule)
}

export function samePair(
  a: { asset: string; fiat: string; exchange?: string | null },
  b: { asset: string; fiat: string; exchange?: string | null },
) {
  return a.asset === b.asset && a.fiat === b.fiat && (a.exchange ?? null) === (b.exchange ?? null)
}
