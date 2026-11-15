import { delay, http, HttpResponse } from 'msw'

import type { ChatRequest } from '@/shared/api/assistant-types'
import { endpoints } from '@/shared/api/endpoints'

import { chat, getConversation, listConversations } from './assistant'
import { communityHandlers } from './community'

const url = (path: string) => `*/api/v1${path}`

const LATENCY_MS = 250

function detail(message: string, status: number) {
  return HttpResponse.json({ detail: message }, { status })
}

export const handlers = [
  http.get(url(endpoints.assistantConversations), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(listConversations())
  }),

  http.get(url(endpoints.assistantConversation(':id')), async ({ params }) => {
    await delay(LATENCY_MS)
    const conversation = getConversation(String(params.id))
    return conversation ? HttpResponse.json(conversation) : detail('Розмову не знайдено', 404)
  }),

  http.post(url(endpoints.assistantChat), async ({ request }) => {
    await delay(900)
    const body = (await request.json()) as ChatRequest
    if (!body.message?.trim()) return detail('Порожнє повідомлення', 422)
    const response = chat(body)
    return response ? HttpResponse.json(response) : detail('Розмову не знайдено', 404)
  }),

  ...communityHandlers,
]
