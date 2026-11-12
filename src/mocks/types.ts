import type { DecimalString } from '@/shared/api/types'

export type AlertChannel = 'app' | 'telegram'

export interface AlertRule {
  id: string
  title: string
  metric: 'spread_pct' | 'ai_score' | 'net_profit' | 'price' | 'risky_merchant'
  operator: '>' | '<'
  threshold: DecimalString
  asset: string
  fiat: string
  exchanges: string[]
  channels: AlertChannel[]
  enabled: boolean
  last_triggered_at: string | null
  triggered_today: number
}

export type AlertRuleInput = Omit<AlertRule, 'id' | 'last_triggered_at' | 'triggered_today'>

export interface AlertRulesResponse {
  count: number
  items: AlertRule[]
}

export interface Notification {
  id: string
  rule_id: string | null
  text: string
  channel: AlertChannel
  read: boolean
  created_at: string
}

export interface NotificationsResponse {
  count: number
  unread: number
  items: Notification[]
}

export interface WatchlistItem {
  id: string
  asset: string
  quote: string
  exchange: string
  side: 'BUY' | 'SELL' | null
  price: DecimalString
  change_pct: DecimalString
  sparkline: DecimalString[]
}

export interface WatchlistResponse {
  count: number
  items: WatchlistItem[]
}

export interface Conversation {
  id: string
  title: string
  updated_at: string
}

export interface ConversationsResponse {
  count: number
  items: Conversation[]
}

export interface ChatRequest {
  conversation_id?: string | null
  message: string
}

export interface ChatResponse {
  conversation_id: string
  message: {
    role: 'assistant'
    content: string
    tool_calls: string[]
    created_at: string
  }
}

export interface CommunityPost {
  id: string
  author: { nickname: string; name: string }
  text: string
  likes: number
  comments: number
  popular: boolean
  created_at: string
}

export interface CommunityPostsResponse {
  count: number
  items: CommunityPost[]
}
