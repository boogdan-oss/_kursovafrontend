import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { CalculatorPage } from '@/features/calculator/CalculatorPage'
import {
  buildRequest,
  feeBreakdown,
  passesRisk,
  type CalculatorForm,
} from '@/features/calculator/lib'
import { ApiError, apiClient } from '@/shared/api/client'
import type { CalculatorResponse } from '@/shared/api/types'
import { useFiltersStore } from '@/store/useFiltersStore'

const FORM: CalculatorForm = {
  mode: 'market',
  asset: 'USDT',
  fiat: 'UAH',
  buyExchange: 'bybit',
  sellExchange: 'binance',
  investment: 20_000,
  buyPrice: 41,
  sellPrice: 41.8,
  payment: 'monobank',
  extraFees: 27.3,
  adverseMove: null,
  minRr: 2,
}

const RESULT: CalculatorResponse = {
  deal: {
    investment: '20000',
    buy_price: '41.00',
    sell_price: '41.80',
    quantity: '487.80',
    sell_quantity: '486.80',
    buy_amount: '20000',
    sell_amount: '20390.00',
    fees: '90.00',
    net_profit: '300.00',
    spread_pct: '1.9512',
    net_spread_pct: '1.5000',
    roi_pct: '1.5000',
  },
  potential_loss: '100.00',
  rr: '3.0000',
  buy_slippage_pct: '0.2200',
  sell_slippage_pct: null,
  fully_filled: true,
}

const plain = (text: string) => text.replaceAll(String.fromCharCode(160), ' ')

describe('calculator lib', () => {
  it('симулятор надсилає біржі без цін, калькулятор — свої ціни', () => {
    expect(buildRequest(FORM).request).toEqual({
      asset: 'USDT',
      fiat: 'UAH',
      investment: 20_000,
      buy_exchange: 'bybit',
      sell_exchange: 'binance',
      buy_price: null,
      sell_price: null,
      payment: 'monobank',
      extra_fees: 27.3,
      adverse_move_pct: 0.5,
    })
    const manual = buildRequest({ ...FORM, mode: 'manual', buyExchange: null }).request
    expect(manual).toMatchObject({ buy_price: 41, sell_price: 41.8, payment: null })
    expect(manual?.buy_exchange).toBeNull()
  })

  it('перевіряє обов’язкові поля', () => {
    expect(buildRequest({ ...FORM, investment: null }).error).toMatch(/суму/)
    expect(buildRequest({ ...FORM, sellExchange: null }).error).toMatch(/біржі/)
    expect(buildRequest({ ...FORM, mode: 'manual', sellPrice: null }).error).toMatch(/ціни/)
  })

  it('розкладає комісії й звіряє RR з порогом', () => {
    const parts = feeBreakdown(RESULT, 27.3)
    expect(parts.map((part) => [part.key, Number(part.value.toFixed(2))])).toEqual([
      ['trade', 20.9],
      ['withdrawal', 41.8],
      ['extra', 27.3],
    ])
    expect(parts.reduce((sum, part) => sum + part.share, 0)).toBeCloseTo(1)
    expect(passesRisk('3.0', 2)).toBe(true)
    expect(passesRisk('1.2', 2)).toBe(false)
    expect(passesRisk(null, 1)).toBe(false)
  })
})

describe('сторінка «Калькулятор»', () => {
  beforeEach(() => {
    localStorage.clear()
    useFiltersStore.getState().reset()
    vi.spyOn(apiClient, 'get').mockResolvedValue({
      data: { count: 0, assets: ['USDT'], fiats: ['UAH'], items: [] },
    })
    vi.spyOn(apiClient, 'post').mockResolvedValue({ data: RESULT })
  })

  afterEach(() => vi.restoreAllMocks())

  function renderPage(path = '/calculator') {
    render(
      <Providers>
        <MemoryRouter
          initialEntries={[path]}
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <CalculatorPage />
        </MemoryRouter>
      </Providers>,
    )
  }

  it('з посилання з арбітражу одразу рахує угоду за ринковими цінами', async () => {
    renderPage(
      '/calculator?asset=USDT&fiat=UAH&buy_exchange=okx&sell_exchange=bybit&investment=50000',
    )

    expect(await screen.findByText((text) => plain(text) === '+300,00 ₴')).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledWith(
      '/calculator',
      expect.objectContaining({
        buy_exchange: 'okx',
        sell_exchange: 'bybit',
        investment: 50_000,
        buy_price: null,
      }),
      expect.anything(),
    )
    expect(screen.getByText('RR 3,00 ≥ 2 : 1')).toBeInTheDocument()
    expect(screen.getByText('Угода проходить ваш поріг ризику')).toBeInTheDocument()
    expect(screen.getByText('slippage 0,22%')).toBeInTheDocument()
    expect(screen.getByText('ціну задано вручну')).toBeInTheDocument()
    expect(screen.getByText((text) => plain(text) === '487,80 USDT')).toBeInTheDocument()
  })

  it('без цін у режимі калькулятора просить їх увести', async () => {
    renderPage('/calculator?mode=manual')
    expect(screen.getByText("Результат з'явиться тут")).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Розрахувати' }))
    expect(screen.getByRole('alert')).toHaveTextContent(/Вкажіть ціни купівлі й продажу/)
    expect(apiClient.post).not.toHaveBeenCalled()

    await userEvent.type(screen.getByLabelText('Ціна купівлі (P_buy)'), '41')
    await userEvent.type(screen.getByLabelText('Ціна продажу (P_sell)'), '41,8')
    await userEvent.click(screen.getByRole('button', { name: 'Розрахувати' }))
    expect(await screen.findByText((text) => plain(text) === '+300,00 ₴')).toBeInTheDocument()
    expect(apiClient.post).toHaveBeenCalledWith(
      '/calculator',
      expect.objectContaining({ buy_price: 41, sell_price: 41.8 }),
      expect.anything(),
    )
  })

  it('показує помилку сервера', async () => {
    vi.mocked(apiClient.post).mockRejectedValue(
      new ApiError('bybit: немає свіжих оголошень USDT/UAH (BUY)', { status: 409 }),
    )
    renderPage()
    await userEvent.click(screen.getByRole('button', { name: 'Розрахувати' }))
    expect(await screen.findByText('Не вдалося порахувати угоду')).toBeInTheDocument()
    expect(screen.getByText('bybit: немає свіжих оголошень USDT/UAH (BUY)')).toBeInTheDocument()
  })
})
