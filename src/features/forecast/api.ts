import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  ForecastModelsResponse,
  ForecastParams,
  ForecastResponse,
} from '@/shared/api/forecast-types'
import type { HistoryParams, HistoryResponse } from '@/shared/api/types'

export async function fetchForecast(params: ForecastParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<ForecastResponse>(endpoints.forecast, { params, signal })
  return data
}

export async function fetchForecastModels(signal?: AbortSignal) {
  const { data } = await apiClient.get<ForecastModelsResponse>(endpoints.forecastModels, {
    signal,
  })
  return data
}

export async function fetchPriceHistory(params: HistoryParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<HistoryResponse>(endpoints.marketHistory, {
    params,
    signal,
  })
  return data
}
