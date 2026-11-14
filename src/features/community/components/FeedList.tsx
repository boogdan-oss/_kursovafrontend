import type { InfiniteData, UseInfiniteQueryResult } from '@tanstack/react-query'
import type { ReactNode } from 'react'

import { PostCard } from '@/features/community/components/PostCard'
import { feedItemKey } from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { FeedPage } from '@/shared/api/community-types'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

const SKELETON_POSTS = 3

interface FeedListProps {
  query: UseInfiniteQueryResult<InfiniteData<FeedPage, unknown>>
  now: number
  empty: ReactNode
}

export function FeedList({ query, now, empty }: FeedListProps) {
  if (query.isPending) {
    return (
      <div className="flex flex-col gap-2" aria-busy>
        {Array.from({ length: SKELETON_POSTS }, (_, index) => (
          <Skeleton key={index} className="h-40 w-full rounded-sm" />
        ))}
      </div>
    )
  }

  if (query.isError && !query.data) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-sm border bg-card px-4 py-12 text-center">
        <p className="text-body font-semibold">Не вдалося завантажити стрічку</p>
        <p className="text-ui text-muted-foreground">{toApiError(query.error).message}</p>
        <Button variant="secondary" size="terminal" onClick={() => void query.refetch()}>
          Спробувати ще
        </Button>
      </div>
    )
  }

  const seen = new Set<number>()
  const items = (query.data?.pages.flatMap((page) => page.items) ?? []).filter((item) => {
    if (seen.has(item.post.id)) return false
    seen.add(item.post.id)
    return true
  })
  if (items.length === 0) {
    return (
      <div className="rounded-sm border bg-card px-4 py-12 text-center text-ui-lg text-muted-foreground">
        {empty}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {items.map((item) => (
        <PostCard key={feedItemKey(item)} item={item} now={now} />
      ))}
      {query.hasNextPage && (
        <Button
          variant="secondary"
          size="terminal"
          className="self-center"
          disabled={query.isFetchingNextPage}
          onClick={() => void query.fetchNextPage()}
        >
          {query.isFetchingNextPage ? 'Завантаження…' : 'Показати ще'}
        </Button>
      )}
    </div>
  )
}
