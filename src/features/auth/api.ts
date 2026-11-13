import { API_URL, apiClient } from '@/shared/api/client'
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

export async function exchangeGoogleCode(code: string) {
  const { data } = await apiClient.post<AuthResponse>(endpoints.authGoogleExchange, { code })
  return data
}

export function googleStartUrl(next = '/') {
  const params = new URLSearchParams({ origin: window.location.origin, next })
  return `${API_URL}/api/v1${endpoints.authGoogleStart}?${params}`
}

export const GOOGLE_ERRORS: Record<string, string> = {
  google_denied: 'Вхід через Google скасовано.',
  google_state: 'Сесія входу застаріла. Спробуйте ще раз.',
  google_unverified: 'Email у вашому акаунті Google не підтверджений.',
  google_disabled: 'Вхід через Google поки недоступний.',
  account_blocked: 'Акаунт заблоковано або призупинено.',
  google_failed: 'Не вдалося увійти через Google. Спробуйте ще раз.',
}
