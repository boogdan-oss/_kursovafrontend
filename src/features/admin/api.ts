import { apiClient } from '@/shared/api/client'
import type {
  AdminUser,
  AdminUsersResponse,
  BansResponse,
  HiddenResponse,
  ModerationStats,
  ReportsResponse,
  ReportState,
  ReportView,
  ResolveAction,
} from '@/shared/api/community-types'
import { endpoints } from '@/shared/api/endpoints'
import type { Role } from '@/shared/lib/roles'

const LIST_LIMIT = 100

export interface UsersParams {
  query?: string
  role?: Role
}

export async function fetchStats(signal?: AbortSignal) {
  const { data } = await apiClient.get<ModerationStats>(endpoints.adminStats, { signal })
  return data
}

export async function fetchReports(status: ReportState | null, signal?: AbortSignal) {
  const { data } = await apiClient.get<ReportsResponse>(endpoints.adminReports, {
    params: { status: status ?? undefined, limit: LIST_LIMIT },
    signal,
  })
  return data
}

export async function resolveReport(id: number, action: ResolveAction) {
  const { data } = await apiClient.post<ReportView>(endpoints.adminResolveReport(id), { action })
  return data
}

export async function fetchHidden(signal?: AbortSignal) {
  const { data } = await apiClient.get<HiddenResponse>(endpoints.adminHidden, {
    params: { limit: LIST_LIMIT },
    signal,
  })
  return data
}

export async function fetchUsers(params: UsersParams, signal?: AbortSignal) {
  const { data } = await apiClient.get<AdminUsersResponse>(endpoints.adminUsers, {
    params: { query: params.query || undefined, role: params.role, limit: LIST_LIMIT },
    signal,
  })
  return data
}

export async function setUserRole(id: number, role: Exclude<Role, 'owner'>) {
  const { data } = await apiClient.put<AdminUser>(endpoints.adminUserRole(id), { role })
  return data
}

export async function fetchActiveBans(signal?: AbortSignal) {
  const { data } = await apiClient.get<BansResponse>(endpoints.adminBans, {
    params: { active: true },
    signal,
  })
  return data
}
