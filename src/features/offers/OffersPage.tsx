import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { OffersFilters } from '@/features/offers/components/OffersFilters'
import { OffersSummary } from '@/features/offers/components/OffersSummary'
import { OffersTable } from '@/features/offers/components/OffersTable'
import { OFFERS_REFRESH_MS, useOffers } from '@/features/offers/hooks'
import {
  bestSnapshot,
  isReliable,
  SIDES,
  SORT_KEYS,
  sortOffers,
  type Side,
  type SortKey,
} from '@/features/offers/lib'
import { toApiError } from '@/shared/api/client'
import { useMarketSnapshot } from '@/shared/api/queries/market'
import { plural } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { Chip } from '@/shared/ui/chip'
import { exchangeName } from '@/shared/ui/exchange-label'
import { LiveBadge } from '@/shared/ui/live-badge'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { useMarketSocket, useMarketSocketStatus } from '@/shared/ws/useMarketSocket'
import { selectSingleExchange, useFiltersStore } from '@/store/useFiltersStore'

const PAGE_SIZE = 10
const OFFER_FORMS = ['оголошення', 'оголошення', 'оголошень'] as const
const EXCHANGE_FORMS = ['біржі', 'бірж', 'бірж'] as const

const SIDE_LABELS: Record<Side, string> = { BUY: 'купівля', SELL: 'продаж' }
const SORT_DESCRIPTIONS: Record<SortKey, string> = {
  price: 'ціною',
  rating: 'рейтингом продавця',
  limit: 'верхнім лімітом',
}

function sortLabel(sort: SortKey, side: Side) {
  if (sort === 'price') return side === 'BUY' ? 'Ціна ↑' : 'Ціна ↓'
  return sort === 'rating' ? 'Рейтинг' : 'Ліміт'
}

export function OffersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sideParam = searchParams.get('side') as Side | null
  const sortParam = searchParams.get('sort') as SortKey | null
  const side: Side = sideParam && SIDES.includes(sideParam) ? sideParam : 'BUY'
  const sort: SortKey = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'price'
  const reliableOnly = searchParams.get('reliable') !== '0'

  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const bank = useFiltersStore((state) => state.bank)
  const amount = useFiltersStore((state) => state.amount)
  const exchanges = useFiltersStore((state) => state.exchanges)
  const resetFilters = useFiltersStore((state) => state.reset)
  const exchange = selectSingleExchange({ exchanges })

  useMarketSocket(asset, fiat)
  const liveStatus = useMarketSocketStatus()

  const offersQuery = useOffers({
    asset,
    fiat,
    side,
    payment: bank ?? undefined,
    amount: amount ?? undefined,
    exchange,
  })
  const snapshotQuery = useMarketSnapshot({ asset, fiat, amount: amount ?? undefined, exchange })

  const data = offersQuery.data
  const visible = useMemo(() => {
    const items = (data?.items ?? []).filter(
      (offer) =>
        (exchanges as string[]).includes(offer.exchange) &&
        (!reliableOnly || isReliable(offer.merchant)),
    )
    return sortOffers(items, sort, side)
  }, [data, exchanges, reliableOnly, sort, side])

  const bestOffer = useMemo(() => sortOffers(visible, 'price', side)[0], [visible, side])
  const snapshot = useMemo(
    () => bestSnapshot(snapshotQuery.data?.items ?? [], exchanges, bank, side),
    [snapshotQuery.data, exchanges, bank, side],
  )

  const viewKey = [asset, fiat, side, sort, bank, amount, exchanges.join(), reliableOnly].join('|')
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 })
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const page = Math.min(pageState.key === viewKey ? pageState.page : 1, pageCount)
  const pageOffers = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  function setParam(name: string, value: string | null) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value === null) next.delete(name)
        else next.set(name, value)
        return next
      },
      { replace: true },
    )
  }

  function reset() {
    resetFilters()
    setSearchParams({}, { replace: true })
  }

  const exchangesWithOffers = new Set(visible.map((offer) => offer.exchange)).size
  const staleExchanges = (data?.freshness ?? []).filter(
    (item) => item.stale && (exchanges as string[]).includes(item.exchange),
  )
  const isLoading = offersQuery.isPending
  const failed = offersQuery.isError && !data
  const refreshSec = OFFERS_REFRESH_MS / 1000

  const description = data
    ? `${visible.length} ${plural(visible.length, OFFER_FORMS)} з ${exchangesWithOffers} ${plural(exchangesWithOffers, EXCHANGE_FORMS)} · автооновлення кожні ${refreshSec} с`
    : `Оголошення з P2P-бірж · автооновлення кожні ${refreshSec} с`

  return (
    <>
      <PageHeader
        title="Сканер P2P-оголошень"
        description={description}
        actions={
          <>
            <LiveBadge status={liveStatus} />
            <Button
              variant="secondary"
              onClick={() => {
                void offersQuery.refetch()
                void snapshotQuery.refetch()
              }}
              disabled={offersQuery.isFetching}
            >
              <RefreshCw className={cn(offersQuery.isFetching && 'animate-spin')} />
              Оновити
            </Button>
          </>
        }
      />

      <OffersFilters
        side={side}
        onSideChange={(value) => setParam('side', value === 'BUY' ? null : value)}
        reliableOnly={reliableOnly}
        onReliableOnlyChange={(value) => setParam('reliable', value ? null : '0')}
        onReset={reset}
      />

      <OffersSummary
        side={side}
        fiat={fiat}
        bestOffer={bestOffer}
        snapshot={snapshot}
        shown={visible.length}
        collected={data?.count}
      />

      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex flex-wrap items-center gap-2">
              <CardTitle>Оголошення</CardTitle>
              {staleExchanges.map((item) => (
                <Badge key={item.exchange} variant="warning">
                  {exchangeName(item.exchange)}: дані застаріли
                </Badge>
              ))}
            </div>
            <CardDescription>
              {asset}/{fiat} · {SIDE_LABELS[side]}
              {bank ? ` · ${paymentLabel(bank)}` : ''} · відсортовано за {SORT_DESCRIPTIONS[sort]}
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-caption text-muted-foreground">Сортування:</span>
            {SORT_KEYS.map((key) => (
              <Chip
                key={key}
                active={key === sort}
                onClick={() => setParam('sort', key === 'price' ? null : key)}
              >
                {sortLabel(key, side)}
              </Chip>
            ))}
          </div>
        </div>

        {failed ? (
          <div className="flex flex-col items-center gap-3 border-t px-5 py-12 text-center">
            <p className="text-body font-semibold">Не вдалося завантажити оголошення</p>
            <p className="text-caption text-muted-foreground">
              {toApiError(offersQuery.error).message}
            </p>
            <Button variant="secondary" onClick={() => void offersQuery.refetch()}>
              Спробувати ще
            </Button>
          </div>
        ) : (
          <>
            <OffersTable
              offers={pageOffers}
              side={side}
              bestPrice={bestOffer?.price}
              isLoading={isLoading}
            />
            {!isLoading && visible.length === 0 && (
              <div className="flex flex-col items-center gap-2 border-t px-5 py-12 text-center">
                <p className="text-body font-semibold">Оголошень за цими фільтрами немає</p>
                <p className="max-w-[520px] text-caption text-muted-foreground">
                  Сервер зберігає топ-20 оголошень кожної біржі, тож фільтри діють лише на них.
                  Спробуйте змінити суму чи банк або вимкнути «Тільки надійні продавці».
                </p>
              </div>
            )}
            {visible.length > 0 && (
              <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5">
                <span className="text-small text-muted-foreground">
                  Показано {(page - 1) * PAGE_SIZE + 1}–{(page - 1) * PAGE_SIZE + pageOffers.length}{' '}
                  з {visible.length}
                </span>
                <Pagination
                  page={page}
                  pageCount={pageCount}
                  onPageChange={(next) => setPageState({ key: viewKey, page: next })}
                />
              </div>
            )}
          </>
        )}
      </Card>
    </>
  )
}
