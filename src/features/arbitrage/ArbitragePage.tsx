import { Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ArbitrageFilters } from '@/features/arbitrage/components/ArbitrageFilters'
import { OpportunityDetails } from '@/features/arbitrage/components/OpportunityDetails'
import { OpportunityHistory } from '@/features/arbitrage/components/OpportunityHistory'
import { OpportunityList } from '@/features/arbitrage/components/OpportunityList'
import {
  OPPORTUNITIES_REFRESH_MS,
  useChains,
  useOpportunities,
  useOpportunityHistory,
} from '@/features/arbitrage/hooks'
import {
  activeStarts,
  countByKind,
  downloadCsv,
  HISTORY_LIMIT,
  involvesAsset,
  KIND_FILTERS,
  opportunityKey,
  passesThresholds,
  PERIOD_HOURS,
  PERIODS,
  sortByNet,
  startsByOpportunity,
  toCsv,
  usesExchanges,
  type KindFilter,
  type Period,
  type Thresholds,
} from '@/features/arbitrage/lib'
import { toApiError } from '@/shared/api/client'
import { useNow } from '@/shared/hooks/useNow'
import { formatNumber, formatPercent, formatRelativeTime, plural } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { ContextBar, ContextField, ContextLive } from '@/shared/ui/context-bar'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Pagination } from '@/shared/ui/pagination'
import { PairSelect } from '@/shared/ui/pair-select'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { useMarketSocket, useMarketSocketStatus } from '@/shared/ws/useMarketSocket'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const PAGE_SIZE = 10
const CLOCK_MS = 1_000
const HIDDEN_FORMS = [
  'можливість не проходить',
  'можливості не проходять',
  'можливостей не проходять',
] as const

export function ArbitragePage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const kindParam = searchParams.get('type') as KindFilter | null
  const periodParam = searchParams.get('period') as Period | null
  const kind: KindFilter = kindParam && KIND_FILTERS.includes(kindParam) ? kindParam : 'all'
  const period: Period = periodParam && PERIODS.includes(periodParam) ? periodParam : 'day'
  const volumeParam = Number(searchParams.get('volume'))
  const minVolume = Number.isFinite(volumeParam) && volumeParam > 0 ? volumeParam : null
  const liquidOnly = searchParams.get('liquid') !== '0'

  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const amount = useFiltersStore((state) => state.amount)
  const exchanges = useFiltersStore((state) => state.exchanges)
  const minNet = useFiltersStore((state) => state.minSpread)
  const minAiScore = useFiltersStore((state) => state.minAiScore)
  const setMinSpread = useFiltersStore((state) => state.setMinSpread)
  const setMinAiScore = useFiltersStore((state) => state.setMinAiScore)
  const resetFilters = useFiltersStore((state) => state.reset)

  useMarketSocket(asset, fiat)
  const liveStatus = useMarketSocketStatus()

  const investment = amount ?? undefined
  const pairQuery = useOpportunities({ asset, fiat, investment })
  const chainsQuery = useChains({ fiat, investment })
  const historyQuery = useOpportunityHistory({
    asset,
    fiat,
    kind: kind === 'all' ? undefined : kind,
    hours: PERIOD_HOURS[period],
    limit: HISTORY_LIMIT,
  })
  const now = useNow(CLOCK_MS)

  const all = useMemo(
    () =>
      [
        ...(pairQuery.data?.items ?? []),
        ...(chainsQuery.data?.items ?? []).filter((item) => involvesAsset(item, asset)),
      ].filter((item) => usesExchanges(item, exchanges)),
    [pairQuery.data, chainsQuery.data, asset, exchanges],
  )
  const thresholds: Thresholds = useMemo(
    () => ({ minNet, minAiScore, minVolume, liquidOnly }),
    [minNet, minAiScore, minVolume, liquidOnly],
  )
  const passing = useMemo(
    () => all.filter((item) => passesThresholds(item, thresholds)),
    [all, thresholds],
  )
  const counts = useMemo(() => countByKind(passing), [passing])
  const visible = useMemo(
    () => sortByNet(kind === 'all' ? passing : passing.filter((item) => item.kind === kind)),
    [passing, kind],
  )
  const maxNet = passing.length
    ? Math.max(...passing.map((item) => Number(item.net_spread_pct)))
    : null

  const history = useMemo(() => historyQuery.data?.items ?? [], [historyQuery.data])
  const checkedAt = historyQuery.dataUpdatedAt || now
  const activeSince = useMemo(
    () => startsByOpportunity(all, activeStarts(history, checkedAt)),
    [all, history, checkedAt],
  )

  const viewKey = [asset, fiat, kind, amount, minNet, minAiScore, minVolume, liquidOnly, exchanges]
    .flat()
    .join('|')
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 })
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const page = Math.min(pageState.key === viewKey ? pageState.page : 1, pageCount)
  const firstRank = (page - 1) * PAGE_SIZE + 1
  const pageItems = visible.slice(firstRank - 1, page * PAGE_SIZE)

  const [selectedKey, setSelectedKey] = useState<string>()
  const selectedIndex = Math.max(
    0,
    pageItems.findIndex((item) => opportunityKey(item) === selectedKey),
  )
  const selected = pageItems[selectedIndex]

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

  function relaxThresholds() {
    setMinSpread(0)
    setMinAiScore(0)
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        next.delete('volume')
        next.set('liquid', '0')
        return next
      },
      { replace: true },
    )
  }

  const isLoading = pairQuery.isPending
  const failed = pairQuery.isError && !pairQuery.data
  const chainsLoading = chainsQuery.isPending
  const hidden = all.length - passing.length
  const refreshSec = OPPORTUNITIES_REFRESH_MS / 1000
  const exchangesText =
    exchanges.length === EXCHANGES.length ? 'усі 6' : exchanges.map(exchangeName).join(' · ')

  return (
    <>
      <h1 className="sr-only">Арбітражні можливості</h1>

      <ContextBar>
        <ContextField label="Пара">
          <PairSelect />
        </ContextField>
        <ContextField label="Сума угоди">
          {amount === null ? (
            <span className="text-muted-foreground">типова</span>
          ) : (
            <>
              <span className="font-mono">{formatNumber(amount, { minDigits: 2 })}</span> {fiat}
            </>
          )}
        </ContextField>
        <ContextField label="Біржі">{exchangesText}</ContextField>
        <ContextField label="Активні">
          <span className="font-mono">{pairQuery.data ? passing.length : '—'}</span>
        </ContextField>
        <ContextField label="Макс. Net">
          <span className="font-mono text-success">
            {maxNet === null ? '—' : formatPercent(maxNet, { signed: true })}
          </span>
        </ContextField>
        <ContextLive
          status={liveStatus}
          updatedAt={pairQuery.dataUpdatedAt || undefined}
          now={now}
          cycleSec={refreshSec}
        />
      </ContextBar>

      <div className="flex flex-col gap-2 p-2">
        <ArbitrageFilters
          kind={kind}
          onKindChange={(value) => setParam('type', value === 'all' ? null : value)}
          counts={counts}
          chainsLoading={chainsLoading}
          thresholds={thresholds}
          onMinVolumeChange={(value) => setParam('volume', value === null ? null : String(value))}
          onLiquidOnlyChange={(value) => setParam('liquid', value ? null : '0')}
          onReset={reset}
        />

        <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-2">
            <Panel className="overflow-hidden">
              <PanelHeader
                title="Активні можливості"
                meta={`Net — після комісій P2P, виводу та мережі${
                  pairQuery.dataUpdatedAt
                    ? ` · оновлено ${formatRelativeTime(pairQuery.dataUpdatedAt, now)}`
                    : ''
                }`}
                actions={
                  <Button
                    variant="secondary"
                    size="terminal-sm"
                    disabled={visible.length === 0}
                    onClick={() => downloadCsv(`arbitrage-${asset}-${fiat}.csv`, toCsv(visible))}
                  >
                    <Download className="!size-3" />
                    Експорт CSV
                  </Button>
                }
              />

              {failed ? (
                <div className="flex flex-col items-center gap-2.5 px-3 py-10 text-center">
                  <p className="text-ui-lg font-semibold">Не вдалося завантажити можливості</p>
                  <p className="text-ui text-muted-foreground">
                    {toApiError(pairQuery.error).message}
                  </p>
                  <Button
                    variant="secondary"
                    size="terminal"
                    onClick={() => void pairQuery.refetch()}
                  >
                    Спробувати ще
                  </Button>
                </div>
              ) : (
                <>
                  <OpportunityList
                    items={pageItems}
                    firstRank={firstRank}
                    selectedKey={selected && opportunityKey(selected)}
                    onSelect={setSelectedKey}
                    activeSince={activeSince}
                    now={now}
                    isLoading={isLoading}
                  />
                  {!isLoading && visible.length === 0 && (
                    <div className="flex flex-col items-center gap-2.5 px-3 py-10 text-center">
                      <p className="text-ui-lg font-semibold">
                        {kind === 'chain' && chainsLoading
                          ? 'Шукаємо ланцюжки…'
                          : 'Можливостей за цими фільтрами немає'}
                      </p>
                      <p className="max-w-[520px] text-ui text-muted-foreground">
                        {kind === 'chain' && chainsLoading
                          ? 'Ланцюжки рахуються по всіх парах, це триває до 10 секунд.'
                          : hidden > 0
                            ? `Ще ${hidden} ${plural(hidden, HIDDEN_FORMS)} пороги: знизьте Мін. Net чи Мін. AI Score або вимкніть «Тільки ліквідні».`
                            : `Зараз на вибраних біржах немає прибуткових після комісій угод для ${asset}/${fiat}. Список оновиться автоматично.`}
                      </p>
                      {hidden > 0 && !(kind === 'chain' && chainsLoading) && (
                        <Button variant="secondary" size="terminal" onClick={relaxThresholds}>
                          Показати всі
                        </Button>
                      )}
                    </div>
                  )}
                  {visible.length > PAGE_SIZE && (
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t px-3 py-2">
                      <span className="text-ui text-muted-foreground">
                        Показано {firstRank}–{firstRank + pageItems.length - 1} з {visible.length}
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

            <OpportunityHistory
              key={[asset, fiat, kind, period].join('|')}
              items={history}
              period={period}
              onPeriodChange={(value) => setParam('period', value === 'day' ? null : value)}
              now={now}
              checkedAt={checkedAt}
              isLoading={historyQuery.isPending}
              failed={historyQuery.isError}
            />
          </div>

          {selected && !failed && (
            <OpportunityDetails
              key={opportunityKey(selected)}
              opportunity={selected}
              rank={firstRank + selectedIndex}
              activeSince={activeSince.get(opportunityKey(selected))}
              now={now}
              className="xl:sticky xl:top-[72px]"
            />
          )}
        </div>
      </div>
    </>
  )
}
