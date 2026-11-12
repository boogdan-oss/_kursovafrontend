import { keepPreviousData, useQueries, useQuery } from '@tanstack/react-query'

import { fetchOpportunities, fetchOpportunityHistory } from '@/features/arbitrage/api'
import { spreadSeries } from '@/features/arbitrage/lib'
import { fetchDealQuote, type DealRequest } from '@/shared/api/queries/calculator'
import { fetchMarketHistory } from '@/shared/api/queries/market'
import { queryKeys } from '@/shared/api/queryKeys'
import type {
  OpportunitiesHistoryParams,
  OpportunitiesParams,
  OpportunityItem,
} from '@/shared/api/types'

export const OPPORTUNITIES_REFRESH_MS = 30_000
const CHAINS_REFRESH_MS = 60_000
const CHAINS_TIMEOUT_MS = 30_000
const HISTORY_REFRESH_MS = 60_000

interface PairParams {
  asset: string
  fiat: string
  investment?: number
}

export function useOpportunities(params: PairParams) {
  return useQuery({
    queryKey: queryKeys.opportunities.list(params),
    queryFn: ({ signal }) => fetchOpportunities(params, { signal }),
    refetchInterval: OPPORTUNITIES_REFRESH_MS,
    placeholderData: keepPreviousData,
  })
}

export function useChains({ fiat, investment }: Omit<PairParams, 'asset'>) {
  const params: OpportunitiesParams = { fiat, kind: 'chain', investment }
  return useQuery({
    queryKey: queryKeys.opportunities.list(params),
    queryFn: ({ signal }) => fetchOpportunities(params, { signal, timeout: CHAINS_TIMEOUT_MS }),
    refetchInterval: CHAINS_REFRESH_MS,
    staleTime: CHAINS_REFRESH_MS,
    placeholderData: keepPreviousData,
    meta: { silent: true },
  })
}

export function useOpportunityHistory(params: OpportunitiesHistoryParams) {
  return useQuery({
    queryKey: queryKeys.opportunities.history(params),
    queryFn: ({ signal }) => fetchOpportunityHistory(params, signal),
    refetchInterval: HISTORY_REFRESH_MS,
    placeholderData: keepPreviousData,
    meta: { silent: true },
  })
}

export function useDealQuote(opportunity: OpportunityItem | undefined) {
  const request: DealRequest | null =
    opportunity && opportunity.kind !== 'chain' && opportunity.investment != null
      ? {
          asset: opportunity.asset,
          fiat: opportunity.fiat,
          investment: opportunity.investment,
          buy_exchange: opportunity.buy_exchange,
          sell_exchange: opportunity.sell_exchange,
          buy_price: opportunity.buy_price,
          sell_price: opportunity.sell_price,
        }
      : null

  return useQuery({
    queryKey: queryKeys.calculator.quote(request ?? {}),
    queryFn: ({ signal }) => fetchDealQuote(request!, signal),
    enabled: request !== null,
    meta: { silent: true },
  })
}

const SPREAD_WINDOW_MS = 60 * 60_000
const SPREAD_REFRESH_MS = 60_000

export function useRouteSpread(opportunity: OpportunityItem | undefined) {
  const enabled = opportunity !== undefined && opportunity.kind !== 'chain'
  const exchanges = enabled
    ? [...new Set([opportunity.buy_exchange, opportunity.sell_exchange])]
    : []
  const asset = opportunity?.asset ?? ''
  const fiat = opportunity?.fiat ?? ''

  return useQueries({
    queries: exchanges.map((exchange) => ({
      queryKey: [
        ...queryKeys.markets.history({ asset, fiat, exchange, interval: '1m' }),
        'route-spread',
      ],
      queryFn: ({ signal }: { signal: AbortSignal }) =>
        fetchMarketHistory(
          {
            asset,
            fiat,
            exchange,
            interval: '1m',
            from: new Date(Date.now() - SPREAD_WINDOW_MS).toISOString(),
          },
          signal,
        ),
      refetchInterval: SPREAD_REFRESH_MS,
      meta: { silent: true },
    })),
    combine: (results) => {
      const byExchange = new Map(
        results.flatMap((result) =>
          result.data ? [[result.data.exchange, result.data.items]] : [],
        ),
      )
      const buy = opportunity && byExchange.get(opportunity.buy_exchange)
      const sell = opportunity && byExchange.get(opportunity.sell_exchange)
      return {
        points: buy && sell ? spreadSeries(buy, sell) : [],
        isPending: results.some((result) => result.isPending),
      }
    },
  })
}
