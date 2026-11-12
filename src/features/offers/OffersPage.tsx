import { RefreshCw } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { OfferDepth } from '@/features/offers/components/OfferDepth'
import { OffersFilters } from '@/features/offers/components/OffersFilters'
import { OffersSummary } from '@/features/offers/components/OffersSummary'
import { OffersTable } from '@/features/offers/components/OffersTable'
import { OFFERS_REFRESH_MS, useOffers } from '@/features/offers/hooks'
import {
  bestSnapshot,
  depthLevels,
  isSuspicious,
  medianPrice,
  passesMerchant,
  SIDES,
  SORT_KEYS,
  sortOffers,
  type MerchantFilters,
  type Side,
  type SortKey,
} from '@/features/offers/lib'
import { toApiError } from '@/shared/api/client'
import { useMarketSnapshot } from '@/shared/api/queries/market'
import { useNow } from '@/shared/hooks/useNow'
import { formatNumber } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { ContextBar, ContextField, ContextLive } from '@/shared/ui/context-bar'
import { exchangeName } from '@/shared/ui/exchange-label'
import { PairSelect } from '@/shared/ui/pair-select'
import { Pagination } from '@/shared/ui/pagination'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'
import { Tag } from '@/shared/ui/tag'
import { useMarketSocket, useMarketSocketStatus } from '@/shared/ws/useMarketSocket'
import { EXCHANGES, selectSingleExchange, useFiltersStore } from '@/store/useFiltersStore'

const PAGE_SIZE = 14
const CLOCK_MS = 1_000

const SIDE_LABELS: Record<Side, string> = { BUY: 'купівля', SELL: 'продаж' }
const SORT_DESCRIPTIONS: Record<SortKey, string> = {
  price: 'ціною',
  rating: 'рейтингом продавця',
  limit: 'верхнім лімітом',
  volume: 'доступним обсягом',
}

function sortLabel(sort: SortKey, side: Side) {
  if (sort === 'price') return side === 'BUY' ? 'Ціна ▴' : 'Ціна ▾'
  return { rating: 'Рейтинг', limit: 'Ліміт', volume: 'Обсяг' }[sort]
}

export function OffersPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const sideParam = searchParams.get('side') as Side | null
  const sortParam = searchParams.get('sort') as SortKey | null
  const side: Side = sideParam && SIDES.includes(sideParam) ? sideParam : 'BUY'
  const sort: SortKey = sortParam && SORT_KEYS.includes(sortParam) ? sortParam : 'price'
  const minRate = searchParams.get('rate') !== '0'
  const minOrders = searchParams.get('orders') !== '0'
  const merchantFilters: MerchantFilters = useMemo(
    () => ({ minRate, minOrders }),
    [minRate, minOrders],
  )

  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const bank = useFiltersStore((state) => state.bank)
  const amount = useFiltersStore((state) => state.amount)
  const exchanges = useFiltersStore((state) => state.exchanges)
  const resetFilters = useFiltersStore((state) => state.reset)
  const exchange = selectSingleExchange({ exchanges })

  useMarketSocket(asset, fiat)
  const liveStatus = useMarketSocketStatus()
  const now = useNow(CLOCK_MS)

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
  const onExchanges = useMemo(
    () => (data?.items ?? []).filter((offer) => (exchanges as string[]).includes(offer.exchange)),
    [data, exchanges],
  )
  const visible = useMemo(
    () =>
      sortOffers(
        onExchanges.filter((offer) => passesMerchant(offer.merchant, merchantFilters)),
        sort,
        side,
      ),
    [onExchanges, merchantFilters, sort, side],
  )

  const bestOffer = useMemo(() => sortOffers(visible, 'price', side)[0], [visible, side])
  const snapshot = useMemo(
    () => bestSnapshot(snapshotQuery.data?.items ?? [], exchanges, bank, side),
    [snapshotQuery.data, exchanges, bank, side],
  )
  const snapshotPrice = snapshot
    ? side === 'BUY'
      ? snapshot.buy_price
      : snapshot.sell_price
    : null
  const reference = snapshotPrice ? Number(snapshotPrice) : medianPrice(onExchanges, side)
  const risky = onExchanges.filter((offer) => isSuspicious(offer, reference, side)).length
  const supply = visible.reduce((sum, offer) => sum + Number(offer.available), 0)
  const levels = useMemo(() => depthLevels(visible, side), [visible, side])

  const viewKey = [
    asset,
    fiat,
    side,
    sort,
    bank,
    amount,
    exchanges.join(),
    minRate,
    minOrders,
  ].join('|')
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 })
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const page = Math.min(pageState.key === viewKey ? pageState.page : 1, pageCount)
  const firstRank = (page - 1) * PAGE_SIZE + 1
  const pageOffers = visible.slice(firstRank - 1, page * PAGE_SIZE)

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

  function setMerchantFilters(next: MerchantFilters) {
    setSearchParams(
      (previous) => {
        const params = new URLSearchParams(previous)
        if (next.minRate) params.delete('rate')
        else params.set('rate', '0')
        if (next.minOrders) params.delete('orders')
        else params.set('orders', '0')
        return params
      },
      { replace: true },
    )
  }

  function reset() {
    resetFilters()
    setSearchParams({}, { replace: true })
  }

  const staleExchanges = (data?.freshness ?? []).filter(
    (item) => item.stale && (exchanges as string[]).includes(item.exchange),
  )
  const isLoading = offersQuery.isPending
  const failed = offersQuery.isError && !data
  const exchangesText =
    exchanges.length === EXCHANGES.length ? 'усі 6' : exchanges.map(exchangeName).join(' · ')

  return (
    <>
      <h1 className="sr-only">Сканер P2P-оголошень</h1>

      <ContextBar>
        <ContextField label="Пара">
          <PairSelect />
        </ContextField>
        <ContextField label="Банк">
          {bank ? paymentLabel(bank) : <span className="text-muted-foreground">усі</span>}
        </ContextField>
        <ContextField label="Сума угоди">
          {amount === null ? (
            <span className="text-muted-foreground">будь-яка</span>
          ) : (
            <>
              <span className="font-mono">{formatNumber(amount, { minDigits: 2 })}</span> {fiat}
            </>
          )}
        </ContextField>
        <ContextField label="Біржі">{exchangesText}</ContextField>
        <ContextField label="Дія">{side === 'BUY' ? 'Купівля' : 'Продаж'}</ContextField>
        <ContextLive
          status={liveStatus}
          updatedAt={offersQuery.dataUpdatedAt || undefined}
          now={now}
          cycleSec={OFFERS_REFRESH_MS / 1000}
        />
      </ContextBar>

      <div className="flex flex-col gap-2 p-2">
        <OffersFilters
          side={side}
          onSideChange={(value) => setParam('side', value === 'BUY' ? null : value)}
          merchantFilters={merchantFilters}
          onMerchantFiltersChange={setMerchantFilters}
          onReset={reset}
        />

        <OffersSummary
          side={side}
          asset={asset}
          bestOffer={bestOffer}
          snapshot={snapshot}
          shown={visible.length}
          collected={data ? onExchanges.length : undefined}
          supply={supply}
          risky={risky}
        />

        <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1fr)_360px]">
          <Panel className="overflow-hidden">
            <PanelHeader
              title={`Оголошення · ${SIDE_LABELS[side]} ${asset} за ${fiat}`}
              meta={`відсортовано за ${SORT_DESCRIPTIONS[sort]}${
                bank ? ` · ${paymentLabel(bank)}` : ''
              } · ризик — за угодами, виконанням і ціною`}
              actions={
                <>
                  {staleExchanges.map((item) => (
                    <Tag key={item.exchange} tone="warning">
                      {exchangeName(item.exchange)}: дані застаріли
                    </Tag>
                  ))}
                  <Segmented
                    value={sort}
                    onValueChange={(key) => setParam('sort', key === 'price' ? null : key)}
                    options={SORT_KEYS.map((key) => ({ value: key, label: sortLabel(key, side) }))}
                    size="sm"
                    label="Сортування"
                  />
                  <Button
                    variant="secondary"
                    size="terminal-sm"
                    className="w-[22px] px-0"
                    aria-label="Оновити"
                    disabled={offersQuery.isFetching}
                    onClick={() => {
                      void offersQuery.refetch()
                      void snapshotQuery.refetch()
                    }}
                  >
                    <RefreshCw
                      className={cn('!size-3', offersQuery.isFetching && 'animate-spin')}
                    />
                  </Button>
                </>
              }
            />

            {failed ? (
              <div className="flex flex-col items-center gap-2.5 px-3 py-10 text-center">
                <p className="text-ui-lg font-semibold">Не вдалося завантажити оголошення</p>
                <p className="text-ui text-muted-foreground">
                  {toApiError(offersQuery.error).message}
                </p>
                <Button
                  variant="secondary"
                  size="terminal"
                  onClick={() => void offersQuery.refetch()}
                >
                  Спробувати ще
                </Button>
              </div>
            ) : (
              <>
                <OffersTable
                  offers={pageOffers}
                  firstRank={firstRank}
                  side={side}
                  asset={asset}
                  fiat={fiat}
                  bestPrice={bestOffer?.price}
                  reference={reference}
                  isLoading={isLoading}
                />
                {!isLoading && visible.length === 0 && (
                  <div className="flex flex-col items-center gap-2 px-3 py-10 text-center">
                    <p className="text-ui-lg font-semibold">Оголошень за цими фільтрами немає</p>
                    <p className="max-w-[520px] text-ui text-muted-foreground">
                      Сервер зберігає топ-20 оголошень кожної біржі, тож фільтри діють лише на них.
                      Спробуйте змінити суму чи банк або вимкнути фільтри продавців.
                    </p>
                  </div>
                )}
                {visible.length > 0 && (
                  <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
                    <span className="text-ui text-muted-foreground">
                      Показано {firstRank}–{firstRank + pageOffers.length - 1} з {visible.length}
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
          </Panel>

          <OfferDepth
            levels={levels}
            asset={asset}
            isLoading={isLoading}
            className="xl:sticky xl:top-[72px]"
          />
        </div>
      </div>
    </>
  )
}
