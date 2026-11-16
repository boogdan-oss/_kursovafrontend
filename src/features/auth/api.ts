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

export interface NotifyEmailCode {
  email: string
  expires_in: number
}

export type TestChannel = 'telegram' | 'email'

export interface TestNotificationResult {
  channel: TestChannel
  sent_to: string
}

export async function requestNotifyEmail(email: string) {
  const { data } = await apiClient.post<NotifyEmailCode>(endpoints.meNotifyEmail, { email })
  return data
}

export async function confirmNotifyEmail(code: string) {
  const { data } = await apiClient.post<User>(endpoints.meNotifyEmailConfirm, { code })
  return data
}

export async function clearNotifyEmail() {
  const { data } = await apiClient.delete<User>(endpoints.meNotifyEmail)
  return data
}

export async function sendTestNotification(channel: TestChannel) {
  const { data } = await apiClient.post<TestNotificationResult>(endpoints.meNotificationTest, {
    channel,
  })
  return data
}
