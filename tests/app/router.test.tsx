import { fireEvent, render, screen, within } from '@testing-library/react'
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
  ['/offers', 'Ринок доступний після входу'],
  ['/arbitrage', 'Арбітраж доступний після входу'],
  ['/calculator', 'Калькулятор угоди'],
  ['/assistant', 'AI-асистент доступний після входу'],
  ['/alerts', 'Сповіщення доступні після входу'],
  ['/community', 'Спільнота'],
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

  it('гість на закритій сторінці бачить кнопки входу й реєстрації', () => {
    renderAt('/arbitrage?type=chain')
    const main = screen.getByRole('main')
    expect(within(main).getByRole('link', { name: 'Увійти' })).toHaveAttribute('href', '/login')
    expect(within(main).getByRole('link', { name: 'Зареєструватися' })).toHaveAttribute(
      'href',
      '/register',
    )
  })

  it('профіль без входу веде на сторінку входу', () => {
    renderAt('/profile')
    expect(screen.getByRole('heading', { level: 1, name: 'Вхід' })).toBeInTheDocument()
  })

  it('вкладка «Реєстрація» перемикає на реєстрацію', async () => {
    renderAt('/login')
    fireEvent.mouseDown(screen.getByRole('tab', { name: 'Реєстрація' }))
    expect(await screen.findByRole('heading', { level: 1, name: 'Реєстрація' })).toBeInTheDocument()
  })
})

describe('шапка', () => {
  const SEARCH = 'Пошук пари, біржі або користувача'

  afterEach(() => vi.restoreAllMocks())

  it('на широкому екрані клавіша «/» ставить курсор у пошук', () => {
    vi.spyOn(HTMLElement.prototype, 'getClientRects').mockReturnValue({
      length: 1,
    } as DOMRectList)
    renderAt('/')
    fireEvent.keyDown(document.body, { key: '/' })
    expect(screen.getByRole('combobox', { name: SEARCH })).toHaveFocus()
  })

  it('на вузькому екрані клавіша «/» відкриває вікно пошуку', async () => {
    renderAt('/')
    fireEvent.keyDown(document.body, { key: '/' })
    const dialog = await screen.findByRole('dialog', { name: 'Пошук' })
    expect(within(dialog).getByRole('combobox', { name: SEARCH })).toHaveFocus()
  })
})
