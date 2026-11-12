import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { googleLogin, login, logout, register } from '@/features/auth/api'
import {
  GoogleCancelled,
  googleClientId,
  loadGoogle,
  requestGoogleCode,
} from '@/features/auth/google'
import { toApiError } from '@/shared/api/client'
import type { LoginRequest } from '@/shared/api/types'
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
  return typeof from === 'string' && from.startsWith('/') && !from.startsWith('//') ? from : '/'
}

type GoogleAccounts = Awaited<ReturnType<typeof loadGoogle>>

export function useGoogleLogin() {
  const signIn = useAuthStore((state) => state.signIn)
  const clientId = googleClientId()
  const [accounts, setAccounts] = useState<GoogleAccounts | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)

  useEffect(() => {
    if (!clientId) return
    let active = true
    loadGoogle()
      .then((loaded) => active && setAccounts(loaded))
      .catch((error: Error) => active && setLoadError(error.message))
    return () => {
      active = false
    }
  }, [clientId])

  const mutation = useMutation({
    mutationFn: async ({ code }: { code: Promise<string>; remember: boolean }) =>
      googleLogin(await code),
    onSuccess: (response, { remember }) => signIn(response, remember),
  })

  function start(remember: boolean) {
    if (!clientId || !accounts || mutation.isPending) return
    mutation.mutate({ code: requestGoogleCode(accounts, clientId), remember })
  }

  const cancelled = mutation.error instanceof GoogleCancelled
  return {
    configured: clientId !== null,
    ready: accounts !== null,
    pending: mutation.isPending,
    error:
      loadError ?? (mutation.isError && !cancelled ? toApiError(mutation.error).message : null),
    start,
  }
}
