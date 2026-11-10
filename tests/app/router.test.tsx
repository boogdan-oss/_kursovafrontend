import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, useRoutes } from 'react-router-dom'

import { NAV_ITEMS } from '@/app/navigation'
import { Providers } from '@/app/providers'
import { routes } from '@/app/router'

vi.mock('@/features/dashboard/api', () => ({
  fetchHealth: vi.fn().mockResolvedValue({
    status: 'ok',
    version: 'test',
    time: '2026-11-08T12:00:00Z',
    components: {},
  }),
  fetchPing: vi.fn(),
}))

const PAGES: [string, string][] = [
  ['/', 'Огляд ринку'],
  ['/offers', 'Сканер P2P-оголошень'],
  ['/arbitrage', 'Арбітражні можливості'],
  ['/calculator', 'Калькулятор угоди'],
  ['/forecast', 'AI-прогноз ціни'],
  ['/assistant', 'AI-асистент'],
  ['/alerts', 'Сповіщення та Watchlist'],
  ['/community', 'Спільнота'],
  ['/profile', 'Налаштування'],
]

function AppRoutes() {
  return useRoutes(routes)
}

function renderAt(path: string) {
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <AppRoutes />
      </MemoryRouter>
    </Providers>,
  )
}

describe('маршрути', () => {
  it.each(PAGES)('%s відкриває сторінку «%s»', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('у меню лише існуючі сторінки', () => {
    const paths = PAGES.map(([path]) => path)
    for (const item of NAV_ITEMS) expect(paths).toContain(item.to)
  })

  it('позначає активний пункт меню', () => {
    renderAt('/offers')
    expect(screen.getByRole('link', { name: 'Ринок' })).toHaveAttribute('aria-current', 'page')
    expect(screen.getByRole('link', { name: 'Головна' })).not.toHaveAttribute('aria-current')
  })

  it('показує 404 для невідомого шляху', () => {
    renderAt('/no-such-page')
    expect(screen.getByRole('heading', { name: 'Сторінку не знайдено' })).toBeInTheDocument()
  })

  it('відкриває вхід без меню', () => {
    renderAt('/login')
    expect(screen.getByRole('heading', { level: 1, name: 'Вхід' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })

  it('вкладка «Реєстрація» перемикає на реєстрацію', async () => {
    renderAt('/login')
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Реєстрація' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Реєстрація' })).toBeInTheDocument()
  })
})

describe('шапка', () => {
  it('клавіша «/» ставить курсор у пошук', () => {
    renderAt('/')
    fireEvent.keyDown(document.body, { key: '/' })
    expect(screen.getByRole('searchbox', { name: 'Пошук пари або біржі' })).toHaveFocus()
  })
})
