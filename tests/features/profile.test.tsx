import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { ProfilePage } from '@/features/auth/ProfilePage'
import { UserProfilePage } from '@/features/community/UserProfilePage'
import { ApiError, apiClient } from '@/shared/api/client'
import type { ProfileView } from '@/shared/api/community-types'
import type { AuthResponse, User } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'
import { useFiltersStore } from '@/store/useFiltersStore'

const USER: User = {
  id: 1,
  username: 'bohdan',
  email: 'bohdan@example.com',
  display_name: 'Богдан Ткачук',
  bio: 'Студент, вивчаю P2P-арбітраж USDT/UAH.',
  role: 'user',
  status: 'active',
  telegram_connected: false,
  google_connected: false,
  settings: {
    default_asset: 'USDT',
    default_fiat: 'UAH',
    default_payment: 'monobank',
    default_investment: '20000',
    notify_comments: true,
    notify_likes: false,
  },
  created_at: '2026-10-01T10:00:00Z',
}

const MY_PROFILE: ProfileView = {
  id: 1,
  username: 'bohdan',
  display_name: 'Богдан Ткачук',
  bio: 'Студент, вивчаю P2P-арбітраж USDT/UAH.',
  is_admin: false,
  status: 'active',
  joined_at: '2026-10-01T10:00:00Z',
  posts: 12,
  likes_received: 184,
  reposts_received: 9,
  comments: 46,
}

const OTHER: ProfileView = {
  ...MY_PROFILE,
  id: 101,
  username: 'max_p2p',
  display_name: 'Максим Бондар',
  bio: 'Торгую USDT/UAH з 2024 року.',
  comments: 3,
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

function mockApi(user: User = USER) {
  return vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
    if (url === '/me') return { data: user }
    if (url === '/community/users/bohdan') return { data: MY_PROFILE }
    if (url === '/community/users/max_p2p') return { data: OTHER }
    if (url.endsWith('/feed')) return { data: { items: [], next_cursor: null } }
    return { data: { count: 0, assets: ['USDT', 'BTC'], fiats: ['UAH', 'EUR'], items: [] } }
  })
}

function renderAt(path: string) {
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/community/u/:username" element={<UserProfilePage />} />
          <Route path="/login" element={<p>Сторінка входу</p>} />
          <Route path="/" element={<p>Головна сторінка</p>} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

const panel = (name: string) => screen.getByRole('region', { name })

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.getState().signOut()
  useFiltersStore.getState().reset()
})

afterEach(() => vi.restoreAllMocks())

describe('мій профіль', () => {
  it('шапка з ім’ям, описом і чотирма лічильниками', async () => {
    signIn()
    mockApi()
    renderAt('/profile')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Богдан Ткачук' }),
    ).toBeInTheDocument()
    const header = panel('Профіль')
    expect(within(header).getByText('@bohdan · на платформі з жовтня 2026')).toBeInTheDocument()
    expect(within(header).getByText(USER.bio!)).toBeInTheDocument()
    const stats = screen.getByLabelText('Статистика профілю')
    for (const value of ['12', '184', '9', '46']) {
      expect(within(stats).getByText(value)).toBeInTheDocument()
    }
    expect(screen.getByText('Учасник')).toBeInTheDocument()
  })

  it('«Редагувати профіль» ставить курсор у поле імені', async () => {
    signIn()
    mockApi()
    Element.prototype.scrollIntoView = vi.fn()
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: 'Редагувати профіль' }))
    expect(within(panel('Налаштування профілю')).getByLabelText('Ім’я')).toHaveFocus()
  })

  it('зберігає ім’я та опис, порожнє поле очищається', async () => {
    signIn()
    mockApi()
    const patch = vi
      .spyOn(apiClient, 'patch')
      .mockResolvedValue({ data: { ...USER, display_name: 'Bohdan T.', bio: null } })
    renderAt('/profile')

    const form = panel('Налаштування профілю')
    const save = within(form).getByRole('button', { name: 'Зберегти' })
    expect(save).toBeDisabled()
    expect(within(form).getByLabelText('Email')).toHaveAttribute('readonly')

    await userEvent.clear(within(form).getByLabelText('Ім’я'))
    await userEvent.type(within(form).getByLabelText('Ім’я'), '  Bohdan T.  ')
    await userEvent.clear(within(form).getByLabelText('Про себе'))
    await userEvent.click(save)

    expect(patch).toHaveBeenCalledWith('/me', { display_name: 'Bohdan T.', bio: null })
    expect(await within(form).findByText('Збережено')).toBeInTheDocument()
    expect(useAuthStore.getState().session?.user.display_name).toBe('Bohdan T.')
  })

  it('надто довгий опис не відправляється', async () => {
    signIn()
    mockApi()
    const patch = vi.spyOn(apiClient, 'patch')
    renderAt('/profile')

    const form = panel('Налаштування профілю')
    fireEvent.change(within(form).getByLabelText('Про себе'), {
      target: { value: 'а'.repeat(301) },
    })
    await userEvent.click(within(form).getByRole('button', { name: 'Зберегти' }))
    expect(within(form).getByText('Максимум 300 символів')).toBeInTheDocument()
    expect(patch).not.toHaveBeenCalled()
  })

  it('налаштування за замовчуванням зберігаються й застосовуються до фільтрів', async () => {
    signIn()
    mockApi()
    const saved = {
      ...USER,
      settings: { ...USER.settings, default_investment: '50000', extra_fees: '27.3' },
    }
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({ data: saved })
    renderAt('/profile')

    const form = panel('Налаштування за замовчуванням')
    expect(within(form).getByLabelText('Сума, UAH')).toHaveValue('20000')
    await userEvent.clear(within(form).getByLabelText('Сума, UAH'))
    await userEvent.type(within(form).getByLabelText('Сума, UAH'), '50 000')
    await userEvent.type(within(form).getByLabelText('Додаткові комісії, UAH'), '27,3')
    await userEvent.click(within(form).getByRole('button', { name: 'Зберегти' }))

    expect(patch).toHaveBeenCalledWith(
      '/me/settings',
      expect.objectContaining({
        default_asset: 'USDT',
        default_fiat: 'UAH',
        default_payment: 'monobank',
        default_investment: '50000',
        extra_fees: '27.3',
      }),
    )
    await waitFor(() => expect(useFiltersStore.getState().amount).toBe(50_000))
    expect(useFiltersStore.getState().bank).toBe('monobank')
  })

  it('перемикачі сповіщень і підключення Telegram', async () => {
    signIn()
    const get = mockApi()
    const open = vi.spyOn(window, 'open').mockReturnValue(null)
    const patch = vi.spyOn(apiClient, 'patch').mockResolvedValue({
      data: { ...USER, settings: { ...USER.settings, notify_comments: false } },
    })
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { url: 'https://t.me/upars_bot?start=abc', expires_in: 600 } })
    renderAt('/profile')

    const notifications = panel('Сповіщення')
    expect(within(notifications).getAllByText('незабаром')).toHaveLength(2)
    await userEvent.click(
      within(notifications).getByRole('switch', { name: /Відповіді та коментарі/ }),
    )
    expect(patch).toHaveBeenCalledWith('/me/settings', { notify_comments: false })

    await userEvent.click(within(notifications).getByRole('switch', { name: 'Telegram-бот' }))
    expect(post).toHaveBeenCalledWith('/me/telegram')
    expect(open).toHaveBeenCalledWith(
      'https://t.me/upars_bot?start=abc',
      '_blank',
      'noopener,noreferrer',
    )
    get.mockClear()
    await userEvent.click(
      await within(notifications).findByRole('button', { name: 'Я натиснув Start' }),
    )
    expect(get).toHaveBeenCalledWith('/me', expect.anything())
  })

  it('зміна пароля перевіряє поля, а після успіху веде на вхід', async () => {
    signIn()
    mockApi()
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: undefined })
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: 'Змінити пароль' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Змінити пароль' }))
    expect(within(dialog).getByText('Вкажіть поточний пароль')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()

    await userEvent.type(within(dialog).getByLabelText('Поточний пароль'), 'old-secret-1')
    await userEvent.type(within(dialog).getByLabelText('Новий пароль'), 'New-secret-22')
    await userEvent.type(within(dialog).getByLabelText('Повторіть новий пароль'), 'New-secret-22')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Змінити пароль' }))

    expect(post).toHaveBeenCalledWith('/auth/change-password', {
      current_password: 'old-secret-1',
      new_password: 'New-secret-22',
    })
    expect(await screen.findByText('Сторінка входу')).toBeInTheDocument()
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('помилка сервера при зміні пароля видна в діалозі', async () => {
    signIn()
    mockApi()
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Поточний пароль невірний', { status: 400 }),
    )
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: 'Змінити пароль' }))
    const dialog = screen.getByRole('dialog')
    await userEvent.type(within(dialog).getByLabelText('Поточний пароль'), 'wrong-pass-1')
    await userEvent.type(within(dialog).getByLabelText('Новий пароль'), 'New-secret-22')
    await userEvent.type(within(dialog).getByLabelText('Повторіть новий пароль'), 'New-secret-22')
    await userEvent.click(within(dialog).getByRole('button', { name: 'Змінити пароль' }))
    expect(await within(dialog).findByText('Поточний пароль невірний')).toBeInTheDocument()
  })

  it('вихід завершує сесію й веде на головну', async () => {
    signIn()
    mockApi()
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: undefined })
    renderAt('/profile')

    await userEvent.click(await screen.findByRole('button', { name: 'Вийти' }))
    expect(await screen.findByText('Головна сторінка')).toBeInTheDocument()
    expect(useAuthStore.getState().session).toBeNull()
  })

  it('без входу веде на сторінку входу', () => {
    mockApi()
    renderAt('/profile')
    expect(screen.getByText('Сторінка входу')).toBeInTheDocument()
  })
})

describe('профіль у спільноті', () => {
  it('свій публічний профіль відкриває сторінку «Мій профіль»', async () => {
    signIn()
    mockApi()
    renderAt('/community/u/bohdan?tab=likes')
    expect(await screen.findByRole('region', { name: 'Налаштування профілю' })).toBeInTheDocument()
  })

  it('чужий профіль показує ім’я та опис без налаштувань', async () => {
    signIn()
    mockApi()
    renderAt('/community/u/max_p2p')

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Максим Бондар' }),
    ).toBeInTheDocument()
    expect(within(panel('Профіль')).getByText(OTHER.bio!)).toBeInTheDocument()
    expect(screen.queryByRole('region', { name: 'Налаштування профілю' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Заблокувати' })).not.toBeInTheDocument()
  })
})
