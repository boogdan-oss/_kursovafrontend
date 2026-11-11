import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  CalculatorRequest,
  CalculatorResponse,
  OpportunitiesHistoryParams,
  OpportunitiesParams,
  OpportunitiesResponse,
  OpportunityHistoryResponse,
} from '@/shared/api/types'

export type DealRequest = Omit<CalculatorRequest, 'extra_fees' | 'adverse_move_pct'>

interface RequestOptions {
  signal?: AbortSignal
  timeout?: number
}

export async function fetchOpportunities(
  params: OpportunitiesParams,
  options: RequestOptions = {},
) {
  const { data } = await apiClient.get<OpportunitiesResponse>(endpoints.opportunities, {
    params,
    ...options,
  })
  return data
}

export async function fetchOpportunityHistory(
  params: OpportunitiesHistoryParams,
  signal?: AbortSignal,
) {
  const { data } = await apiClient.get<OpportunityHistoryResponse>(endpoints.opportunitiesHistory, {
    params,
    signal,
  })
  return data
}

export async function fetchDealQuote(request: DealRequest, signal?: AbortSignal) {
  const { data } = await apiClient.post<CalculatorResponse>(endpoints.calculator, request, {
    signal,
  })
  return data
}
