import { keepPreviousData, useQuery } from '@tanstack/react-query'

import { fetchOffers } from '@/features/offers/api'
import { queryKeys } from '@/shared/api/queryKeys'
import type { OffersParams } from '@/shared/api/types'

export const OFFERS_REFRESH_MS = 30_000
const QUEUED_REFRESH_MS = 5_000

export function useOffers(params: OffersParams) {
  return useQuery({
    queryKey: queryKeys.offers.list(params),
    queryFn: ({ signal }) => fetchOffers(params, signal),
    refetchInterval: (query) => (query.state.data?.queued ? QUEUED_REFRESH_MS : OFFERS_REFRESH_MS),
    placeholderData: keepPreviousData,
  })
}
