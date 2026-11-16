import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { NotificationsPanel } from '@/features/auth/components/ProfileSections'
import { ApiError, apiClient } from '@/shared/api/client'
import type { User } from '@/shared/api/types'
import { useAuthStore } from '@/store/useAuthStore'

const USER: User = {
  id: 1,
  username: 'bohdan',
  email: 'bohdan@example.com',
  display_name: null,
  bio: null,
  role: 'user',
  status: 'active',
  telegram_connected: true,
  notify_email: null,
  email_alerts_available: true,
  telegram_alerts_available: true,
  settings: {},
  created_at: '2026-10-01T10:00:00Z',
}

function renderPanel(user: User = USER) {
  render(
    <Providers>
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <NotificationsPanel user={user} checking={false} onCheck={() => undefined} />
      </MemoryRouter>
    </Providers>,
  )
}

beforeEach(() => {
  localStorage.clear()
  useAuthStore.getState().signIn(
    {
      access_token: 'a',
      refresh_token: 'r',
      token_type: 'bearer',
      expires_in: 900,
      refresh_expires_in: 1000,
      user: USER,
    },
    true,
  )
})

afterEach(() => vi.restoreAllMocks())

describe('пошта для сповіщень', () => {
  it('показує, куди підуть листи', () => {
    renderPanel()
    expect(screen.getByText('bohdan@example.com')).toBeInTheDocument()
    expect(screen.getByText(/email акаунта/)).toBeInTheDocument()
  })

  it('нова адреса стає активною лише після коду', async () => {
    const confirmed = { ...USER, notify_email: 'alerts@example.org' }
    const post = vi.spyOn(apiClient, 'post').mockImplementation(async (url: string) => {
      if (url === '/me/notify-email') {
        return { data: { email: 'alerts@example.org', expires_in: 900 } }
      }
      if (url === '/me/notify-email/confirm') return { data: confirmed }
      throw new Error(url)
    })
    renderPanel()

    await userEvent.click(screen.getByRole('button', { name: 'Інша адреса' }))
    await userEvent.type(screen.getByLabelText('Нова адреса'), 'alerts@example.org')
    await userEvent.click(screen.getByRole('button', { name: 'Надіслати код' }))
    expect(await screen.findByText(/Код надіслано на/)).toBeInTheDocument()

    await userEvent.type(screen.getByLabelText('Код з листа'), '12a3456')
    await userEvent.click(screen.getByRole('button', { name: 'Підтвердити' }))

    expect(post).toHaveBeenCalledWith('/me/notify-email', { email: 'alerts@example.org' })
    expect(post).toHaveBeenCalledWith('/me/notify-email/confirm', { code: '123456' })
    expect(await screen.findByRole('button', { name: 'Інша адреса' })).toBeInTheDocument()
    expect(useAuthStore.getState().session?.user.notify_email).toBe('alerts@example.org')
  })

  it('показує помилку невірного коду', async () => {
    vi.spyOn(apiClient, 'post').mockImplementation(async (url: string) => {
      if (url === '/me/notify-email') {
        return { data: { email: 'alerts@example.org', expires_in: 900 } }
      }
      throw new ApiError('Невірний код. Залишилось спроб: 4', { status: 400, code: 'unknown' })
    })
    renderPanel()

    await userEvent.click(screen.getByRole('button', { name: 'Інша адреса' }))
    await userEvent.type(screen.getByLabelText('Нова адреса'), 'alerts@example.org')
    await userEvent.click(screen.getByRole('button', { name: 'Надіслати код' }))
    await userEvent.type(await screen.findByLabelText('Код з листа'), '000000')
    await userEvent.click(screen.getByRole('button', { name: 'Підтвердити' }))

    expect(await screen.findByText('Невірний код. Залишилось спроб: 4')).toBeInTheDocument()
  })

  it('без пошти на сервері зміна адреси недоступна', () => {
    renderPanel({ ...USER, email_alerts_available: false })
    expect(screen.getByText('не налаштована на сервері')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Інша адреса' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Тестовий лист' })).toBeDisabled()
  })
})

describe('тестові сповіщення', () => {
  it('надсилає тест у Telegram і показує результат', async () => {
    const post = vi
      .spyOn(apiClient, 'post')
      .mockResolvedValue({ data: { channel: 'telegram', sent_to: 'Telegram' } })
    renderPanel()

    await userEvent.click(screen.getByRole('button', { name: 'Тест у Telegram' }))

    expect(post).toHaveBeenCalledWith('/me/notifications/test', { channel: 'telegram' })
    expect(await screen.findByText('Надіслано: Telegram')).toBeInTheDocument()
    expect(screen.getByText(/\/pairs — ціни ваших пар/)).toBeInTheDocument()
  })

  it('показує причину, чому лист не пішов', async () => {
    vi.spyOn(apiClient, 'post').mockRejectedValue(
      new ApiError('Тестове повідомлення можна надсилати раз на 30 секунд', {
        status: 429,
        code: 'rate_limit',
      }),
    )
    renderPanel()

    await userEvent.click(screen.getByRole('button', { name: 'Тестовий лист' }))

    expect(
      await screen.findByText('Тестове повідомлення можна надсилати раз на 30 секунд'),
    ).toBeInTheDocument()
  })
})
