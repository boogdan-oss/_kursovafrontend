import { delay, http, HttpResponse } from 'msw'

import { endpoints } from '@/shared/api/endpoints'

import alertRulesJson from './fixtures/alert-rules.json'
import communityPostsJson from './fixtures/community-posts.json'
import conversationsJson from './fixtures/conversations.json'
import forecastModelsJson from './fixtures/forecast-models.json'
import forecastJson from './fixtures/forecast.json'
import notificationsJson from './fixtures/notifications.json'
import userJson from './fixtures/user.json'
import watchlistJson from './fixtures/watchlist.json'
import type {
  AlertRule,
  AlertRuleInput,
  AuthResponse,
  ChatRequest,
  ChatResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from './types'

const url = (path: string) => `*/api/v1${path}`

const LATENCY_MS = 250
const MOCK_TOKEN = 'mock-access-token'

let rules = structuredClone(alertRulesJson.items) as AlertRule[]
let nextRuleId = rules.length + 1

const user = userJson as User

function detail(message: string, status: number) {
  return HttpResponse.json({ detail: message }, { status })
}

export const handlers = [
  http.get(url(endpoints.forecast), async ({ request }) => {
    await delay(LATENCY_MS)
    const params = new URL(request.url).searchParams
    return HttpResponse.json({
      ...forecastJson,
      asset: params.get('asset') ?? forecastJson.asset,
      fiat: params.get('fiat') ?? forecastJson.fiat,
      exchange: params.get('exchange') ?? forecastJson.exchange,
    })
  }),

  http.get(url(endpoints.forecastModels), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(forecastModelsJson)
  }),

  http.get(url(endpoints.alertRules), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json({ count: rules.length, items: rules })
  }),

  http.post(url(endpoints.alertRules), async ({ request }) => {
    await delay(LATENCY_MS)
    const input = (await request.json()) as AlertRuleInput
    if (!input.title?.trim()) return detail('Вкажіть назву правила', 422)
    const rule: AlertRule = {
      ...input,
      id: `rule-${nextRuleId++}`,
      last_triggered_at: null,
      triggered_today: 0,
    }
    rules = [...rules, rule]
    return HttpResponse.json(rule, { status: 201 })
  }),

  http.patch(url(endpoints.alertRule(':id')), async ({ params, request }) => {
    await delay(LATENCY_MS)
    const current = rules.find((rule) => rule.id === params.id)
    if (!current) return detail('Правило не знайдено', 404)
    const patch = (await request.json()) as Partial<AlertRuleInput>
    const updated: AlertRule = { ...current, ...patch, id: current.id }
    rules = rules.map((rule) => (rule.id === current.id ? updated : rule))
    return HttpResponse.json(updated)
  }),

  http.delete(url(endpoints.alertRule(':id')), async ({ params }) => {
    await delay(LATENCY_MS)
    if (!rules.some((rule) => rule.id === params.id)) return detail('Правило не знайдено', 404)
    rules = rules.filter((rule) => rule.id !== params.id)
    return new HttpResponse(null, { status: 204 })
  }),

  http.get(url(endpoints.notifications), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(notificationsJson)
  }),

  http.get(url(endpoints.watchlist), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(watchlistJson)
  }),

  http.get(url(endpoints.assistantConversations), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(conversationsJson)
  }),

  http.post(url(endpoints.assistantChat), async ({ request }) => {
    await delay(900)
    const { conversation_id, message } = (await request.json()) as ChatRequest
    if (!message?.trim()) return detail('Порожнє повідомлення', 422)
    const response: ChatResponse = {
      conversation_id: conversation_id ?? 'c-new',
      message: {
        role: 'assistant',
        content:
          'Це відповідь-заглушка: AI-асистент ще не підключений до бекенду. ' +
          `Ваш запит: «${message.trim()}».`,
        tool_calls: ['get_best_prices'],
        created_at: new Date().toISOString(),
      },
    }
    return HttpResponse.json(response)
  }),

  http.post(url(endpoints.authLogin), async ({ request }) => {
    await delay(LATENCY_MS)
    const { email, password } = (await request.json()) as LoginRequest
    if (!email || !password) return detail('Невірний email або пароль', 401)
    const response: AuthResponse = {
      access_token: MOCK_TOKEN,
      token_type: 'bearer',
      user: { ...user, email },
    }
    return HttpResponse.json(response)
  }),

  http.post(url(endpoints.authRegister), async ({ request }) => {
    await delay(LATENCY_MS)
    const input = (await request.json()) as RegisterRequest
    if (!input.email || !input.password) return detail('Вкажіть email і пароль', 422)
    const response: AuthResponse = {
      access_token: MOCK_TOKEN,
      token_type: 'bearer',
      user: {
        ...user,
        email: input.email,
        first_name: input.first_name || user.first_name,
        nickname: input.nickname || user.nickname,
      },
    }
    return HttpResponse.json(response, { status: 201 })
  }),

  http.get(url(endpoints.authMe), async ({ request }) => {
    await delay(LATENCY_MS)
    if (request.headers.get('Authorization') !== `Bearer ${MOCK_TOKEN}`) {
      return detail('Потрібно увійти в акаунт', 401)
    }
    return HttpResponse.json(user)
  }),

  http.get(url(endpoints.communityPosts), async () => {
    await delay(LATENCY_MS)
    return HttpResponse.json(communityPostsJson)
  }),
]
