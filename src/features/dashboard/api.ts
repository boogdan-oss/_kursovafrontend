import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'

export type ComponentStatus = 'ok' | 'error'

export interface HealthResponse {
  status: 'ok' | 'degraded'
  version: string
  time: string
  components: Record<string, { status: ComponentStatus; detail: string | null }>
}

export interface PingResponse {
  message: string
  time: string
}

export async function fetchHealth() {
  const { data } = await apiClient.get<HealthResponse>(endpoints.health)
  return data
}

export async function fetchPing() {
  const { data } = await apiClient.get<PingResponse>(endpoints.ping)
  return data
}
