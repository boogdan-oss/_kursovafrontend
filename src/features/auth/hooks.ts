import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'

import {
  changePassword,
  createTelegramLink,
  exchangeGoogleCode,
  fetchMe,
  GOOGLE_ERRORS,
  login,
  logout,
  register,
  unlinkTelegram,
  updateProfile,
  updateSettings,
} from '@/features/auth/api'
import { safeNext } from '@/features/auth/lib'
import { queryKeys } from '@/shared/api/queryKeys'
import type { AuthResponse, LoginRequest } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useFiltersStore } from '@/store/useFiltersStore'

export function useLogin() {
  const signIn = useAuthStore((state) => state.signIn)
  return useMutation({
    mutationFn: ({ body }: { body: LoginRequest; remember: boolean }) => login(body),
    onSuccess: (response, { remember }) => signIn(response, remember),
  })
}

export function useRegister() {
  const signIn = useAuthStore((state) => state.signIn)
  return useMutation({
    mutationFn: register,
    onSuccess: (response) => signIn(response, true),
  })
}

export function useLogout() {
  const queryClient = useQueryClient()
  const signOut = useAuthStore((state) => state.signOut)
  return useMutation({
    mutationFn: async () => {
      const refreshToken = useAuthStore.getState().session?.refreshToken
      if (refreshToken) await logout(refreshToken).catch(() => undefined)
    },
    onSettled: () => {
      signOut()
      queryClient.clear()
    },
  })
}

export function useAuthRedirectTarget() {
  const location = useLocation()
  const from = (location.state as { from?: unknown } | null)?.from
  return safeNext(typeof from === 'string' ? from : null)
}

const GOOGLE_REMEMBER_KEY = 'upars-google-remember'

export function rememberForGoogle(remember: boolean) {
  try {
    globalThis.sessionStorage.setItem(GOOGLE_REMEMBER_KEY, remember ? '1' : '0')
  } catch {
    return
  }
}

export function takeGoogleRemember() {
  try {
    const value = globalThis.sessionStorage.getItem(GOOGLE_REMEMBER_KEY)
    globalThis.sessionStorage.removeItem(GOOGLE_REMEMBER_KEY)
    return value !== '0'
  } catch {
    return true
  }
}

const exchanges = new Map<string, Promise<AuthResponse>>()

export function exchangeOnce(code: string) {
  let pending = exchanges.get(code)
  if (!pending) {
    pending = exchangeGoogleCode(code)
    exchanges.set(code, pending)
  }
  return pending
}

export function useGoogleError() {
  const [params] = useSearchParams()
  const code = params.get('error')
  return code ? (GOOGLE_ERRORS[code] ?? GOOGLE_ERRORS.google_failed) : null
}

export function useMe(enabled = true) {
  const setUser = useAuthStore((state) => state.setUser)
  const query = useQuery({
    queryKey: queryKeys.auth.me(),
    queryFn: ({ signal }) => fetchMe(signal),
    enabled,
  })
  const { data } = query
  useEffect(() => {
    if (data) setUser(data)
  }, [data, setUser])
  return query
}

export function useUpdateProfile() {
  const client = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (user) => {
      setUser(user)
      client.setQueryData(queryKeys.auth.me(), user)
      void client.invalidateQueries({ queryKey: queryKeys.community.profile(user.username) })
    },
  })
}

export function useUpdateSettings() {
  const client = useQueryClient()
  const setUser = useAuthStore((state) => state.setUser)
  return useMutation({
    mutationFn: updateSettings,
    onSuccess: (user) => {
      setUser(user)
      client.setQueryData(queryKeys.auth.me(), user)
      const { default_asset, default_fiat, default_payment, default_investment } = user.settings
      const filters = useFiltersStore.getState()
      if (default_asset && default_fiat) filters.setPair(default_asset, default_fiat)
      if (default_asset && default_fiat) filters.setBank(default_payment ?? null)
      if (default_investment) filters.setAmount(Number(default_investment))
    },
  })
}

export function useChangePassword() {
  const queryClient = useQueryClient()
  const signOut = useAuthStore((state) => state.signOut)
  return useMutation({
    mutationFn: ({ current, next }: { current: string; next: string }) =>
      changePassword(current, next),
    onSuccess: () => {
      signOut()
      queryClient.clear()
    },
  })
}

export function useTelegramLink() {
  return useMutation({ mutationFn: createTelegramLink })
}

export function useUnlinkTelegram() {
  const client = useQueryClient()
  return useMutation({
    mutationFn: unlinkTelegram,
    onSuccess: () => client.invalidateQueries({ queryKey: queryKeys.auth.me() }),
  })
}
