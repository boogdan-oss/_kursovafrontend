import { Bell, Star } from 'lucide-react'

import { useRemoveFromWatchlist } from '@/features/alerts/hooks'
import { samePair } from '@/features/alerts/lib'
import { bestSnapshot } from '@/features/offers/lib'
import { toApiError } from '@/shared/api/client'
import { useMarketSnapshot } from '@/shared/api/queries/market'
import type { AlertRule, WatchlistItem } from '@/shared/api/types'
import { formatNumber, formatPercent } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { EXCHANGES } from '@/store/useFiltersStore'

function LivePrice({ item }: { item: WatchlistItem }) {
  const snapshot = useMarketSnapshot({ asset: item.asset, fiat: item.fiat })
  const exchanges = item.exchange ? [item.exchange] : EXCHANGES
  const best = bestSnapshot(snapshot.data?.items ?? [], exchanges, null, 'BUY')

  if (snapshot.isPending) {
    return (
      <>
        <TableCell>
          <Skeleton className="ml-auto h-4 w-16" />
        </TableCell>
        <TableCell>
          <Skeleton className="ml-auto h-4 w-12" />
        </TableCell>
      </>
    )
  }
  const spread = best?.spread_pct == null ? null : Number(best.spread_pct)
  return (
    <>
      <TableCell className="whitespace-nowrap text-right font-mono text-ui-lg font-semibold">
        {best?.buy_price ? formatNumber(best.buy_price, { minDigits: 2 }) : '—'}
        {best && !item.exchange && (
          <span className="block text-meta font-normal text-muted-foreground">
            {exchangeName(best.exchange)}
          </span>
        )}
      </TableCell>
      <TableCell
        className={cn(
          'whitespace-nowrap text-right font-mono text-ui-lg',
          spread !== null && (spread > 0 ? 'text-success' : 'text-destructive'),
        )}
      >
        {formatPercent(spread, { signed: true })}
      </TableCell>
    </>
  )
}

interface WatchlistTableProps {
  items: WatchlistItem[]
  rules: AlertRule[]
  selectedId: number | null
  onSelect: (item: WatchlistItem) => void
  isLoading: boolean
  failed: boolean
}

export function WatchlistTable({
  items,
  rules,
  selectedId,
  onSelect,
  isLoading,
  failed,
}: WatchlistTableProps) {
  const remove = useRemoveFromWatchlist()

  return (
    <Panel aria-label="Watchlist" className="overflow-hidden">
      <PanelHeader title="Watchlist" meta={`${items.length} пар · live-ціни купівлі`} />
      <Table className="min-w-[620px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-10" />
            <TableHead>Пара</TableHead>
            <TableHead className="w-[130px] text-right">Купівля</TableHead>
            <TableHead className="w-[110px] text-right">Спред</TableHead>
            <TableHead className="w-[150px] text-right">Сповіщення</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 3 }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={5}>
                    <Skeleton className="h-8 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : items.map((item) => {
                const count = rules.filter((rule) => samePair(rule, item)).length
                const selected = item.id === selectedId
                return (
                  <TableRow
                    key={item.id}
                    data-state={selected ? 'selected' : undefined}
                    aria-selected={selected}
                    tabIndex={0}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                    onClick={() => onSelect(item)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      onSelect(item)
                    }}
                  >
                    <TableCell className="pr-0">
                      <button
                        type="button"
                        aria-label={`Прибрати ${item.asset}/${item.fiat} з Watchlist`}
                        title="Прибрати з Watchlist"
                        disabled={remove.isPending}
                        onClick={(event) => {
                          event.stopPropagation()
                          remove.mutate(item.id)
                        }}
                        className="flex size-6 items-center justify-center rounded-sm text-warning hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <Star className="size-4 fill-current" />
                      </button>
                    </TableCell>
                    <TableCell>
                      <span className="block text-ui-lg font-semibold">
                        {item.asset}/{item.fiat}
                      </span>
                      <span className="text-meta text-muted-foreground">
                        {item.exchange ? `${exchangeName(item.exchange)} · P2P` : 'усі біржі · P2P'}
                      </span>
                    </TableCell>
                    <LivePrice item={item} />
                    <TableCell className="text-right">
                      <span
                        className={cn(
                          'inline-flex h-7 items-center gap-1.5 rounded-sm border px-2.5 text-ui',
                          count > 0
                            ? 'border-primary/70 bg-primary/10 text-foreground'
                            : 'border-border-strong text-muted-foreground',
                        )}
                      >
                        <Bell className="size-3.5" aria-hidden />
                        Правила · {count}
                      </span>
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>
      {!isLoading && items.length === 0 && (
        <p className="border-t px-4 py-8 text-center text-ui text-muted-foreground">
          {failed
            ? 'Не вдалося завантажити Watchlist'
            : 'Обраних пар ще немає. Створіть сповіщення праворуч — пара додасться сюди.'}
        </p>
      )}
      {remove.isError && (
        <p role="alert" className="border-t px-4 py-2 text-ui text-destructive">
          {toApiError(remove.error).message}
        </p>
      )}
    </Panel>
  )
}
