import { Route } from '@/features/arbitrage/components/Route'
import {
  formatVolume,
  KIND_BADGES,
  KIND_LABELS,
  opportunityKey,
  routeSummary,
} from '@/features/arbitrage/lib'
import type { OpportunityItem } from '@/shared/api/types'
import { formatDuration, formatPercent } from '@/shared/lib/format'
import { AiScore } from '@/shared/ui/ai-score'
import { Badge } from '@/shared/ui/badge'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const SKELETON_ROWS = 5

function SkeletonRows() {
  return Array.from({ length: SKELETON_ROWS }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell className="py-3.5">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-5 w-44" />
          <Skeleton className="h-3 w-36" />
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-24" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-4 w-12" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-4 w-10" />
      </TableCell>
    </TableRow>
  ))
}

interface OpportunityListProps {
  items: OpportunityItem[]
  selectedKey: string | undefined
  onSelect: (key: string) => void
  activeSince: Map<string, number>
  now: number
  isLoading: boolean
}

export function OpportunityList({
  items,
  selectedKey,
  onSelect,
  activeSince,
  now,
  isLoading,
}: OpportunityListProps) {
  return (
    <Table className="min-w-[680px]">
      <TableHeader>
        <TableRow>
          <TableHead>Маршрут</TableHead>
          <TableHead className="w-[130px]">Тип</TableHead>
          <TableHead className="w-[80px] text-right">Net %</TableHead>
          <TableHead className="w-[120px] text-right">Обсяг</TableHead>
          <TableHead className="w-[120px]">AI Score</TableHead>
          <TableHead className="w-[90px] text-right">Триває</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <SkeletonRows />
        ) : (
          items.map((item) => {
            const key = opportunityKey(item)
            const selected = key === selectedKey
            const since = activeSince.get(key)
            return (
              <TableRow
                key={key}
                tabIndex={0}
                aria-selected={selected}
                data-state={selected ? 'selected' : undefined}
                className="cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                onClick={() => onSelect(key)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter' && event.key !== ' ') return
                  event.preventDefault()
                  onSelect(key)
                }}
              >
                <TableCell className="py-3.5">
                  <Route
                    from={item.buy_exchange}
                    to={item.sell_exchange}
                    sub={routeSummary(item)}
                  />
                </TableCell>
                <TableCell>
                  <Badge variant={KIND_BADGES[item.kind]}>{KIND_LABELS[item.kind]}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-caption font-semibold tabular-nums text-success">
                  {formatPercent(item.net_spread_pct, { signed: true })}
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-caption tabular-nums">
                  {formatVolume(item.max_volume, item.asset)}
                </TableCell>
                <TableCell>
                  <AiScore score={item.ai_score} />
                </TableCell>
                <TableCell className="whitespace-nowrap text-right text-caption tabular-nums">
                  {since === undefined ? '—' : formatDuration((now - since) / 1000)}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
