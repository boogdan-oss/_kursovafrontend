import type { MarketSnapshot, OpportunityItem } from '@/shared/api/types'

export type MarketEventType = 'snapshot' | 'opportunity'

export const MARKET_EVENT_TYPES: MarketEventType[] = ['snapshot', 'opportunity']

export interface PairRef {
  asset: string
  fiat: string
}

export interface SnapshotEvent {
  type: 'snapshot'
  ts: string
  data: PairRef & { exchange: string; items: MarketSnapshot[] }
}

export interface OpportunityEvent {
  type: 'opportunity'
  ts: string
  data: Omit<OpportunityItem, 'ai_category'>
}

export type MarketEvent = SnapshotEvent | OpportunityEvent

export interface SubscribedReply {
  type: 'subscribed'
  ts: string
  data: { subscriptions: (PairRef & { type: MarketEventType })[] }
}

export interface ErrorReply {
  type: 'error'
  ts: string
  data: { detail: string }
}

export type ServerMessage = MarketEvent | SubscribedReply | ErrorReply

export interface ClientCommand {
  action: 'subscribe' | 'unsubscribe'
  pairs: PairRef[]
  types: MarketEventType[]
}

export type SocketStatus = 'disabled' | 'connecting' | 'live' | 'offline'
