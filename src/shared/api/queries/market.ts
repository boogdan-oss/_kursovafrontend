import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import { queryKeys } from '@/shared/api/queryKeys'
import type {
  MarketsParams,
  MarketsResponse,
  SnapshotParams,
  SnapshotResponse,
} from '@/shared/api/types'

const MARKETS_STALE_MS = 10 * 60_000
export const MARKET_REFRESH_MS = 30_000

export async function fetchMarkets(params: MarketsParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<MarketsResponse>(endpoints.markets, { params, signal })
  return data
}

export async function fetchMarketSnapshot(params: SnapshotParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<SnapshotResponse>(endpoints.marketSnapshot, {
    params,
    signal,
  })
  return data
}

export function useMarkets(params: MarketsParams) {
  return useQuery({
    queryKey: queryKeys.markets.list(params),
    queryFn: ({ signal }) => fetchMarkets(params, signal),
    staleTime: MARKETS_STALE_MS,
  })
}

export function useMarketSnapshot(params: SnapshotParams) {
  return useQuery({
    queryKey: queryKeys.markets.snapshot(params),
    queryFn: ({ signal }) => fetchMarketSnapshot(params, signal),
    refetchInterval: MARKET_REFRESH_MS,
    placeholderData: keepPreviousData,
  })
}
