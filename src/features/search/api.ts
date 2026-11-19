import { apiClient } from '@/shared/api/client'
import type { UserHit } from '@/shared/api/community-types'
import { endpoints } from '@/shared/api/endpoints'
import type { PairsResponse } from '@/shared/api/types'

export const USER_RESULTS = 5

export async function fetchPairs(signal?: AbortSignal) {
  const { data } = await apiClient.get<PairsResponse>(endpoints.marketPairs, { signal })
  return data.items
}

export async function fetchUsers(query: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<UserHit[]>(endpoints.communityUsers, {
    params: { query, limit: USER_RESULTS },
    signal,
  })
  return data
}
