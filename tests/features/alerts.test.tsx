import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { AlertsPage } from '@/features/alerts/AlertsPage'
import { draftToInput, emptyDraft, ruleConditions } from '@/features/alerts/lib'
import { ApiError, apiClient } from '@/shared/api/client'
import type { AlertRule, AuthResponse, User, WatchlistItem } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useFiltersStore } from '@/store/useFiltersStore'

const USER: User = {
  id: 1,
  username: 'bohdan',
  email: 'bohdan@example.com',
  display_name: null,
  bio: null,
  role: 'user',
  status: 'active',
  telegram_connected: false,
  google_connected: false,
  notify_email: null,
  email_alerts_available: true,
  telegram_alerts_available: true,
  settings: {},
  created_at: '2026-10-01T10:00:00Z',
}

const RULE: AlertRule = {
  id: 7,
  title: null,
  asset: 'USDT',
  fiat: 'UAH',
  exchange: 'bybit',
  payment: null,
  min_spread: '1.5',
  min_net_spread: null,
  min_ai_score: 85,
  min_rr: null,
  min_net_profit: null,
  channels: ['in_app', 'telegram'],
  enabled: true,
  created_at: '2026-11-14T10:00:00Z',
  last_triggered_at: null,
  triggered_today: 2,
}

const WATCH: WatchlistItem = {
  id: 3,
  asset: 'USDT',
  fiat: 'UAH',
  exchange: 'bybit',
  created_at: '2026-11-14T10:00:00Z',
}

function signIn(user: User = USER) {
  useAuthStore.getState().signIn(
    {
      access_token: 'token',
      refresh_token: 'refresh',
      token_type: 'bearer',
      expires_in: 900,
      refresh_expires_in: 2_592_000,
      user,
    } as AuthResponse,
    true,
  )
}

function mockGet() {
  return vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
    if (url === '/alerts/rules') return { data: { count: 1, items: [RULE] } }
    if (url === '/watchlist') return { data: { count: 1, items: [WATCH] } }
    if (url === '/notifications') {
      return {
        data: {
          count: 1,
          unread: 1,
          items: [
            {
              id: 11,
              rule_id: 7,
              rule_title: null,
              text: 'Спред 1.6% на Bybit — вище порогу',
              channels: ['in_app'],
              delivery: { in_app: 'sent' },
              opportunity: null,
              read: false,
              created_at: new Date().toISOString(),
            },
          ],
        },
      }
    }
    if (url === '/market/snapshot') {
      return {
        data: {
          asset: 'USDT',
          fiat: 'UAH',
          queued: false,
          freshness: [],
          items: [
            {
              exchange: 'bybit',
              asset: 'USDT',
              fiat: 'UAH',
              payment_method: null,
              buy_price: '41.05',
              sell_price: '41.47',
              spread_pct: '1.02',
              volume: '1000',
              offers_count_buy: 5,
              offers_count_sell: 5,
              fetched_at: new Date().toISOString(),
            },
          ],
        },
      }
    }
    return { data: { count: 0, assets: ['USDT', 'BTC'], fiats: ['UAH', 'EUR'], items: [] } }
  })
}

function renderPage() {
  render(
    <Providers>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AlertsPage />
      </MemoryRouter>
    </Providers>,
  )
}

const panel = (name: string) => screen.getByRole('region', { name })

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().signOut()
  useFiltersStore.getState().reset()
})

afterEach(() => vi.restoreAllMocks())

describe('alerts lib', () => {
  it('чернетка правила перетворюється на запит бекенду', () => {
    const draft = { ...emptyDraft('USDT', 'UAH'), minSpread: 1.5, minAiScore: 85 }
    expect(draftToInput(draft, ['in_app'])).toEqual({
      asset: 'USDT',
      fiat: 'UAH',
      exchange: null,
      title: null,
      min_spread: '1.5',
      min_net_spread: null,
      min_ai_score: 85,
      channels: ['in_app'],
      enabled: true,
    })
    expect(ruleConditions(RULE)).toEqual(['Спред ≥ 1,5%', 'AI Score ≥ 85'])
  })
})

describe('сторінка «Watchlist і сповіщення»', () => {
  it('створює сповіщення: пара, біржа, спред, AI Score, потім вибір каналів', async () => {
    signIn()
    mockGet()
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: RULE })
    renderPage()

    const form = panel('Нове сповіщення')
    await userEvent.type(within(form).getByLabelText('Спред від'), '1,5')
    await userEvent.type(within(form).getByLabelText('AI Score від'), '85')
    await userEvent.click(within(form).getByRole('button', { name: 'Далі: куди надсилати' }))

    const dialog = await screen.findByRole('dialog')
    expect(
      within(dialog).getByText(/USDT\/UAH · усі біржі · спред ≥ 1,5% · AI Score ≥ 85/),
    ).toBeInTheDocument()
    expect(within(dialog).getByRole('button', { name: 'Telegram' })).toBeDisabled()
    await userEvent.click(within(dialog).getByRole('button', { name: 'Email' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Створити сповіщення' }))

    await waitFor(() =>
      expect(post).toHaveBeenCalledWith('/alerts/rules', {
        asset: 'USDT',
        fiat: 'UAH',
        exchange: null,
        title: null,
        min_spread: '1.5',
        min_net_spread: null,
        min_ai_score: 85,
        channels: ['in_app', 'email'],
        enabled: true,
      }),
    )
    expect(post).toHaveBeenCalledWith('/watchlist', { asset: 'USDT', fiat: 'UAH', exchange: null })
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
  })

  it('без жодної умови далі не пускає', async () => {
    signIn()
    mockGet()
    renderPage()
    const form = panel('Нове сповіщення')
    await userEvent.click(within(form).getByRole('button', { name: 'Далі: куди надсилати' }))
    expect(within(form).getByRole('alert')).toHaveTextContent('Задайте хоча б одну умову')
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('помилка бекенду (Telegram не підключено) видна в діалозі', async () => {
    signIn({ ...USER, telegram_connected: true })
    mockGet()
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Telegram не підключено', { status: 400 }),
    )
    renderPage()

    const form = panel('Нове сповіщення')
    await userEvent.type(within(form).getByLabelText('Спред від'), '2')
    await userEvent.click(within(form).getByRole('button', { name: 'Далі: куди надсилати' }))
    const dialog = await screen.findByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Telegram' }))
    await userEvent.click(within(dialog).getByRole('button', { name: 'Створити сповіщення' }))
    expect(await within(dialog).findByText('Telegram не підключено')).toBeInTheDocument()
  })

  it('Watchlist з live-ціною: вибір пари фільтрує правила й підставляє її у форму', async () => {
    signIn()
    mockGet()
    const remove = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: undefined })
    renderPage()

    const watchlist = panel('Watchlist')
    const row = (await within(watchlist).findByText('USDT/UAH')).closest('tr')!
    expect(within(row).getByText('Bybit · P2P')).toBeInTheDocument()
    expect(await within(row).findByText('41,05')).toBeInTheDocument()
    expect(within(row).getByText('Правила · 1')).toBeInTheDocument()

    await userEvent.click(row)
    expect(within(panel('Мої правила')).getAllByText('USDT/UAH · Bybit')).toHaveLength(2)
    expect(
      within(panel('Мої правила')).getByRole('button', { name: 'Показати всі' }),
    ).toBeInTheDocument()
    expect(
      within(panel('Нове сповіщення')).getByRole('combobox', { name: 'Біржа' }),
    ).toHaveTextContent('Bybit')

    await userEvent.click(within(row).getByRole('button', { name: /Прибрати USDT\/UAH/ }))
    expect(remove).toHaveBeenCalledWith('/watchlist/3')
  })

  it('правило вмикається, видаляється, а сповіщення позначаються прочитаними', async () => {
    signIn()
    mockGet()
    const patch = vi
      .spyOn(apiClient, 'patch')
      .mockResolvedValue({ data: { ...RULE, enabled: false } })
    const remove = vi.spyOn(apiClient, 'delete').mockResolvedValue({ data: undefined })
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: { updated: 1 } })
    renderPage()

    const rules = panel('Мої правила')
    expect(await within(rules).findByText('Спред ≥ 1,5%')).toBeInTheDocument()
    expect(within(rules).getByText('сьогодні: 2')).toBeInTheDocument()
    await userEvent.click(within(rules).getByRole('switch', { name: 'Вимкнути правило' }))
    expect(patch).toHaveBeenCalledWith('/alerts/rules/7', { enabled: false })
    await userEvent.click(within(rules).getByRole('button', { name: 'Видалити' }))
    expect(remove).toHaveBeenCalledWith('/alerts/rules/7')

    const history = panel('Історія сповіщень')
    expect(
      await within(history).findByText('Спред 1.6% на Bybit — вище порогу'),
    ).toBeInTheDocument()
    await userEvent.click(within(history).getByRole('button', { name: 'Прочитати всі' }))
    expect(post).toHaveBeenCalledWith('/notifications/read', {})
  })
})
