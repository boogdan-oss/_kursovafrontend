import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import {
  addToWatchlist,
  createRule,
  deleteRule,
  fetchNotifications,
  fetchRules,
  fetchWatchlist,
  markNotificationsRead,
  removeFromWatchlist,
  updateRule,
} from '@/features/alerts/api'
import { queryKeys } from '@/shared/api/queryKeys'
import type { AlertRulePatch } from '@/shared/api/types'

const NOTIFICATIONS_REFRESH_MS = 30_000

export function useRules() {
  return useQuery({
    queryKey: queryKeys.alerts.rules(),
    queryFn: ({ signal }) => fetchRules(signal),
  })
}

export function useNotifications() {
  return useQuery({
    queryKey: queryKeys.alerts.notifications(),
    queryFn: ({ signal }) => fetchNotifications(signal),
    refetchInterval: NOTIFICATIONS_REFRESH_MS,
    meta: { silent: true },
  })
}

export function useWatchlist() {
  return useQuery({
    queryKey: queryKeys.watchlist,
    queryFn: ({ signal }) => fetchWatchlist(signal),
  })
}

export function useCreateRule() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: createRule,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.alerts.rules() }),
  })
}

export function useUpdateRule() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: number; patch: AlertRulePatch }) => updateRule(id, patch),
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.alerts.rules() }),
  })
}

export function useDeleteRule() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: deleteRule,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.alerts.rules() }),
  })
}

export function useMarkRead() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: markNotificationsRead,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.alerts.notifications() }),
  })
}

export function useAddToWatchlist() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: addToWatchlist,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.watchlist }),
  })
}

export function useRemoveFromWatchlist() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: removeFromWatchlist,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.watchlist }),
  })
}
