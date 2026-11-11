import type {
  ClientCommand,
  MarketEvent,
  MarketEventType,
  PairRef,
  ServerMessage,
  SocketStatus,
} from '@/shared/ws/types'

const RECONNECT_DELAYS_MS = [1_000, 2_000, 5_000, 10_000, 30_000]

export type MarketListener = (event: MarketEvent) => void

interface Subscription {
  pair: PairRef
  types: MarketEventType[]
  listener: MarketListener
}

interface SocketOptions {
  createSocket?: (url: string) => WebSocket
  reconnectDelaysMs?: number[]
}

function matches(subscription: Subscription, event: MarketEvent) {
  const { pair, types } = subscription
  return (
    types.includes(event.type) && pair.asset === event.data.asset && pair.fiat === event.data.fiat
  )
}

export class MarketSocket {
  private socket: WebSocket | null = null
  private status: SocketStatus = 'offline'
  private attempts = 0
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null
  private readonly subscriptions = new Set<Subscription>()
  private readonly statusListeners = new Set<() => void>()
  private readonly createSocket: (url: string) => WebSocket
  private readonly delays: number[]

  constructor(
    private readonly url: string,
    options: SocketOptions = {},
  ) {
    this.createSocket = options.createSocket ?? ((target) => new WebSocket(target))
    this.delays = options.reconnectDelaysMs ?? RECONNECT_DELAYS_MS
  }

  getStatus = () => this.status

  onStatusChange = (listener: () => void) => {
    this.statusListeners.add(listener)
    return () => {
      this.statusListeners.delete(listener)
    }
  }

  subscribe(pair: PairRef, types: MarketEventType[], listener: MarketListener) {
    const subscription: Subscription = { pair, types, listener }
    const fresh = types.filter((type) => this.count(pair, type) === 0)
    this.subscriptions.add(subscription)
    if (!this.socket) this.connect()
    else if (fresh.length) this.send({ action: 'subscribe', pairs: [pair], types: fresh })

    return () => {
      this.subscriptions.delete(subscription)
      const unused = types.filter((type) => this.count(pair, type) === 0)
      if (this.subscriptions.size === 0) this.close()
      else if (unused.length) this.send({ action: 'unsubscribe', pairs: [pair], types: unused })
    }
  }

  private count(pair: PairRef, type: MarketEventType) {
    let total = 0
    for (const { pair: other, types } of this.subscriptions) {
      if (other.asset === pair.asset && other.fiat === pair.fiat && types.includes(type)) total += 1
    }
    return total
  }

  private setStatus(status: SocketStatus) {
    if (this.status === status) return
    this.status = status
    for (const listener of this.statusListeners) listener()
  }

  private send(command: ClientCommand) {
    if (this.socket?.readyState === WebSocket.OPEN) this.socket.send(JSON.stringify(command))
  }

  private connect() {
    this.clearTimer()
    this.setStatus('connecting')
    let socket: WebSocket
    try {
      socket = this.createSocket(this.url)
    } catch {
      this.scheduleReconnect()
      return
    }
    this.socket = socket

    socket.onopen = () => {
      if (this.socket !== socket) return
      this.attempts = 0
      this.setStatus('live')
      for (const { pair, types } of this.subscriptions) {
        this.send({ action: 'subscribe', pairs: [pair], types })
      }
    }
    socket.onmessage = (message: MessageEvent) => {
      if (this.socket === socket) this.handle(message.data)
    }
    socket.onclose = () => {
      if (this.socket !== socket) return
      this.socket = null
      this.scheduleReconnect()
    }
  }

  private handle(raw: unknown) {
    if (typeof raw !== 'string') return
    let message: ServerMessage
    try {
      message = JSON.parse(raw) as ServerMessage
    } catch {
      return
    }
    if (message.type !== 'snapshot' && message.type !== 'opportunity') return
    for (const subscription of [...this.subscriptions]) {
      if (matches(subscription, message)) subscription.listener(message)
    }
  }

  private scheduleReconnect() {
    this.setStatus('offline')
    if (this.subscriptions.size === 0) return
    const delay = this.delays[Math.min(this.attempts, this.delays.length - 1)]
    this.attempts += 1
    this.reconnectTimer = setTimeout(() => this.connect(), delay)
  }

  private clearTimer() {
    if (this.reconnectTimer !== null) clearTimeout(this.reconnectTimer)
    this.reconnectTimer = null
  }

  private close() {
    this.clearTimer()
    const socket = this.socket
    this.socket = null
    this.attempts = 0
    socket?.close()
    this.setStatus('offline')
  }
}
