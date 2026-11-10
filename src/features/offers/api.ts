import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { OffersParams, OffersResponse } from '@/shared/api/types'

export async function fetchOffers(params: OffersParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<OffersResponse>(endpoints.offers, { params, signal })
  return data
}
