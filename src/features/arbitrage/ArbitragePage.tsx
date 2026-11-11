import { BellPlus, Download } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

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
  type KindFilter,
  type Period,
  type Thresholds,
} from '@/features/arbitrage/lib'
import { toApiError } from '@/shared/api/client'
import { useNow } from '@/shared/hooks/useNow'
import { formatRelativeTime, plural } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { LiveBadge } from '@/shared/ui/live-badge'
import { PageHeader } from '@/shared/ui/page-header'
import { Pagination } from '@/shared/ui/pagination'
import { useMarketSocket, useMarketSocketStatus } from '@/shared/ws/useMarketSocket'
import { useFiltersStore } from '@/store/useFiltersStore'

const PAGE_SIZE = 8
const CLOCK_MS = 1_000
const ACTIVE_FORMS = ['активна', 'активні', 'активних'] as const
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
    () => [
      ...(pairQuery.data?.items ?? []),
      ...(chainsQuery.data?.items ?? []).filter((item) => involvesAsset(item, asset)),
    ],
    [pairQuery.data, chainsQuery.data, asset],
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

  const history = useMemo(() => historyQuery.data?.items ?? [], [historyQuery.data])
  const checkedAt = historyQuery.dataUpdatedAt || now
  const activeSince = useMemo(
    () => startsByOpportunity(all, activeStarts(history, checkedAt)),
    [all, history, checkedAt],
  )

  const viewKey = [asset, fiat, kind, amount, minNet, minAiScore, minVolume, liquidOnly].join('|')
  const [pageState, setPageState] = useState({ key: viewKey, page: 1 })
  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE))
  const page = Math.min(pageState.key === viewKey ? pageState.page : 1, pageCount)
  const pageItems = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const [selectedKey, setSelectedKey] = useState<string>()
  const selected =
    pageItems.find((item) => opportunityKey(item) === selectedKey) ?? pageItems[0] ?? undefined

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

  const activeText = pairQuery.data
    ? ` · ${passing.length} ${plural(passing.length, ACTIVE_FORMS)}`
    : ''
  const description = `Міжбіржові угоди, спред усередині біржі та ланцюжки${activeText} · з урахуванням усіх комісій`

  return (
    <>
      <PageHeader
        title="Арбітражні можливості"
        description={description}
        actions={
          <>
            <LiveBadge status={liveStatus} />
            <Button asChild variant="secondary">
              <Link to="/alerts">
                <BellPlus />
                Створити сповіщення
              </Link>
            </Button>
            <Button
              variant="secondary"
              disabled={visible.length === 0}
              onClick={() => downloadCsv(`arbitrage-${asset}-${fiat}.csv`, toCsv(visible))}
            >
              <Download />
              Експорт CSV
            </Button>
          </>
        }
      />

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

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <Card className="w-full min-w-0 flex-1 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <div className="flex flex-col gap-0.5">
              <CardTitle>Активні можливості</CardTitle>
              <CardDescription>
                {asset}/{fiat} · Net % — після комісій P2P, виводу та мережі
              </CardDescription>
            </div>
            <span className="text-small text-muted-foreground">
              {pairQuery.dataUpdatedAt
                ? `оновлено ${formatRelativeTime(pairQuery.dataUpdatedAt, now)} · автооновлення кожні ${refreshSec} с`
                : 'завантаження…'}
            </span>
          </div>

          {failed ? (
            <div className="flex flex-col items-center gap-3 border-t px-5 py-12 text-center">
              <p className="text-body font-semibold">Не вдалося завантажити можливості</p>
              <p className="text-caption text-muted-foreground">
                {toApiError(pairQuery.error).message}
              </p>
              <Button variant="secondary" onClick={() => void pairQuery.refetch()}>
                Спробувати ще
              </Button>
            </div>
          ) : (
            <>
              <OpportunityList
                items={pageItems}
                selectedKey={selected && opportunityKey(selected)}
                onSelect={setSelectedKey}
                activeSince={activeSince}
                now={now}
                isLoading={isLoading}
              />
              {!isLoading && visible.length === 0 && (
                <div className="flex flex-col items-center gap-3 border-t px-5 py-12 text-center">
                  <p className="text-body font-semibold">
                    {kind === 'chain' && chainsLoading
                      ? 'Шукаємо ланцюжки…'
                      : 'Можливостей за цими фільтрами немає'}
                  </p>
                  <p className="max-w-[520px] text-caption text-muted-foreground">
                    {kind === 'chain' && chainsLoading
                      ? 'Ланцюжки рахуються по всіх парах, це триває до 10 секунд.'
                      : hidden > 0
                        ? `Ще ${hidden} ${plural(hidden, HIDDEN_FORMS)} пороги: знизьте Мін. Net % чи Мін. AI Score або вимкніть «Тільки ліквідні».`
                        : `Зараз на біржах немає прибуткових після комісій угод для ${asset}/${fiat}. Список оновиться автоматично.`}
                  </p>
                  {hidden > 0 && !(kind === 'chain' && chainsLoading) && (
                    <Button variant="secondary" onClick={relaxThresholds}>
                      Показати всі
                    </Button>
                  )}
                </div>
              )}
              {visible.length > PAGE_SIZE && (
                <div className="flex flex-wrap items-center justify-between gap-3 border-t px-5 py-3.5">
                  <span className="text-small text-muted-foreground">
                    Показано {(page - 1) * PAGE_SIZE + 1}–
                    {(page - 1) * PAGE_SIZE + pageItems.length} з {visible.length}
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

        {selected && !failed && (
          <OpportunityDetails
            key={opportunityKey(selected)}
            opportunity={selected}
            activeSince={activeSince.get(opportunityKey(selected))}
            now={now}
            className="w-full xl:w-[420px] xl:shrink-0"
          />
        )}
      </div>

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
    </>
  )
}
