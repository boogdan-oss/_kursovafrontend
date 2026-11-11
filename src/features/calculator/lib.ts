import type { DealRequest } from '@/shared/api/queries/calculator'
import type { CalculatorResponse } from '@/shared/api/types'

export type Mode = 'market' | 'manual'

export const MODES: Mode[] = ['manual', 'market']

export const MODE_LABELS: Record<Mode, string> = {
  manual: 'Калькулятор',
  market: 'Симулятор угоди',
}

export const MIN_RR_OPTIONS = [1, 1.5, 2, 3]
export const DEFAULT_MIN_RR = 2
export const DEFAULT_ADVERSE_MOVE_PCT = 0.5

export interface CalculatorForm {
  mode: Mode
  asset: string
  fiat: string
  buyExchange: string | null
  sellExchange: string | null
  investment: number | null
  buyPrice: number | null
  sellPrice: number | null
  payment: string | null
  extraFees: number | null
  adverseMove: number | null
  minRr: number
}

type BuildResult =
  { request: DealRequest; error?: undefined } | { request?: undefined; error: string }

export function buildRequest(form: CalculatorForm): BuildResult {
  if (form.investment === null) return { error: 'Вкажіть суму інвестиції' }
  const market = form.mode === 'market'
  if (market && (!form.buyExchange || !form.sellExchange)) {
    return { error: 'Для ринкових цін оберіть біржі купівлі й продажу' }
  }
  if (!market && (form.buyPrice === null || form.sellPrice === null)) {
    return { error: 'Вкажіть ціни купівлі й продажу або перейдіть у «Симулятор угоди»' }
  }

  return {
    request: {
      asset: form.asset,
      fiat: form.fiat,
      investment: form.investment,
      buy_exchange: form.buyExchange,
      sell_exchange: form.sellExchange,
      buy_price: market ? null : form.buyPrice,
      sell_price: market ? null : form.sellPrice,
      payment: market ? form.payment : null,
      extra_fees: form.extraFees ?? 0,
      adverse_move_pct: form.adverseMove ?? DEFAULT_ADVERSE_MOVE_PCT,
    },
  }
}

export interface FeePart {
  key: 'trade' | 'withdrawal' | 'extra'
  label: string
  value: number
  share: number
}

export function feeBreakdown({ deal }: CalculatorResponse, extraFees: number): FeePart[] {
  const total = Number(deal.fees)
  const withdrawal = (Number(deal.quantity) - Number(deal.sell_quantity)) * Number(deal.sell_price)
  const extra = Math.min(extraFees, total)
  const trade = Math.max(0, total - withdrawal - extra)
  const parts: Omit<FeePart, 'share'>[] = [
    { key: 'trade', label: 'Біржа та P2P', value: trade },
    { key: 'withdrawal', label: 'Вивід і мережа', value: withdrawal },
    { key: 'extra', label: 'Додаткові', value: extra },
  ]
  return parts.map((part) => ({ ...part, share: total > 0 ? part.value / total : 0 }))
}

export function passesRisk(rr: string | null, minRr: number) {
  return rr !== null && Number(rr) >= minRr
}
