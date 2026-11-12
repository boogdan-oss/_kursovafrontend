import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import {
  bestSnapshot,
  depthLevels,
  isReliable,
  medianPrice,
  riskLevel,
  sortOffers,
} from '@/features/offers/lib'
import { OffersPage } from '@/features/offers/OffersPage'
import { ApiError, apiClient } from '@/shared/api/client'
import type { MarketSnapshot, Offer } from '@/shared/api/types'
import { formatRatio, plural } from '@/shared/lib/format'
import { paymentLabel, sortPayments } from '@/shared/lib/payments'
import { pageItems } from '@/shared/ui/pagination'
import { useFiltersStore } from '@/store/useFiltersStore'

function offer(overrides: Partial<Offer> & { nickname?: string; orders?: number; rate?: string }) {
  const { nickname = 'Seller', orders = 500, rate = '0.99', ...rest } = overrides
  return {
    exchange: 'bybit',
    side: 'BUY',
    asset: 'USDT',
    fiat: 'UAH',
    price: '41.10',
    min_amount: '1000',
    max_amount: '50000',
    available: '2450',
    payment_methods: ['monobank'],
    merchant: { id: nickname, nickname, orders_30d: orders, completion_rate: rate },
    fetched_at: '2026-11-10T12:00:00Z',
    external_id: nickname,
    ...rest,
  } satisfies Offer
}

const OFFERS = [
  offer({ nickname: 'CryptoMax', price: '41.05', orders: 1284, rate: '0.992' }),
  offer({ nickname: 'SafeP2P', exchange: 'okx', price: '41.12', max_amount: '100000' }),
  offer({ nickname: 'newtrader_77', price: '39.70', orders: 12, rate: '0.833' }),
  offer({
    nickname: 'FastCoin',
    exchange: 'binance',
    price: '41.18',
    payment_methods: ['monobank', 'privatbank', 'abank', 'pumb'],
  }),
]

function snapshot(exchange: string, buy: string | null, spread: string | null): MarketSnapshot {
  return {
    exchange,
    asset: 'USDT',
    fiat: 'UAH',
    payment_method: null,
    buy_price: buy,
    sell_price: '41.72',
    spread_pct: spread,
    volume: '1000',
    offers_count_buy: 5,
    offers_count_sell: 5,
    fetched_at: '2026-11-10T12:00:00Z',
  }
}

const plain = (text: string) => text.replaceAll(String.fromCharCode(160), ' ')

describe('offers lib', () => {
  it('надійний продавець: від 50 угод і від 90% завершених', () => {
    expect(isReliable(OFFERS[0].merchant)).toBe(true)
    expect(isReliable(OFFERS[2].merchant)).toBe(false)
    expect(isReliable({ ...OFFERS[0].merchant, orders_30d: 49 })).toBe(false)
  })

  it('сортує за ціною залежно від сторони, за рейтингом і лімітом', () => {
    const names = (items: Offer[]) => items.map((item) => item.merchant.nickname)
    expect(names(sortOffers(OFFERS, 'price', 'BUY'))[0]).toBe('newtrader_77')
    expect(names(sortOffers(OFFERS, 'price', 'SELL'))[0]).toBe('FastCoin')
    expect(names(sortOffers(OFFERS, 'rating', 'BUY'))[0]).toBe('CryptoMax')
    expect(names(sortOffers(OFFERS, 'limit', 'BUY'))[0]).toBe('SafeP2P')
    expect(
      names(
        sortOffers([OFFERS[0], offer({ nickname: 'Big', available: '9000' })], 'volume', 'BUY'),
      )[0],
    ).toBe('Big')
  })

  it('медіана топ-5 і ризик продавця', () => {
    expect(medianPrice(OFFERS, 'BUY')).toBeCloseTo(41.085)
    expect(medianPrice([], 'BUY')).toBeNull()
    expect(riskLevel(OFFERS[0], 41.12, 'BUY')).toBe('low')
    expect(riskLevel(OFFERS[2], 41.12, 'BUY')).toBe('high')
    expect(riskLevel(offer({ orders: 214, rate: '0.961' }), 41.12, 'BUY')).toBe('medium')
    expect(riskLevel(offer({ price: '39.80' }), 41.12, 'BUY')).toBe('high')
  })

  it('глибина групує обсяг за ціною від найкращої', () => {
    const levels = depthLevels(
      [
        offer({ price: '41.10' }),
        offer({ price: '41.10', available: '50' }),
        offer({ price: '41.00' }),
      ],
      'BUY',
    )
    expect(levels).toEqual([
      { price: 41, volume: 2450 },
      { price: 41.1, volume: 2500 },
    ])
  })

  it('обирає найкращий знімок серед вибраних бірж', () => {
    const items = [
      snapshot('binance', '41.32', '0.97'),
      snapshot('bybit', '41.05', '1.02'),
      snapshot('okx', null, null),
    ]
    expect(bestSnapshot(items, ['binance', 'bybit', 'okx'], null, 'BUY')?.exchange).toBe('bybit')
    expect(bestSnapshot(items, ['binance', 'okx'], null, 'BUY')?.exchange).toBe('binance')
    expect(bestSnapshot(items, ['okx'], null, 'BUY')).toBeNull()
    expect(bestSnapshot(items, ['bybit'], 'monobank', 'BUY')).toBeNull()
  })
})

describe('допоміжні функції', () => {
  it('частка → відсоток, множина українською', () => {
    expect(formatRatio('0.992')).toBe('99,2%')
    expect(formatRatio(1)).toBe('100%')
    expect(plural(1, ['угода', 'угоди', 'угод'])).toBe('угода')
    expect(plural(3, ['угода', 'угоди', 'угод'])).toBe('угоди')
    expect(plural(12, ['угода', 'угоди', 'угод'])).toBe('угод')
  })

  it('назви способів оплати', () => {
    expect(paymentLabel('privatbank')).toBe('ПриватБанк')
    expect(paymentLabel('monobank_iban')).toBe('Monobank IBAN')
    expect(paymentLabel('somebank')).toBe('Somebank')
    expect(sortPayments(['wise', 'privatbank', 'monobank'])).toEqual([
      'monobank',
      'privatbank',
      'wise',
    ])
  })

  it('номери сторінок із пропусками', () => {
    expect(pageItems(1, 3)).toEqual([1, 2, 3])
    expect(pageItems(1, 31)).toEqual([1, 2, 3, 4, 'gap-end', 31])
    expect(pageItems(15, 31)).toEqual([1, 'gap-start', 14, 15, 16, 'gap-end', 31])
    expect(pageItems(31, 31)).toEqual([1, 'gap-start', 28, 29, 30, 31])
  })
})

describe('сторінка «Ринок»', () => {
  beforeEach(() => {
    localStorage.clear()
    useFiltersStore.getState().reset()
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string) => {
      if (url === '/offers') {
        return {
          data: {
            asset: 'USDT',
            fiat: 'UAH',
            side: 'BUY',
            count: OFFERS.length,
            freshness: [{ exchange: 'binance', stale: true }],
            queued: false,
            items: OFFERS,
          },
        }
      }
      if (url === '/market/snapshot') {
        return {
          data: {
            asset: 'USDT',
            fiat: 'UAH',
            freshness: [],
            queued: false,
            items: [snapshot('bybit', '41.08', '1.02'), snapshot('binance', '41.32', '0.97')],
          },
        }
      }
      return { data: { count: 0, assets: ['USDT', 'BTC'], fiats: ['UAH'], items: [] } }
    })
  })

  afterEach(() => vi.restoreAllMocks())

  function renderPage(path = '/offers') {
    render(
      <Providers>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <OffersPage />
        </MemoryRouter>
      </Providers>,
    )
  }

  it('показує надійних продавців, найкращу ціну, KPI та глибину', async () => {
    renderPage()

    const row = (await screen.findByText('CryptoMax')).closest('tr')!
    expect(within(row).getByText('41,05')).toHaveClass('text-success')
    expect(within(row).getByText('01')).toBeInTheDocument()
    expect(within(row).getByText((text) => plain(text) === '1 284')).toBeInTheDocument()
    expect(within(row).getByText('99,2%')).toBeInTheDocument()
    expect(within(row).getByText(/^[−-]0,07%$/)).toBeInTheDocument()
    expect(within(row).getByText('Низький')).toBeInTheDocument()
    expect(within(row).getByRole('link', { name: 'На біржу Bybit' })).toHaveAttribute(
      'href',
      'https://www.bybit.com/fiat/trade/otc/?actionType=1&token=USDT&fiat=UAH',
    )

    expect(screen.queryByText('newtrader_77')).not.toBeInTheDocument()
    expect(screen.getByText('Bybit · CryptoMax')).toBeInTheDocument()
    expect(screen.getByText('ефективна ціна · Bybit')).toBeInTheDocument()
    expect(screen.getByText('після фільтрів: 3')).toBeInTheDocument()
    expect(screen.getByText('Ризикові').parentElement).toHaveTextContent('1')
    expect(screen.getByText('Binance: дані застаріли')).toBeInTheDocument()
    expect(screen.getByText('+2')).toBeInTheDocument()
    expect(screen.getByText('Показано 1–3 з 3')).toBeInTheDocument()

    const depth = screen.getByRole('region', { name: 'Глибина пропозиції' })
    expect(within(depth).getAllByRole('row')).toHaveLength(4)
  })

  it('вимкнені фільтри продавців показують всіх', async () => {
    renderPage('/offers?rate=0&orders=0')
    const row = (await screen.findByText('newtrader_77')).closest('tr')!
    expect(within(row).getByText('Високий')).toBeInTheDocument()
    expect(within(row).getByText('39,70')).toHaveClass('text-destructive')
    expect(screen.getByText('Bybit · newtrader_77')).toBeInTheDocument()
  })

  it('перемикач «Мін. 50 угод» окремо від виконання', async () => {
    renderPage('/offers?rate=0')
    await screen.findByText('CryptoMax')
    expect(screen.queryByText('newtrader_77')).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('switch', { name: 'Мін. 50 угод' }))
    expect(screen.getByText('newtrader_77')).toBeInTheDocument()
  })

  it('зняття біржі прибирає її оголошення', async () => {
    renderPage()
    await screen.findByText('CryptoMax')
    await userEvent.click(screen.getByRole('button', { name: 'Bybit' }))
    expect(screen.queryByText('CryptoMax')).not.toBeInTheDocument()
    expect(screen.getByText('SafeP2P')).toBeInTheDocument()
    expect(screen.getByText('ефективна ціна · Binance')).toBeInTheDocument()
  })

  it('порожній результат пояснює обмеження', async () => {
    useFiltersStore.getState().setExchanges(['bybit'])
    renderPage()
    await screen.findByText('CryptoMax')
    await userEvent.click(screen.getByRole('tab', { name: 'Рейтинг' }))
    expect(screen.getByText(/відсортовано за рейтингом продавця/)).toBeInTheDocument()

    vi.mocked(apiClient.get).mockResolvedValue({
      data: { count: 0, freshness: [], queued: false, items: [], assets: [], fiats: [] },
    })
    useFiltersStore.getState().setBank('wise')
    expect(await screen.findByText('Оголошень за цими фільтрами немає')).toBeInTheDocument()
    expect(screen.getByText('немає оголошень')).toBeInTheDocument()
  })

  it('помилка завантаження дає кнопку повтору', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Пари немає в довіднику бірж', { status: 404, code: 'not_found' }),
    )
    renderPage()
    expect(await screen.findByText('Не вдалося завантажити оголошення')).toBeInTheDocument()
    expect(screen.getByText('Пари немає в довіднику бірж')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Спробувати ще' })).toBeInTheDocument()
  })
})
