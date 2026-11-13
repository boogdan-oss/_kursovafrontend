import { create } from 'zustand'

import type { AuthResponse, User } from '@/shared/api/types'

const STORAGE_KEY = 'upars-auth'

export interface Session {
  accessToken: string
  refreshToken: string
  user: User
}

function storage(remember: boolean): Storage | null {
  try {
    return remember ? globalThis.localStorage : globalThis.sessionStorage
  } catch {
    return null
  }
}

function read(remember: boolean): Session | null {
  try {
    const raw = storage(remember)?.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

function write(session: Session | null, remember: boolean) {
  try {
    for (const target of [storage(true), storage(false)]) target?.removeItem(STORAGE_KEY)
    if (session) storage(remember)?.setItem(STORAGE_KEY, JSON.stringify(session))
  } catch {
    return
  }
}

function toSession(response: AuthResponse): Session {
  return {
    accessToken: response.access_token,
    refreshToken: response.refresh_token,
    user: response.user,
  }
}

interface AuthState {
  session: Session | null
  remember: boolean
  signIn: (response: AuthResponse, remember: boolean) => void
  setUser: (user: User) => void
  signOut: () => void
}

function initialState() {
  const remembered = read(true)
  if (remembered) return { session: remembered, remember: true }
  return { session: read(false), remember: false }
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  ...initialState(),
  signIn: (response, remember) => {
    const session = toSession(response)
    write(session, remember)
    set({ session, remember })
  },
  setUser: (user) => {
    const { session, remember } = get()
    if (!session) return
    const next = { ...session, user }
    write(next, remember)
    set({ session: next })
  },
  signOut: () => {
    write(null, get().remember)
    set({ session: null })
  },
}))
