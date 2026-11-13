import { X } from 'lucide-react'
import { useSearchParams } from 'react-router-dom'

import {
  CommunityRules,
  MyProfileCard,
  TrendingPairs,
} from '@/features/community/components/CommunitySidebar'
import { FeedList } from '@/features/community/components/FeedList'
import { PostComposer } from '@/features/community/components/PostComposer'
import { useCurrentUser, useFeed } from '@/features/community/hooks'
import { FEED_TABS, pairLabel, SORT_LABELS, type FeedTab } from '@/features/community/lib'
import type { FeedParams, PairRef } from '@/shared/api/community-types'
import { useNow } from '@/shared/hooks/useNow'
import { Segmented } from '@/shared/ui/segmented'

const CLOCK_MS = 30_000
const PAIR_PATTERN = /^([A-Z0-9]{1,16})-([A-Z0-9]{1,16})$/

function readPair(value: string | null): PairRef | null {
  const match = value?.toUpperCase().match(PAIR_PATTERN)
  return match ? { asset: match[1], fiat: match[2] } : null
}

export function CommunityPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useCurrentUser()
  const now = useNow(CLOCK_MS)
  const tabParam = searchParams.get('tab') as FeedTab | null
  const requested = FEED_TABS.some((tab) => tab.value === tabParam) ? tabParam! : 'new'
  const tab: FeedTab = requested === 'mine' && !user ? 'new' : requested
  const pair = readPair(searchParams.get('pair'))

  const params: FeedParams = {
    sort: tab === 'popular' ? 'popular' : 'new',
    scope: tab === 'mine' ? 'mine' : 'all',
    ...(pair ?? {}),
  }
  const feed = useFeed(params)
  const tabs = user ? FEED_TABS : FEED_TABS.filter((option) => option.value !== 'mine')

  function setParam(name: string, value: string | null) {
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous)
        if (value === null) next.delete(name)
        else next.set(name, value)
        return next
      },
      { replace: true },
    )
  }

  const selectPair = (next: PairRef | null) =>
    setParam('pair', next ? `${next.asset}-${next.fiat}` : null)

  const empty =
    tab === 'mine'
      ? 'Ви ще нічого не публікували й не поширювали.'
      : pair
        ? `Публікацій про ${pairLabel(pair)} ще немає.`
        : 'Публікацій ще немає — станьте першим.'

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-col gap-1 px-2 pb-1 pt-3">
        <h1 className="text-kpi-lg">Спільнота</h1>
        <p className="text-ui-lg text-muted-foreground">
          Обговорюйте пари, діліться угодами та ідеями з іншими трейдерами
        </p>
      </div>

      <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1fr)_400px]">
        <div className="flex min-w-0 flex-col gap-2">
          <PostComposer />

          <div className="flex flex-wrap items-center gap-2">
            <Segmented
              label="Стрічка"
              value={tab}
              onValueChange={(value) => setParam('tab', value === 'new' ? null : value)}
              options={tabs}
            />
            {pair && (
              <button
                type="button"
                onClick={() => selectPair(null)}
                className="inline-flex h-[26px] items-center gap-1.5 rounded-sm border border-primary/70 bg-primary/10 px-2.5 text-meta font-semibold"
              >
                Пара: {pairLabel(pair)}
                <X className="size-3" aria-label="Прибрати фільтр" />
              </button>
            )}
            <span className="ml-auto text-ui text-muted-foreground">
              Сортування: {SORT_LABELS[tab]}
            </span>
          </div>

          <FeedList query={feed} now={now} empty={empty} />
        </div>

        <aside className="flex min-w-0 flex-col gap-2" aria-label="Бічна панель спільноти">
          <MyProfileCard />
          <TrendingPairs active={pair} onSelect={selectPair} />
          <CommunityRules />
        </aside>
      </div>
    </div>
  )
}
