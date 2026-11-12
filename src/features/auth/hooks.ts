import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useLocation } from 'react-router-dom'

import { login, logout, register } from '@/features/auth/api'
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
