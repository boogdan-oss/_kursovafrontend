import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { RequireStaff } from '@/app/RequireAuth'
import { AdminPage } from '@/features/admin/AdminPage'
import { apiClient } from '@/shared/api/client'
import type { AdminUser, Author, ReportView } from '@/shared/api/community-types'
import type { AuthResponse, User } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'

const SPAMMER: Author = { id: 104, username: 'crypto_bonus_24', is_admin: false, role: 'user' }
const OWNER: Author = { id: 9, username: 'boss', is_admin: true, role: 'owner' }
const REPORTER: Author = { id: 101, username: 'max_p2p', is_admin: false, role: 'user' }

function report(overrides: Partial<ReportView> = {}): ReportView {
  return {
    id: 1042,
    target: 'post',
    post_id: 4,
    comment_id: null,
    target_text: 'Швидкий обмін USDT за найкращим курсом! Пишіть у Telegram.',
    target_status: 'visible',
    target_author: SPAMMER,
    reporter: REPORTER,
    reason: 'scam',
    details: 'Просить писати в особисті',
    status: 'pending',
    created_at: new Date().toISOString(),
    resolved_at: null,
    ...overrides,
  }
}

const USERS: AdminUser[] = [
  {
    id: 104,
    username: 'crypto_bonus_24',
    display_name: null,
    email: 'bonus@example.com',
    role: 'user',
    status: 'active',
    created_at: '2026-11-12T10:00:00Z',
    posts: 6,
    reports_against: 14,
  },
  {
    id: 5,
    username: 'andrii_m',
    display_name: 'Андрій',
    email: 'andrii@example.com',
    role: 'admin',
    status: 'active',
    created_at: '2026-10-12T10:00:00Z',
    posts: 17,
    reports_against: 0,
  },
]

function signIn(role: User['role'], id = 1) {
  useAuthStore.getState().signIn(
    {
      access_token: 'token',
      refresh_token: 'refresh',
      token_type: 'bearer',
      expires_in: 900,
      refresh_expires_in: 2_592_000,
      user: {
        id,
        username: role === 'owner' ? 'boss' : 'moder',
        email: 'staff@example.com',
        display_name: null,
        bio: null,
        role,
        status: 'active',
        telegram_connected: false,
        google_connected: false,
        settings: {},
        created_at: '2026-10-01T10:00:00Z',
      },
    } as AuthResponse,
    true,
  )
}

function mockGet(reports: ReportView[] = [report()]) {
  return vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
    if (url === '/admin/stats') {
      return { data: { reports_new: 12, reports_pending: 5, hidden: 3, deleted_7d: 18, banned: 7 } }
    }
    if (url === '/admin/reports') return { data: { count: reports.length, items: reports } }
    if (url === '/admin/hidden') return { data: { posts: [], comments: [] } }
    if (url === '/admin/users') return { data: { count: USERS.length, items: USERS } }
    if (url === '/admin/bans') return { data: { count: 0, items: [] } }
    if (url === '/health') {
      return {
        data: {
          status: 'ok',
          version: 'test',
          time: new Date().toISOString(),
          components: { api: { status: 'ok' }, db: { status: 'ok' }, redis: { status: 'error' } },
          exchanges: [
            {
              exchange: 'binance',
              status: 'active',
              last_ok_at: null,
              age_sec: 2,
              rps: 1.4,
              limiter_state: 'ok',
            },
            {
              exchange: 'bybit',
              status: 'active',
              last_ok_at: null,
              age_sec: 400,
              rps: 1,
              limiter_state: 'cooldown',
            },
          ],
        },
      }
    }
    return { data: {} }
  })
}

function renderAdmin(path = '/admin') {
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <RequireStaff>
          <AdminPage />
        </RequireStaff>
      </MemoryRouter>
    </Providers>,
  )
}

const panel = (name: string) => screen.getByRole('region', { name })

beforeAll(() => {
  Element.prototype.scrollIntoView = vi.fn()
  Element.prototype.hasPointerCapture = vi.fn(() => false)
  Element.prototype.releasePointerCapture = vi.fn()
})

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().signOut()
})

afterEach(() => vi.restoreAllMocks())

describe('адмін-панель', () => {
  it('звичайний користувач бачить, що доступ лише для адміністраторів', () => {
    signIn('user')
    mockGet()
    renderAdmin()
    expect(
      screen.getByRole('heading', { name: 'Доступ лише для адміністраторів' }),
    ).toBeInTheDocument()
  })

  it('статистика, скарга з деталями та рішення «приховати»', async () => {
    signIn('admin')
    mockGet()
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: report({ status: 'resolved' }) })
    renderAdmin()

    const stats = panel('Статистика модерації')
    expect(await within(stats).findByText('12')).toBeInTheDocument()
    expect(within(stats).getByText('18')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Скарги · 5' })).toBeInTheDocument()

    const details = await screen.findByRole('region', { name: 'Скарга #1042' })
    expect(within(details).getByText(/Швидкий обмін USDT/)).toBeInTheDocument()
    expect(within(details).getByText('Шахрайство, фішингові посилання')).toBeInTheDocument()
    expect(within(details).getByText('Просить писати в особисті')).toBeInTheDocument()
    await userEvent.click(within(details).getByRole('button', { name: 'Приховати публікацію' }))
    expect(post).toHaveBeenCalledWith('/admin/reports/1042/resolve', { action: 'hide' })
  })

  it('контент власника адмін не модерує й не блокує', async () => {
    signIn('admin')
    mockGet([report({ target_author: OWNER })])
    renderAdmin()

    const details = await screen.findByRole('region', { name: 'Скарга #1042' })
    expect(
      within(details).queryByRole('button', { name: 'Приховати публікацію' }),
    ).not.toBeInTheDocument()
    expect(within(details).getByText(/модерує лише старший за роллю/)).toBeInTheDocument()
    expect(within(details).getByRole('button', { name: 'Заблокувати автора' })).toBeDisabled()
    expect(within(details).getByRole('button', { name: 'Відхилити скаргу' })).toBeEnabled()
  })

  it('стан бірж винесено в адмінку', async () => {
    signIn('admin')
    mockGet()
    renderAdmin()
    const status = panel('Стан бірж')
    expect(await within(status).findByText('Кулдаун')).toBeInTheDocument()
    expect(within(status).getByText('Redis: помилка')).toBeInTheDocument()
  })

  it('власник змінює роль користувача, адмін — ні', async () => {
    signIn('owner', 9)
    mockGet()
    const put = vi
      .spyOn(apiClient, 'put')
      .mockResolvedValue({ data: { ...USERS[0], role: 'admin' } })
    renderAdmin('/admin?tab=users')

    const trigger = await screen.findByRole('combobox', { name: 'Роль @crypto_bonus_24' })
    fireEvent.keyDown(trigger, { key: 'Enter' })
    await userEvent.click(await screen.findByRole('option', { name: 'Адмін' }))
    await waitFor(() =>
      expect(put).toHaveBeenCalledWith('/admin/users/104/role', { role: 'admin' }),
    )
    expect(screen.getAllByRole('button', { name: 'Заблокувати' })).toHaveLength(2)
  })

  it('адмін бачить ролі лише для читання і блокує тільки учасників', async () => {
    signIn('admin')
    mockGet()
    renderAdmin('/admin?tab=users')

    expect(await screen.findByText('Ролі змінює лише власник')).toBeInTheDocument()
    await screen.findByText('@crypto_bonus_24')
    expect(screen.queryByRole('combobox', { name: /Роль @/ })).not.toBeInTheDocument()
    const rows = screen.getAllByRole('row').slice(1)
    expect(within(rows[0]).getByRole('button', { name: 'Заблокувати' })).toBeInTheDocument()
    expect(within(rows[1]).queryByRole('button', { name: 'Заблокувати' })).not.toBeInTheDocument()
  })
})
