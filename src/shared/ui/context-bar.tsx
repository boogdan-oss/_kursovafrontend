import type { ReactNode } from 'react'

import { formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'

export function ContextBar({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex min-h-10 flex-wrap items-stretch border-b bg-card pr-4 [&>*:first-child]:pl-4',
        className,
      )}
    >
      {children}
    </div>
  )
}

interface ContextFieldProps {
  label: string
  children: ReactNode
  className?: string
}

export function ContextField({ label, children, className }: ContextFieldProps) {
  return (
    <div className={cn('flex flex-col justify-center border-r px-4 py-1', className)}>
      <span className="text-label uppercase leading-3 text-tertiary">{label}</span>
      <span className="text-ui-lg font-semibold">{children}</span>
    </div>
  )
}

type LiveState = 'live' | 'connecting' | 'offline' | 'disabled'

const LIVE_LABELS: Record<LiveState, string> = {
  live: 'LIVE',
  connecting: 'Підключення',
  offline: 'Таймер',
  disabled: 'Таймер',
}

interface ContextLiveProps {
  status: LiveState
  updatedAt: number | undefined
  now: number
  cycleSec: number
}

export function ContextLive({ status, updatedAt, now, cycleSec }: ContextLiveProps) {
  const live = status === 'live'
  return (
    <div className="ml-auto flex items-center gap-1.5 pl-4 text-ui text-muted-foreground">
      <span
        aria-hidden
        className={cn('size-1.5 rounded-full', live ? 'bg-success' : 'bg-muted-foreground')}
      />
      <span>{LIVE_LABELS[status]}</span>
      {updatedAt ? (
        <>
          <span>· оновлено</span>
          <span className="font-mono">{formatRelativeTime(updatedAt, now)}</span>
        </>
      ) : (
        <span>· завантаження…</span>
      )}
      <span>· цикл</span>
      <span className="font-mono">{cycleSec} с</span>
    </div>
  )
}
