import { bestPrices } from '@/features/dashboard/lib'
import type { MarketSnapshot, OpportunityItem } from '@/shared/api/types'
import { formatFiat, formatNumber, formatPercent } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { ExchangeLabel, exchangeName } from '@/shared/ui/exchange-label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const SKELETON_ROWS = 4

function Price({ value, best }: { value: string | null | undefined; best: number | null }) {
  const highlighted = value != null && Number(value) === best
  return (
    <TableCell
      className={cn(
        'whitespace-nowrap text-right text-caption tabular-nums',
        highlighted && 'font-semibold text-success',
      )}
    >
      {formatNumber(value, { minDigits: 2 })}
    </TableCell>
  )
}

function Summary({ label, value, positive }: { label: string; value: string; positive?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-caption text-muted-foreground">{label}</span>
      <span
        className={cn(
          'whitespace-nowrap text-caption font-semibold tabular-nums',
          positive && 'text-success',
        )}
      >
        {value}
      </span>
    </div>
  )
}

interface PriceTableProps {
  rows: MarketSnapshot[]
  staleExchanges: string[]
  asset: string
  fiat: string
  bank: string | null
  bestRoute: OpportunityItem | undefined
  isLoading: boolean
  className?: string
}

export function PriceTable({
  rows,
  staleExchanges,
  asset,
  fiat,
  bank,
  bestRoute,
  isLoading,
  className,
}: PriceTableProps) {
  const best = bestPrices(rows)

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle>Ціни по біржах</CardTitle>
          <CardDescription>
            {asset} за {fiat} · ефективна ціна (медіана топ-5)
          </CardDescription>
        </div>
        <Badge>{bank ? paymentLabel(bank) : 'усі банки'}</Badge>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Біржа</TableHead>
            <TableHead className="text-right">Купівля</TableHead>
            <TableHead className="text-right">Продаж</TableHead>
            <TableHead className="text-right">Спред</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={4}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : rows.map((row) => (
                <TableRow key={row.exchange}>
                  <TableCell>
                    <span className="flex items-center gap-2">
                      <ExchangeLabel exchange={row.exchange} />
                      {staleExchanges.includes(row.exchange) && (
                        <Badge variant="warning">застаріло</Badge>
                      )}
                    </span>
                  </TableCell>
                  <Price value={row.buy_price} best={best.buy} />
                  <Price value={row.sell_price} best={best.sell} />
                  <TableCell className="whitespace-nowrap text-right text-caption tabular-nums">
                    {formatPercent(row.spread_pct)}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {!isLoading && rows.length === 0 && (
        <p className="border-t px-5 py-8 text-center text-caption text-muted-foreground">
          Для цієї пари й способу оплати цін зараз немає
        </p>
      )}

      <div className="flex flex-col gap-2 border-t px-5 pb-[18px] pt-3.5">
        <Summary
          label="Найкращий маршрут"
          value={
            bestRoute
              ? `${exchangeName(bestRoute.buy_exchange)} → ${exchangeName(bestRoute.sell_exchange)}`
              : '—'
          }
        />
        <Summary
          label="Міжбіржовий спред"
          value={formatPercent(bestRoute?.spread_pct, { signed: true })}
          positive={Boolean(bestRoute)}
        />
        <Summary
          label={
            bestRoute?.investment != null
              ? `Чистий прибуток на ${formatFiat(bestRoute.investment, fiat, { minDigits: 0, maxDigits: 0 })}`
              : 'Чистий прибуток'
          }
          value={formatFiat(bestRoute?.estimated_profit, fiat, { signed: true })}
          positive={Boolean(bestRoute)}
        />
      </div>
    </Card>
  )
}
