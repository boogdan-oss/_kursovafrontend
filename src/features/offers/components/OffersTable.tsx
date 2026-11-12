import { ArrowUpRight } from 'lucide-react'

import {
  deviationPct,
  exchangeMarketUrl,
  isSuspicious,
  offerKey,
  RISK_LABELS,
  RISK_TONES,
  riskLevel,
  type Side,
} from '@/features/offers/lib'
import type { Offer } from '@/shared/api/types'
import { formatNumber, formatPercent, formatRatio } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
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
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const VISIBLE_PAYMENTS = 2
const SKELETON_ROWS = 8
const COLUMNS = 12

function amountDigits(value: string | number) {
  return Math.abs(Number(value)) >= 1 ? { minDigits: 2, maxDigits: 2 } : { maxDigits: 6 }
}

function Payments({ methods }: { methods: string[] }) {
  const visible = methods.slice(0, VISIBLE_PAYMENTS)
  const hidden = methods.slice(VISIBLE_PAYMENTS)
  return (
    <div className="flex items-center gap-1">
      {visible.map((method) => (
        <Tag key={method} className="max-w-[96px] truncate">
          {paymentLabel(method)}
        </Tag>
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Tag tabIndex={0} className="cursor-default font-mono">
              +{hidden.length}
            </Tag>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px]">
            {hidden.map(paymentLabel).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

interface OffersTableProps {
  offers: Offer[]
  firstRank: number
  side: Side
  asset: string
  fiat: string
  bestPrice: string | undefined
  reference: number | null
  isLoading: boolean
}

export function OffersTable({
  offers,
  firstRank,
  side,
  asset,
  fiat,
  bestPrice,
  reference,
  isLoading,
}: OffersTableProps) {
  return (
    <Table className="min-w-[1000px]">
      <TableHeader className="bg-transparent">
        <TableRow>
          <TableHead className={cn(terminalHead, 'w-[42px]')}>#</TableHead>
          <TableHead className={terminalHead}>Продавець</TableHead>
          <TableHead className={cn(terminalHead, 'w-[84px]')}>Біржа</TableHead>
          <TableHead className={cn(terminalHead, 'w-[84px] text-right')}>Ціна</TableHead>
          <TableHead className={cn(terminalHead, 'w-[96px] text-right')}>Від медіани</TableHead>
          <TableHead className={cn(terminalHead, 'w-[116px] text-right')}>
            Доступно, {asset}
          </TableHead>
          <TableHead className={cn(terminalHead, 'w-[150px] text-right')}>Ліміти, {fiat}</TableHead>
          <TableHead className={cn(terminalHead, 'w-[150px]')}>Оплата</TableHead>
          <TableHead className={cn(terminalHead, 'w-[76px] text-right')}>Угод 30д</TableHead>
          <TableHead className={cn(terminalHead, 'w-[70px] text-right')}>Викон.</TableHead>
          <TableHead className={cn(terminalHead, 'w-[90px]')}>Ризик</TableHead>
          <TableHead className={cn(terminalHead, 'w-[36px]')}>
            <span className="sr-only">Посилання</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading
          ? Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <TableRow key={index} className="hover:bg-transparent">
                <TableCell colSpan={COLUMNS} className={terminalCell}>
                  <Skeleton className="h-4 w-full" />
                </TableCell>
              </TableRow>
            ))
          : offers.map((offer, index) => {
              const url = exchangeMarketUrl(offer.exchange, side, offer.asset, offer.fiat)
              const deviation = deviationPct(offer.price, reference)
              const risk = riskLevel(offer, reference, side)
              const flagged = isSuspicious(offer, reference, side)
              return (
                <TableRow key={offerKey(offer)}>
                  <TableCell className={cn(terminalCell, 'font-mono text-tertiary')}>
                    {String(firstRank + index).padStart(2, '0')}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'max-w-[200px] truncate font-semibold')}>
                    {offer.merchant.nickname}
                  </TableCell>
                  <TableCell className={terminalCell}>{exchangeName(offer.exchange)}</TableCell>
                  <TableCell
                    className={cn(
                      terminalCell,
                      'text-right font-mono font-semibold',
                      flagged ? 'text-destructive' : offer.price === bestPrice && 'text-success',
                    )}
                  >
                    {formatNumber(offer.price, { minDigits: 2 })}
                  </TableCell>
                  <TableCell
                    className={cn(
                      terminalCell,
                      'text-right font-mono',
                      flagged ? 'text-destructive' : 'text-muted-foreground',
                    )}
                  >
                    {deviation === null
                      ? '—'
                      : formatPercent(deviation, { minDigits: 2, maxDigits: 2, signed: true })}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right font-mono')}>
                    {formatNumber(offer.available, amountDigits(offer.available))}
                  </TableCell>
                  <TableCell
                    className={cn(
                      terminalCell,
                      'whitespace-nowrap text-right font-mono text-muted-foreground',
                    )}
                  >
                    {formatNumber(offer.min_amount, { maxDigits: 0 })} –{' '}
                    {formatNumber(offer.max_amount, { maxDigits: 0 })}
                  </TableCell>
                  <TableCell className={terminalCell}>
                    <Payments methods={offer.payment_methods} />
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right font-mono')}>
                    {formatNumber(offer.merchant.orders_30d)}
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'text-right font-mono')}>
                    {formatRatio(offer.merchant.completion_rate)}
                  </TableCell>
                  <TableCell className={terminalCell}>
                    <Tag tone={RISK_TONES[risk]}>{RISK_LABELS[risk]}</Tag>
                  </TableCell>
                  <TableCell className={cn(terminalCell, 'px-2')}>
                    {url && (
                      <a
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`На біржу ${exchangeName(offer.exchange)}`}
                        className="flex size-6 items-center justify-center rounded-sm text-primary hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                      >
                        <ArrowUpRight className="size-4" />
                      </a>
                    )}
                  </TableCell>
                </TableRow>
              )
            })}
      </TableBody>
    </Table>
  )
}
