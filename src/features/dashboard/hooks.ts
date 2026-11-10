import { useMutation, useQuery } from '@tanstack/react-query'

import { fetchHealth, fetchPing } from '@/features/dashboard/api'
import { queryKeys } from '@/shared/api/queryKeys'

const HEALTH_REFRESH_MS = 10_000

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
