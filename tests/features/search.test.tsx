import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { AxiosRequestConfig } from 'axios'
import { MemoryRouter, Route, Routes, useLocation } from 'react-router-dom'

import { Providers } from '@/app/providers'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import {
  buildItems,
  parseQuery,
  RECENT_KEY,
  rememberPair,
  readRecentPairs,
  searchPairs,
} from '@/features/search/lib'
import { apiClient } from '@/shared/api/client'
import type { UserHit } from '@/shared/api/community-types'
import type { PairItem } from '@/shared/api/types'
import { useFiltersStore } from '@/store/useFiltersStore'

function pair(asset: string, fiat: string, exchanges: string[], collected = true): PairItem {
  return { asset, fiat, exchanges, collected }
}

const PAIRS: PairItem[] = [
  pair('BTC', 'EUR', ['binance', 'bybit', 'okx']),
  pair('BTC', 'UAH', ['binance', 'okx']),
  pair('USDT', 'UAH', ['binance', 'bybit', 'okx', 'bitget', 'mexc', 'htx']),
  pair('USDT', 'EUR', ['binance', 'bybit']),
  pair('USDC', 'EUR', ['bybit']),
  pair('DOGE', 'EUR', ['mexc'], false),
]
const CURRENCIES = new Set(PAIRS.flatMap((item) => [item.asset, item.fiat]))
const CONTEXT = { asset: 'USDT', fiat: 'UAH' }
const MAX: UserHit = { username: 'max_p2p', display_name: 'Макс', role: 'user', posts: 3 }

function found(query: string) {
  return searchPairs(PAIRS, parseQuery(query, CURRENCIES), CONTEXT).map(
    (item) => `${item.asset}/${item.fiat}`,
  )
}

describe('розбір запиту', () => {
  it('відділяє біржу від валют', () => {
    expect(parseQuery('Bybit  usdt', CURRENCIES)).toEqual({
      words: ['usdt'],
      exchanges: ['bybit'],
      user: null,
      usersOnly: false,
    })
    expect(parseQuery('bit', CURRENCIES).exchanges).toEqual(['bitget'])
    expect(parseQuery('bi', CURRENCIES).exchanges).toEqual([])
  })

  it('«@» шукає лише користувачів', () => {
    expect(parseQuery('@Max', CURRENCIES)).toEqual({
      words: [],
      exchanges: [],
      user: 'max',
      usersOnly: true,
    })
    expect(parseQuery('@m', CURRENCIES).user).toBeNull()
  })

  it('звичайний текст шукає і користувачів', () => {
    expect(parseQuery('макс', CURRENCIES).user).toBe('макс')
  })
})

describe('пошук пар', () => {
  it('знаходить пару в будь-якому порядку і записі', () => {
    expect(found('btc eur')[0]).toBe('BTC/EUR')
    expect(found('eur btc')[0]).toBe('BTC/EUR')
    expect(found('btc/eur')[0]).toBe('BTC/EUR')
    expect(found('usdtuah')).toEqual(['USDT/UAH'])
  })

  it('спершу пари поточного фіату й популярні, незібрані — в кінці', () => {
    expect(found('btc')).toEqual(['BTC/UAH', 'BTC/EUR'])
    expect(found('eur').at(-1)).toBe('DOGE/EUR')
  })

  it('біржа в запиті лишає пари лише цієї біржі', () => {
    expect(found('mexc')).toEqual(['USDT/UAH', 'DOGE/EUR'])
    expect(found('okx eur')).toEqual(['BTC/EUR'])
  })

  it('нічого не знаходить для невідомого', () => {
    expect(found('xyz')).toEqual([])
  })
})

describe('нещодавні пари', () => {
  beforeEach(() => localStorage.clear())

  it('порожній запит показує нещодавні, найновіша перша', () => {
    rememberPair({ asset: 'BTC', fiat: 'EUR' })
    rememberPair({ asset: 'USDT', fiat: 'UAH' })
    rememberPair({ asset: 'BTC', fiat: 'EUR' })

    expect(readRecentPairs()).toEqual(['BTC/EUR', 'USDT/UAH'])
    const items = buildItems({
      pairs: PAIRS,
      parsed: parseQuery('', CURRENCIES),
      context: CONTEXT,
      users: [],
      recent: readRecentPairs(),
    })
    expect(items.map((item) => item.key)).toEqual(['recent:BTC/EUR', 'recent:USDT/UAH'])
  })

  it('зіпсований запис у сховищі не ламає пошук', () => {
    localStorage.setItem(RECENT_KEY, '{oops')
    expect(readRecentPairs()).toEqual([])
  })
})

function Location() {
  const location = useLocation()
  return <output aria-label="адреса">{location.pathname}</output>
}

function renderSearch(path = '/community') {
  vi.spyOn(apiClient, 'get').mockImplementation(
    async (url: string, config?: AxiosRequestConfig) => {
      if (url === '/markets/pairs') return { data: { count: PAIRS.length, items: PAIRS } }
      if (url === '/community/users') {
        const query = (config?.params as { query?: string } | undefined)?.query ?? ''
        return { data: query.includes('max') ? [MAX] : [] }
      }
      throw new Error(url)
    },
  )
  render(
    <Providers>
      <MemoryRouter
        initialEntries={[path]}
        future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      >
        <GlobalSearch />
        <Routes>
          <Route path="*" element={<Location />} />
        </Routes>
      </MemoryRouter>
    </Providers>,
  )
  return screen.getByRole('combobox')
}

describe('пошук у шапці', () => {
  beforeEach(() => {
    localStorage.clear()
    useFiltersStore.getState().reset()
  })
  afterEach(() => vi.restoreAllMocks())

  it('Enter відкриває знайдену пару на сторінці «Ринок»', async () => {
    const input = renderSearch()

    await userEvent.type(input, 'btc eur')
    await screen.findByRole('option', { name: /BTC \/ EUR/ })
    expect(within(screen.getByRole('listbox')).getAllByRole('option')[0]).toHaveTextContent(
      'BTC / EUR',
    )
    await userEvent.keyboard('{Enter}')

    const { asset, fiat } = useFiltersStore.getState()
    expect(`${asset}/${fiat}`).toBe('BTC/EUR')
    expect(screen.getByLabelText('адреса')).toHaveTextContent('/offers')
    expect(readRecentPairs()).toEqual(['BTC/EUR'])
  })

  it('на сторінці з парою лишається на ній, біржа з запиту стає фільтром', async () => {
    const input = renderSearch('/arbitrage')

    await userEvent.type(input, 'okx eur')
    await screen.findByRole('option', { name: /BTC \/ EUR/ })
    await userEvent.keyboard('{ArrowDown}{Enter}')

    expect(useFiltersStore.getState().exchanges).toEqual(['okx'])
    expect(useFiltersStore.getState().fiat).toBe('EUR')
    expect(screen.getByLabelText('адреса')).toHaveTextContent('/arbitrage')
  })

  it('користувач веде на його профіль', async () => {
    const input = renderSearch('/')

    await userEvent.type(input, '@max')
    await userEvent.click(await screen.findByText('@max_p2p'))

    expect(screen.getByLabelText('адреса')).toHaveTextContent('/community/u/max_p2p')
    expect(apiClient.get).toHaveBeenCalledWith('/community/users', {
      params: { query: 'max', limit: 5 },
      signal: expect.any(AbortSignal),
    })
  })

  it('без збігів підказує, що можна шукати, а Esc очищає поле', async () => {
    const input = renderSearch()

    await userEvent.type(input, 'xyz')
    expect(await screen.findByText('Нічого не знайдено')).toBeInTheDocument()
    expect(screen.getByText('btc eur')).toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    expect(input).toHaveValue('')
  })
})
