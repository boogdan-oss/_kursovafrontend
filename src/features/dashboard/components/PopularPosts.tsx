import { Heart, MessageCircle, Repeat2, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { UserAvatar } from '@/features/community/components/UserAvatar'
import { usePopularPosts } from '@/features/community/hooks'
import { pairLabel } from '@/features/community/lib'
import type { PostView } from '@/shared/api/community-types'
import { useNow } from '@/shared/hooks/useNow'
import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { badgeVariants } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'

const POPULAR_COUNT = 3
const CLOCK_MS = 60_000

function Counter({ icon: Icon, value, label }: { icon: LucideIcon; value: number; label: string }) {
  return (
    <span className="flex items-center gap-1 tabular-nums" title={label}>
      <Icon className="size-3.5" aria-hidden />
      <span className="sr-only">{label}:</span>
      {value}
    </span>
  )
}

function PopularPost({ post, now }: { post: PostView; now: number }) {
  const pair = post.pair ?? post.opportunity
  const author = post.author.username

  return (
    <li className="flex gap-3 border-b px-5 py-3.5 last:border-b-0">
      <UserAvatar username={author} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline gap-2 text-small">
          <Link to={`/community/u/${author}`} className="truncate font-semibold hover:underline">
            @{author}
          </Link>
          <time dateTime={post.created_at} className="shrink-0 font-normal text-muted-foreground">
            {formatRelativeTime(post.created_at, now)}
          </time>
        </div>
        <p className="line-clamp-2 break-words text-caption">{post.text}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-small text-muted-foreground">
          {pair && (
            <Link
              to={`/community?pair=${pair.asset}-${pair.fiat}`}
              className={cn(badgeVariants({ variant: 'accent' }), 'hover:opacity-80')}
            >
              {pairLabel(pair)}
            </Link>
          )}
          <Counter icon={Heart} value={post.likes} label="Вподобання" />
          <Counter icon={MessageCircle} value={post.comments} label="Коментарі" />
          <Counter icon={Repeat2} value={post.reposts} label="Репости" />
        </div>
      </div>
    </li>
  )
}

export function PopularPosts({ className }: { className?: string }) {
  const query = usePopularPosts(POPULAR_COUNT)
  const now = useNow(CLOCK_MS)
  const posts = query.data ?? []

  return (
    <Card className={cn('flex flex-col overflow-hidden', className)}>
      <div className="flex items-center justify-between gap-3 px-5 py-4">
        <div className="flex flex-col gap-0.5">
          <CardTitle>Популярне в спільноті</CardTitle>
          <CardDescription>Найбільше реакцій за 7 днів</CardDescription>
        </div>
        <Button asChild variant="ghost">
          <Link to="/community?tab=popular">Усі обговорення</Link>
        </Button>
      </div>

      {query.isPending ? (
        <div className="flex flex-col gap-3 border-t px-5 py-4">
          {Array.from({ length: POPULAR_COUNT }, (_, index) => (
            <Skeleton key={index} className="h-14 w-full" />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-2 border-t px-5 py-8 text-center">
          <p className="text-caption text-muted-foreground">
            {query.isError
              ? 'Не вдалося завантажити обговорення'
              : 'За тиждень обговорень ще не було'}
          </p>
          {!query.isError && (
            <Button asChild variant="secondary" size="sm">
              <Link to="/community">Написати першим</Link>
            </Button>
          )}
        </div>
      ) : (
        <ul className="flex flex-col border-t" aria-label="Популярні публікації">
          {posts.map((post) => (
            <PopularPost key={post.id} post={post} now={now} />
          ))}
        </ul>
      )}
    </Card>
  )
}
