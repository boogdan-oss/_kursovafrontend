export type ChatRole = 'user' | 'assistant'

export interface ChatAction {
  label: string
  to: string
}

export interface ChatMessage {
  id: string
  role: ChatRole
  content: string
  created_at: string
  tool_calls?: string[]
  actions?: ChatAction[]
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

export interface ConversationDetail extends Conversation {
  messages: ChatMessage[]
}

export interface ChatRequest {
  conversation_id?: string | null
  message: string
  asset?: string
  fiat?: string
}

export interface ChatResponse {
  conversation_id: string
  title: string
  user_message: ChatMessage
  message: ChatMessage
}
