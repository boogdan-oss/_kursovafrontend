import {
  keepPreviousData,
  useMutation,
  useQueries,
  useQuery,
  type UseQueryResult,
} from '@tanstack/react-query'

import { fetchHealth, fetchHistory, fetchPing } from '@/features/dashboard/api'
import { RANGE_CONFIG, type Range } from '@/features/dashboard/lib'
import { queryKeys } from '@/shared/api/queryKeys'
import type { HistoryResponse } from '@/shared/api/types'

const HEALTH_REFRESH_MS = 10_000
const HISTORY_REFRESH_MS = 60_000
const HOUR_MS = 3_600_000

export function useHealth() {
  return useQuery({
    queryKey: queryKeys.health,
    queryFn: fetchHealth,
    refetchInterval: HEALTH_REFRESH_MS,
    meta: { silent: true },
  })
}

export function usePing() {
  return useMutation({ mutationFn: fetchPing })
}

function combineHistory(results: UseQueryResult<HistoryResponse>[]) {
  return {
    data: results.flatMap((result) => (result.data ? [result.data] : [])),
    isPending: results.some((result) => result.isPending),
  }
}

export function usePriceHistory(
  asset: string,
  fiat: string,
  exchanges: readonly string[],
  range: Range,
) {
  const { hours, interval } = RANGE_CONFIG[range]
  return useQueries({
    queries: exchanges.map((exchange) => ({
      queryKey: [...queryKeys.markets.history({ asset, fiat, exchange, interval }), range],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchHistory(
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
    })),
    combine: combineHistory,
  })
}
