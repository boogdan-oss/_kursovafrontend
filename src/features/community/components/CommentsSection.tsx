import { MoreHorizontal } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { ReportDialog } from '@/features/community/components/Dialogs'
import { UserAvatar } from '@/features/community/components/UserAvatar'
import {
  useComments,
  useCreateComment,
  useCurrentUser,
  useRemoveComment,
  useUpdateComment,
} from '@/features/community/hooks'
import { COMMENT_MAX } from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { CommentView } from '@/shared/api/community-types'
import { formatRelativeTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'
import { Textarea } from '@/shared/ui/textarea'

interface CommentItemProps {
  comment: CommentView
  now: number
  onReport: (id: number) => void
}

function CommentItem({ comment, now, onReport }: CommentItemProps) {
  const user = useCurrentUser()
  const update = useUpdateComment(comment.post_id)
  const remove = useRemoveComment(comment.post_id)
  const [draft, setDraft] = useState<string | null>(null)
  const own = user?.id === comment.author.id
  const admin = user?.isAdmin ?? false
  const hidden = comment.status === 'hidden'

  function save(event: FormEvent) {
    event.preventDefault()
    const text = draft?.trim()
    if (!text) return
    update.mutate({ id: comment.id, text }, { onSuccess: () => setDraft(null) })
  }

  return (
    <li className="flex gap-2.5 py-2.5">
      <UserAvatar username={comment.author.username} size="sm" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-meta text-muted-foreground">
          <Link
            to={`/community/u/${comment.author.username}`}
            className="text-ui font-semibold text-foreground hover:underline"
          >
            {comment.author.username}
          </Link>
          {own && <Tag tone="accent">Ви</Tag>}
          {hidden && <Tag tone="warning">Приховано</Tag>}
          <span>{formatRelativeTime(comment.created_at, now)}</span>
          {comment.updated_at && <span>· змінено</span>}
        </div>
        {draft === null ? (
          <p className="whitespace-pre-wrap break-words text-ui-lg">{comment.text}</p>
        ) : (
          <form onSubmit={save} className="flex flex-col gap-2">
            <Textarea
              aria-label="Текст коментаря"
              rows={2}
              maxLength={COMMENT_MAX}
              value={draft}
              onChange={(event) => setDraft(event.target.value)}
            />
            {update.isError && (
              <p className="text-meta text-destructive">{toApiError(update.error).message}</p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="terminal-sm" disabled={update.isPending || !draft.trim()}>
                Зберегти
              </Button>
              <Button
                type="button"
                variant="secondary"
                size="terminal-sm"
                onClick={() => setDraft(null)}
              >
                Скасувати
              </Button>
            </div>
          </form>
        )}
        {remove.isError && (
          <p className="text-meta text-destructive">{toApiError(remove.error).message}</p>
        )}
      </div>
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger
            aria-label="Дії з коментарем"
            className="flex size-6 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <MoreHorizontal className="size-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {own ? (
              <>
                <DropdownMenuItem onSelect={() => setDraft(comment.text)}>
                  Редагувати
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => remove.mutate({ id: comment.id, moderate: null })}
                >
                  Видалити
                </DropdownMenuItem>
              </>
            ) : (
              <DropdownMenuItem onSelect={() => onReport(comment.id)}>
                Поскаржитися
              </DropdownMenuItem>
            )}
            {admin && !own && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={() =>
                    remove.mutate({ id: comment.id, moderate: hidden ? 'visible' : 'hidden' })
                  }
                >
                  {hidden ? 'Відновити' : 'Приховати'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive"
                  onSelect={() => remove.mutate({ id: comment.id, moderate: 'deleted' })}
                >
                  Видалити (модерація)
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </li>
  )
}

interface CommentsSectionProps {
  postId: number
  now: number
}

export function CommentsSection({ postId, now }: CommentsSectionProps) {
  const user = useCurrentUser()
  const comments = useComments(postId, true)
  const create = useCreateComment(postId)
  const [text, setText] = useState('')
  const [reportId, setReportId] = useState<number | null>(null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    create.mutate(value, { onSuccess: () => setText('') })
  }

  const items = comments.data?.items ?? []

  return (
    <div className="border-t px-4 pb-3">
      {comments.isPending ? (
        <div className="flex flex-col gap-2 py-3">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-2/3" />
        </div>
      ) : comments.isError ? (
        <p className="py-3 text-ui text-destructive">{toApiError(comments.error).message}</p>
      ) : items.length === 0 ? (
        <p className="py-3 text-ui text-muted-foreground">Коментарів ще немає — будьте першими.</p>
      ) : (
        <ul className="divide-y">
          {items.map((comment) => (
            <CommentItem key={comment.id} comment={comment} now={now} onReport={setReportId} />
          ))}
        </ul>
      )}

      {user ? (
        <form onSubmit={submit} className="flex items-start gap-2.5 pt-2">
          <UserAvatar username={user.username} size="sm" accent />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Textarea
              aria-label="Новий коментар"
              placeholder="Напишіть коментар…"
              rows={1}
              maxLength={COMMENT_MAX}
              value={text}
              onChange={(event) => setText(event.target.value)}
              className="min-h-8 py-1.5"
            />
            {create.isError && (
              <p className="text-meta text-destructive">{toApiError(create.error).message}</p>
            )}
          </div>
          <Button type="submit" size="terminal" disabled={create.isPending || !text.trim()}>
            Надіслати
          </Button>
        </form>
      ) : (
        <p className="pt-2 text-ui text-muted-foreground">
          <Link to="/login" className="font-semibold text-primary hover:underline">
            Увійдіть
          </Link>
          , щоб коментувати.
        </p>
      )}

      <ReportDialog
        target={reportId === null ? null : { comment_id: reportId }}
        onClose={() => setReportId(null)}
      />
    </div>
  )
}
