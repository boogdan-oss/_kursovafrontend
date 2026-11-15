import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  fetchActiveBans,
  fetchHidden,
  fetchReports,
  fetchStats,
  fetchUsers,
  resolveReport,
  setUserRole,
  type UsersParams,
} from '@/features/admin/api'
import type { ReportState, ResolveAction } from '@/shared/api/community-types'
import { queryKeys } from '@/shared/api/queryKeys'
import type { Role } from '@/shared/lib/roles'

const STATS_REFRESH_MS = 60_000

export function useModerationStats() {
  return useQuery({
    queryKey: queryKeys.admin.stats(),
    queryFn: ({ signal }) => fetchStats(signal),
    refetchInterval: STATS_REFRESH_MS,
  })
}

export function useReports(status: ReportState | null) {
  return useQuery({
    queryKey: queryKeys.admin.reports(status),
    queryFn: ({ signal }) => fetchReports(status, signal),
    placeholderData: keepPreviousData,
  })
}

export function useHidden() {
  return useQuery({
    queryKey: queryKeys.admin.hidden(),
    queryFn: ({ signal }) => fetchHidden(signal),
  })
}

export function useUsers(params: UsersParams) {
  return useQuery({
    queryKey: queryKeys.admin.users(params),
    queryFn: ({ signal }) => fetchUsers(params, signal),
    placeholderData: keepPreviousData,
  })
}

export function useActiveBans() {
  return useQuery({
    queryKey: queryKeys.admin.bans(),
    queryFn: ({ signal }) => fetchActiveBans(signal),
  })
}

function useRefreshAdmin() {
  const client = useQueryClient()
  return () => {
    void client.invalidateQueries({ queryKey: queryKeys.admin.all })
    void client.invalidateQueries({ queryKey: queryKeys.community.all })
  }
}

export function useResolveReport() {
  const refresh = useRefreshAdmin()
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: ResolveAction }) =>
      resolveReport(id, action),
    onSuccess: refresh,
  })
}

export function useSetUserRole() {
  const refresh = useRefreshAdmin()
  return useMutation({
    mutationFn: ({ id, role }: { id: number; role: Exclude<Role, 'owner'> }) =>
      setUserRole(id, role),
    onSuccess: refresh,
  })
}

export function useAdminRefresh() {
  return useRefreshAdmin()
}
