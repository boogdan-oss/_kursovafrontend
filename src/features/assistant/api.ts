import { apiClient } from '@/shared/api/client'
import type {
  ChatRequest,
  ChatResponse,
  ConversationDetail,
  ConversationsResponse,
} from '@/shared/api/assistant-types'
import { endpoints } from '@/shared/api/endpoints'

const CHAT_TIMEOUT_MS = 120_000

export async function fetchConversations(signal?: AbortSignal) {
  const { data } = await apiClient.get<ConversationsResponse>(endpoints.assistantConversations, {
    signal,
  })
  return data
}

export async function fetchConversation(id: string, signal?: AbortSignal) {
  const { data } = await apiClient.get<ConversationDetail>(endpoints.assistantConversation(id), {
    signal,
  })
  return data
}

export async function sendMessage(request: ChatRequest) {
  const { data } = await apiClient.post<ChatResponse>(endpoints.assistantChat, request, {
    timeout: CHAT_TIMEOUT_MS,
  })
  return data
}
