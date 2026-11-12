import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { ForecastPage } from '@/features/forecast/ForecastPage'
import { parseChartRange, parseHorizon } from '@/features/forecast/lib'
import { DEMO_MODEL, MIN_POINTS, trendForecast, type PricePoint } from '@/mocks/forecast-model'
import { ApiError, apiClient } from '@/shared/api/client'
import { useFiltersStore } from '@/store/useFiltersStore'

vi.mock('@/features/forecast/components/ForecastChart', () => ({
  ForecastChart: () => <div data-testid="forecast-chart" />,
}))

const START = Date.parse('2026-11-11T09:00:00Z')
const MINUTE = 60_000

function line(count: number, price: (minute: number) => number): PricePoint[] {
  return Array.from({ length: count }, (_, minute) => ({
    time: START + minute * MINUTE,
    price: price(minute),
  }))
}

const PARAMS = { asset: 'USDT', fiat: 'UAH', exchange: 'bybit', side: 'BUY' as const }
const plain = (text: string) =>
  text.replaceAll(String.fromCharCode(160), ' ').replaceAll(String.fromCharCode(0x2212), '-')

describe('демо-модель прогнозу', () => {
  it('без достатньої історії прогнозу немає', () => {
    expect(
      trendForecast(
        line(MIN_POINTS - 1, () => 41),
        { ...PARAMS, horizon: 60 },
      ),
    ).toBeNull()
  })

  it('на пласкій ціні прогноз дорівнює поточній, інтервал нульовий', () => {
    const result = trendForecast(
      line(200, () => 41.05),
      { ...PARAMS, horizon: 30 },
    )!
    expect(result.model).toBe(DEMO_MODEL)
    expect(result.current_price).toBe('41.0500')
    expect(result.predicted_price).toBe('41.0500')
    expect(result.lower).toBe(result.upper)
    expect(result.forecast.map((point) => point.time)).toHaveLength(6)
    expect(result.mae).toBe('0.0000')
    expect(result.improvement_pct).toBeNull()
  })

  it('продовжує тренд і розширює інтервал з горизонтом', () => {
    const noisy = line(300, (minute) => 41 + minute * 0.001 + (minute % 2 ? 0.01 : -0.01))
    const result = trendForecast(noisy, { ...PARAMS, horizon: 60 })!
    expect(Number(result.predicted_price)).toBeGreaterThan(Number(result.current_price))
    const widths = result.forecast.map((point) => Number(point.upper) - Number(point.lower))
    expect(widths[widths.length - 1]).toBeGreaterThan(widths[0])
    expect(result.backtest.length).toBeGreaterThan(0)
    expect(Number(result.improvement_pct)).toBeGreaterThan(0)
    expect(result.current_time).toBe(new Date(noisy[299].time).toISOString())
  })

  it('читає горизонт і масштаб графіка з URL', () => {
    expect(parseHorizon('15')).toBe(15)
    expect(parseHorizon('45')).toBe(60)
    expect(parseHorizon(null)).toBe(60)
    expect(parseChartRange('1d')).toBe('1d')
    expect(parseChartRange('bad')).toBe('5m')
  })
})

describe('сторінка «AI-прогнози»', () => {
  const forecast = trendForecast(
    line(300, (minute) => 46 + minute * 0.0005 + (minute % 2 ? 0.004 : -0.004)),
    { ...PARAMS, horizon: 60 },
  )!

  beforeEach(() => {
    localStorage.clear()
    useFiltersStore.getState().reset()
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === '/ai/forecast') return { data: forecast }
      if (url === '/ai/models') {
        return {
          data: {
            count: 1,
            items: [
              {
                name: DEMO_MODEL,
                status: 'active',
                mae: null,
                trained_at: null,
                description: 'рахується в браузері',
              },
            ],
          },
        }
      }
      if (url === '/market/history') {
        return {
          data: {
            exchange: 'bybit',
            asset: 'USDT',
            fiat: 'UAH',
            interval: '5m',
            count: 1,
            items: [
              {
                time: '2026-11-11T13:55:00Z',
                buy_price: '46.10',
                sell_price: '47.20',
                spread_pct: '2.3',
                volume: '1',
                samples: 5,
              },
            ],
          },
        }
      }
      return {
        data: {
          count: 1,
          assets: ['USDT'],
          fiats: ['UAH'],
          items: [
            {
              exchange: 'bybit',
              asset: 'USDT',
              fiat: 'UAH',
              payment_methods: [],
              buy_fetched_at: null,
              sell_fetched_at: null,
            },
          ],
        },
      }
    })
  })

  afterEach(() => vi.restoreAllMocks())

  function renderPage(path = '/forecast') {
    render(
      <Providers>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ForecastPage />
        </MemoryRouter>
      </Providers>,
    )
  }

  it('показує картки, примітку про демо, фактори, перевірки й моделі', async () => {
    renderPage()
    expect(await screen.findByText('Прогноз через 1 год')).toBeInTheDocument()
    expect(
      screen.getByText(/Демо-прогноз: AI-модуль на бекенді ще не підключений/),
    ).toBeInTheDocument()
    expect(screen.getByText('Інтервал довіри 80%')).toBeInTheDocument()
    expect(
      screen.getByText(
        (text) => plain(text) === plain(`${forecast.current_price.replace('.', ',')} ₴`),
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Ціна 15 хв тому')).toBeInTheDocument()
    expect(screen.getAllByRole('row').length).toBeGreaterThan(1)
    expect(screen.getByText('Активна')).toBeInTheDocument()
    expect(screen.getByTestId('forecast-chart')).toBeInTheDocument()
    expect(screen.getByText(/модель Демо: лінійний тренд/)).toBeInTheDocument()
  })

  it('перемикає горизонт', async () => {
    renderPage()
    await screen.findByText('Прогноз через 1 год')
    await userEvent.click(screen.getByRole('tab', { name: '15 хв' }))
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      '/ai/forecast',
      expect.objectContaining({ params: expect.objectContaining({ horizon: 15 }) }),
    )
  })

  it('без сервісу прогнозів пояснює, що бекенд ще не підключений', async () => {
    const original = vi.mocked(apiClient.get).getMockImplementation()!
    vi.mocked(apiClient.get).mockImplementation(async (url: string, config?: unknown) => {
      if (url === '/ai/forecast')
        throw new ApiError('Not Found', { status: 404, code: 'not_found' })
      return original(url, config as never)
    })
    renderPage()
    expect(await screen.findByText('Прогноз недоступний')).toBeInTheDocument()
    expect(screen.getByText('Сервіс прогнозів на бекенді ще не підключений.')).toBeInTheDocument()
    expect(screen.getByText('Активна')).toBeInTheDocument()
    expect(screen.queryByText('Що впливає на прогноз')).not.toBeInTheDocument()
  })
})
