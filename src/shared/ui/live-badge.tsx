import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

type LiveStatus = 'disabled' | 'connecting' | 'live' | 'offline'

const LABELS: Record<LiveStatus, string> = {
  live: 'Live',
  connecting: 'Підключення…',
  offline: 'Офлайн',
  disabled: 'Автооновлення',
}

const HINTS: Record<LiveStatus, string> = {
  live: 'Оновлення надходять одразу, щойно сервер збере нові дані',
  connecting: 'Підключаємось до потоку оновлень; поки дані оновлюються за таймером',
  offline: 'Потік оновлень недоступний; дані оновлюються за таймером',
  disabled: 'Дані оновлюються за таймером',
}

interface LiveBadgeProps {
  status: LiveStatus
  className?: string
}

export function LiveBadge({ status, className }: LiveBadgeProps) {
  const live = status === 'live'
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          tabIndex={0}
          className={cn(
            'inline-flex h-10 cursor-default items-center gap-2 rounded-lg border px-3.5 text-caption font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
            live
              ? 'border-success/50 bg-success-soft text-success'
              : 'bg-card text-muted-foreground',
            className,
          )}
        >
          <span
            className={cn('size-2 rounded-full', live ? 'bg-success' : 'bg-muted-foreground')}
            aria-hidden
          />
          {LABELS[status]}
        </span>
      </TooltipTrigger>
      <TooltipContent>{HINTS[status]}</TooltipContent>
    </Tooltip>
  )
}
