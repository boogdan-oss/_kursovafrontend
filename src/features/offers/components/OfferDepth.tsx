import type { DepthLevel } from '@/features/offers/lib'
import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Panel, PanelHeader } from '@/shared/ui/panel'
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

const SKELETON_ROWS = 8

interface OfferDepthProps {
  levels: DepthLevel[]
  asset: string
  isLoading: boolean
  className?: string
}

export function OfferDepth({ levels, asset, isLoading, className }: OfferDepthProps) {
  const max = Math.max(0, ...levels.map((level) => level.volume))

  return (
    <Panel className={cn('overflow-hidden', className)} aria-label="Глибина пропозиції">
      <PanelHeader title="Глибина пропозиції" meta={`${asset} за ціною`} />
      <Table>
        <TableHeader className="bg-transparent">
          <TableRow>
            <TableHead className={cn(terminalHead, 'w-[96px]')}>Ціна</TableHead>
            <TableHead className={terminalHead}>Обсяг</TableHead>
            <TableHead className={cn(terminalHead, 'w-[96px] text-right')}>{asset}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={3} className={terminalCell}>
                    <Skeleton className="h-4 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : levels.map((level) => (
                <TableRow key={level.price}>
                  <TableCell className={cn(terminalCell, 'font-mono')}>
                    {formatNumber(level.price, { minDigits: 2 })}
                  </TableCell>
                  <TableCell className={terminalCell}>
                    <div
                      aria-hidden
                      className="h-2.5 bg-success"
                      style={{ width: `${max ? Math.max(2, (level.volume / max) * 100) : 0}%` }}
                    />
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right font-mono')}>
                    {formatNumber(level.volume, { maxDigits: level.volume >= 1 ? 0 : 6 })}
                  </TableCell>
                </TableRow>
              ))}
        </TableBody>
      </Table>
      {!isLoading && levels.length === 0 && (
        <p className="px-3 py-8 text-center text-ui text-muted-foreground">Пропозицій немає</p>
      )}
    </Panel>
  )
}
