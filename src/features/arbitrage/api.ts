import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  OpportunitiesHistoryParams,
  OpportunitiesParams,
  OpportunitiesResponse,
  OpportunityHistoryResponse,
} from '@/shared/api/types'

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
