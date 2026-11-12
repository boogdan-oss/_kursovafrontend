import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchForecast, fetchForecastModels, fetchPriceHistory } from '@/features/forecast/api'
import { CHART_RANGE_CONFIG, type ChartRange } from '@/features/forecast/lib'
import type { ForecastParams } from '@/shared/api/forecast-types'
import { queryKeys } from '@/shared/api/queryKeys'

const FORECAST_REFRESH_MS = 60_000
const HISTORY_REFRESH_MS = 60_000
const MODELS_STALE_MS = 10 * 60_000
const HOUR_MS = 3_600_000

export function useForecast(params: ForecastParams) {
  return useQuery({
    queryKey: queryKeys.forecast.detail(params),
    queryFn: ({ signal }) => fetchForecast(params, signal),
    refetchInterval: FORECAST_REFRESH_MS,
    placeholderData: keepPreviousData,
  })
}

export function useForecastModels() {
  return useQuery({
    queryKey: queryKeys.forecast.models(),
    queryFn: ({ signal }) => fetchForecastModels(signal),
    staleTime: MODELS_STALE_MS,
    meta: { silent: true },
  })
}

export function useForecastHistory(
  asset: string,
  fiat: string,
  exchange: string,
  range: ChartRange,
) {
  const { interval, hours } = CHART_RANGE_CONFIG[range]
  return useQuery({
    queryKey: [...queryKeys.markets.history({ asset, fiat, exchange, interval }), range],
    queryFn: ({ signal }) =>
      fetchPriceHistory(
        {
          asset,
          fiat,
          exchange,
          interval,
          from: new Date(Date.now() - hours * HOUR_MS).toISOString(),
        },
        signal,
      ),
    refetchInterval: HISTORY_REFRESH_MS,
    placeholderData: keepPreviousData,
    meta: { silent: true },
  })
}
