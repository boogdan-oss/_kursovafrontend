import type { MarketSnapshot, Merchant, Offer } from '@/shared/api/types'
import type { TagTone } from '@/shared/ui/tag'

export type Side = Offer['side']
export type SortKey = 'price' | 'rating' | 'limit' | 'volume'
export type RiskLevel = 'low' | 'medium' | 'high'

export const SIDES: Side[] = ['BUY', 'SELL']
export const SORT_KEYS: SortKey[] = ['price', 'rating', 'limit', 'volume']

export const MIN_COMPLETION_RATE = 0.9
export const MIN_ORDERS_30D = 50
export const SUSPICIOUS_GAP_PCT = 3
export const MEDIAN_TOP = 5

export const RISK_LABELS: Record<RiskLevel, string> = {
  low: 'Низький',
  medium: 'Середній',
  high: 'Високий',
}

export const RISK_TONES: Record<RiskLevel, TagTone> = {
  low: 'success',
  medium: 'warning',
  high: 'danger',
}

export interface MerchantFilters {
  minRate: boolean
  minOrders: boolean
}

export function passesMerchant(merchant: Merchant, filters: MerchantFilters) {
  return (
    (!filters.minRate || Number(merchant.completion_rate) >= MIN_COMPLETION_RATE) &&
    (!filters.minOrders || merchant.orders_30d >= MIN_ORDERS_30D)
  )
}

export function isReliable(merchant: Merchant) {
  return passesMerchant(merchant, { minRate: true, minOrders: true })
}

export function sortOffers(offers: Offer[], sort: SortKey, side: Side) {
  const byPrice = (a: Offer, b: Offer) =>
    side === 'BUY' ? Number(a.price) - Number(b.price) : Number(b.price) - Number(a.price)

  const compare: Record<SortKey, (a: Offer, b: Offer) => number> = {
    price: byPrice,
    rating: (a, b) =>
      Number(b.merchant.completion_rate) - Number(a.merchant.completion_rate) ||
      b.merchant.orders_30d - a.merchant.orders_30d ||
      byPrice(a, b),
    limit: (a, b) => Number(b.max_amount) - Number(a.max_amount) || byPrice(a, b),
    volume: (a, b) => Number(b.available) - Number(a.available) || byPrice(a, b),
  }
  return [...offers].sort(compare[sort])
}

export function medianPrice(offers: Offer[], side: Side, top = MEDIAN_TOP) {
  const prices = sortOffers(offers, 'price', side)
    .slice(0, top)
    .map((offer) => Number(offer.price))
    .sort((a, b) => a - b)
  if (!prices.length) return null
  const middle = Math.floor(prices.length / 2)
  return prices.length % 2 ? prices[middle] : (prices[middle - 1] + prices[middle]) / 2
}

export function deviationPct(price: string, reference: number | null) {
  if (!reference) return null
  return ((Number(price) - reference) / reference) * 100
}

export function isSuspicious(offer: Offer, reference: number | null, side: Side) {
  const gap = deviationPct(offer.price, reference)
  if (gap === null) return false
  return side === 'BUY' ? gap <= -SUSPICIOUS_GAP_PCT : gap >= SUSPICIOUS_GAP_PCT
}

export function riskLevel(offer: Offer, reference: number | null, side: Side): RiskLevel {
  const orders = offer.merchant.orders_30d
  const rate = Number(offer.merchant.completion_rate)
  if (isSuspicious(offer, reference, side) || orders < 20 || rate < 0.85) return 'high'
  if (orders < 100 || rate < 0.97) return 'medium'
  return 'low'
}

export interface DepthLevel {
  price: number
  volume: number
}

export function depthLevels(offers: Offer[], side: Side, limit = 12): DepthLevel[] {
  const levels = new Map<number, number>()
  for (const offer of offers) {
    const price = Math.round(Number(offer.price) * 100) / 100
    levels.set(price, (levels.get(price) ?? 0) + Number(offer.available))
  }
  return [...levels]
    .map(([price, volume]) => ({ price, volume }))
    .sort((a, b) => (side === 'BUY' ? a.price - b.price : b.price - a.price))
    .slice(0, limit)
}

export function bestSnapshot(
  items: MarketSnapshot[],
  exchanges: readonly string[],
  payment: string | null,
  side: Side,
) {
  const price = (item: MarketSnapshot) => (side === 'BUY' ? item.buy_price : item.sell_price)
  const candidates = items.filter(
    (item) =>
      exchanges.includes(item.exchange) &&
      (item.payment_method ?? null) === payment &&
      price(item) != null,
  )
  if (!candidates.length) return null
  return candidates.reduce((best, item) => {
    const better =
      side === 'BUY'
        ? Number(price(item)) < Number(price(best))
        : Number(price(item)) > Number(price(best))
    return better ? item : best
  })
}

export function exchangeMarketUrl(exchange: string, side: Side, asset: string, fiat: string) {
  const buy = side === 'BUY'
  switch (exchange) {
    case 'binance':
      return buy
        ? `https://p2p.binance.com/trade/all-payments/${asset}?fiat=${fiat}`
        : `https://p2p.binance.com/trade/sell/${asset}?fiat=${fiat}&payment=all-payments`
    case 'bybit':
      return `https://www.bybit.com/fiat/trade/otc/?actionType=${buy ? 1 : 0}&token=${asset}&fiat=${fiat}`
    case 'okx':
      return `https://www.okx.com/p2p-markets/${fiat.toLowerCase()}/${buy ? 'buy' : 'sell'}-${asset.toLowerCase()}`
    default:
      return null
  }
}

export function offerKey(offer: Offer) {
  return `${offer.exchange}:${offer.side}:${offer.external_id ?? `${offer.merchant.id}:${offer.price}:${offer.max_amount}`}`
}
