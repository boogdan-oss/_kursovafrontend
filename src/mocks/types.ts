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
