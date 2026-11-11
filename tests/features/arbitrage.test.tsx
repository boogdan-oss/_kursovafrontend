import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { ArbitragePage } from '@/features/arbitrage/ArbitragePage'
import {
  activeStarts,
  countByKind,
  opportunityKey,
  passesThresholds,
  routeKey,
  routeSummary,
  startsByOpportunity,
  toCsv,
  type Thresholds,
} from '@/features/arbitrage/lib'
import { ApiError, apiClient } from '@/shared/api/client'
import type { OpportunityHistoryItem, OpportunityItem } from '@/shared/api/types'
import { parseNumber } from '@/shared/ui/number-input'
import { useFiltersStore } from '@/store/useFiltersStore'

const NOW = Date.now()
const ago = (minutes: number) => new Date(NOW - minutes * 60_000).toISOString()

function opportunity(overrides: Partial<OpportunityItem> = {}): OpportunityItem {
  return {
    kind: 'cross_exchange',
    asset: 'USDT',
    fiat: 'UAH',
    buy_exchange: 'bybit',
    sell_exchange: 'binance',
    buy_price: '41.05',
    sell_price: '41.72',
    steps: [
      { exchange: 'bybit', action: 'BUY', asset: 'USDT', price: '41.05' },
      { exchange: 'bybit', action: 'TRANSFER', asset: 'USDT' },
      { exchange: 'binance', action: 'SELL', asset: 'USDT', price: '41.72' },
    ],
    spread_pct: '1.6322',
    net_spread_pct: '1.4200',
    estimated_profit: '284.68',
    max_volume: '1840',
    rr: '2.1',
    ai_score: 91,
    ai_category: 'Good Opportunity',
    investment: '20000',
    detected_at: ago(0),
    ...overrides,
  }
}

const CROSS = opportunity()
const SPREAD = opportunity({
  kind: 'spread',
  sell_exchange: 'bybit',
  sell_price: '41.47',
  steps: [
    { exchange: 'bybit', action: 'BUY', asset: 'USDT', price: '41.05' },
    { exchange: 'bybit', action: 'SELL', asset: 'USDT', price: '41.47' },
  ],
  net_spread_pct: '0.9200',
  ai_score: 84,
})
const WEAK = opportunity({
  buy_exchange: 'okx',
  net_spread_pct: '0.2000',
  ai_score: 41,
  ai_category: 'High Risk',
})
const CHAIN = opportunity({
  kind: 'chain',
  sell_exchange: 'mexc',
  steps: [
    { exchange: 'bybit', action: 'BUY', asset: 'USDT', price: '41.05' },
    { exchange: 'bybit', action: 'SELL', asset: 'USDT', price: '512.92' },
    { exchange: 'mexc', action: 'BUY', asset: 'USDT', price: '487.5' },
    { exchange: 'mexc', action: 'SELL', asset: 'USDT', price: '41.07' },
  ],
  net_spread_pct: '0.7400',
  ai_score: 66,
  ai_category: 'Medium Opportunity',
})

function historyItem(
  base: OpportunityItem,
  startedMinutesAgo: number,
  durationSec: number,
): OpportunityHistoryItem {
  return { ...base, detected_at: ago(startedMinutesAgo), duration_sec: durationSec }
}

const HISTORY = [historyItem(CROSS, 42, 42 * 60), historyItem(SPREAD, 120, 600)]

const DEAL = {
  deal: {
    investment: '20000',
    buy_price: '41.05',
    sell_price: '41.72',
    quantity: '487.21',
    sell_quantity: '486.21',
    buy_amount: '20000',
    sell_amount: '20326.40',
    fees: '41.72',
    net_profit: '284.68',
    spread_pct: '1.6322',
    net_spread_pct: '1.42',
    roi_pct: '1.42',
  },
  potential_loss: '141.72',
  rr: '2.1',
  buy_slippage_pct: null,
  sell_slippage_pct: null,
  fully_filled: true,
}

const ANY: Thresholds = { minNet: 0, minAiScore: 0, minVolume: null, liquidOnly: false }
const plain = (text: string) => text.replaceAll(String.fromCharCode(160), ' ')

describe('arbitrage lib', () => {
  it('пороги: Net %, AI Score, обсяг і ліквідність', () => {
    expect(passesThresholds(CROSS, ANY)).toBe(true)
    expect(passesThresholds(CROSS, { ...ANY, minNet: 1.5 })).toBe(false)
    expect(passesThresholds(CROSS, { ...ANY, minAiScore: 92 })).toBe(false)
    expect(passesThresholds({ ...CROSS, ai_score: null }, { ...ANY, minAiScore: 1 })).toBe(false)
    expect(passesThresholds(CROSS, { ...ANY, minVolume: 2000 })).toBe(false)
    expect(passesThresholds(CROSS, { ...ANY, liquidOnly: true })).toBe(true)
    expect(passesThresholds({ ...CROSS, max_volume: '100' }, { ...ANY, liquidOnly: true })).toBe(
      false,
    )
  })

  it('рахує можливості за типами й описує маршрут', () => {
    expect(countByKind([CROSS, SPREAD, WEAK, CHAIN])).toEqual({
      all: 4,
      cross_exchange: 2,
      spread: 1,
      chain: 1,
    })
    expect(plain(routeSummary(CROSS))).toBe('41,05 → 41,72 ₴')
    expect(plain(routeSummary(SPREAD))).toBe('купівля 41,05 → продаж 41,47 ₴')
    expect(routeSummary(CHAIN)).toBe('USDT через іншу валюту · 4 кроки')
  })

  it('тривалість беруть лише активні записи історії й найкраща можливість маршруту', () => {
    const starts = activeStarts(HISTORY, NOW)
    expect(starts.has(routeKey(CROSS))).toBe(true)
    expect(starts.has(routeKey(SPREAD))).toBe(false)

    const worse = { ...CROSS, net_spread_pct: '0.5', steps: CROSS.steps.slice(0, 2) }
    const byOpportunity = startsByOpportunity([worse, CROSS], starts)
    expect(byOpportunity.has(opportunityKey(CROSS))).toBe(true)
    expect(byOpportunity.has(opportunityKey(worse))).toBe(false)
  })

  it('CSV і розбір чисел', () => {
    const [header, row] = toCsv([CROSS]).split('\n')
    expect(header.startsWith('Тип;Актив;Фіат')).toBe(true)
    expect(row).toBe(
      'Міжбіржовий;USDT;UAH;Bybit;Binance;41.05;41.72;1.6322;1.4200;284.68;20000;1840;2.1;91',
    )
    expect(parseNumber('20 000,5')).toBe(20000.5)
    expect(parseNumber('150', { max: 100, integer: true })).toBe(100)
    expect(parseNumber('abc')).toBeNull()
  })
})

describe('сторінка «Арбітраж»', () => {
  beforeEach(() => {
    localStorage.clear()
    useFiltersStore.getState().reset()
    vi.spyOn(apiClient, 'get').mockImplementation(async (url: string, config) => {
      if (url === '/opportunities') {
        const items =
          (config?.params as { kind?: string } | undefined)?.kind === 'chain'
            ? [CHAIN]
            : [CROSS, SPREAD, WEAK]
        return { data: { count: items.length, items } }
      }
      if (url === '/opportunities/history') {
        return { data: { count: HISTORY.length, items: HISTORY } }
      }
      return { data: { count: 0, assets: ['USDT', 'BTC'], fiats: ['UAH'], items: [] } }
    })
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: DEAL })
  })

  afterEach(() => vi.restoreAllMocks())

  function renderPage(path = '/arbitrage') {
    render(
      <Providers>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <ArbitragePage />
        </MemoryRouter>
      </Providers>,
    )
  }

  const list = () => screen.getAllByRole('table')[0]
  const details = () => screen.getByLabelText('Деталі можливості')

  it('показує можливості вище порогів, найкращу — з деталями', async () => {
    renderPage()

    const row = (await within(list()).findByText('+1,42%')).closest('tr')!
    expect(row).toHaveAttribute('aria-selected', 'true')
    expect(within(row).getByText('Міжбіржовий')).toBeInTheDocument()
    expect(within(row).getByText('42 хв')).toBeInTheDocument()
    expect(within(list()).queryByText('+0,20%')).not.toBeInTheDocument()

    expect(await screen.findByRole('tab', { name: 'Усі · 3' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Ланцюжки · 1' })).toBeInTheDocument()
    expect(screen.getByText(/3 активні/)).toBeInTheDocument()

    const panel = details()
    expect(within(panel).getByText('Bybit → Binance')).toBeInTheDocument()
    expect(within(panel).getByText('Активна 42 хв')).toBeInTheDocument()
    expect(within(panel).getByText('Good Opportunity')).toBeInTheDocument()
    expect(
      await within(panel).findByText((text) => plain(text) === 'Купити 487,21 USDT на Bybit P2P'),
    ).toBeInTheDocument()
    expect(within(panel).getByText('Переказати USDT з Bybit на Binance')).toBeInTheDocument()
    expect(within(panel).getByText((text) => plain(text) === '+284,68 ₴')).toBeInTheDocument()
    expect(within(panel).getByRole('link', { name: 'Відкрити в калькуляторі' })).toHaveAttribute(
      'href',
      '/calculator?asset=USDT&fiat=UAH&buy_exchange=bybit&sell_exchange=binance&investment=20000',
    )
    expect(apiClient.post).toHaveBeenCalledWith(
      '/calculator',
      expect.objectContaining({ buy_price: '41.05', sell_price: '41.72', investment: '20000' }),
      expect.anything(),
    )
  })

  it('вкладка типу й вибір рядка змінюють список і деталі', async () => {
    renderPage()
    await within(list()).findByText('+1,42%')

    await userEvent.click(within(list()).getByText('+0,92%'))
    expect(within(details()).getByText('Bybit → Bybit')).toBeInTheDocument()

    await userEvent.click(await screen.findByRole('tab', { name: 'Ланцюжки · 1' }))
    expect(within(list()).queryByText('+1,42%')).not.toBeInTheDocument()
    const panel = details()
    expect(within(panel).getByText('Bybit → MEXC')).toBeInTheDocument()
    expect(within(panel).getByText(/512,92 в іншій валюті/)).toBeInTheDocument()
    expect(within(panel).getByText(/потрібні рахунки в усіх валютах/)).toBeInTheDocument()
    expect(
      within(panel).queryByRole('link', { name: 'Відкрити в калькуляторі' }),
    ).not.toBeInTheDocument()
  })

  it('суворі пороги дають порожній стан із кнопкою «Показати всі»', async () => {
    useFiltersStore.getState().setMinAiScore(95)
    renderPage('/arbitrage?type=cross_exchange')

    expect(await screen.findByText('Можливостей за цими фільтрами немає')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Показати всі' }))
    expect(await within(list()).findByText('+0,20%')).toBeInTheDocument()
    expect(useFiltersStore.getState().minAiScore).toBe(0)
  })

  it('історія показує тривалість і статус', async () => {
    renderPage()
    const history = screen.getAllByRole('table')[1]
    const active = (await within(history).findByText('42 хв')).closest('tr')!
    expect(within(active).getByText('Активна')).toBeInTheDocument()
    const finished = within(history).getByText('10 хв').closest('tr')!
    expect(within(finished).getByText('Завершено')).toBeInTheDocument()
  })

  it('помилка завантаження дає кнопку повтору', async () => {
    vi.mocked(apiClient.get).mockRejectedValue(
      new ApiError('Пари немає в довіднику бірж', { status: 404, code: 'not_found' }),
    )
    renderPage()
    expect(await screen.findByText('Не вдалося завантажити можливості')).toBeInTheDocument()
    expect(screen.getByText('Пари немає в довіднику бірж')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Спробувати ще' })).toBeInTheDocument()
  })
})
