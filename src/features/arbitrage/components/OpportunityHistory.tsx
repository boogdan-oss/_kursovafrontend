import { useState } from 'react'

import { RouteText } from '@/features/arbitrage/components/OpportunityList'
import {
  HISTORY_LIMIT,
  isStillActive,
  PERIOD_LABELS,
  PERIODS,
  type Period,
} from '@/features/arbitrage/lib'
import type { OpportunityHistoryItem } from '@/shared/api/types'
import {
  formatClock,
  formatDate,
  formatDateTime,
  formatNumber,
  formatPercent,
  formatShortTime,
} from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Pagination } from '@/shared/ui/pagination'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'
import { Skeleton } from '@/shared/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  terminalCell,
  terminalHead,
} from '@/shared/ui/table'
import { Tag } from '@/shared/ui/tag'

const PAGE_SIZE = 8
const SKELETON_ROWS = 3

const PERIOD_META: Record<Period, string> = {
  day: 'за 24 години',
  week: 'за 7 днів',
  month: 'за 30 днів',
}

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
    <Panel className="overflow-hidden">
      <PanelHeader
        title="Історія можливостей"
        meta={`${PERIOD_META[period]}${items.length >= HISTORY_LIMIT ? ` · останні ${HISTORY_LIMIT}` : ''}`}
        actions={
          <Segmented
            value={period}
            onValueChange={onPeriodChange}
            options={PERIODS.map((value) => ({ value, label: PERIOD_LABELS[value] }))}
            size="sm"
            label="Період"
          />
        }
      />

      <Table className="min-w-[760px] font-mono">
        <TableHeader className="bg-transparent">
          <TableRow>
            <TableHead className={cn(terminalHead, 'w-[130px]')}>Початок</TableHead>
            <TableHead className={terminalHead}>Маршрут</TableHead>
            <TableHead className={cn(terminalHead, 'w-[140px] text-right')}>Макс. Net</TableHead>
            <TableHead className={cn(terminalHead, 'w-[160px] text-right')}>Тривалість</TableHead>
            <TableHead className={cn(terminalHead, 'w-[160px] text-right')}>Макс. обсяг</TableHead>
            <TableHead className={cn(terminalHead, 'w-[140px] text-right')}>Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={6} className={terminalCell}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : pageItems.map((item) => {
                const active = isStillActive(item, checkedAt)
                return (
                  <TableRow
                    key={`${item.detected_at}:${item.kind}:${item.buy_exchange}:${item.sell_exchange}`}
                  >
                    <TableCell
                      className={cn(terminalCell, 'whitespace-nowrap text-muted-foreground')}
                    >
                      {formatStart(item.detected_at, now)}
                    </TableCell>
                    <TableCell className={terminalCell}>
                      <RouteText from={item.buy_exchange} to={item.sell_exchange} />
                    </TableCell>
                    <TableCell className={cn(terminalCell, 'text-right text-success')}>
                      {formatPercent(item.net_spread_pct, { signed: true })}
                    </TableCell>
                    <TableCell className={cn(terminalCell, 'text-right')}>
                      {formatClock(item.duration_sec, { alwaysHours: true })}
                    </TableCell>
                    <TableCell className={cn(terminalCell, 'text-right')}>
                      {formatNumber(item.max_volume, {
                        maxDigits: Math.abs(Number(item.max_volume)) >= 100 ? 0 : 4,
                      })}
                    </TableCell>
                    <TableCell className={cn(terminalCell, 'text-right')}>
                      <Tag tone={active ? 'success' : 'neutral'}>
                        {active ? 'Активна' : 'Закрита'}
                      </Tag>
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>

      {!isLoading && items.length === 0 && (
        <p className="px-3 py-8 text-center text-ui text-muted-foreground">
          {failed
            ? 'Не вдалося завантажити історію'
            : 'За цей період можливостей для пари не знайдено'}
        </p>
      )}

      {items.length > PAGE_SIZE && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
          <span className="text-ui text-muted-foreground">
            Показано {(current - 1) * PAGE_SIZE + 1}–{(current - 1) * PAGE_SIZE + pageItems.length}{' '}
            з {items.length}
          </span>
          <Pagination page={current} pageCount={pageCount} onPageChange={setPage} />
        </div>
      )}
    </Panel>
  )
}
