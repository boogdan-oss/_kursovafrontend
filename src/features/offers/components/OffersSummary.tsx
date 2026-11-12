import type { ReactNode } from 'react'

import type { Side } from '@/features/offers/lib'
import { SUSPICIOUS_GAP_PCT } from '@/features/offers/lib'
import type { MarketSnapshot, Offer } from '@/shared/api/types'
import { formatCompact, formatNumber, formatPercent } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Panel, SectionLabel } from '@/shared/ui/panel'

interface KpiProps {
  label: string
  value: ReactNode
  note: ReactNode
  tone?: 'default' | 'success' | 'danger'
}

function Kpi({ label, value, note, tone = 'default' }: KpiProps) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5 bg-card px-3.5 py-3">
      <SectionLabel>{label}</SectionLabel>
      <p
        className={cn(
          'truncate font-mono text-kpi',
          tone === 'success' && 'text-success',
          tone === 'danger' && 'text-destructive',
        )}
      >
        {value}
      </p>
      <p className="truncate text-meta text-muted-foreground">{note}</p>
    </div>
  )
}

interface OffersSummaryProps {
  side: Side
  asset: string
  bestOffer: Offer | undefined
  snapshot: MarketSnapshot | null
  shown: number
  collected: number | undefined
  supply: number
  risky: number
}

export function OffersSummary({
  side,
  asset,
  bestOffer,
  snapshot,
  shown,
  collected,
  supply,
  risky,
}: OffersSummaryProps) {
  const buy = side === 'BUY'
  const effective = snapshot ? (buy ? snapshot.buy_price : snapshot.sell_price) : null

  return (
    <Panel className="grid grid-cols-2 gap-px overflow-hidden bg-border sm:grid-cols-3 xl:grid-cols-6">
      <Kpi
        label={buy ? 'Найкраща ціна купівлі' : 'Найкраща ціна продажу'}
        value={formatNumber(bestOffer?.price, { minDigits: 2 })}
        note={
          bestOffer
            ? `${exchangeName(bestOffer.exchange)} · ${bestOffer.merchant.nickname}`
            : 'немає оголошень'
        }
        tone={bestOffer ? 'success' : 'default'}
      />
      <Kpi
        label="Медіана топ-5"
        value={formatNumber(effective, { minDigits: 2 })}
        note={
          snapshot ? `ефективна ціна · ${exchangeName(snapshot.exchange)}` : 'недостатньо даних'
        }
      />
      <Kpi
        label="Спред купівля / продаж"
        value={formatPercent(snapshot?.spread_pct)}
        note={snapshot?.spread_pct != null ? exchangeName(snapshot.exchange) : 'недостатньо даних'}
      />
      <Kpi
        label="Оголошень"
        value={collected === undefined ? '—' : formatNumber(collected)}
        note={collected === undefined ? 'завантаження…' : `після фільтрів: ${shown}`}
      />
      <Kpi label="Пропозиція" value={shown ? formatCompact(supply) : '—'} note={asset} />
      <Kpi
        label="Ризикові"
        value={collected === undefined ? '—' : formatNumber(risky)}
        note={`ціна на ${SUSPICIOUS_GAP_PCT}%+ краща за медіану`}
        tone={risky > 0 ? 'danger' : 'default'}
      />
    </Panel>
  )
}
