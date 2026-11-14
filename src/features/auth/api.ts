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

export interface SettingsPatch {
  default_asset?: string | null
  default_fiat?: string | null
  default_payment?: string | null
  default_investment?: string | null
  min_rr?: string | null
  extra_fees?: string | null
  hide_illiquid?: boolean | null
  notify_comments?: boolean | null
  notify_likes?: boolean | null
  language?: 'uk' | 'en' | null
}

export interface ProfilePatch {
  display_name?: string | null
  bio?: string | null
}

export async function updateProfile(body: ProfilePatch) {
  const { data } = await apiClient.patch<User>(endpoints.me, body)
  return data
}

export async function updateSettings(body: SettingsPatch) {
  const { data } = await apiClient.patch<User>(endpoints.meSettings, body)
  return data
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await apiClient.post(endpoints.authChangePassword, {
    current_password: currentPassword,
    new_password: newPassword,
  })
}

export interface TelegramLink {
  url: string
  expires_in: number
}

export async function createTelegramLink() {
  const { data } = await apiClient.post<TelegramLink>(endpoints.meTelegram)
  return data
}

export async function unlinkTelegram() {
  await apiClient.delete(endpoints.meTelegram)
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
