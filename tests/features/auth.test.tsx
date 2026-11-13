import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import axios, { AxiosError, type AxiosAdapter, type InternalAxiosRequestConfig } from 'axios'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { GoogleCallbackPage } from '@/features/auth/GoogleCallbackPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { passwordScore, validateRegistration } from '@/features/auth/validation'
import { ApiError, apiClient } from '@/shared/api/client'
import type { AuthResponse } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'

const STORAGE_KEY = 'upars-auth'

function authResponse(token = 'access-1', refresh = 'refresh-1'): AuthResponse {
  return {
    access_token: token,
    refresh_token: refresh,
    token_type: 'bearer',
    expires_in: 900,
    refresh_expires_in: 2_592_000,
    user: {
      id: 1,
      username: 'bohdan',
      email: 'bohdan@example.com',
      role: 'user',
      status: 'active',
      telegram_connected: false,
      google_connected: false,
      settings: {},
      created_at: '2026-11-12T10:00:00Z',
    },
  }
}

function renderAuth(path: string, state?: unknown) {
  const [pathname, search = ''] = path.split('?')
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[{ pathname, search: search && `?${search}`, state }]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/auth/google/callback" element={<GoogleCallbackPage />} />
          <Route path="/" element={<p>Головна сторінка</p>} />
          <Route path="/arbitrage" element={<p>Сторінка арбітражу</p>} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
}

beforeEach(() => {
  localStorage.clear()
  sessionStorage.clear()
  useAuthStore.getState().signOut()
})

afterEach(() => vi.restoreAllMocks())

describe('валідація реєстрації', () => {
  const valid = {
    username: 'bohdan',
    email: 'bohdan@example.com',
    password: 'Secret123!',
    confirm: 'Secret123!',
  }

  it('пропускає коректні дані', () => {
    expect(validateRegistration(valid)).toEqual({})
  })

  it('перевіряє нікнейм, email, довжину та збіг паролів', () => {
    expect(
      validateRegistration({ username: 'бо', email: 'x@', password: 'short', confirm: 'other' }),
    ).toEqual({
      username: '3–32 символи: латинські літери, цифри, «_» або «.»',
      email: 'Вкажіть коректний email',
      password: 'Мінімум 8 символів',
      confirm: 'Паролі не збігаються',
    })
  })

  it('оцінює надійність пароля від 0 до 4', () => {
    expect(passwordScore('')).toBe(0)
    expect(passwordScore('abc')).toBe(0)
    expect(passwordScore('abcdefgh')).toBe(1)
    expect(passwordScore('Abcdefgh1')).toBe(2)
    expect(passwordScore('Abcdefgh1234!')).toBe(4)
  })
})

describe('вхід', () => {
  it('порожня форма показує помилки й не йде на сервер', async () => {
    const post = vi.spyOn(apiClient, 'post')
    renderAuth('/login')
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }))
    expect(screen.getByText('Вкажіть email або нікнейм')).toBeInTheDocument()
    expect(screen.getByText('Вкажіть пароль')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('успішний вхід зберігає сесію й повертає на попередню сторінку', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: authResponse() })
    renderAuth('/login', { from: '/arbitrage' })

    await userEvent.type(screen.getByLabelText('Email або нікнейм'), ' bohdan ')
    await userEvent.type(screen.getByLabelText('Пароль'), 'Secret123!')
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }))

    expect(await screen.findByText('Сторінка арбітражу')).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith('/auth/login', { login: 'bohdan', password: 'Secret123!' })
    expect(useAuthStore.getState().session?.user.username).toBe('bohdan')
    expect(localStorage.getItem(STORAGE_KEY)).toContain('access-1')
  })

  it('без «Запам’ятати мене» сесія живе лише у вкладці', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: authResponse() })
    renderAuth('/login')

    await userEvent.type(screen.getByLabelText('Email або нікнейм'), 'bohdan')
    await userEvent.type(screen.getByLabelText('Пароль'), 'Secret123!')
    await userEvent.click(screen.getByRole('checkbox', { name: 'Запам’ятати мене' }))
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }))

    expect(await screen.findByText('Головна сторінка')).toBeInTheDocument()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
    expect(sessionStorage.getItem(STORAGE_KEY)).toContain('access-1')
  })

  it('показує помилку сервера', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Невірний логін або пароль', { status: 401, code: 'unauthorized' }),
    )
    renderAuth('/login')
    await userEvent.type(screen.getByLabelText('Email або нікнейм'), 'bohdan')
    await userEvent.type(screen.getByLabelText('Пароль'), 'wrong-pass')
    await userEvent.click(screen.getByRole('button', { name: 'Увійти' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('Невірний логін або пароль')
  })
})

describe('реєстрація', () => {
  async function fill(values: Record<string, string>) {
    for (const [label, value] of Object.entries(values)) {
      await userEvent.type(screen.getByLabelText(label), value)
    }
  }

  it('кнопка активна лише після згоди з правилами', async () => {
    renderAuth('/register')
    const submit = screen.getByRole('button', { name: 'Створити акаунт' })
    expect(submit).toBeDisabled()
    await userEvent.click(screen.getByRole('checkbox', { name: /правилами спільноти/ }))
    expect(submit).toBeEnabled()
  })

  it('показує помилки валідації та надійність пароля', async () => {
    const post = vi.spyOn(apiClient, 'post')
    renderAuth('/register')
    await fill({ Пароль: 'Abcdefgh1', 'Підтвердження пароля': 'Abcdefgh2' })
    expect(screen.getByRole('meter', { name: 'Надійність пароля' })).toHaveAttribute(
      'aria-valuenow',
      '2',
    )
    await userEvent.click(screen.getByRole('checkbox', { name: /правилами спільноти/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Створити акаунт' }))
    expect(screen.getByText('Вкажіть нікнейм')).toBeInTheDocument()
    expect(screen.getByText('Паролі не збігаються')).toBeInTheDocument()
    expect(post).not.toHaveBeenCalled()
  })

  it('створює акаунт і одразу входить', async () => {
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: authResponse() })
    renderAuth('/register')
    await fill({
      Нікнейм: '@bohdan',
      Email: 'bohdan@example.com',
      Пароль: 'Secret123!',
      'Підтвердження пароля': 'Secret123!',
    })
    await userEvent.click(screen.getByRole('checkbox', { name: /правилами спільноти/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Створити акаунт' }))

    expect(await screen.findByText('Головна сторінка')).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith('/auth/register', {
      username: 'bohdan',
      email: 'bohdan@example.com',
      password: 'Secret123!',
    })
    expect(useAuthStore.getState().session?.accessToken).toBe('access-1')
  })

  it('зайнятий нікнейм — повідомлення з сервера', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError("Користувач з таким ім'ям вже існує", { status: 409 }),
    )
    renderAuth('/register')
    await fill({
      Нікнейм: 'bohdan',
      Email: 'bohdan@example.com',
      Пароль: 'Secret123!',
      'Підтвердження пароля': 'Secret123!',
    })
    await userEvent.click(screen.getByRole('checkbox', { name: /правилами спільноти/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Створити акаунт' }))
    expect(await screen.findByRole('alert')).toHaveTextContent('вже існує')
  })
})

describe('токени в API-клієнті', () => {
  const originalAdapter = apiClient.defaults.adapter

  afterEach(() => {
    apiClient.defaults.adapter = originalAdapter
  })

  function respond(config: InternalAxiosRequestConfig, status: number, data: unknown) {
    const response = { data, status, statusText: '', headers: {}, config }
    if (status < 400) return Promise.resolve(response)
    return Promise.reject(
      new AxiosError('fail', AxiosError.ERR_BAD_REQUEST, config, undefined, response),
    )
  }

  it('додає Bearer-токен і оновлює його після 401', async () => {
    useAuthStore.getState().signIn(authResponse('old-access', 'refresh-1'), true)
    const seen: (string | undefined)[] = []
    const adapter: AxiosAdapter = (config) => {
      const header = config.headers.get('Authorization')?.toString()
      seen.push(header)
      return header === 'Bearer new-access'
        ? respond(config, 200, { ok: true })
        : respond(config, 401, { detail: 'Токен прострочений' })
    }
    apiClient.defaults.adapter = adapter
    const refresh = vi
      .spyOn(axios, 'post')
      .mockResolvedValue({ data: authResponse('new-access', 'refresh-2') })

    const { data } = await apiClient.get('/me')

    expect(data).toEqual({ ok: true })
    expect(seen).toEqual(['Bearer old-access', 'Bearer new-access'])
    expect(refresh).toHaveBeenCalledWith(
      expect.stringMatching(/\/auth\/refresh$/),
      { refresh_token: 'refresh-1' },
      expect.anything(),
    )
    expect(useAuthStore.getState().session?.refreshToken).toBe('refresh-2')
  })

  it('невдале оновлення завершує сесію', async () => {
    useAuthStore.getState().signIn(authResponse(), true)
    apiClient.defaults.adapter = (config) => respond(config, 401, { detail: 'Потрібно увійти' })
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('refresh failed'))

    await expect(apiClient.get('/me')).rejects.toMatchObject({ status: 401 })
    expect(useAuthStore.getState().session).toBeNull()
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })
})

describe('вхід через Google', () => {
  function googleLink() {
    return screen.getByRole('link', { name: /Продовжити з Google/ })
  }

  it('кнопка веде на бекенд з адресою повернення й сторінкою після входу', () => {
    renderAuth('/register', { from: '/arbitrage' })
    const url = new URL(googleLink().getAttribute('href')!, 'http://localhost')
    expect(url.pathname).toBe('/api/v1/auth/google/start')
    expect(url.searchParams.get('origin')).toBe(window.location.origin)
    expect(url.searchParams.get('next')).toBe('/arbitrage')
  })

  it('запам’ятовує вибір «Запам’ятати мене» до повернення з Google', async () => {
    renderAuth('/login')
    await userEvent.click(screen.getByText('Запам’ятати мене'))
    googleLink().addEventListener('click', (event) => event.preventDefault())
    await userEvent.click(googleLink())
    expect(sessionStorage.getItem('upars-google-remember')).toBe('0')
  })

  it('помилка з бекенду показується на сторінці входу', () => {
    renderAuth('/login?error=account_blocked')
    expect(screen.getByRole('alert')).toHaveTextContent('Акаунт заблоковано або призупинено.')
  })

  it('одноразовий код обмінюється на сесію й веде на next', async () => {
    sessionStorage.setItem('upars-google-remember', '0')
    const post = vi.spyOn(apiClient, 'post').mockResolvedValue({ data: authResponse('g-access') })
    renderAuth('/auth/google/callback?code=login-code&next=/arbitrage')

    expect(await screen.findByText('Сторінка арбітражу')).toBeInTheDocument()
    expect(post).toHaveBeenCalledWith('/auth/google/exchange', { code: 'login-code' })
    expect(useAuthStore.getState().session?.accessToken).toBe('g-access')
    expect(useAuthStore.getState().remember).toBe(false)
    expect(sessionStorage.getItem('upars-google-remember')).toBeNull()
  })

  it('чужий next не виводить за межі сайту', async () => {
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: authResponse('g-2') })
    renderAuth('/auth/google/callback?code=login-code-2&next=//evil.example')
    expect(await screen.findByText('Головна сторінка')).toBeInTheDocument()
  })

  it('без коду або з простроченим кодом пропонує спробувати ще раз', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Код входу недійсний або вже використаний', { status: 401 }),
    )
    renderAuth('/auth/google/callback?code=used-code')
    expect(await screen.findByRole('alert')).toHaveTextContent('Код входу недійсний')
    expect(screen.getByRole('link', { name: 'Спробувати ще раз' })).toHaveAttribute(
      'href',
      '/login',
    )
  })
})
