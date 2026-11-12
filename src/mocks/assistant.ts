import type {
  ChatMessage,
  ChatRequest,
  ChatResponse,
  ConversationDetail,
} from '@/shared/api/assistant-types'

const HOUR_MS = 3_600_000
const DAY_MS = 24 * HOUR_MS
const TITLE_LENGTH = 60

function ago(ms: number) {
  return new Date(Date.now() - ms).toISOString()
}

function message(id: string, role: ChatMessage['role'], content: string, at: string): ChatMessage {
  return { id, role, content, created_at: at, tool_calls: [] }
}

function seed(): ConversationDetail[] {
  const first = ago(25 * 60_000)
  return [
    {
      id: 'c-1',
      title: 'Де вигідно купити USDT зараз?',
      updated_at: first,
      messages: [
        message('m-1', 'user', 'Де зараз вигідніше купити USDT на 20 000 ₴ через monobank?', first),
        {
          ...message(
            'm-2',
            'assistant',
            [
              'Демо-відповідь (MSW): цифри нижче приклад, а не живий ринок.',
              '',
              'Найвигідніше зараз на **Bybit**: ефективна ціна 41,05 — на 0,27 нижче, ніж на Binance. За 20 000 ₴ отримаєте ≈ 487,2 USDT.',
              '',
              '| Біржа | Ціна | Отримаєте, USDT |',
              '| --- | --- | --- |',
              '| Bybit | 41,05 | 487,21 |',
              '| OKX | 41,12 | 486,38 |',
              '| MEXC | 41,18 | 485,67 |',
              '| Binance | 41,32 | 484,03 |',
              '',
              'Для арбітражу — маршрут **Bybit → Binance**: чистий прибуток +1,42%, AI Score 91.',
            ].join('\n'),
            first,
          ),
          tool_calls: ['get_best_prices', 'get_opportunities'],
          actions: [
            { label: 'Відкрити в калькуляторі', to: '/calculator' },
            { label: 'Показати маршрут', to: '/arbitrage' },
          ],
        },
      ],
    },
    {
      id: 'c-2',
      title: 'Чи можна довіряти newtrader_77?',
      updated_at: ago(2 * HOUR_MS),
      messages: [],
    },
    { id: 'c-3', title: 'Порівняй комісії Bybit і OKX', updated_at: ago(DAY_MS), messages: [] },
    {
      id: 'c-4',
      title: 'Який банк вигідніший для продажу?',
      updated_at: ago(DAY_MS + 3 * HOUR_MS),
      messages: [],
    },
    { id: 'c-5', title: 'Як рахується AI Score?', updated_at: ago(3 * DAY_MS), messages: [] },
    { id: 'c-6', title: 'Ланцюжок USDT → BTC → USDT', updated_at: ago(4 * DAY_MS), messages: [] },
    {
      id: 'c-7',
      title: 'Чому HTX повільно оновлюється?',
      updated_at: ago(12 * DAY_MS),
      messages: [],
    },
  ]
}

let conversations = seed()
let nextId = 100

export function resetAssistantMock() {
  conversations = seed()
  nextId = 100
}

export function listConversations() {
  const items = [...conversations]
    .sort((a, b) => b.updated_at.localeCompare(a.updated_at))
    .map(({ id, title, updated_at }) => ({ id, title, updated_at }))
  return { count: items.length, items }
}

export function getConversation(id: string) {
  return conversations.find((item) => item.id === id) ?? null
}

function stubReply(text: string, request: ChatRequest) {
  const pair = request.asset && request.fiat ? ` для ${request.asset}/${request.fiat}` : ''
  return [
    `Це відповідь-заглушка: AI-асистент ще не підключений до бекенду${pair}.`,
    '',
    `Ваш запит: «${text}».`,
    '',
    'Коли бекенд віддасть **/assistant/chat**, тут будуть відповіді на живих даних UPars.',
  ].join('\n')
}

export function chat(request: ChatRequest): ChatResponse | null {
  const text = request.message.trim()
  const now = new Date().toISOString()
  let conversation = request.conversation_id ? getConversation(request.conversation_id) : null
  if (request.conversation_id && !conversation) return null
  if (!conversation) {
    conversation = {
      id: `c-${nextId++}`,
      title: text.length > TITLE_LENGTH ? `${text.slice(0, TITLE_LENGTH - 1)}…` : text,
      updated_at: now,
      messages: [],
    }
    conversations.push(conversation)
  }
  const userMessage = message(`m-${nextId++}`, 'user', text, now)
  const reply = message(`m-${nextId++}`, 'assistant', stubReply(text, request), now)
  conversation.messages.push(userMessage, reply)
  conversation.updated_at = now
  return {
    conversation_id: conversation.id,
    title: conversation.title,
    user_message: userMessage,
    message: reply,
  }
}
