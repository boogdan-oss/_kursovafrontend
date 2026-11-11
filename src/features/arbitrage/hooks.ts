import { keepPreviousData, useQuery } from '@tanstack/react-query'

import {
  fetchDealQuote,
  fetchOpportunities,
  fetchOpportunityHistory,
  type DealRequest,
} from '@/features/arbitrage/api'
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
