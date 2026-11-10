import type { DecimalString } from '@/shared/api/types'

export interface ForecastPoint {
  time: string
  price: DecimalString
  lower: DecimalString | null
  upper: DecimalString | null
}

export interface ForecastFeature {
  name: string
  importance_pct: DecimalString
}

export interface ForecastResponse {
  asset: string
  fiat: string
  exchange: string
  horizon_min: number
  model: string
  current_price: DecimalString
  predicted_price: DecimalString
  change_pct: DecimalString
  confidence_pct: DecimalString
  generated_at: string
  history: ForecastPoint[]
  forecast: ForecastPoint[]
  features: ForecastFeature[]
}

export interface ForecastModel {
  name: string
  status: 'active' | 'archived' | 'baseline'
  mae: DecimalString
  trained_at: string | null
}

export interface ForecastModelsResponse {
  count: number
  items: ForecastModel[]
}

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

export interface User {
  id: string
  email: string
  first_name: string
  last_name: string
  nickname: string
  created_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest extends LoginRequest {
  first_name: string
  nickname: string
}

export interface AuthResponse {
  access_token: string
  token_type: 'bearer'
  user: User
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
