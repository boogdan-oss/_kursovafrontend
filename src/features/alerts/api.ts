import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type {
  AlertRule,
  AlertRuleInput,
  AlertRulePatch,
  AlertRulesResponse,
  NotificationsResponse,
  WatchlistInput,
  WatchlistItem,
  WatchlistResponse,
} from '@/shared/api/types'

const NOTIFICATIONS_LIMIT = 50

export async function fetchRules(signal?: AbortSignal) {
  const { data } = await apiClient.get<AlertRulesResponse>(endpoints.alertRules, { signal })
  return data
}

export async function createRule(input: AlertRuleInput) {
  const { data } = await apiClient.post<AlertRule>(endpoints.alertRules, input)
  return data
}

export async function updateRule(id: number, patch: AlertRulePatch) {
  const { data } = await apiClient.patch<AlertRule>(endpoints.alertRule(id), patch)
  return data
}

export async function deleteRule(id: number) {
  await apiClient.delete(endpoints.alertRule(id))
}

export async function fetchNotifications(signal?: AbortSignal) {
  const { data } = await apiClient.get<NotificationsResponse>(endpoints.notifications, {
    params: { limit: NOTIFICATIONS_LIMIT },
    signal,
  })
  return data
}

export async function markNotificationsRead(ids?: number[]) {
  await apiClient.post(endpoints.notificationsRead, ids ? { ids } : {})
}

export async function fetchWatchlist(signal?: AbortSignal) {
  const { data } = await apiClient.get<WatchlistResponse>(endpoints.watchlist, { signal })
  return data
}

export async function addToWatchlist(input: WatchlistInput) {
  const { data } = await apiClient.post<WatchlistItem>(endpoints.watchlist, input)
  return data
}

export async function removeFromWatchlist(id: number) {
  await apiClient.delete(endpoints.watchlistItem(id))
}
