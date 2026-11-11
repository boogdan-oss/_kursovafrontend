import type { Query, QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import type { SnapshotResponse } from '@/shared/api/types'
import type { OpportunityEvent, PairRef, SnapshotEvent } from '@/shared/ws/types'

type Params = Record<string, unknown>

function paramsOf(query: Query, scope: string): Params | null {
  const [, kind, params] = query.queryKey
  return kind === scope && typeof params === 'object' && params !== null ? (params as Params) : null
}

function samePair(params: Params, pair: PairRef) {
  return params.asset === pair.asset && params.fiat === pair.fiat
}

function isExactSnapshot(params: Params, exchange: string) {
  return params.amount == null && (params.exchange == null || params.exchange === exchange)
}

export function applySnapshotEvent(client: QueryClient, { data }: SnapshotEvent) {
  client.setQueriesData<SnapshotResponse>(
    {
      queryKey: queryKeys.markets.all,
      predicate: (query) => {
        const params = paramsOf(query, 'snapshot')
        return params !== null && samePair(params, data) && isExactSnapshot(params, data.exchange)
      },
    },
    (current) =>
      current && {
        ...current,
        items: [...current.items.filter((item) => item.exchange !== data.exchange), ...data.items],
      },
  )
}

export function refreshAfterSnapshot(client: QueryClient, pair: PairRef & { exchange: string }) {
  void client.invalidateQueries({
    queryKey: queryKeys.markets.all,
    predicate: (query) => {
      const params = paramsOf(query, 'snapshot')
      return params !== null && samePair(params, pair) && !isExactSnapshot(params, pair.exchange)
    },
  })
  void client.invalidateQueries({
    queryKey: queryKeys.offers.all,
    predicate: (query) => {
      const params = paramsOf(query, 'list')
      return params !== null && samePair(params, pair)
    },
  })
}

export function refreshAfterOpportunity(client: QueryClient, { data }: OpportunityEvent) {
  void client.invalidateQueries({
    queryKey: queryKeys.opportunities.all,
    predicate: (query) => {
      const params = paramsOf(query, 'list') ?? paramsOf(query, 'history')
      if (params === null || params.fiat !== data.fiat) return false
      if (params.kind === 'chain') return data.kind === 'chain'
      return params.asset == null || params.asset === data.asset
    },
  })
}
