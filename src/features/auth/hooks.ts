import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation, useSearchParams } from 'react-router-dom'

import { exchangeGoogleCode, GOOGLE_ERRORS, login, logout, register } from '@/features/auth/api'
import { safeNext } from '@/features/auth/lib'
import type { AuthResponse, LoginRequest } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'

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
