import { bypass, delay, http, HttpResponse } from 'msw'

import type { ChatRequest } from '@/shared/api/assistant-types'
import { endpoints } from '@/shared/api/endpoints'
import type { ForecastHorizon, ForecastSide } from '@/shared/api/forecast-types'
import type { HistoryResponse } from '@/shared/api/types'

import alertRulesJson from './fixtures/alert-rules.json'
import forecastModelsJson from './fixtures/forecast-models.json'
import notificationsJson from './fixtures/notifications.json'
import watchlistJson from './fixtures/watchlist.json'
import { MIN_POINTS, trendForecast, type PricePoint } from './forecast-model'
import { chat, getConversation, listConversations } from './assistant'
import { communityHandlers } from './community'
import type { AlertRule, AlertRuleInput } from './types'

const url = (path: string) => `*/api/v1${path}`

const LATENCY_MS = 250
const HISTORY_WINDOW_MS = 8 * 3_600_000

let rules = structuredClone(alertRulesJson.items) as AlertRule[]
let nextRuleId = rules.length + 1

function detail(message: string, status: number) {
  return HttpResponse.json({ detail: message }, { status })
}

export const handlers = [
  http.get(url(endpoints.forecast), async ({ request }) => {
    const query = new URL(request.url).searchParams
    const asset = (query.get('asset') ?? 'USDT').toUpperCase()
    const fiat = (query.get('fiat') ?? 'UAH').toUpperCase()
    const exchange = query.get('exchange') ?? 'bybit'
    const side: ForecastSide = query.get('side') === 'SELL' ? 'SELL' : 'BUY'
    const requested = Number(query.get('horizon'))
    const horizon: ForecastHorizon = requested === 15 || requested === 30 ? requested : 60

    const apiBase = request.url.slice(0, request.url.indexOf('/api/v1') + '/api/v1'.length)
    const historyUrl = new URL(`${apiBase}${endpoints.marketHistory}`)
    historyUrl.search = new URLSearchParams({
      asset,
      fiat,
      exchange,
      interval: '1m',
      from: new Date(Date.now() - HISTORY_WINDOW_MS).toISOString(),
    }).toString()

    let history: HistoryResponse
    try {
      const response = await fetch(bypass(new Request(historyUrl)))
      if (!response.ok) return detail('Не вдалося отримати історію цін для прогнозу', 503)
      history = (await response.json()) as HistoryResponse
    } catch {
      return detail('Не вдалося отримати історію цін для прогнозу', 503)
    }

    const points: PricePoint[] = []
    for (const item of history.items) {
      const price = side === 'BUY' ? item.buy_price : item.sell_price
      if (price != null) points.push({ time: Date.parse(item.time), price: Number(price) })
    }
    const result = trendForecast(points, { asset, fiat, exchange, side, horizon })
    if (!result) {
      return detail(
        `Замало історії для прогнозу: потрібно щонайменше ${MIN_POINTS} хвилин даних`,
        404,
      )
    }
    return HttpResponse.json(result)
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
