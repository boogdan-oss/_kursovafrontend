import { useMarkRead, useNotifications } from '@/features/alerts/hooks'
import { CHANNEL_TAGS } from '@/features/alerts/lib'
import type { AppNotification } from '@/shared/api/types'
import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'

export function NotificationList({ now, className }: { now: number; className?: string }) {
  const notifications = useNotifications()
  const markRead = useMarkRead()
  const data = notifications.data
  const items = data?.items ?? []

  return (
    <Panel aria-label="Історія сповіщень" className={cn('flex flex-col', className)}>
      <PanelHeader
        title="Історія сповіщень"
        meta={data ? `${data.unread} непрочитаних` : undefined}
        actions={
          data && data.unread > 0 ? (
            <Button
              variant="ghost"
              size="terminal-sm"
              disabled={markRead.isPending}
              onClick={() => markRead.mutate(undefined)}
            >
              Прочитати всі
            </Button>
          ) : undefined
        }
      />
      <div className="relative xl:min-h-[360px] xl:flex-1">
        <div
          aria-label="Список сповіщень"
          role="region"
          className="flex max-h-[420px] flex-col overflow-y-auto overscroll-contain xl:absolute xl:inset-0 xl:max-h-none"
        >
          {notifications.isPending ? (
            <div className="flex flex-col gap-2 p-4">
              <Skeleton className="h-10" />
              <Skeleton className="h-10" />
            </div>
          ) : items.length === 0 ? (
            <p className="my-auto px-4 py-8 text-center text-ui text-muted-foreground">
              {notifications.isError
                ? 'Не вдалося завантажити сповіщення'
                : 'Сповіщень ще не було. Щойно умова правила виконається, воно з’явиться тут.'}
            </p>
          ) : (
            <NotificationItems items={items} now={now} />
          )}
        </div>
      </div>
    </Panel>
  )
}

function NotificationItems({ items, now }: { items: AppNotification[]; now: number }) {
  return (
    <ul>
      {items.map((item) => (
        <li
          key={item.id}
          className={cn(
            'flex gap-3 border-b px-4 py-2.5 last:border-b-0',
            !item.read && 'bg-primary/5',
          )}
        >
          <span
            aria-hidden
            className={cn(
              'mt-1.5 size-1.5 shrink-0 rounded-full',
              item.read ? 'bg-transparent' : 'bg-primary',
            )}
          />
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <span className="text-ui">{item.text}</span>
            <span className="text-meta text-muted-foreground">
              <time dateTime={item.created_at}>{formatRelativeTime(item.created_at, now)}</time>
              {item.rule_title && ` · ${item.rule_title}`}
            </span>
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            {item.channels.map((channel) => (
              <Tag
                key={channel}
                tone={item.delivery[channel] === 'sent' ? 'neutral' : 'warning'}
                title={item.delivery[channel]}
              >
                {CHANNEL_TAGS[channel]}
              </Tag>
            ))}
          </div>
        </li>
      ))}
    </ul>
  )
}
