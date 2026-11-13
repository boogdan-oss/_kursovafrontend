import { cn } from '@/shared/lib/utils'

const SIZES = {
  sm: 'size-7 text-meta',
  md: 'size-9 text-meta',
  lg: 'size-12 text-ui-lg',
  xl: 'size-20 text-kpi',
} as const

interface UserAvatarProps {
  username: string
  size?: keyof typeof SIZES
  accent?: boolean
  className?: string
}

export function UserAvatar({ username, size = 'md', accent = false, className }: UserAvatarProps) {
  const letters = username.replace(/[^\p{L}\p{N}]/gu, '').slice(0, 2) || '?'
  return (
    <span
      aria-hidden
      className={cn(
        'flex shrink-0 items-center justify-center rounded-sm border bg-elevated font-semibold uppercase',
        accent ? 'border-primary/70 text-foreground' : 'border-border-strong',
        SIZES[size],
        className,
      )}
    >
      {letters}
    </span>
  )
}
