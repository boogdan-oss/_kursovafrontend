import { Info } from 'lucide-react'

import { feeBreakdown, passesRisk, type FeePart } from '@/features/calculator/lib'
import type { CalculatorResponse } from '@/shared/api/types'
import {
  formatCrypto,
  formatFiat,
  formatNumber,
  formatPercent,
  formatRatio,
} from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card, CardTitle } from '@/shared/ui/card'
import { StatCard } from '@/shared/ui/stat-card'

const FEE_COLORS: Record<FeePart['key'], string> = {
  trade: 'bg-primary',
  withdrawal: 'bg-warning',
  extra: 'bg-muted-foreground',
}

interface CalculatorResultProps {
  result: CalculatorResponse
  asset: string
  fiat: string
  minRr: number
  extraFees: number
  marketPrices: boolean
}

export function CalculatorResult({
  result,
  asset,
  fiat,
  minRr,
  extraFees,
  marketPrices,
}: CalculatorResultProps) {
  const { deal, rr } = result
  const profit = Number(deal.net_profit)
  const safe = passesRisk(rr, minRr)
  const fees = feeBreakdown(result, extraFees)
  const slippage = (value: string | null) =>
    value === null ? 'ціну задано вручну' : `slippage ${formatPercent(value)}`

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <Card className="flex flex-wrap items-center justify-between gap-6 border-primary/60 p-5">
        <div className="flex flex-col gap-1">
          <span className="text-caption text-muted-foreground">Чистий прибуток</span>
          <span
            className={cn(
              'text-num-lg tabular-nums',
              profit > 0 ? 'text-success' : 'text-destructive',
            )}
          >
            {formatFiat(deal.net_profit, fiat, { signed: true })}
          </span>
          <span className="text-caption text-muted-foreground">
            ROI {formatPercent(deal.roi_pct)} · Net Spread {formatPercent(deal.net_spread_pct)}
          </span>
        </div>
        <div className="flex flex-col items-start gap-2 sm:items-end">
          <Badge variant={safe ? 'success' : 'danger'}>
            RR {formatNumber(rr, { minDigits: 2 })} {safe ? '≥' : '<'} {minRr} : 1
          </Badge>
          <span className="text-small text-muted-foreground">
            {rr === null
              ? 'Угода збиткова: співвідношення ризик / прибуток не рахується'
              : safe
                ? 'Угода проходить ваш поріг ризику'
                : 'Ризикова угода: RR нижчий за ваш поріг'}
          </span>
        </div>
      </Card>

      {!result.fully_filled && (
        <p className="rounded-lg border border-warning/50 bg-warning-soft px-4 py-3 text-caption text-warning">
          На біржі недостатньо оголошень на всю суму: розрахунок зроблено для доступного обсягу.
        </p>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Кількість (Q)"
          value={formatCrypto(deal.quantity, asset, { maxDigits: 4 })}
          delta="Investment / P_buy"
        />
        <StatCard
          label="Сума продажу"
          value={formatFiat(deal.sell_amount, fiat)}
          delta="Q × P_sell"
        />
        <StatCard label="Комісії" value={formatFiat(deal.fees, fiat)} delta="усі складові разом" />
        <StatCard
          label="Spread"
          value={formatPercent(deal.spread_pct)}
          delta="(P_sell − P_buy) / P_buy"
        />
        <StatCard
          label={marketPrices ? 'Середня ціна купівлі P_avg' : 'Ціна купівлі'}
          value={formatFiat(deal.buy_price, fiat)}
          delta={slippage(result.buy_slippage_pct)}
          deltaTone={Number(result.buy_slippage_pct) > 0 ? 'warning' : 'muted'}
        />
        <StatCard
          label={marketPrices ? 'Середня ціна продажу P_avg' : 'Ціна продажу'}
          value={formatFiat(deal.sell_price, fiat)}
          delta={slippage(result.sell_slippage_pct)}
          deltaTone={Number(result.sell_slippage_pct) > 0 ? 'warning' : 'muted'}
        />
        <StatCard
          label="Ризик / прибуток"
          value={rr === null ? '—' : `${formatNumber(rr, { minDigits: 2 })} : 1`}
          delta={`${formatFiat(deal.net_profit, fiat)} / ${formatFiat(result.potential_loss, fiat)}`}
          deltaTone={safe ? 'success' : 'danger'}
        />
        <StatCard
          label="Потенційний збиток"
          value={formatFiat(result.potential_loss, fiat)}
          delta="комісії + рух ціни проти угоди"
        />
      </div>

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Структура комісій</CardTitle>
          <span className="text-body font-semibold tabular-nums">
            {formatFiat(deal.fees, fiat)}
          </span>
        </div>
        <div className="flex h-2.5 gap-0.5 overflow-hidden rounded-full bg-muted" aria-hidden>
          {fees
            .filter((part) => part.share > 0)
            .map((part) => (
              <span
                key={part.key}
                className={FEE_COLORS[part.key]}
                style={{ width: `${part.share * 100}%` }}
              />
            ))}
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {fees.map((part) => (
            <span
              key={part.key}
              className="flex items-center gap-1.5 text-small text-muted-foreground"
            >
              <span className={cn('h-[3px] w-3.5 rounded-sm', FEE_COLORS[part.key])} aria-hidden />
              {part.label} {formatFiat(part.value, fiat)}
              {part.share > 0 && ` (${formatRatio(part.share, { maxDigits: 0 })})`}
            </span>
          ))}
        </div>
      </Card>

      <p className="flex items-start gap-2 text-small text-muted-foreground">
        <Info className="mt-px size-3.5 shrink-0" aria-hidden />
        Розрахунок — аналітика, не фінансова порада. Ціни на P2P змінюються щохвилини, а
        CryptoParser не виконує угод.
      </p>
    </div>
  )
}
