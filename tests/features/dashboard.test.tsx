import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { bestPrices, exchangePrices, exchangesSummary, maxBy } from '@/features/dashboard/lib'
import { apiClient } from '@/shared/api/client'
import type { PostView } from '@/shared/api/community-types'
import type { MarketSnapshot, OpportunityItem } from '@/shared/api/types'
import { useFiltersStore } from '@/store/useFiltersStore'

function snapshot(
  exchange: string,
  buy: string | null,
  sell: string,
  payment: string | null = null,
): MarketSnapshot {
  return {
    exchange,
    asset: 'USDT',
    fiat: 'UAH',
    payment_method: payment,
    buy_price: buy,
    sell_price: sell,
    spread_pct: '1.02',
    volume: '1000',
    offers_count_buy: 5,
    offers_count_sell: 5,
    fetched_at: '2026-11-11T12:00:00Z',
  }
}

const SNAPSHOTS = [
  snapshot('binance', '41.32', '41.72'),
  snapshot('bybit', '41.05', '41.47'),
  snapshot('okx', null, '41.52'),
  snapshot('bybit', '41.00', '41.40', 'monobank'),
]

function opportunity(overrides: Partial<OpportunityItem>): OpportunityItem {
  return {
    kind: 'cross_exchange',
    asset: 'USDT',
    fiat: 'UAH',
    buy_exchange: 'bybit',
    sell_exchange: 'binance',
    buy_price: '41.05',
    sell_price: '41.72',
    steps: [],
    spread_pct: '1.63',
    net_spread_pct: '1.42',
    estimated_profit: '284.68',
    max_volume: '1840',
    rr: '2.1',
    ai_score: 82,
    ai_category: 'Good Opportunity',
    investment: '20000',
    detected_at: '2026-11-11T12:00:00Z',
    ...overrides,
  }
}

const OPPORTUNITIES = [
  opportunity({}),
  opportunity({
    kind: 'spread',
    sell_exchange: 'bybit',
    net_spread_pct: '0.92',
    estimated_profit: '184.00',
    ai_score: 91,
  }),
  opportunity({ buy_exchange: 'okx', net_spread_pct: '0.50', ai_score: 60 }),
  opportunity({ buy_exchange: 'htx', net_spread_pct: '0.20', ai_score: 41 }),
]

function post(id: number, overrides: Partial<PostView> = {}): PostView {
  return {
    id,
    author: { id: 10 + id, username: `trader${id}`, is_admin: false, role: 'user' },
    text: `Публікація ${id}`,
    pair: null,
    opportunity: null,
    status: 'visible',
    likes: 0,
    comments: 0,
    reposts: 0,
    liked_by_me: false,
    reposted_by_me: false,
    created_at: new Date().toISOString(),
    updated_at: null,
    ...overrides,
  }
}

const POPULAR = [
  post(1, {
    text: 'Bybit → Binance тримається вже годину',
    pair: { asset: 'USDT', fiat: 'UAH' },
    likes: 12,
    comments: 4,
    reposts: 2,
  }),
  post(2, { likes: 5 }),
]

const HEALTH = {
  status: 'ok',
  version: 'test',
  time: '2026-11-11T12:00:00Z',
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
}

describe('dashboard lib', () => {
  it('ціни по біржах для вибраного способу оплати, найкращі — мін. купівля і макс. продаж', () => {
    const rows = exchangePrices(SNAPSHOTS, null)
    expect(rows.map((row) => row.exchange)).toEqual(['bybit', 'binance', 'okx'])
    expect(bestPrices(rows)).toEqual({ buy: 41.05, sell: 41.72 })
    expect(exchangePrices(SNAPSHOTS, 'monobank')).toHaveLength(1)
    expect(bestPrices([])).toEqual({ buy: null, sell: null })
  })

  it('найкращий елемент і зведення по біржах', () => {
    expect(maxBy(OPPORTUNITIES, (item) => item.ai_score)?.ai_score).toBe(91)
    expect(maxBy([], () => 1)).toBeUndefined()
    expect(exchangesSummary(HEALTH.exchanges)).toEqual({ online: 1, total: 2, maxAgeSec: 2 })
  })
})

describe('сторінка «Головна»', () => {
  let popular: PostView[] = POPULAR

  function renderDashboard() {
    render(
      <Providers>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <DashboardPage />
        </MemoryRouter>
      </Providers>,
    )
  }

  beforeEach(() => {
    popular = POPULAR
    localStorage.clear()
    useFiltersStore.getState().reset()
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === '/market/snapshot') {
        return {
          data: {
            asset: 'USDT',
            fiat: 'UAH',
            queued: false,
            freshness: [{ exchange: 'okx', stale: true }],
            items: SNAPSHOTS,
          },
        }
      }
      if (url === '/opportunities') {
        return { data: { count: OPPORTUNITIES.length, items: OPPORTUNITIES } }
      }
      if (url === '/opportunities/history') return { data: { count: 7, items: [] } }
      if (url === '/health') return { data: HEALTH }
      if (url === '/community/feed') {
        return {
          data: {
            items: popular.map((item) => ({ post: item, reposted_by: null, at: item.created_at })),
            next_cursor: null,
          },
        }
      }
      if (url === '/market/history') {
        return {
          data: {
            exchange: 'bybit',
            asset: 'USDT',
            fiat: 'UAH',
            interval: '15m',
            count: 0,
            items: [],
          },
        }
      }
      return { data: { count: 0, assets: ['USDT'], fiats: ['UAH'], items: [] } }
    })
  })

  afterEach(() => vi.restoreAllMocks())

  it('показує показники, ціни й топ-3 без стану бірж (він в адмінці)', async () => {
    renderDashboard()

    expect(await screen.findByText('7 знайдено за останню годину')).toBeInTheDocument()
    expect(screen.getByText('1,42%')).toBeInTheDocument()
    expect(screen.getByText('1 / 2')).toBeInTheDocument()
    expect(screen.getByText('Історії цін для USDT/UAH за цей період ще немає')).toBeInTheDocument()

    const [prices, top] = screen.getAllByRole('table')
    const bybit = within(prices).getByText('Bybit').closest('tr')!
    expect(within(bybit).getByText('41,05')).toHaveClass('text-success')
    expect(within(prices).getByText('41,72')).toHaveClass('text-success')
    expect(within(prices).getByText('застаріло')).toBeInTheDocument()
    expect(screen.getAllByText('Bybit → Binance')).toHaveLength(2)

    const rows = within(top).getAllByRole('row').slice(1)
    expect(rows).toHaveLength(3)
    expect(within(rows[0]).getByText('91')).toBeInTheDocument()
    expect(within(rows[0]).getByRole('link', { name: 'Деталі' })).toHaveAttribute(
      'href',
      '/arbitrage?type=spread',
    )
    expect(within(top).queryByText('41')).not.toBeInTheDocument()

    expect(screen.queryByRole('region', { name: 'Стан бірж' })).not.toBeInTheDocument()
  })

  it('«Популярне в спільноті»: найпопулярніші публікації за тиждень з парою й лічильниками', async () => {
    const get = vi.mocked(apiClient.get)
    renderDashboard()

    const list = await screen.findByRole('list', { name: 'Популярні публікації' })
    const items = within(list).getAllByRole('listitem')
    expect(items).toHaveLength(2)
    expect(within(items[0]).getByText('Bybit → Binance тримається вже годину')).toBeInTheDocument()
    expect(within(items[0]).getByRole('link', { name: '@trader1' })).toHaveAttribute(
      'href',
      '/community/u/trader1',
    )
    expect(within(items[0]).getByRole('link', { name: 'USDT/UAH' })).toHaveAttribute(
      'href',
      '/community?pair=USDT-UAH',
    )
    expect(within(items[0]).getByTitle('Вподобання')).toHaveTextContent('12')
    expect(within(items[0]).getByTitle('Коментарі')).toHaveTextContent('4')
    expect(screen.getByRole('link', { name: 'Усі обговорення' })).toHaveAttribute(
      'href',
      '/community?tab=popular',
    )
    expect(get).toHaveBeenCalledWith('/community/feed', {
      params: { sort: 'popular', limit: 3 },
      signal: expect.any(AbortSignal),
    })
  })

  it('без обговорень за тиждень пропонує написати першим', async () => {
    popular = []
    renderDashboard()
    expect(await screen.findByText('За тиждень обговорень ще не було')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Написати першим' })).toHaveAttribute(
      'href',
      '/community',
    )
  })
})
