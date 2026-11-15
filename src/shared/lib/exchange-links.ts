export type TradeSide = 'BUY' | 'SELL'

export function exchangeMarketUrl(exchange: string, side: TradeSide, asset: string, fiat: string) {
  const buy = side === 'BUY'
  const action = buy ? 'buy' : 'sell'
  const upperAsset = asset.toUpperCase()
  const upperFiat = fiat.toUpperCase()
  switch (exchange) {
    case 'binance':
      return buy
        ? `https://p2p.binance.com/trade/all-payments/${upperAsset}?fiat=${upperFiat}`
        : `https://p2p.binance.com/trade/sell/${upperAsset}?fiat=${upperFiat}&payment=all-payments`
    case 'bybit':
      return `https://www.bybit.com/fiat/trade/otc/?actionType=${buy ? 1 : 0}&token=${upperAsset}&fiat=${upperFiat}`
    case 'okx':
      return `https://www.okx.com/p2p-markets/${upperFiat.toLowerCase()}/${action}-${upperAsset.toLowerCase()}`
    case 'bitget':
      return `https://www.bitget.com/p2p-trade/${action}/${upperAsset}?fiatName=${upperFiat}`
    case 'mexc':
      return `https://www.mexc.com/buy-crypto/p2p/${action}/${upperAsset}/${upperFiat}`
    case 'htx':
      return `https://www.htx.com/en-us/fiat-crypto/trade/${action}-${upperAsset.toLowerCase()}-${upperFiat.toLowerCase()}`
    default:
      return null
  }
}
