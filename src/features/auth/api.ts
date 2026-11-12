import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { AuthResponse, LoginRequest, RegisterRequest, User } from '@/shared/api/types'

export async function login(body: LoginRequest) {
  const { data } = await apiClient.post<AuthResponse>(endpoints.authLogin, body)
  return data
}

export async function register(body: RegisterRequest) {
  const { data } = await apiClient.post<AuthResponse>(endpoints.authRegister, body)
  return data
}

export async function logout(refreshToken: string) {
  await apiClient.post(endpoints.authLogout, { refresh_token: refreshToken })
}

export async function fetchMe(signal?: AbortSignal) {
  const { data } = await apiClient.get<User>(endpoints.me, { signal })
  return data
}
