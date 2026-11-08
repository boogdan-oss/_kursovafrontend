import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider } from 'react-router-dom'

import { NAV_ITEMS } from '@/app/navigation'
import { Providers } from '@/app/providers'
import { routerFuture, routes } from '@/app/router'

vi.mock('@/features/dashboard/api', () => ({
  fetchHealth: vi.fn().mockResolvedValue({
    status: 'ok',
    version: 'test',
    time: '2026-11-08T12:00:00Z',
    components: {},
  }),
  fetchPing: vi.fn(),
}))

function renderAt(path: string) {
  const router = createMemoryRouter(routes, { initialEntries: [path], future: routerFuture })
  render(
    <Providers>
      <RouterProvider router={router} future={{ v7_startTransition: true }} />
    </Providers>,
  )
}

describe('маршрути', () => {
  it.each(NAV_ITEMS)('$to відкриває сторінку «$label»', ({ to, label }) => {
    renderAt(to)
    expect(screen.getByRole('heading', { level: 1, name: label })).toBeInTheDocument()
  })

  it('показує 404 для невідомого шляху', () => {
    renderAt('/no-such-page')
    expect(screen.getByRole('heading', { name: 'Сторінку не знайдено' })).toBeInTheDocument()
  })

  it('відкриває вхід без бічного меню', () => {
    renderAt('/login')
    expect(screen.getByRole('heading', { name: 'Вхід' })).toBeInTheDocument()
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument()
  })
})
