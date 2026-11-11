import { useState } from 'react'

import { Route } from '@/features/arbitrage/components/Route'
import {
  formatVolume,
  HISTORY_LIMIT,
  isStillActive,
  KIND_BADGES,
  KIND_LABELS,
  PERIOD_LABELS,
  PERIODS,
  type Period,
} from '@/features/arbitrage/lib'
import type { OpportunityHistoryItem } from '@/shared/api/types'
import {
  formatDate,
  formatDateTime,
  formatDuration,
  formatPercent,
  formatShortTime,
} from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { Pagination } from '@/shared/ui/pagination'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const PAGE_SIZE = 8
const SKELETON_ROWS = 3

function formatStart(value: string, now: number) {
  return formatDate(value) === formatDate(now) ? formatShortTime(value) : formatDateTime(value)
}

interface OpportunityHistoryProps {
  items: OpportunityHistoryItem[]
  period: Period
  onPeriodChange: (period: Period) => void
  now: number
  checkedAt: number
  isLoading: boolean
  failed: boolean
}

export function OpportunityHistory({
  items,
  period,
  onPeriodChange,
  now,
  checkedAt,
  isLoading,
  failed,
}: OpportunityHistoryProps) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(items.length / PAGE_SIZE))
  const current = Math.min(page, pageCount)
  const pageItems = items.slice((current - 1) * PAGE_SIZE, current * PAGE_SIZE)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle>Історія можливостей</CardTitle>
          <CardDescription>
            Знайдені раніше можливості та скільки вони існували
            {items.length >= HISTORY_LIMIT && ` · останні ${HISTORY_LIMIT}`}
          </CardDescription>
        </div>
        <Tabs value={period} onValueChange={(value) => onPeriodChange(value as Period)}>
          <TabsList>
            {PERIODS.map((value) => (
              <TabsTrigger key={value} value={value}>
                {PERIOD_LABELS[value]}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      <Table className="min-w-[820px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[150px]">Час</TableHead>
            <TableHead>Маршрут</TableHead>
            <TableHead className="w-[130px]">Тип</TableHead>
            <TableHead className="w-[100px] text-right">Net %</TableHead>
            <TableHead className="w-[130px] text-right">Тривалість</TableHead>
            <TableHead className="w-[130px] text-right">Обсяг</TableHead>
            <TableHead className="w-[120px] text-right">Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={7}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : pageItems.map((item) => {
                const active = isStillActive(item, checkedAt)
                return (
                  <TableRow
                    key={`${item.detected_at}:${item.kind}:${item.buy_exchange}:${item.sell_exchange}`}
                  >
                    <TableCell className="whitespace-nowrap text-caption tabular-nums">
                      {formatStart(item.detected_at, now)}
                    </TableCell>
                    <TableCell>
                      <Route from={item.buy_exchange} to={item.sell_exchange} />
                    </TableCell>
                    <TableCell>
                      <Badge variant={KIND_BADGES[item.kind]}>{KIND_LABELS[item.kind]}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-caption font-semibold tabular-nums text-success">
                      {formatPercent(item.net_spread_pct, { signed: true })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-caption tabular-nums">
                      {formatDuration(item.duration_sec)}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-right text-caption tabular-nums">
                      {formatVolume(item.max_volume, item.asset)}
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant={active ? 'success' : 'neutral'}>
                        {active ? 'Активна' : 'Завершено'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>

      {!isLoading && items.length === 0 && (
        <p className="border-t px-5 py-10 text-center text-caption text-muted-foreground">
          {failed
            ? 'Не вдалося завантажити історію'
            : 'За цей період можливостей для пари не знайдено'}
        </p>
      )}

      {items.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5">
          <span className="text-small text-muted-foreground">
            Показано {(current - 1) * PAGE_SIZE + 1}–{(current - 1) * PAGE_SIZE + pageItems.length}{' '}
            з {items.length}
          </span>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}
    </Card>
  )
}
