import type { HealthResponse, HistoryParams, MarketSnapshot } from '@/shared/api/types'

export type Range = 'hour' | 'day' | 'week' | 'month'

export const RANGES: Range[] = ['hour', 'day', 'week', 'month']

export const RANGE_LABELS: Record<Range, string> = {
  hour: '1Г',
  day: '24Г',
  week: '7Д',
  month: '30Д',
}

export const RANGE_DESCRIPTIONS: Record<Range, string> = {
  hour: 'останню годину',
  day: 'останні 24 години',
  week: 'останні 7 днів',
  month: 'останні 30 днів',
}

export const RANGE_CONFIG: Record<
  Range,
  { hours: number; interval: NonNullable<HistoryParams['interval']> }
> = {
  hour: { hours: 1, interval: '1m' },
  day: { hours: 24, interval: '15m' },
  week: { hours: 168, interval: '1h' },
  month: { hours: 720, interval: '1h' },
}

export const EXCHANGE_COLORS: Record<string, string> = {
  bybit: '#8B6CEF',
  binance: '#F0B90B',
  okx: '#8E8E8E',
  bitget: '#4CC38A',
  mexc: '#5B9BF0',
  htx: '#F06A6A',
}

export const FALLBACK_COLOR = '#DCDDDE'
export const ONLINE_MAX_AGE_SEC = 120

export function exchangePrices(items: MarketSnapshot[], bank: string | null) {
  return items
    .filter((item) => (item.payment_method ?? null) === bank)
    .sort((a, b) => Number(a.buy_price ?? Infinity) - Number(b.buy_price ?? Infinity))
}

export function bestPrices(rows: MarketSnapshot[]) {
  const buys = rows.flatMap((row) => (row.buy_price == null ? [] : [Number(row.buy_price)]))
  const sells = rows.flatMap((row) => (row.sell_price == null ? [] : [Number(row.sell_price)]))
  return {
    buy: buys.length ? Math.min(...buys) : null,
    sell: sells.length ? Math.max(...sells) : null,
  }
}

export function maxBy<Item>(items: Item[], read: (item: Item) => number | null | undefined) {
  let best: Item | undefined
  let bestValue = -Infinity
  for (const item of items) {
    const value = read(item)
    if (value != null && value > bestValue) {
      best = item
      bestValue = value
    }
  }
  return best
}

type ExchangeHealth = HealthResponse['exchanges'][number]

export function isOnline(exchange: ExchangeHealth) {
  return (
    exchange.status === 'active' &&
    exchange.limiter_state !== 'cooldown' &&
    exchange.age_sec != null &&
    exchange.age_sec <= ONLINE_MAX_AGE_SEC
  )
}

export function exchangesSummary(exchanges: ExchangeHealth[]) {
  const online = exchanges.filter(isOnline)
  const ages = online.flatMap((exchange) => (exchange.age_sec == null ? [] : [exchange.age_sec]))
  return {
    online: online.length,
    total: exchanges.length,
    maxAgeSec: ages.length ? Math.max(...ages) : null,
  }
}
