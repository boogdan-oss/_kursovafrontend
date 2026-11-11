import { Link } from 'react-router-dom'

import { Route } from '@/features/arbitrage/components/Route'
import { formatVolume, KIND_BADGES, KIND_LABELS, routeSummary } from '@/features/arbitrage/lib'
import type { OpportunityItem } from '@/shared/api/types'
import { formatPercent } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { AiScore } from '@/shared/ui/ai-score'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

const SKELETON_ROWS = 3

interface TopOpportunitiesProps {
  items: OpportunityItem[]
  pair: string
  isLoading: boolean
  className?: string
}

export function TopOpportunities({ items, pair, isLoading, className }: TopOpportunitiesProps) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle>Топ-3 можливості</CardTitle>
          <CardDescription>{pair} · відсортовано за AI Score</CardDescription>
        </div>
        <Button asChild variant="ghost">
          <Link to="/arbitrage">Усі можливості</Link>
        </Button>
      </div>

      <Table className="min-w-[640px]">
        <TableHeader>
          <TableRow>
            <TableHead>Маршрут</TableHead>
            <TableHead className="w-[130px]">Тип</TableHead>
            <TableHead className="w-[80px] text-right">Net %</TableHead>
            <TableHead className="w-[120px] text-right">Обсяг</TableHead>
            <TableHead className="w-[120px]">AI Score</TableHead>
            <TableHead className="w-[100px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={6}>
                    <Skeleton className="h-9 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : items.map((item) => (
                <TableRow key={`${item.kind}:${item.buy_exchange}:${item.sell_exchange}`}>
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
                  <TableCell className="text-right">
                    <Button asChild variant="secondary" size="sm">
                      <Link to={`/arbitrage?type=${item.kind}`}>Деталі</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>

      {!isLoading && items.length === 0 && (
        <p className="border-t px-5 py-10 text-center text-caption text-muted-foreground">
          Зараз немає прибуткових після комісій угод для {pair}
        </p>
      )}
    </Card>
  )
}
