import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

export const EXCHANGES = ['binance', 'bybit', 'okx'] as const
export type ExchangeCode = (typeof EXCHANGES)[number]

export interface Filters {
  asset: string
  fiat: string
  exchanges: ExchangeCode[]
  bank: string | null
  amount: number | null
  minSpread: number
  minAiScore: number
}

interface FiltersActions {
  setPair: (asset: string, fiat: string) => void
  setExchanges: (exchanges: ExchangeCode[]) => void
  toggleExchange: (exchange: ExchangeCode) => void
  setBank: (bank: string | null) => void
  setAmount: (amount: number | null) => void
  setMinSpread: (minSpread: number) => void
  setMinAiScore: (minAiScore: number) => void
  reset: () => void
}

export type FiltersState = Filters & FiltersActions

export const DEFAULT_FILTERS: Filters = {
  asset: 'USDT',
  fiat: 'UAH',
  exchanges: [...EXCHANGES],
  bank: null,
  amount: 20_000,
  minSpread: 0.5,
  minAiScore: 60,
}

export const FILTERS_STORAGE_KEY = 'cryptoparser-filters'

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const useFiltersStore = create<FiltersState>()(
  persist(
    (set) => ({
      ...DEFAULT_FILTERS,

      setPair: (asset, fiat) => set({ asset: asset.toUpperCase(), fiat: fiat.toUpperCase() }),

      setExchanges: (exchanges) =>
        set({ exchanges: EXCHANGES.filter((code) => exchanges.includes(code)) }),

      toggleExchange: (exchange) =>
        set((state) => {
          const selected = state.exchanges.includes(exchange)
          if (selected && state.exchanges.length === 1) return state
          const next = selected
            ? state.exchanges.filter((code) => code !== exchange)
            : [...state.exchanges, exchange]
          return { exchanges: EXCHANGES.filter((code) => next.includes(code)) }
        }),

      setBank: (bank) => set({ bank: bank || null }),

      setAmount: (amount) =>
        set({ amount: amount !== null && Number.isFinite(amount) && amount > 0 ? amount : null }),

      setMinSpread: (minSpread) =>
        set({ minSpread: Number.isFinite(minSpread) ? Math.max(0, minSpread) : 0 }),

      setMinAiScore: (minAiScore) =>
        set({
          minAiScore: Number.isFinite(minAiScore) ? clamp(Math.round(minAiScore), 0, 100) : 0,
        }),

      reset: () => set(DEFAULT_FILTERS),
    }),
    {
      name: FILTERS_STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: ({ asset, fiat, exchanges, bank, amount, minSpread, minAiScore }): Filters => ({
        asset,
        fiat,
        exchanges,
        bank,
        amount,
        minSpread,
        minAiScore,
      }),
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<Filters>
        const exchanges = Array.isArray(saved.exchanges)
          ? EXCHANGES.filter((code) => saved.exchanges!.includes(code))
          : []
        return {
          ...current,
          ...saved,
          exchanges: exchanges.length ? exchanges : current.exchanges,
        }
      },
    },
  ),
)

export function selectSingleExchange(state: Pick<Filters, 'exchanges'>) {
  return state.exchanges.length === 1 ? state.exchanges[0] : undefined
}
