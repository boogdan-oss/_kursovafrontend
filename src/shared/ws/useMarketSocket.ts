import { useQueryClient } from '@tanstack/react-query'
import { useEffect, useSyncExternalStore } from 'react'

import { API_URL } from '@/shared/api/client'
import {
  applySnapshotEvent,
  refreshAfterOpportunity,
  refreshAfterSnapshot,
} from '@/shared/ws/cache'
import { MarketSocket } from '@/shared/ws/socket'
import { MARKET_EVENT_TYPES, type MarketEvent, type SocketStatus } from '@/shared/ws/types'

const WS_PATH = '/ws/market'
const REFRESH_INTERVAL_MS = 10_000

export function marketSocketUrl() {
  if (import.meta.env.MODE === 'test') return null
  const explicit = import.meta.env.VITE_WS_URL
  if (explicit) return explicit
  if (API_URL) return `${API_URL.replace(/^http/, 'ws')}${WS_PATH}`
  if (!import.meta.env.DEV) return null
  return `${window.location.origin.replace(/^http/, 'ws')}${WS_PATH}`
}

let instance: MarketSocket | null | undefined

function marketSocket() {
  if (instance === undefined) {
    const url = marketSocketUrl()
    instance = url ? new MarketSocket(url) : null
  }
  return instance
}

function createThrottle(intervalMs: number) {
  const lastRun = new Map<string, number>()
  const timers = new Map<string, ReturnType<typeof setTimeout>>()

  function run(key: string, task: () => void) {
    if (timers.has(key)) return
    const wait = Math.max(0, (lastRun.get(key) ?? 0) + intervalMs - Date.now())
    timers.set(
      key,
      setTimeout(() => {
        timers.delete(key)
        lastRun.set(key, Date.now())
        task()
      }, wait),
    )
  }

  function cancel() {
    for (const timer of timers.values()) clearTimeout(timer)
    timers.clear()
  }

  return { run, cancel }
}

export function useMarketSocket(asset: string, fiat: string) {
  const client = useQueryClient()

  useEffect(() => {
    const socket = marketSocket()
    if (!socket) return
    const throttle = createThrottle(REFRESH_INTERVAL_MS)

    function onEvent(event: MarketEvent) {
      if (event.type === 'snapshot') {
        applySnapshotEvent(client, event)
        throttle.run(`snapshot:${event.data.exchange}`, () =>
          refreshAfterSnapshot(client, event.data),
        )
      } else {
        throttle.run(`opportunity:${event.data.kind}`, () => refreshAfterOpportunity(client, event))
      }
    }

    const unsubscribe = socket.subscribe({ asset, fiat }, MARKET_EVENT_TYPES, onEvent)
    return () => {
      unsubscribe()
      throttle.cancel()
    }
  }, [client, asset, fiat])
}

const subscribeNever = () => () => {}
const disabled = (): SocketStatus => 'disabled'

export function useMarketSocketStatus(): SocketStatus {
  const socket = marketSocket()
  return useSyncExternalStore(
    socket?.onStatusChange ?? subscribeNever,
    socket?.getStatus ?? disabled,
  )
}
