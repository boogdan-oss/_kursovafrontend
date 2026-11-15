import { useMutation } from '@tanstack/react-query'
import { Link } from 'react-router-dom'

import { useAdminRefresh } from '@/features/admin/hooks'
import { setCommentStatus, setPostStatus } from '@/features/community/api'
import { useCurrentUser } from '@/features/community/hooks'
import { toApiError } from '@/shared/api/client'
import type { Author, ContentState, HiddenResponse } from '@/shared/api/community-types'
import { formatRelativeTime } from '@/shared/lib/format'
import { canModerate } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'

interface HiddenItem {
  key: string
  kind: 'post' | 'comment'
  id: number
  text: string
  author: Author
  createdAt: string
}

function items(data: HiddenResponse | undefined): HiddenItem[] {
  if (!data) return []
  return [
    ...data.posts.map((post) => ({
      key: `post-${post.id}`,
      kind: 'post' as const,
      id: post.id,
      text: post.text,
      author: post.author,
      createdAt: post.created_at,
    })),
    ...data.comments.map((comment) => ({
      key: `comment-${comment.id}`,
      kind: 'comment' as const,
      id: comment.id,
      text: comment.text,
      author: comment.author,
      createdAt: comment.created_at,
    })),
  ].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

interface HiddenPanelProps {
  data: HiddenResponse | undefined
  now: number
  isLoading: boolean
  failed: boolean
}

export function HiddenPanel({ data, now, isLoading, failed }: HiddenPanelProps) {
  const user = useCurrentUser()
  const refresh = useAdminRefresh()
  const change = useMutation({
    mutationFn: ({ item, status }: { item: HiddenItem; status: ContentState }) =>
      item.kind === 'post'
        ? setPostStatus(item.id, status).then(() => undefined)
        : setCommentStatus(item.id, status).then(() => undefined),
    onSuccess: refresh,
  })
  const list = items(data)

  if (isLoading) {
    return (
      <div className="flex flex-col gap-2 p-4">
        <Skeleton className="h-14" />
        <Skeleton className="h-14" />
      </div>
    )
  }
  if (list.length === 0) {
    return (
      <p className="px-4 py-10 text-center text-ui text-muted-foreground">
        {failed ? 'Не вдалося завантажити приховане' : 'Прихованих публікацій і коментарів немає.'}
      </p>
    )
  }

  return (
    <>
      {change.isError && (
        <p role="alert" className="border-b px-4 py-2 text-ui text-destructive">
          {toApiError(change.error).message}
        </p>
      )}
      <ul>
        {list.map((item) => (
          <li key={item.key} className="flex items-start gap-3 border-b px-4 py-3 last:border-b-0">
            <Tag className="mt-0.5">{item.kind === 'post' ? 'Пост' : 'Комент.'}</Tag>
            <div className="flex min-w-0 flex-1 flex-col gap-1">
              <p className="line-clamp-2 whitespace-pre-wrap break-words text-ui-lg">{item.text}</p>
              <span className="text-meta text-muted-foreground">
                <Link
                  to={`/community/u/${item.author.username}`}
                  className="font-mono hover:underline"
                >
                  @{item.author.username}
                </Link>{' '}
                · {formatRelativeTime(item.createdAt, now)}
              </span>
            </div>
            <div className="flex shrink-0 gap-1.5">
              <Button
                variant="secondary"
                size="terminal-sm"
                disabled={change.isPending}
                onClick={() => change.mutate({ item, status: 'visible' })}
              >
                Відновити
              </Button>
              {canModerate(user, item.author) && (
                <Button
                  variant="ghost"
                  size="terminal-sm"
                  className="text-destructive hover:bg-destructive/10"
                  disabled={change.isPending}
                  onClick={() => change.mutate({ item, status: 'deleted' })}
                >
                  Видалити
                </Button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}
