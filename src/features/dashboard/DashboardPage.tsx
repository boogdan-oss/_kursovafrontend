import { useId, useMemo, useState } from 'react'

import { useOpportunities, useOpportunityHistory } from '@/features/arbitrage/hooks'
import { ExchangeStatus } from '@/features/dashboard/components/ExchangeStatus'
import { PriceChart, type ChartSeries } from '@/features/dashboard/components/PriceChart'
import { PriceTable } from '@/features/dashboard/components/PriceTable'
import { TopOpportunities } from '@/features/dashboard/components/TopOpportunities'
import { useHealth, usePriceHistory } from '@/features/dashboard/hooks'
import {
  EXCHANGE_COLORS,
  exchangePrices,
  exchangesSummary,
  FALLBACK_COLOR,
  maxBy,
  RANGE_DESCRIPTIONS,
  RANGE_LABELS,
  RANGES,
  type Range,
} from '@/features/dashboard/lib'
import { useMarketSnapshot, usePairOptions } from '@/shared/api/queries/market'
import { useNow } from '@/shared/hooks/useNow'
import {
  formatDuration,
  formatFiat,
  formatNumber,
  formatPercent,
  formatRelativeTime,
  plural,
} from '@/shared/lib/format'
import { paymentLabel, sortPayments } from '@/shared/lib/payments'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Field } from '@/shared/ui/field'
import { LiveBadge } from '@/shared/ui/live-badge'
import { NumberInput } from '@/shared/ui/number-input'
import { PageHeader } from '@/shared/ui/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useMarketSocket, useMarketSocketStatus } from '@/shared/ws/useMarketSocket'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const ANY_BANK = 'all'
const TOP_COUNT = 3
const CLOCK_MS = 1_000
const HISTORY_HOURS = 1
const HISTORY_LIMIT = 500
const FOUND_FORMS = ['знайдена', 'знайдені', 'знайдено'] as const

export function DashboardPage() {
  const id = useId()
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const bank = useFiltersStore((state) => state.bank)
  const amount = useFiltersStore((state) => state.amount)
  const setPair = useFiltersStore((state) => state.setPair)
  const setBank = useFiltersStore((state) => state.setBank)
  const setAmount = useFiltersStore((state) => state.setAmount)
  const [range, setRange] = useState<Range>('day')

  useMarketSocket(asset, fiat)
  const liveStatus = useMarketSocketStatus()
  const now = useNow(CLOCK_MS)

  const investment = amount ?? undefined
  const { assets, fiats, markets } = usePairOptions(asset, fiat)
  const snapshotQuery = useMarketSnapshot({ asset, fiat, amount: investment })
  const opportunitiesQuery = useOpportunities({ asset, fiat, investment })
  const recentQuery = useOpportunityHistory({
    asset,
    fiat,
    hours: HISTORY_HOURS,
    limit: HISTORY_LIMIT,
  })
  const health = useHealth()
  const history = usePriceHistory(asset, fiat, EXCHANGES, range)

  const banks = useMemo(() => {
    const methods = new Set<string>(bank ? [bank] : [])
    for (const market of markets) {
      if (market.asset !== asset) continue
      for (const method of market.payment_methods) methods.add(method)
    }
    return sortPayments([...methods])
  }, [markets, asset, bank])

  const rows = useMemo(
    () => exchangePrices(snapshotQuery.data?.items ?? [], bank),
    [snapshotQuery.data, bank],
  )
  const staleExchanges = (snapshotQuery.data?.freshness ?? [])
    .filter((item) => item.stale)
    .map((item) => item.exchange)

  const opportunities = useMemo(
    () => opportunitiesQuery.data?.items ?? [],
    [opportunitiesQuery.data],
  )
  const top = useMemo(
    () =>
      [...opportunities]
        .sort((a, b) => (b.ai_score ?? -1) - (a.ai_score ?? -1))
        .slice(0, TOP_COUNT),
    [opportunities],
  )
  const bestNet = maxBy(opportunities, (item) => Number(item.net_spread_pct))
  const bestScore = maxBy(opportunities, (item) => item.ai_score)
  const bestProfit = maxBy(opportunities, (item) => Number(item.estimated_profit))
  const bestRoute = maxBy(
    opportunities.filter((item) => item.kind === 'cross_exchange'),
    (item) => Number(item.net_spread_pct),
  )

  const series: ChartSeries[] = useMemo(
    () =>
      history.data
        .map((item) => ({
          id: item.exchange,
          title: exchangeName(item.exchange),
          color: EXCHANGE_COLORS[item.exchange] ?? FALLBACK_COLOR,
          points: item.items.flatMap((point) =>
            point.buy_price == null ? [] : [{ time: point.time, value: Number(point.buy_price) }],
          ),
        }))
        .filter((item) => item.points.length > 0),
    [history.data],
  )

  const exchanges = exchangesSummary(health.data?.exchanges ?? [])
  const recent = recentQuery.data?.count
  const loadingOpportunities = opportunitiesQuery.isPending
  const pair = `${asset}/${fiat}`
  const updated = snapshotQuery.dataUpdatedAt
    ? ` · оновлено ${formatRelativeTime(snapshotQuery.dataUpdatedAt, now)}`
    : ''
  const dash = (value: string) => (loadingOpportunities ? '…' : value)

  return (
    <>
      <PageHeader
        title="Огляд ринку"
        description={`${pair} · ціни, спреди й можливості на P2P-біржах${updated}`}
        actions={
          <>
            <Field label="Актив" htmlFor={`${id}-asset`} className="w-[110px]">
              <Select value={asset} onValueChange={(value) => setPair(value, fiat)}>
                <SelectTrigger id={`${id}-asset`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {assets.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Фіат" htmlFor={`${id}-fiat`} className="w-[100px]">
              <Select
                value={fiat}
                onValueChange={(value) => {
                  setPair(asset, value)
                  setBank(null)
                }}
              >
                <SelectTrigger id={`${id}-fiat`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fiats.map((code) => (
                    <SelectItem key={code} value={code}>
                      {code}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Банк" htmlFor={`${id}-bank`} className="w-[190px]">
              <Select
                value={bank ?? ANY_BANK}
                onValueChange={(value) => setBank(value === ANY_BANK ? null : value)}
              >
                <SelectTrigger id={`${id}-bank`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ANY_BANK}>Усі способи оплати</SelectItem>
                  {banks.map((code) => (
                    <SelectItem key={code} value={code}>
                      {paymentLabel(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Сума угоди" htmlFor={`${id}-amount`} className="w-[150px]">
              <NumberInput
                id={`${id}-amount`}
                value={amount}
                onValueChange={setAmount}
                suffix={fiat}
                placeholder="типова"
              />
            </Field>
            <LiveBadge status={liveStatus} />
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard
          label="Активні можливості"
          value={dash(formatNumber(opportunities.length))}
          delta={
            recent === undefined
              ? undefined
              : `${recent} ${plural(recent, FOUND_FORMS)} за останню годину`
          }
          deltaTone={recent ? 'success' : 'muted'}
        />
        <StatCard
          label="Найкращий чистий спред"
          value={dash(formatPercent(bestNet?.net_spread_pct))}
          delta={
            bestNet
              ? `${exchangeName(bestNet.buy_exchange)} → ${exchangeName(bestNet.sell_exchange)}`
              : 'немає можливостей'
          }
        />
        <StatCard
          label="Найкращий AI Score"
          value={dash(bestScore?.ai_score == null ? '—' : String(bestScore.ai_score))}
          delta={bestScore?.ai_category ?? 'немає можливостей'}
          deltaTone={(bestScore?.ai_score ?? 0) >= 80 ? 'success' : 'muted'}
        />
        <StatCard
          label="Потенційний прибуток"
          value={dash(formatFiat(bestProfit?.estimated_profit, fiat, { signed: true }))}
          delta={
            bestProfit?.investment != null
              ? `на ${formatFiat(bestProfit.investment, fiat, { minDigits: 0, maxDigits: 0 })}`
              : 'немає можливостей'
          }
          deltaTone={bestProfit ? 'success' : 'muted'}
        />
        <StatCard
          label="Біржі онлайн"
          value={health.data ? `${exchanges.online} / ${exchanges.total}` : '…'}
          delta={
            exchanges.maxAgeSec === null
              ? 'немає свіжих даних'
              : `затримка даних до ${formatDuration(exchanges.maxAgeSec)}`
          }
          deltaTone={health.data && exchanges.online < exchanges.total ? 'warning' : 'muted'}
        />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        <Card className="flex min-w-0 flex-1 flex-col gap-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-col gap-0.5">
              <CardTitle>{pair} — ціна купівлі</CardTitle>
              <CardDescription>Ефективна ціна за {RANGE_DESCRIPTIONS[range]}</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-4">
              {series.map((item) => (
                <span
                  key={item.id}
                  className="flex items-center gap-1.5 text-small text-muted-foreground"
                >
                  <span
                    className="h-[3px] w-3.5 rounded-sm"
                    style={{ backgroundColor: item.color }}
                    aria-hidden
                  />
                  {item.title}
                </span>
              ))}
              <Tabs value={range} onValueChange={(value) => setRange(value as Range)}>
                <TabsList>
                  {RANGES.map((value) => (
                    <TabsTrigger key={value} value={value}>
                      {RANGE_LABELS[value]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </div>
          </div>
          <div className="relative min-h-[260px] flex-1">
            <div className="absolute inset-0">
              <PriceChart series={series} />
            </div>
            {series.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center bg-card">
                {history.isPending ? (
                  <Skeleton className="size-full" />
                ) : (
                  <p className="text-caption text-muted-foreground">
                    Історії цін для {pair} за цей період ще немає
                  </p>
                )}
              </div>
            )}
          </div>
        </Card>

        <PriceTable
          rows={rows}
          staleExchanges={staleExchanges}
          asset={asset}
          fiat={fiat}
          bank={bank}
          bestRoute={bestRoute}
          isLoading={snapshotQuery.isPending}
          className="w-full xl:w-[440px] xl:shrink-0"
        />
      </div>

      <div className="flex flex-col gap-4 xl:flex-row">
        <TopOpportunities
          items={top}
          pair={pair}
          isLoading={loadingOpportunities}
          className="min-w-0 flex-1"
        />
        <ExchangeStatus
          health={health.data}
          failed={health.isError}
          className="w-full xl:w-[440px] xl:shrink-0"
        />
      </div>
    </>
  )
}
