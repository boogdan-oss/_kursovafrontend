import { QueryClient } from '@tanstack/react-query'

import { queryKeys } from '@/shared/api/queryKeys'
import type { MarketSnapshot, SnapshotResponse } from '@/shared/api/types'
import {
  applySnapshotEvent,
  refreshAfterOpportunity,
  refreshAfterSnapshot,
} from '@/shared/ws/cache'
import { MarketSocket } from '@/shared/ws/socket'
import type { MarketEvent, OpportunityEvent, SnapshotEvent } from '@/shared/ws/types'

class FakeSocket {
  static instances: FakeSocket[] = []
  readyState: number = WebSocket.CONNECTING
  sent: unknown[] = []
  onopen: (() => void) | null = null
  onmessage: ((event: { data: unknown }) => void) | null = null
  onclose: (() => void) | null = null

  constructor() {
    FakeSocket.instances.push(this)
  }

  send(text: string) {
    this.sent.push(JSON.parse(text))
  }

  open() {
    this.readyState = WebSocket.OPEN
    this.onopen?.()
  }

  receive(message: unknown) {
    this.onmessage?.({ data: JSON.stringify(message) })
  }

  close() {
    this.readyState = WebSocket.CLOSED
    this.onclose?.()
  }
}

function snapshot(exchange: string, buy: string): MarketSnapshot {
  return {
    exchange,
    asset: 'USDT',
    fiat: 'UAH',
    payment_method: null,
    buy_price: buy,
    sell_price: '41.72',
    spread_pct: '1.0',
    volume: '1000',
    offers_count_buy: 5,
    offers_count_sell: 5,
    fetched_at: '2026-11-11T12:00:00Z',
  }
}

const SNAPSHOT_EVENT: SnapshotEvent = {
  type: 'snapshot',
  ts: '2026-11-11T12:00:05Z',
  data: { exchange: 'bybit', asset: 'USDT', fiat: 'UAH', items: [snapshot('bybit', '41.01')] },
}

const PAIR = { asset: 'USDT', fiat: 'UAH' }

describe('MarketSocket', () => {
  beforeEach(() => {
    FakeSocket.instances = []
    vi.useFakeTimers()
  })

  afterEach(() => vi.useRealTimers())

  function create() {
    return new MarketSocket('ws://test/ws/market', {
      createSocket: () => new FakeSocket() as unknown as WebSocket,
      reconnectDelaysMs: [1_000, 5_000],
    })
  }

  it('підписується після відкриття й роздає події лише своєї пари', () => {
    const socket = create()
    const events: MarketEvent[] = []
    socket.subscribe(PAIR, ['snapshot', 'opportunity'], (event) => events.push(event))
    expect(socket.getStatus()).toBe('connecting')

    const [connection] = FakeSocket.instances
    connection.open()
    expect(socket.getStatus()).toBe('live')
    expect(connection.sent).toEqual([
      { action: 'subscribe', pairs: [PAIR], types: ['snapshot', 'opportunity'] },
    ])

    connection.receive(SNAPSHOT_EVENT)
    connection.receive({ ...SNAPSHOT_EVENT, data: { ...SNAPSHOT_EVENT.data, fiat: 'EUR' } })
    connection.receive({ type: 'subscribed', ts: '', data: { subscriptions: [] } })
    connection.onmessage?.({ data: 'не json' })
    expect(events).toEqual([SNAPSHOT_EVENT])
  })

  it('друга пара дає нову команду, остання відписка закриває з’єднання', () => {
    const socket = create()
    const first = socket.subscribe(PAIR, ['snapshot'], () => {})
    const [connection] = FakeSocket.instances
    connection.open()

    const second = socket.subscribe({ asset: 'BTC', fiat: 'UAH' }, ['snapshot'], () => {})
    socket.subscribe(PAIR, ['snapshot'], () => {})()
    second()
    expect(connection.sent.slice(1)).toEqual([
      { action: 'subscribe', pairs: [{ asset: 'BTC', fiat: 'UAH' }], types: ['snapshot'] },
      { action: 'unsubscribe', pairs: [{ asset: 'BTC', fiat: 'UAH' }], types: ['snapshot'] },
    ])

    first()
    expect(connection.readyState).toBe(WebSocket.CLOSED)
    expect(socket.getStatus()).toBe('offline')
    vi.advanceTimersByTime(60_000)
    expect(FakeSocket.instances).toHaveLength(1)
  })

  it('після обриву перепідключається з наростаючою паузою', () => {
    const socket = create()
    const statuses: string[] = []
    socket.onStatusChange(() => statuses.push(socket.getStatus()))
    socket.subscribe(PAIR, ['snapshot'], () => {})
    FakeSocket.instances[0].open()

    FakeSocket.instances[0].close()
    expect(socket.getStatus()).toBe('offline')
    vi.advanceTimersByTime(1_000)
    expect(FakeSocket.instances).toHaveLength(2)

    FakeSocket.instances[1].close()
    vi.advanceTimersByTime(4_999)
    expect(FakeSocket.instances).toHaveLength(2)
    vi.advanceTimersByTime(1)
    expect(FakeSocket.instances).toHaveLength(3)

    FakeSocket.instances[2].open()
    expect(FakeSocket.instances[2].sent).toHaveLength(1)
    expect(statuses).toEqual([
      'connecting',
      'live',
      'offline',
      'connecting',
      'offline',
      'connecting',
      'live',
    ])
  })
})

describe('запис подій у кеш', () => {
  function response(items: MarketSnapshot[]): SnapshotResponse {
    return { asset: 'USDT', fiat: 'UAH', freshness: [], queued: false, items }
  }

  it('знімок замінює рядки своєї біржі лише в запитах без суми', () => {
    const client = new QueryClient()
    const plain = queryKeys.markets.snapshot(PAIR)
    const withAmount = queryKeys.markets.snapshot({ ...PAIR, amount: 20_000 })
    const otherPair = queryKeys.markets.snapshot({ asset: 'BTC', fiat: 'UAH' })
    const initial = response([snapshot('bybit', '41.05'), snapshot('okx', '41.12')])
    for (const key of [plain, withAmount, otherPair]) client.setQueryData(key, initial)

    applySnapshotEvent(client, SNAPSHOT_EVENT)

    const updated = client.getQueryData<SnapshotResponse>(plain)!
    expect(updated.items.map((item) => [item.exchange, item.buy_price])).toEqual([
      ['okx', '41.12'],
      ['bybit', '41.01'],
    ])
    expect(client.getQueryData(withAmount)).toBe(initial)
    expect(client.getQueryData(otherPair)).toBe(initial)
  })

  it('після подій застарівають лише запити цієї пари', () => {
    const client = new QueryClient()
    const stale = (key: readonly unknown[]) => client.getQueryState(key)!.isInvalidated
    const keys = {
      snapshotAmount: queryKeys.markets.snapshot({ ...PAIR, amount: 20_000 }),
      snapshotPlain: queryKeys.markets.snapshot(PAIR),
      offers: queryKeys.offers.list({ ...PAIR, side: 'BUY' }),
      offersOther: queryKeys.offers.list({ asset: 'BTC', fiat: 'UAH', side: 'BUY' }),
      list: queryKeys.opportunities.list(PAIR),
      chains: queryKeys.opportunities.list({ fiat: 'UAH', kind: 'chain' }),
      history: queryKeys.opportunities.history({ ...PAIR, hours: 24 }),
      listOther: queryKeys.opportunities.list({ asset: 'USDT', fiat: 'EUR' }),
    }
    for (const key of Object.values(keys)) client.setQueryData(key, {})

    refreshAfterSnapshot(client, SNAPSHOT_EVENT.data)
    expect(stale(keys.snapshotAmount)).toBe(true)
    expect(stale(keys.offers)).toBe(true)
    expect(stale(keys.snapshotPlain)).toBe(false)
    expect(stale(keys.offersOther)).toBe(false)

    const event = {
      type: 'opportunity',
      ts: '',
      data: { kind: 'cross_exchange', asset: 'USDT', fiat: 'UAH' },
    } as OpportunityEvent
    refreshAfterOpportunity(client, event)
    expect(stale(keys.list)).toBe(true)
    expect(stale(keys.history)).toBe(true)
    expect(stale(keys.chains)).toBe(false)
    expect(stale(keys.listOther)).toBe(false)
  })
})
