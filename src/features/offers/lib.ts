import type { MarketSnapshot, Merchant, Offer } from '@/shared/api/types'

export type Side = Offer['side']
export type SortKey = 'price' | 'rating' | 'limit'

export const SIDES: Side[] = ['BUY', 'SELL']
export const SORT_KEYS: SortKey[] = ['price', 'rating', 'limit']

export const MIN_COMPLETION_RATE = 0.9
export const MIN_ORDERS_30D = 50

export function isReliable(merchant: Merchant) {
  return (
    merchant.orders_30d >= MIN_ORDERS_30D && Number(merchant.completion_rate) >= MIN_COMPLETION_RATE
  )
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
  }
  return [...offers].sort(compare[sort])
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
