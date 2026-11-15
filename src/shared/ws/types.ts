import type { AppNotification, MarketSnapshot, OpportunityItem } from '@/shared/api/types'

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

export type AlertNotification = Pick<
  AppNotification,
  'id' | 'rule_id' | 'rule_title' | 'text' | 'channels' | 'opportunity' | 'created_at'
> & { user_id: number }

export interface AlertEvent {
  type: 'alert'
  ts: string
  data: AlertNotification
}

export interface SubscribedReply {
  type: 'subscribed'
  ts: string
  data: { subscriptions: (PairRef & { type: MarketEventType })[] }
}

export interface AuthenticatedReply {
  type: 'authenticated'
  ts: string
  data: { user_id: number; username: string }
}

export interface ErrorReply {
  type: 'error'
  ts: string
  data: { detail: string }
}

export type ServerMessage =
  MarketEvent | AlertEvent | SubscribedReply | AuthenticatedReply | ErrorReply

export type ClientCommand =
  | { action: 'subscribe' | 'unsubscribe'; pairs: PairRef[]; types: MarketEventType[] }
  | { action: 'auth'; token: string }

export type SocketStatus = 'disabled' | 'connecting' | 'live' | 'offline'
