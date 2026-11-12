import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { AssistantPage } from '@/features/assistant/AssistantPage'
import { fillPrompt, groupConversations, parseBlocks, parseInline } from '@/features/assistant/lib'
import { chat, getConversation, listConversations, resetAssistantMock } from '@/mocks/assistant'
import { ApiError, apiClient } from '@/shared/api/client'
import type { ChatRequest } from '@/shared/api/assistant-types'
import { useFiltersStore } from '@/store/useFiltersStore'

const NOW = new Date('2026-11-12T15:00:00').getTime()

describe('assistant lib', () => {
  it('групує розмови за датою', () => {
    const groups = groupConversations(
      [
        { id: 'a', title: 'A', updated_at: new Date('2026-11-12T09:00:00').toISOString() },
        { id: 'b', title: 'B', updated_at: new Date('2026-11-11T23:00:00').toISOString() },
        { id: 'c', title: 'C', updated_at: new Date('2026-11-08T10:00:00').toISOString() },
        { id: 'd', title: 'D', updated_at: new Date('2026-10-01T10:00:00').toISOString() },
      ],
      NOW,
    )
    expect(groups.map((group) => [group.label, group.items.map((item) => item.id)])).toEqual([
      ['Сьогодні', ['a']],
      ['Вчора', ['b']],
      ['Цей тиждень', ['c']],
      ['Раніше', ['d']],
    ])
  })

  it('розбирає абзаци, списки й таблиці', () => {
    const blocks = parseBlocks(
      'Вступ\nдругий рядок\n\n- один\n- два\n\n| Біржа | Ціна |\n| --- | ---: |\n| Bybit | 41,05 |',
    )
    expect(blocks).toEqual([
      { type: 'paragraph', text: 'Вступ\nдругий рядок' },
      { type: 'list', items: ['один', 'два'] },
      { type: 'table', header: ['Біржа', 'Ціна'], rows: [['Bybit', '41,05']] },
    ])
  })

  it('виділяє жирний текст і числа', () => {
    expect(parseInline('На **Bybit** ціна 41,05 і +1,42%, c-1')).toEqual([
      { type: 'text', text: 'На ' },
      { type: 'bold', text: 'Bybit' },
      { type: 'text', text: ' ціна ' },
      { type: 'number', text: '41,05' },
      { type: 'text', text: ' і ' },
      { type: 'number', text: '+1,42%' },
      { type: 'text', text: ', c-1' },
    ])
  })

  it('підставляє пару в шаблон', () => {
    expect(fillPrompt('Огляд {pair}, актив {asset}', 'USDT', 'UAH')).toBe(
      'Огляд USDT/UAH, актив USDT',
    )
  })
})

function LocationProbe() {
  const location = useLocation()
  return <output data-testid="location">{location.search}</output>
}

function renderPage(path = '/assistant') {
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AssistantPage />
        <LocationProbe />
      </MemoryRouter>
    </Providers>,
  )
}

describe('сторінка «Асистент»', () => {
  let failChat = false

  beforeEach(() => {
    failChat = false
    localStorage.clear()
    resetAssistantMock()
    useFiltersStore.getState().reset()
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === '/assistant/conversations') return { data: listConversations() }
      if (url.startsWith('/assistant/conversations/')) {
        const conversation = getConversation(url.split('/').pop()!)
        if (!conversation) throw new ApiError('Розмову не знайдено', { status: 404 })
        return { data: structuredClone(conversation) }
      }
      if (url === '/market/snapshot') {
        return {
          data: {
            items: [
              {
                exchange: 'bybit',
                asset: 'USDT',
                fiat: 'UAH',
                payment_method: null,
                buy_price: '41.05',
                sell_price: '41.60',
                spread_pct: '1.3',
                volume: '1000',
                offers_count_buy: 5,
                offers_count_sell: 5,
                fetched_at: '2026-11-12T12:00:00Z',
              },
            ],
          },
        }
      }
      return { data: { count: 0, items: [] } }
    })
    vi.spyOn(apiClient, 'post').mockImplementation(async (url: string, body: unknown) => {
      if (url !== '/assistant/chat') throw new Error(url)
      if (failChat) throw new ApiError('Асистент тимчасово недоступний', { status: 503 })
      return { data: chat(body as ChatRequest) }
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it('показує історію розмов і контекст ринку', async () => {
    renderPage()
    const history = await screen.findByRole('navigation', { name: 'Історія розмов' })
    expect(await within(history).findByText('Сьогодні')).toBeInTheDocument()
    expect(within(history).getByRole('button', { name: 'Де вигідно купити USDT зараз?' }))
    expect(screen.getByText('Запитайте UPars AI')).toBeInTheDocument()

    const context = screen.getByRole('region', { name: 'Контекст ринку' })
    expect(await within(context).findByText('41,05 · Bybit')).toBeInTheDocument()
  })

  it('відкриває розмову з таблицею й діями', async () => {
    renderPage('/assistant?c=c-1')
    const table = await screen.findByRole('table')
    expect(within(table).getByRole('columnheader', { name: 'Отримаєте, USDT' })).toBeInTheDocument()
    expect(within(table).getByText('487,21')).toHaveClass('font-mono')
    expect(screen.getByRole('link', { name: 'Показати маршрут' })).toHaveAttribute(
      'href',
      '/arbitrage',
    )
    const log = screen.getByRole('log', { name: 'Повідомлення' })
    expect(within(log).getAllByRole('article')).toHaveLength(2)
  })

  it('нове повідомлення створює розмову', async () => {
    renderPage()
    await screen.findByText('Запитайте UPars AI')
    await userEvent.type(
      screen.getByRole('textbox', { name: 'Повідомлення асистенту' }),
      'Де продати USDT?{Enter}',
    )

    expect(await screen.findByText(/Це відповідь-заглушка/)).toBeInTheDocument()
    expect(screen.getByTestId('location')).toHaveTextContent('?c=c-100')
    expect(screen.getByRole('textbox', { name: 'Повідомлення асистенту' })).toHaveValue('')
    expect(
      await screen.findByRole('button', { name: 'Де продати USDT?', current: true }),
    ).toBeInTheDocument()
  })

  it('швидкий запит з ніком лише заповнює поле', async () => {
    renderPage()
    await screen.findByText('Запитайте UPars AI')
    const quick = screen.getByRole('region', { name: 'Швидкі запити' })
    await userEvent.click(within(quick).getByRole('button', { name: /Ризик продавця за ніком/ }))
    expect(screen.getByRole('textbox', { name: 'Повідомлення асистенту' })).toHaveValue(
      'Оціни ризик продавця ',
    )
    expect(apiClient.post).not.toHaveBeenCalled()
  })

  it('помилка відповіді дає повтор', async () => {
    failChat = true
    renderPage()
    await screen.findByText('Запитайте UPars AI')
    await userEvent.click(screen.getByRole('button', { name: /Порівняй комісії бірж/ }))

    expect(await screen.findByRole('alert')).toHaveTextContent('Асистент тимчасово недоступний')
    expect(screen.getByText('Порівняй комісії бірж для USDT/UAH')).toBeInTheDocument()

    failChat = false
    await userEvent.click(screen.getByRole('button', { name: 'Спробувати ще' }))
    expect(await screen.findByText(/Це відповідь-заглушка/)).toBeInTheDocument()
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })
})
