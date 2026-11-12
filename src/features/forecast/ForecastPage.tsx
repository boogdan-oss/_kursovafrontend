import { Info } from 'lucide-react'
import { useId, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ForecastChart, type FactPoint } from '@/features/forecast/components/ForecastChart'
import {
  BacktestTable,
  FeatureImportance,
  ModelList,
} from '@/features/forecast/components/ForecastDetails'
import { useForecast, useForecastHistory, useForecastModels } from '@/features/forecast/hooks'
import {
  CHART_RANGE_CONFIG,
  CHART_RANGES,
  DEFAULT_EXCHANGE,
  HORIZON_LABELS,
  HORIZON_PHRASES,
  HORIZONS,
  parseChartRange,
  parseHorizon,
} from '@/features/forecast/lib'
import { toApiError } from '@/shared/api/client'
import type { ForecastResponse } from '@/shared/api/forecast-types'
import { usePairOptions } from '@/shared/api/queries/market'
import { useNow } from '@/shared/hooks/useNow'
import { formatFiat, formatNumber, formatPercent, formatRelativeTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Field } from '@/shared/ui/field'
import { PageHeader } from '@/shared/ui/page-header'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { StatCard } from '@/shared/ui/stat-card'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const CLOCK_MS = 5_000
const SIDE = 'BUY'

function Legend({ label, className }: { label: string; className: string }) {
  return (
    <span className="flex items-center gap-1.5 text-small text-muted-foreground">
      <span className={className} aria-hidden />
      {label}
    </span>
  )
}

function ForecastStats({
  forecast,
  fiat,
  now,
}: {
  forecast: ForecastResponse | undefined
  fiat: string
  now: number
}) {
  if (!forecast) {
    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <Skeleton key={index} className="h-[102px] rounded-xl" />
        ))}
      </div>
    )
  }

  const horizon = parseHorizon(String(forecast.horizon_min))
  const change = Number(forecast.change_pct)
  const improvement = forecast.improvement_pct === null ? null : Number(forecast.improvement_pct)
  const confidence = formatPercent(Number(forecast.confidence_level) * 100, {
    minDigits: 0,
    maxDigits: 0,
  })
  const price = (value: string) => formatNumber(value, { minDigits: 2, maxDigits: 4 })

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
      <StatCard
        label="Поточна ціна"
        value={formatFiat(forecast.current_price, fiat, { maxDigits: 4 })}
        delta={`дані ${formatRelativeTime(forecast.current_time, now)}`}
      />
      <StatCard
        label={`Прогноз ${HORIZON_PHRASES[horizon]}`}
        value={formatFiat(forecast.predicted_price, fiat, { maxDigits: 4 })}
        delta={formatPercent(change, { signed: true })}
        deltaTone={change > 0 ? 'success' : change < 0 ? 'danger' : 'muted'}
      />
      <StatCard
        label={`Інтервал довіри ${confidence}`}
        value={`${price(forecast.lower)} – ${price(forecast.upper)}`}
        delta={`ширина ${formatPercent(forecast.interval_width_pct)}`}
      />
      <StatCard
        label="Точність (MAE)"
        value={forecast.mae === null ? '—' : formatFiat(forecast.mae, fiat, { maxDigits: 4 })}
        delta={
          forecast.mape_pct === null
            ? 'ще немає перевірок'
            : `MAPE ${formatPercent(forecast.mape_pct, { maxDigits: 3 })} на історії`
        }
      />
      <StatCard
        label="Порівняно з бейзлайном"
        value={
          improvement === null
            ? '—'
            : `${improvement >= 0 ? 'краще' : 'гірше'} на ${formatPercent(Math.abs(improvement), { maxDigits: 0, minDigits: 0 })}`
        }
        delta="наївний прогноз «як зараз»"
        deltaTone={improvement === null ? 'muted' : improvement >= 0 ? 'success' : 'warning'}
      />
    </div>
  )
}

export function ForecastPage() {
  const id = useId()
  const [searchParams, setSearchParams] = useSearchParams()
  const horizon = parseHorizon(searchParams.get('h'))
  const range = parseChartRange(searchParams.get('range'))

  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const setPair = useFiltersStore((state) => state.setPair)
  const { assets, fiats, markets } = usePairOptions(asset, fiat)

  const withPair = useMemo(
    () =>
      EXCHANGES.filter((code) =>
        markets.some((market) => market.asset === asset && market.exchange === code),
      ),
    [markets, asset],
  )
  const requested = searchParams.get('exchange') ?? DEFAULT_EXCHANGE
  const exchangeOptions: string[] = withPair.length ? withPair : [...EXCHANGES]
  const exchange = exchangeOptions.includes(requested) ? requested : exchangeOptions[0]

  const forecastQuery = useForecast({ asset, fiat, exchange, side: SIDE, horizon })
  const historyQuery = useForecastHistory(asset, fiat, exchange, range)
  const modelsQuery = useForecastModels()
  const now = useNow(CLOCK_MS)

  const forecast = forecastQuery.data
  const fact: FactPoint[] = useMemo(
    () =>
      (historyQuery.data?.items ?? []).flatMap((item) =>
        item.buy_price == null ? [] : [{ time: item.time, value: Number(item.buy_price) }],
      ),
    [historyQuery.data],
  )

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

  const forecastError = forecastQuery.isError && !forecast ? toApiError(forecastQuery.error) : null
  const pair = `${asset}/${fiat}`
  const modelName =
    forecast?.model ?? modelsQuery.data?.items.find((m) => m.status === 'active')?.name

  return (
    <>
      <PageHeader
        title="AI-прогноз ціни"
        description={`Прогноз на 15–60 хв на основі історії ринку${modelName ? ` · модель ${modelName}` : ''}`}
        actions={
          <>
            <Field label="Пара" htmlFor={`${id}-pair`} className="w-[150px]">
              <Select
                value={pair}
                onValueChange={(value) => {
                  const [nextAsset, nextFiat] = value.split('/')
                  setPair(nextAsset, nextFiat)
                }}
              >
                <SelectTrigger id={`${id}-pair`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    ...new Set([
                      pair,
                      ...assets.map((code) => `${code}/${fiat}`),
                      ...fiats.map((code) => `${asset}/${code}`),
                    ]),
                  ].map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Біржа" htmlFor={`${id}-exchange`} className="w-[140px]">
              <Select
                value={exchange}
                onValueChange={(value) =>
                  setParam('exchange', value === DEFAULT_EXCHANGE ? null : value)
                }
              >
                <SelectTrigger id={`${id}-exchange`}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {exchangeOptions.map((code) => (
                    <SelectItem key={code} value={code}>
                      {exchangeName(code)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Горизонт">
              <Tabs
                value={String(horizon)}
                onValueChange={(value) => setParam('h', value === '60' ? null : value)}
              >
                <TabsList>
                  {HORIZONS.map((value) => (
                    <TabsTrigger key={value} value={String(value)}>
                      {HORIZON_LABELS[value]}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </Field>
          </>
        }
      />

      {forecast?.note && (
        <p className="flex items-start gap-2 rounded-lg border border-primary/40 bg-primary-soft px-4 py-3 text-caption">
          <Info className="mt-0.5 size-4 shrink-0 text-primary" />
          {forecast.note}
        </p>
      )}

      {forecastError ? (
        <Card className="flex flex-col items-center gap-3 px-5 py-10 text-center">
          <p className="text-body font-semibold">Прогноз недоступний</p>
          <p className="max-w-[560px] text-caption text-muted-foreground">
            {forecastError.code === 'not_found' && forecastError.message === 'Not Found'
              ? 'Сервіс прогнозів на бекенді ще не підключений.'
              : forecastError.message}
          </p>
          <Button variant="secondary" onClick={() => void forecastQuery.refetch()}>
            Спробувати ще
          </Button>
        </Card>
      ) : (
        <ForecastStats forecast={forecast} fiat={fiat} now={now} />
      )}

      <Card className="flex flex-col gap-4 p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <CardTitle>Факт і прогноз</CardTitle>
            <CardDescription>
              {pair} · {exchangeName(exchange)} · купівля
            </CardDescription>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Legend label="Факт" className="h-[3px] w-3.5 rounded-full bg-foreground" />
            <Legend label="Прогноз" className="w-3.5 border-t-2 border-dashed border-primary" />
            <Legend label="Інтервал довіри" className="h-2 w-3.5 rounded-sm bg-primary/30" />
            <Tabs
              value={range}
              onValueChange={(value) => setParam('range', value === '5m' ? null : value)}
            >
              <TabsList>
                {CHART_RANGES.map((value) => (
                  <TabsTrigger key={value} value={value}>
                    {CHART_RANGE_CONFIG[value].label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
        <div className="relative h-[320px]">
          {historyQuery.isPending ? (
            <Skeleton className="size-full" />
          ) : (
            <ForecastChart fact={fact} forecast={forecastError ? undefined : forecast} />
          )}
          {!historyQuery.isPending && fact.length === 0 && (
            <div className="absolute inset-0 flex items-center justify-center">
              <Badge>
                Немає історії цін для {pair} на {exchangeName(exchange)}
              </Badge>
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_1fr_380px]">
        {!forecastError && <FeatureImportance forecast={forecast} />}
        {!forecastError && <BacktestTable forecast={forecast} horizon={horizon} />}
        <ModelList models={modelsQuery.data?.items} isError={modelsQuery.isError} fiat={fiat} />
      </div>
    </>
  )
}
