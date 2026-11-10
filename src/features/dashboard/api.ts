import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { HealthResponse, PingResponse } from '@/shared/api/types'

export type { HealthResponse, PingResponse }
export type ComponentStatus = HealthResponse['components'][string]['status']

export async function fetchHealth() {
  const { data } = await apiClient.get<HealthResponse>(endpoints.health)
  return data
}

export async function fetchPing() {
  const { data } = await apiClient.get<PingResponse>(endpoints.ping)
  return data
}
