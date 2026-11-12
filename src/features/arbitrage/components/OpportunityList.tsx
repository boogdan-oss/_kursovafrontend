import { KIND_TAGS, KIND_TONES, opportunityKey } from '@/features/arbitrage/lib'
import type { OpportunityItem } from '@/shared/api/types'
import { formatClock, formatNumber, formatPercent } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { SCORE_FILL, SCORE_TEXT, scoreTone } from '@/shared/ui/ai-score'
import { exchangeName } from '@/shared/ui/exchange-label'
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

const SKELETON_ROWS = 6

function ScoreCell({ score }: { score: number | null | undefined }) {
  if (score === null || score === undefined) return <span className="text-tertiary">—</span>
  const tone = scoreTone(score)
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('w-5 font-semibold', SCORE_TEXT[tone])}>{score}</span>
      <span className="block h-1 w-11 bg-border-strong" aria-hidden>
        <span
          className={cn('block h-full', SCORE_FILL[tone])}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
        />
      </span>
    </span>
  )
}

export function RouteText({ from, to }: { from: string; to: string }) {
  return (
    <span className="whitespace-nowrap font-sans">
      {exchangeName(from)} <span className="text-tertiary">→</span> {exchangeName(to)}
    </span>
  )
}

interface OpportunityListProps {
  items: OpportunityItem[]
  firstRank: number
  selectedKey: string | undefined
  onSelect: (key: string) => void
  activeSince: Map<string, number>
  now: number
  isLoading: boolean
}

export function OpportunityList({
  items,
  firstRank,
  selectedKey,
  onSelect,
  activeSince,
  now,
  isLoading,
}: OpportunityListProps) {
  const price = (value: string) => formatNumber(value, { minDigits: 2, maxDigits: 2 })
  const volume = (value: string) =>
    formatNumber(value, { maxDigits: Math.abs(Number(value)) >= 100 ? 0 : 4 })

  return (
    <Table className="min-w-[900px] font-mono">
      <TableHeader className="bg-transparent">
        <TableRow>
          <TableHead className={cn(terminalHead, 'w-12')}>#</TableHead>
          <TableHead className={terminalHead}>Маршрут</TableHead>
          <TableHead className={cn(terminalHead, 'w-[128px]')}>Тип</TableHead>
          <TableHead className={cn(terminalHead, 'w-[96px] text-right')}>Купівля</TableHead>
          <TableHead className={cn(terminalHead, 'w-[84px] text-right')}>Продаж</TableHead>
          <TableHead className={cn(terminalHead, 'w-[80px] text-right')}>Gross</TableHead>
          <TableHead className={cn(terminalHead, 'w-[90px] text-right')}>Net ▾</TableHead>
          <TableHead className={cn(terminalHead, 'w-[110px] text-right')}>
            Обсяг, {items[0]?.asset ?? ''}
          </TableHead>
          <TableHead className={cn(terminalHead, 'w-[104px]')}>AI Score</TableHead>
          <TableHead className={cn(terminalHead, 'w-[80px] text-right')}>Триває</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell colSpan={10} className={terminalCell}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          : items.map((item, index) => {
              const key = opportunityKey(item)
              const selected = key === selectedKey
              const since = activeSince.get(key)
              return (
                <TableRow
                  key={key}
                  tabIndex={0}
                  aria-selected={selected}
                  data-state={selected ? 'selected' : undefined}
                  className="cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring data-[state=selected]:bg-primary/15"
                  onClick={() => onSelect(key)}
                  onKeyDown={(event) => {
                    if (event.key !== 'Enter' && event.key !== ' ') return
                    event.preventDefault()
                    onSelect(key)
                  }}
                >
                  <TableCell
                    className={cn(
                      terminalCell,
                      'relative text-tertiary',
                      selected && 'shadow-[inset_2px_0_0_rgb(var(--primary))]',
                    )}
                  >
                    {String(firstRank + index).padStart(2, '0')}
                  </TableCell>
                  <TableCell className={terminalCell}>
                    <RouteText from={item.buy_exchange} to={item.sell_exchange} />
                  </TableCell>
                  <TableCell className={terminalCell}>
                    <Tag tone={KIND_TONES[item.kind]}>{KIND_TAGS[item.kind]}</Tag>
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right')}>
                    {price(item.buy_price)}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right')}>
                    {price(item.sell_price)}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right text-muted-foreground')}>
                    {formatPercent(item.spread_pct)}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right font-semibold text-success')}>
                    {formatPercent(item.net_spread_pct, { signed: true })}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'whitespace-nowrap text-right')}>
                    {volume(item.max_volume)}
                  </TableCell>
                  <TableCell className={terminalCell}>
                    <ScoreCell score={item.ai_score} />
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right text-muted-foreground')}>
                    {since === undefined ? '—' : formatClock((now - since) / 1000)}
                  </TableCell>
                </TableRow>
              )
            })}
      </TableBody>
    </Table>
  )
}
