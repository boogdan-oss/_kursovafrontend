import { Heart, MessageCircle, MoreHorizontal, Repeat2, X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'

import { CommentsSection } from '@/features/community/components/CommentsSection'
import { BanDialog, ConfirmDialog, ReportDialog } from '@/features/community/components/Dialogs'
import {
  OpportunityAttachment,
  PairAttachment,
} from '@/features/community/components/PostAttachment'
import { UserAvatar } from '@/features/community/components/UserAvatar'
import {
  useCurrentUser,
  useDeletePost,
  useModeratePost,
  useToggleLike,
  useToggleRepost,
  useUpdatePost,
} from '@/features/community/hooks'
import { pairLabel, POST_MAX } from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { FeedItem, PostPatch, PostView } from '@/shared/api/community-types'
import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { Tag } from '@/shared/ui/tag'
import { Textarea } from '@/shared/ui/textarea'

const ACTION =
  'inline-flex h-7 items-center gap-1.5 rounded-sm px-1.5 font-mono text-ui-lg text-muted-foreground transition-colors enabled:hover:bg-accent enabled:hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed [&_svg]:size-4'

function AuthorLine({ post, now, own }: { post: PostView; now: number; own: boolean }) {
  return (
    <div className="flex min-w-0 flex-1 items-center gap-3">
      <Link to={`/community/u/${post.author.username}`} tabIndex={-1}>
        <UserAvatar username={post.author.username} accent={own} />
      </Link>
      <div className="flex min-w-0 flex-col">
        <span className="flex flex-wrap items-center gap-1.5">
          <Link
            to={`/community/u/${post.author.username}`}
            className="truncate text-ui-lg font-semibold hover:underline"
          >
            {post.author.username}
          </Link>
          {own && <Tag tone="accent">Ви</Tag>}
          {post.author.is_admin && <Tag tone="warning">Адмін</Tag>}
          {post.status === 'hidden' && <Tag tone="danger">Приховано</Tag>}
        </span>
        <span className="text-meta text-muted-foreground">
          <time dateTime={post.created_at}>{formatRelativeTime(post.created_at, now)}</time>
          {post.updated_at && ' · змінено'}
        </span>
      </div>
    </div>
  )
}

interface EditFormProps {
  post: PostView
  onDone: () => void
}

function EditForm({ post, onDone }: EditFormProps) {
  const update = useUpdatePost()
  const [text, setText] = useState(post.text)
  const [keepPair, setKeepPair] = useState(post.pair !== null)
  const [keepOpportunity, setKeepOpportunity] = useState(post.opportunity !== null)

  function submit(event: FormEvent) {
    event.preventDefault()
    const value = text.trim()
    if (!value) return
    const input: PostPatch = { text: value }
    if (post.pair && !keepPair) input.pair = null
    if (post.opportunity && !keepOpportunity) input.opportunity_id = null
    update.mutate({ id: post.id, input }, { onSuccess: onDone })
  }

  const chip = (label: ReactNode, onRemove: () => void) => (
    <span className="inline-flex h-6 items-center gap-1.5 rounded-sm border border-border-strong px-2 text-meta">
      {label}
      <button
        type="button"
        aria-label="Відкріпити"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="size-3" />
      </button>
    </span>
  )

  return (
    <form onSubmit={submit} className="flex flex-col gap-2">
      <Textarea
        aria-label="Редагування публікації"
        rows={3}
        maxLength={POST_MAX}
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
      {(keepPair || keepOpportunity) && (
        <div className="flex flex-wrap gap-2">
          {post.pair && keepPair && chip(pairLabel(post.pair), () => setKeepPair(false))}
          {post.opportunity &&
            keepOpportunity &&
            chip('Торгова можливість', () => setKeepOpportunity(false))}
        </div>
      )}
      {update.isError && (
        <p className="text-meta text-destructive">{toApiError(update.error).message}</p>
      )}
      <div className="flex gap-2">
        <Button type="submit" size="terminal" disabled={update.isPending || !text.trim()}>
          Зберегти
        </Button>
        <Button type="button" variant="secondary" size="terminal" onClick={onDone}>
          Скасувати
        </Button>
      </div>
    </form>
  )
}

type Pending = 'delete' | 'moderate-delete' | null

interface PostCardProps {
  item: FeedItem
  now: number
}

export function PostCard({ item, now }: PostCardProps) {
  const { post, reposted_by: repostedBy } = item
  const user = useCurrentUser()
  const like = useToggleLike()
  const repost = useToggleRepost()
  const remove = useDeletePost()
  const moderate = useModeratePost()
  const [editing, setEditing] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [confirm, setConfirm] = useState<Pending>(null)
  const [reporting, setReporting] = useState(false)
  const [banning, setBanning] = useState(false)

  const own = user?.id === post.author.id
  const admin = user?.isAdmin ?? false
  const mineRepost = repostedBy !== null && repostedBy.id === user?.id
  const actionError = [like, repost, moderate]
    .map((mutation) => (mutation.isError ? toApiError(mutation.error).message : null))
    .find(Boolean)

  return (
    <article
      className="min-w-0 rounded-sm border bg-card"
      aria-label={`Публікація ${post.author.username}`}
    >
      {repostedBy && (
        <div className="flex items-center gap-2 border-b px-4 py-2 text-ui text-primary">
          <Repeat2 className="size-4 shrink-0" aria-hidden />
          <span className="min-w-0 flex-1 truncate font-semibold">
            {mineRepost ? (
              'Ви поширили цю публікацію'
            ) : (
              <>
                <Link to={`/community/u/${repostedBy.username}`} className="hover:underline">
                  {repostedBy.username}
                </Link>{' '}
                поширює
              </>
            )}
          </span>
          {mineRepost && (
            <button
              type="button"
              disabled={repost.isPending}
              onClick={() => repost.mutate({ post })}
              className="shrink-0 font-semibold hover:underline disabled:opacity-50"
            >
              Скасувати репост
            </button>
          )}
        </div>
      )}

      <div className="flex flex-col gap-3 px-4 pb-3 pt-3.5">
        <div className="flex items-start gap-3">
          <AuthorLine post={post} now={now} own={own} />
          {user && (
            <DropdownMenu>
              <DropdownMenuTrigger
                aria-label="Дії з публікацією"
                className="flex size-7 shrink-0 items-center justify-center rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <MoreHorizontal className="size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="min-w-[220px]">
                {own ? (
                  <>
                    <DropdownMenuItem onSelect={() => setEditing(true)}>
                      Редагувати
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => setConfirm('delete')}
                    >
                      Видалити
                    </DropdownMenuItem>
                  </>
                ) : (
                  <DropdownMenuItem onSelect={() => setReporting(true)}>
                    Поскаржитися
                  </DropdownMenuItem>
                )}
                {admin && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel>Модерація</DropdownMenuLabel>
                    <DropdownMenuItem
                      onSelect={() =>
                        moderate.mutate({
                          id: post.id,
                          status: post.status === 'hidden' ? 'visible' : 'hidden',
                        })
                      }
                    >
                      {post.status === 'hidden' ? 'Відновити публікацію' : 'Приховати публікацію'}
                    </DropdownMenuItem>
                    {!own && (
                      <>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onSelect={() => setConfirm('moderate-delete')}
                        >
                          Видалити публікацію
                        </DropdownMenuItem>
                        {!post.author.is_admin && (
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onSelect={() => setBanning(true)}
                          >
                            Заблокувати автора
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>

        {editing ? (
          <EditForm post={post} onDone={() => setEditing(false)} />
        ) : (
          <>
            <p className="whitespace-pre-wrap break-words text-body">{post.text}</p>
            {post.opportunity && <OpportunityAttachment opportunity={post.opportunity} />}
            {post.pair && <PairAttachment pair={post.pair} />}
          </>
        )}
      </div>

      <div className="flex items-center gap-4 border-t px-2.5 py-1.5">
        <button
          type="button"
          className={cn(
            ACTION,
            post.liked_by_me && 'text-destructive enabled:hover:text-destructive',
          )}
          disabled={!user || like.isPending}
          aria-pressed={post.liked_by_me}
          aria-label="Вподобати"
          title={user ? undefined : 'Увійдіть, щоб вподобати'}
          onClick={() => like.mutate({ post })}
        >
          <Heart className={cn(post.liked_by_me && 'fill-current')} />
          {post.likes}
        </button>
        <button
          type="button"
          className={cn(ACTION, showComments && 'text-foreground')}
          aria-expanded={showComments}
          aria-label="Коментарі"
          onClick={() => setShowComments((value) => !value)}
        >
          <MessageCircle />
          {post.comments}
        </button>
        <button
          type="button"
          className={cn(ACTION, post.reposted_by_me && 'text-primary enabled:hover:text-primary')}
          disabled={!user || own || repost.isPending}
          aria-pressed={post.reposted_by_me}
          aria-label="Поширити"
          title={
            own
              ? 'Власну публікацію поширити не можна'
              : user
                ? undefined
                : 'Увійдіть, щоб поширити'
          }
          onClick={() => repost.mutate({ post })}
        >
          <Repeat2 />
          {post.reposts}
        </button>
        {actionError && <span className="ml-auto text-meta text-destructive">{actionError}</span>}
      </div>

      {showComments && <CommentsSection postId={post.id} now={now} />}

      <ConfirmDialog
        open={confirm !== null}
        onOpenChange={(open) => !open && setConfirm(null)}
        title={confirm === 'delete' ? 'Видалити публікацію?' : 'Видалити як модератор?'}
        description={
          confirm === 'delete'
            ? 'Публікацію разом із коментарями буде видалено назавжди.'
            : 'Публікація зникне зі стрічки для всіх. Дія записується в журнал модерації.'
        }
        confirmLabel="Видалити"
        pending={remove.isPending || moderate.isPending}
        error={
          confirm === 'delete' && remove.isError
            ? toApiError(remove.error).message
            : confirm === 'moderate-delete' && moderate.isError
              ? toApiError(moderate.error).message
              : null
        }
        onConfirm={() => {
          if (confirm === 'delete') remove.mutate(post.id, { onSuccess: () => setConfirm(null) })
          else
            moderate.mutate(
              { id: post.id, status: 'deleted' },
              { onSuccess: () => setConfirm(null) },
            )
        }}
      />
      <ReportDialog
        target={reporting ? { post_id: post.id } : null}
        onClose={() => setReporting(false)}
      />
      <BanDialog user={banning ? post.author : null} onClose={() => setBanning(false)} />
    </article>
  )
}
