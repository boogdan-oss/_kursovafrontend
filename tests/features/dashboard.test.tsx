import { render, screen, within } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { DashboardPage } from '@/features/dashboard/DashboardPage'
import { bestPrices, exchangePrices, exchangesSummary, maxBy } from '@/features/dashboard/lib'
import { apiClient } from '@/shared/api/client'
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
  beforeEach(() => {
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

  it('показує показники, ціни, топ-3 і стан бірж', async () => {
    render(
      <Providers>
        <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <DashboardPage />
        </MemoryRouter>
      </Providers>,
    )

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

    expect(screen.getByText('Кулдаун')).toBeInTheDocument()
    expect(screen.getByText('Redis: помилка')).toBeInTheDocument()
  })
})
