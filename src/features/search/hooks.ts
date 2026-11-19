import { useQuery } from '@tanstack/react-query'
import { useMemo } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { fetchPairs, fetchUsers } from '@/features/search/api'
import {
  buildItems,
  PAIR_PAGES,
  parseQuery,
  readRecentPairs,
  rememberPair,
  type SearchItem,
} from '@/features/search/lib'
import type { UserHit } from '@/shared/api/community-types'
import { queryKeys } from '@/shared/api/queryKeys'
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue'
import { useFiltersStore } from '@/store/useFiltersStore'

const PAIRS_STALE_MS = 10 * 60_000
const USERS_STALE_MS = 30_000
const USER_DEBOUNCE_MS = 250
const NO_USERS: UserHit[] = []

export function usePairs(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.markets.pairs(),
    queryFn: ({ signal }) => fetchPairs(signal),
    staleTime: PAIRS_STALE_MS,
    enabled,
    meta: { silent: true },
  })
}

function useUserSearch(text: string | null) {
  const debounced = useDebouncedValue(text, USER_DEBOUNCE_MS)
  const query = useQuery({
    queryKey: queryKeys.community.users(debounced ?? ''),
    queryFn: ({ signal }) => fetchUsers(debounced ?? '', signal),
    enabled: Boolean(debounced),
    staleTime: USERS_STALE_MS,
    meta: { silent: true },
  })
  const settled = Boolean(text) && debounced === text
  return {
    users: settled ? (query.data ?? NO_USERS) : NO_USERS,
    pending: Boolean(text) && (!settled || query.isFetching),
    failed: settled && query.isError,
  }
}

export function useGlobalSearch(query: string, open: boolean) {
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const pairsQuery = usePairs(open)
  const pairs = useMemo(() => pairsQuery.data ?? [], [pairsQuery.data])
  const currencies = useMemo(
    () => new Set(pairs.flatMap((pair) => [pair.asset, pair.fiat])),
    [pairs],
  )
  const parsed = useMemo(() => parseQuery(query, currencies), [query, currencies])
  const people = useUserSearch(open ? parsed.user : null)
  const recent = useMemo(() => (open ? readRecentPairs() : []), [open])

  const items = useMemo(
    () => buildItems({ pairs, parsed, context: { asset, fiat }, users: people.users, recent }),
    [pairs, parsed, asset, fiat, people.users, recent],
  )

  return {
    items,
    parsed,
    current: { asset, fiat },
    loading: (open && pairsQuery.isPending) || people.pending,
    failed: pairsQuery.isError || people.failed,
  }
}

export function useSearchSelect() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const fiat = useFiltersStore((state) => state.fiat)
  const setPair = useFiltersStore((state) => state.setPair)
  const setBank = useFiltersStore((state) => state.setBank)
  const setExchanges = useFiltersStore((state) => state.setExchanges)

  return (item: SearchItem) => {
    if (item.kind === 'pair') {
      const { asset, fiat: nextFiat } = item.pair
      if (nextFiat !== fiat) setBank(null)
      setPair(asset, nextFiat)
      rememberPair({ asset, fiat: nextFiat })
      if (item.scope.length > 0) setExchanges(item.scope)
      if (!PAIR_PAGES.includes(pathname)) navigate('/offers')
      return
    }
    if (item.kind === 'exchange') {
      setExchanges([item.exchange])
      navigate('/offers')
      return
    }
    navigate(`/community/u/${encodeURIComponent(item.user.username)}`)
  }
}
