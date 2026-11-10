import { BadgeCheck, ExternalLink } from 'lucide-react'

import { exchangeMarketUrl, isReliable, offerKey, type Side } from '@/features/offers/lib'
import type { Offer } from '@/shared/api/types'
import { formatCrypto, formatFiat, formatNumber, formatRatio, plural } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { Avatar } from '@/shared/ui/avatar'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { ExchangeLabel } from '@/shared/ui/exchange-label'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

const VISIBLE_PAYMENTS = 2
const SKELETON_ROWS = 8
const DEAL_FORMS = ['угода', 'угоди', 'угод'] as const

function Seller({ offer }: { offer: Offer }) {
  const { merchant } = offer
  return (
    <div className="flex items-center gap-2.5">
      <Avatar name={merchant.nickname} />
      <div className="flex min-w-0 flex-col gap-0.5">
        <span className="flex items-center gap-1.5">
          <span className="max-w-[220px] truncate text-caption font-semibold">
            {merchant.nickname}
          </span>
          {isReliable(merchant) && (
            <Tooltip>
              <TooltipTrigger asChild>
                <BadgeCheck
                  className="size-3.5 shrink-0 text-success"
                  aria-label="Надійний продавець"
                />
              </TooltipTrigger>
              <TooltipContent>Надійний продавець</TooltipContent>
            </Tooltip>
          )}
        </span>
        <span className="text-small text-muted-foreground">
          {formatNumber(merchant.orders_30d)} {plural(merchant.orders_30d, DEAL_FORMS)} ·{' '}
          {formatRatio(merchant.completion_rate)}
        </span>
      </div>
    </div>
  )
}

function Payments({ methods }: { methods: string[] }) {
  const visible = methods.slice(0, VISIBLE_PAYMENTS)
  const hidden = methods.slice(VISIBLE_PAYMENTS)
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {visible.map((method) => (
        <Badge key={method}>{paymentLabel(method)}</Badge>
      ))}
      {hidden.length > 0 && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge tabIndex={0} className="cursor-default">
              +{hidden.length}
            </Badge>
          </TooltipTrigger>
          <TooltipContent className="max-w-[260px]">
            {hidden.map(paymentLabel).join(', ')}
          </TooltipContent>
        </Tooltip>
      )}
    </div>
  )
}

function SkeletonRows() {
  return Array.from({ length: SKELETON_ROWS }, (_, index) => (
    <TableRow key={index} className="hover:bg-transparent">
      <TableCell className="py-3.5">
        <div className="flex items-center gap-2.5">
          <Skeleton className="size-8 rounded-full" />
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-3.5 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-20" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-16" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-4 w-28" />
      </TableCell>
      <TableCell>
        <Skeleton className="h-5 w-32" />
      </TableCell>
      <TableCell>
        <Skeleton className="ml-auto h-8 w-24" />
      </TableCell>
    </TableRow>
  ))
}

interface OffersTableProps {
  offers: Offer[]
  side: Side
  bestPrice: string | undefined
  isLoading: boolean
}

export function OffersTable({ offers, side, bestPrice, isLoading }: OffersTableProps) {
  return (
    <Table className="min-w-[920px]">
      <TableHeader>
        <TableRow>
          <TableHead>Продавець</TableHead>
          <TableHead className="w-[130px]">Біржа</TableHead>
          <TableHead className="w-[120px]">Ціна</TableHead>
          <TableHead className="w-[190px]">Доступно / ліміти</TableHead>
          <TableHead className="w-[230px]">Оплата</TableHead>
          <TableHead className="w-[140px]" />
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <SkeletonRows />
        ) : (
          offers.map((offer) => {
            const url = exchangeMarketUrl(offer.exchange, side, offer.asset, offer.fiat)
            return (
              <TableRow key={offerKey(offer)}>
                <TableCell className="py-3.5">
                  <Seller offer={offer} />
                </TableCell>
                <TableCell>
                  <ExchangeLabel exchange={offer.exchange} />
                </TableCell>
                <TableCell
                  className={cn(
                    'whitespace-nowrap text-body font-semibold tabular-nums',
                    offer.price === bestPrice && 'text-success',
                  )}
                >
                  {formatFiat(offer.price, offer.fiat)}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-0.5 whitespace-nowrap tabular-nums">
                    <span className="text-caption">
                      {formatCrypto(offer.available, offer.asset)}
                    </span>
                    <span className="text-small text-muted-foreground">
                      {formatNumber(offer.min_amount, { maxDigits: 0 })} –{' '}
                      {formatFiat(offer.max_amount, offer.fiat, { minDigits: 0, maxDigits: 0 })}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Payments methods={offer.payment_methods} />
                </TableCell>
                <TableCell className="text-right">
                  {url && (
                    <Button asChild variant="secondary" size="sm">
                      <a href={url} target="_blank" rel="noreferrer">
                        На біржу
                        <ExternalLink />
                      </a>
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            )
          })
        )}
      </TableBody>
    </Table>
  )
}
