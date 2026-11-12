import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { ChainDetails } from '@/features/arbitrage/components/ChainDetails'
import { SpreadSparkline } from '@/features/arbitrage/components/SpreadSparkline'
import { useDealQuote, useRouteSpread } from '@/features/arbitrage/hooks'
import { KIND_DESCRIPTIONS } from '@/features/arbitrage/lib'
import type { OpportunityItem } from '@/shared/api/types'
import { formatClock, formatCrypto, formatNumber, formatPercent } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { SCORE_TEXT, scoreTone } from '@/shared/ui/ai-score'
import { Button } from '@/shared/ui/button'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Panel, SectionLabel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'

const CHAIN_NOTE = 'Для такої угоди потрібні рахунки в усіх валютах ланцюжка.'

function Row({
  label,
  children,
  highlight,
}: {
  label: string
  children: ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'flex min-h-7 items-center justify-between gap-3 border-b px-3 py-1',
        highlight && 'bg-success/10',
      )}
    >
      <span className={cn('text-ui', highlight ? 'font-semibold' : 'text-muted-foreground')}>
        {label}
      </span>
      <span
        className={cn('whitespace-nowrap font-mono text-ui', highlight && 'font-bold text-success')}
      >
        {children}
      </span>
    </div>
  )
}

function Kpi({ label, children, note }: { label: string; children: ReactNode; note: string }) {
  return (
    <div className="flex flex-1 flex-col gap-0.5 px-3.5 py-2.5 first:border-r">
      <span className="text-label uppercase text-tertiary">{label}</span>
      {children}
      <span className="text-meta text-muted-foreground">{note}</span>
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

function payments(opportunity: OpportunityItem) {
  const methods = opportunity.steps.flatMap((step) =>
    step.action !== 'TRANSFER' && step.payment_method ? [paymentLabel(step.payment_method)] : [],
  )
  return methods.length ? ` · ${methods.join(' → ')}` : ''
}

interface OpportunityDetailsProps {
  opportunity: OpportunityItem
  rank: number
  activeSince: number | undefined
  now: number
  className?: string
}

export function OpportunityDetails({
  opportunity,
  rank,
  activeSince,
  now,
  className,
}: OpportunityDetailsProps) {
  const quote = useDealQuote(opportunity)
  const spread = useRouteSpread(opportunity)
  const { asset, fiat, ai_score: score } = opportunity
  const chain = opportunity.kind === 'chain'
  const deal = chain ? undefined : quote.data?.deal
  const pending = !chain && quote.isPending && opportunity.investment != null
  const tone = score == null ? null : scoreTone(score)
  const withdrawal = deal ? Number(deal.quantity) - Number(deal.sell_quantity) : 0
  const slippage = quote.data?.buy_slippage_pct
  const rr = quote.data?.rr ?? opportunity.rr

  const money = (value: string | number | null | undefined, signed = false) =>
    value == null ? '—' : `${formatNumber(value, { minDigits: 2, maxDigits: 2, signed })} ${fiat}`
  const fromQuote = (value: string | undefined) =>
    pending ? <Skeleton className="h-3.5 w-20" /> : money(value)

  return (
    <Panel
      className={cn('flex flex-col border-border-strong', className)}
      aria-label="Деталі можливості"
    >
      <div className="flex flex-col gap-1 border-b px-3 py-2.5">
        <div className="flex items-center gap-2">
          <span className="font-mono text-ui-lg text-tertiary">
            #{String(rank).padStart(2, '0')}
          </span>
          <h2 className="text-[14px] font-bold leading-[18px]">
            {exchangeName(opportunity.buy_exchange)} → {exchangeName(opportunity.sell_exchange)}
          </h2>
          <Tag tone="success" className="ml-auto">
            {activeSince === undefined
              ? 'Активна'
              : `Активна ${formatClock((now - activeSince) / 1000)}`}
          </Tag>
        </div>
        <span className="text-meta text-muted-foreground">
          {asset}/{fiat} · {KIND_DESCRIPTIONS[opportunity.kind]}
          {payments(opportunity)}
        </span>
      </div>

      <div className="flex border-b">
        <Kpi label="AI Score" note={opportunity.ai_category ?? 'оцінка ще не готова'}>
          <span className="flex items-baseline gap-0.5 font-mono">
            <span className={cn('text-kpi-lg', tone && SCORE_TEXT[tone])}>{score ?? '—'}</span>
            <span className="text-ui font-semibold text-tertiary">/100</span>
          </span>
        </Kpi>
        <Kpi
          label="Чистий прибуток"
          note={`${fiat} · ROI ${formatPercent(deal?.roi_pct ?? opportunity.net_spread_pct)}`}
        >
          <span className="font-mono text-kpi-lg text-success">
            {formatNumber(opportunity.estimated_profit, {
              minDigits: 2,
              maxDigits: 2,
              signed: true,
            })}
          </span>
        </Kpi>
      </div>

      <SectionLabel className="px-3 pb-2 pt-2.5">Кроки угоди</SectionLabel>
      <ChainDetails opportunity={opportunity} deal={deal} />
      {chain && <p className="border-b px-3 py-2 text-meta text-warning">{CHAIN_NOTE}</p>}

      <SectionLabel className="px-3 pb-2 pt-2.5">Розрахунок</SectionLabel>
      <Row label="Інвестиція">{money(opportunity.investment)}</Row>
      {chain ? (
        <>
          <Row label="Спред до комісій">{formatPercent(opportunity.spread_pct)}</Row>
          <Row label="Net % після комісій">{formatPercent(opportunity.net_spread_pct)}</Row>
        </>
      ) : (
        <>
          <Row label="Комісії разом">{fromQuote(deal?.fees)}</Row>
          {withdrawal > 0 && deal && (
            <Row label={`Вивід ${formatCrypto(withdrawal, asset, { minDigits: 0 })}`}>
              <span className="text-destructive">
                {money(-withdrawal * Number(deal.sell_price))}
              </span>
            </Row>
          )}
          <Row label="Сума продажу">{fromQuote(deal?.sell_amount)}</Row>
          <Row label="Slippage · RR">
            {slippage == null ? '—' : formatPercent(slippage)} ·{' '}
            {rr == null ? '—' : `${formatNumber(rr, { minDigits: 1, maxDigits: 2 })} : 1`}
          </Row>
        </>
      )}
      <Row label="Чистий прибуток" highlight>
        {money(opportunity.estimated_profit, true)}
      </Row>

      {!chain && (
        <div className="flex flex-col gap-2 px-3 py-2.5">
          <SectionLabel>Валовий спред маршруту · 60 хв</SectionLabel>
          <SpreadSparkline points={spread.points} isLoading={spread.isPending} />
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2.5 border-t px-3 py-2.5">
        <div className="flex gap-1.5">
          {!chain && (
            <Button asChild size="terminal" className="flex-1">
              <Link to={calculatorUrl(opportunity)}>Відкрити в калькуляторі</Link>
            </Button>
          )}
          <Button asChild variant="secondary" size="terminal" className="flex-1">
            <Link to="/alerts">Створити сповіщення</Link>
          </Button>
        </div>
        <p className="text-meta text-tertiary">
          Аналітика, не фінансова порада. UPars не виконує угод від вашого імені.
        </p>
      </div>
    </Panel>
  )
}
