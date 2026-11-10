import {
  DEFAULT_FILTERS,
  FILTERS_STORAGE_KEY,
  selectSingleExchange,
  useFiltersStore,
} from '@/store/useFiltersStore'

const state = () => useFiltersStore.getState()
const saved = () => JSON.parse(localStorage.getItem(FILTERS_STORAGE_KEY) ?? '{}').state

describe('useFiltersStore', () => {
  beforeEach(() => {
    localStorage.clear()
    state().reset()
  })

  it('стартує зі значень за замовчуванням', () => {
    expect(state()).toMatchObject(DEFAULT_FILTERS)
    expect(DEFAULT_FILTERS).toMatchObject({ asset: 'USDT', fiat: 'UAH', amount: 20_000 })
  })

  it('зберігає зміни в localStorage без функцій', () => {
    state().setPair('btc', 'usd')
    state().setBank('monobank')
    state().setAmount(5000)
    expect(saved()).toEqual({
      ...DEFAULT_FILTERS,
      asset: 'BTC',
      fiat: 'USD',
      bank: 'monobank',
      amount: 5000,
    })
  })

  it('відновлює значення з localStorage', async () => {
    localStorage.setItem(
      FILTERS_STORAGE_KEY,
      JSON.stringify({
        state: { fiat: 'EUR', exchanges: ['okx', 'kraken'], minAiScore: 80 },
        version: 1,
      }),
    )
    await useFiltersStore.persist.rehydrate()
    expect(state()).toMatchObject({
      asset: 'USDT',
      fiat: 'EUR',
      exchanges: ['okx'],
      minAiScore: 80,
    })
  })

  it('перемикає біржі, але останню не знімає', () => {
    state().toggleExchange('binance')
    expect(state().exchanges).toEqual(['bybit', 'okx'])
    state().toggleExchange('okx')
    state().toggleExchange('bybit')
    expect(state().exchanges).toEqual(['bybit'])
    expect(selectSingleExchange(state())).toBe('bybit')
    state().toggleExchange('binance')
    expect(state().exchanges).toEqual(['binance', 'bybit'])
    expect(selectSingleExchange(state())).toBeUndefined()
  })

  it('не пускає некоректні значення', () => {
    state().setAmount(-5)
    expect(state().amount).toBeNull()
    state().setMinSpread(-1)
    expect(state().minSpread).toBe(0)
    state().setMinAiScore(140)
    expect(state().minAiScore).toBe(100)
    state().setBank('')
    expect(state().bank).toBeNull()
  })
})
