import type { Side } from '@/features/offers/lib'
import type { MarketSnapshot, Offer } from '@/shared/api/types'
import { formatFiat, formatNumber, formatPercent } from '@/shared/lib/format'
import { exchangeName } from '@/shared/ui/exchange-label'
import { StatCard } from '@/shared/ui/stat-card'

interface OffersSummaryProps {
  side: Side
  fiat: string
  bestOffer: Offer | undefined
  snapshot: MarketSnapshot | null
  shown: number
  collected: number | undefined
}

export function OffersSummary({
  side,
  fiat,
  bestOffer,
  snapshot,
  shown,
  collected,
}: OffersSummaryProps) {
  const buy = side === 'BUY'
  const effective = snapshot ? (buy ? snapshot.buy_price : snapshot.sell_price) : null

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard
        label={buy ? 'Найкраща ціна купівлі' : 'Найкраща ціна продажу'}
        value={formatFiat(bestOffer?.price, fiat)}
        delta={
          bestOffer
            ? `${exchangeName(bestOffer.exchange)} · ${bestOffer.merchant.nickname}`
            : 'немає оголошень'
        }
        deltaTone={bestOffer ? 'success' : 'muted'}
      />
      <StatCard
        label="Медіана топ-5"
        value={formatFiat(effective, fiat)}
        delta={
          snapshot ? `ефективна ціна · ${exchangeName(snapshot.exchange)}` : 'недостатньо даних'
        }
      />
      <StatCard
        label="Спред купівля / продаж"
        value={formatPercent(snapshot?.spread_pct)}
        delta={
          snapshot?.spread_pct != null
            ? `на ${exchangeName(snapshot.exchange)}`
            : 'недостатньо даних'
        }
      />
      <StatCard
        label="Оголошень у вибірці"
        value={formatNumber(shown)}
        delta={collected === undefined ? 'завантаження…' : `із ${formatNumber(collected)} зібраних`}
      />
    </div>
  )
}
