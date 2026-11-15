import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { Header } from '@/app/layout/Header'
import { Providers } from '@/app/providers'
import { alertToastTitle } from '@/features/alerts/lib'
import { apiClient } from '@/shared/api/client'
import type { AuthResponse, User } from '@/shared/api/types'
import type { AlertEvent } from '@/shared/ws/types'
import { useAuthStore } from '@/store/useAuthStore'

const socket = vi.hoisted(() => ({ listener: null as ((event: AlertEvent) => void) | null }))

vi.mock('@/shared/ws/useMarketSocket', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/ws/useMarketSocket')>()),
  useAlertEvents: (listener: (event: AlertEvent) => void) => {
    socket.listener = listener
  },
}))

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

function alertEvent(overrides: Partial<AlertEvent['data']> = {}): AlertEvent {
  return {
    type: 'alert',
    ts: '2026-11-15T10:00:00Z',
    data: {
      id: 21,
      user_id: 1,
      rule_id: 7,
      rule_title: null,
      text: 'Купити: Bybit 41,05 UAH\nПродати: Binance 41,72 UAH',
      channels: ['in_app'],
      opportunity: null,
      created_at: '2026-11-15T10:00:00Z',
      ...overrides,
    },
  }
}

function signIn() {
  useAuthStore.getState().signIn(
    {
      access_token: 'token',
      refresh_token: 'refresh',
      token_type: 'bearer',
      expires_in: 900,
      refresh_expires_in: 2_592_000,
      user: USER,
    } as AuthResponse,
    true,
  )
}

function mockUnread(initial: number) {
  const state = { unread: initial }
  const get = vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
    if (url === '/notifications')
      return { data: { count: state.unread, unread: state.unread, items: [] } }
    return { data: {} }
  })
  return { state, get }
}

const notificationRequests = (get: ReturnType<typeof mockUnread>['get']) =>
  get.mock.calls.filter(([url]) => url === '/notifications').length

function renderHeader() {
  render(
    <Providers>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Header />
        <Routes>
          <Route path="/" element={<p>Головна</p>} />
          <Route path="/alerts" element={<p>Сторінка сповіщень</p>} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().signOut()
  socket.listener = null
})

afterEach(() => vi.restoreAllMocks())

describe('alertToastTitle', () => {
  it('назва правила, інакше пара можливості, інакше загальний заголовок', () => {
    expect(alertToastTitle({ rule_title: 'Мій арбітраж', opportunity: null })).toBe('Мій арбітраж')
    expect(alertToastTitle(alertEvent().data)).toBe('Спрацювало сповіщення')
    const opportunity = { asset: 'BTC', fiat: 'EUR' } as AlertEvent['data']['opportunity']
    expect(alertToastTitle({ rule_title: null, opportunity })).toBe('Сповіщення · BTC/EUR')
  })
})

describe('дзвіночок у шапці', () => {
  it('гостю — просто посилання, без запиту сповіщень', async () => {
    const { get } = mockUnread(3)
    renderHeader()
    expect(screen.getByRole('link', { name: 'Сповіщення' })).toHaveAttribute('href', '/alerts')
    await act(async () => {})
    expect(notificationRequests(get)).toBe(0)
  })

  it('показує кількість непрочитаних', async () => {
    signIn()
    mockUnread(3)
    renderHeader()
    const bell = await screen.findByRole('link', { name: 'Сповіщення: 3 непрочитані' })
    expect(bell).toHaveTextContent('3')
  })

  it('понад 99 непрочитаних — «99+»', async () => {
    signIn()
    mockUnread(140)
    renderHeader()
    expect(
      await screen.findByRole('link', { name: 'Сповіщення: 140 непрочитаних' }),
    ).toHaveTextContent('99+')
  })
})

describe('сповіщення в реальному часі', () => {
  it('подія alert показує спливаюче вікно, оновлює лічильник і веде до сповіщень', async () => {
    signIn()
    const { state } = mockUnread(0)
    renderHeader()
    await screen.findByRole('link', { name: 'Сповіщення' })
    expect(socket.listener).not.toBeNull()

    state.unread = 1
    act(() => socket.listener!(alertEvent({ rule_title: 'USDT/UAH · Bybit' })))

    expect(await screen.findByText('USDT/UAH · Bybit')).toBeInTheDocument()
    expect(screen.getByText(/Купити: Bybit 41,05 UAH/)).toBeInTheDocument()
    expect(
      await screen.findByRole('link', { name: 'Сповіщення: 1 непрочитане' }),
    ).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Переглянути' }))
    expect(await screen.findByText('Сторінка сповіщень')).toBeInTheDocument()
  })

  it('правило лише з Telegram не показує вікна на сайті, але історія оновлюється', async () => {
    signIn()
    const { get } = mockUnread(0)
    renderHeader()
    await waitFor(() => expect(notificationRequests(get)).toBe(1))

    act(() => socket.listener!(alertEvent({ rule_title: 'Тихе правило', channels: ['telegram'] })))

    await waitFor(() => expect(notificationRequests(get)).toBe(2))
    expect(screen.queryByText('Тихе правило')).not.toBeInTheDocument()
  })
})
