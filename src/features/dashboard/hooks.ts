import { useMutation, useQuery } from '@tanstack/react-query'

import { fetchHealth, fetchPing } from '@/features/dashboard/api'

const HEALTH_REFRESH_MS = 10_000

export function useHealth() {
  return useQuery({
    queryKey: ['health'],
    queryFn: fetchHealth,
    refetchInterval: HEALTH_REFRESH_MS,
  })
}

export function usePing() {
  return useMutation({ mutationFn: fetchPing })
}
