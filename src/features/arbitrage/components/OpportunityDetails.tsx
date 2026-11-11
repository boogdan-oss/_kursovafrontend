import { Info } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ChainDetails } from '@/features/arbitrage/components/ChainDetails'
import { useDealQuote } from '@/features/arbitrage/hooks'
import { KIND_DESCRIPTIONS } from '@/features/arbitrage/lib'
import type { OpportunityItem } from '@/shared/api/types'
import {
  formatCrypto,
  formatDuration,
  formatFiat,
  formatNumber,
  formatPercent,
} from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { SCORE_TEXT, ScoreBar, scoreTone } from '@/shared/ui/ai-score'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Skeleton } from '@/shared/ui/skeleton'

const SCORE_FACTORS =
  'Оцінка за чистим спредом, ліквідністю, RR, стабільністю, обсягом і волатильністю'
const CHAIN_NOTE = 'Для такої угоди потрібні рахунки в усіх валютах ланцюжка.'

function Row({
  label,
  children,
  strong,
}: {
  label: string
  children: ReactNode
  strong?: boolean
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span
        className={cn(
          'whitespace-nowrap tabular-nums',
          strong ? 'text-body font-semibold text-success' : 'text-caption',
        )}
      >
        {children}
      </span>
    </div>
  )
}

function calculatorUrl(opportunity: OpportunityItem) {
  const params = new URLSearchParams({
    asset: opportunity.asset,
    fiat: opportunity.fiat,
    buy_exchange: opportunity.buy_exchange,
    sell_exchange: opportunity.sell_exchange,
  })
  if (opportunity.investment != null) params.set('investment', opportunity.investment)
  return `/calculator?${params.toString()}`
}

interface OpportunityDetailsProps {
  opportunity: OpportunityItem
  activeSince: number | undefined
  now: number
  className?: string
}

export function OpportunityDetails({
  opportunity,
  activeSince,
  now,
  className,
}: OpportunityDetailsProps) {
  const quote = useDealQuote(opportunity)
  const { asset, fiat, ai_score: score } = opportunity
  const chain = opportunity.kind === 'chain'
  const deal = chain ? undefined : quote.data?.deal
  const pending = !chain && quote.isPending && opportunity.investment != null
  const tone = score == null ? null : scoreTone(score)
  const withdrawal = deal ? Number(deal.quantity) - Number(deal.sell_quantity) : 0

  const fromQuote = (value: string | undefined) =>
    pending ? <Skeleton className="h-4 w-20" /> : formatFiat(value, fiat)

  return (
    <Card
      className={cn('flex flex-col gap-4 border-primary/60 p-5', className)}
      aria-label="Деталі можливості"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-0.5">
          <h2 className="text-h3">
            {exchangeName(opportunity.buy_exchange)} → {exchangeName(opportunity.sell_exchange)}
          </h2>
          <span className="text-small text-muted-foreground">
            {asset}/{fiat} · {KIND_DESCRIPTIONS[opportunity.kind]}
          </span>
        </div>
        <Badge variant="success">
          {activeSince === undefined
            ? 'Активна'
            : `Активна ${formatDuration((now - activeSince) / 1000)}`}
        </Badge>
      </div>

      <div className="flex items-center gap-4 rounded-xl bg-background p-4">
        <div className="flex flex-col">
          <span className="text-small text-muted-foreground">AI Score</span>
          <span className="flex items-baseline gap-1">
            <span className={cn('text-num-lg tabular-nums', tone && SCORE_TEXT[tone])}>
              {score ?? '—'}
            </span>
            <span className="text-caption text-muted-foreground">/100</span>
          </span>
        </div>
        <div className="flex min-w-0 flex-1 flex-col items-start gap-2">
          {opportunity.ai_category && tone && (
            <Badge variant={tone}>{opportunity.ai_category}</Badge>
          )}
          {score != null && <ScoreBar score={score} className="w-full" />}
          <span className="text-small text-muted-foreground">{SCORE_FACTORS}</span>
        </div>
      </div>

      <span className="text-body font-semibold">Кроки угоди</span>
      <ChainDetails opportunity={opportunity} deal={deal} />
      {chain && <p className="text-small text-warning">{CHAIN_NOTE}</p>}

      <hr className="border-border" />

      <div className="flex flex-col gap-2.5">
        <Row label="Сума інвестиції">{formatFiat(opportunity.investment, fiat)}</Row>
        {chain ? (
          <>
            <Row label="Спред до комісій">{formatPercent(opportunity.spread_pct)}</Row>
            <Row label="Net % після комісій">{formatPercent(opportunity.net_spread_pct)}</Row>
          </>
        ) : (
          <>
            <Row label="Сума продажу">{fromQuote(deal?.sell_amount)}</Row>
            <Row label="Комісії разом">{fromQuote(deal?.fees)}</Row>
            {withdrawal > 0 && deal && (
              <Row label={`у т. ч. вивід (${formatCrypto(withdrawal, asset, { minDigits: 0 })})`}>
                ≈ {formatFiat(withdrawal * Number(deal.sell_price), fiat)}
              </Row>
            )}
          </>
        )}
      </div>

      <hr className="border-border" />

      <div className="flex flex-col gap-2.5">
        <Row label="Чистий прибуток" strong>
          {formatFiat(opportunity.estimated_profit, fiat, { signed: true })}
        </Row>
        <Row label="ROI">
          <span className="font-semibold">
            {formatPercent(deal?.roi_pct ?? opportunity.net_spread_pct)}
          </span>
        </Row>
        <Row label="Risk / Reward">{formatNumber(opportunity.rr, { minDigits: 2 })}</Row>
      </div>

      <div className="flex flex-wrap gap-2">
        {!chain && (
          <Button asChild className="flex-1">
            <Link to={calculatorUrl(opportunity)}>Відкрити в калькуляторі</Link>
          </Button>
        )}
        <Button asChild variant="secondary" className={cn(chain && 'flex-1')}>
          <Link to="/alerts">Сповістити</Link>
        </Button>
      </div>

      <p className="flex items-start gap-2 text-small text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        CryptoParser не виконує угод — лише аналітика для ваших рішень.
      </p>
    </Card>
  )
}
