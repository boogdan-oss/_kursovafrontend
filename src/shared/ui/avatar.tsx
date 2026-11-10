import { cn } from '@/shared/lib/utils'

interface AvatarProps {
  name: string
  className?: string
}

function initials(name: string) {
  const words = name.trim().split(' ').filter(Boolean)
  const letters = words.length > 1 ? words[0][0] + words[1][0] : name.trim().slice(0, 2)
  return letters.toUpperCase()
}

export function Avatar({ name, className }: AvatarProps) {
  return (
    <span
      aria-hidden
      className={cn(
        'flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-small font-semibold text-foreground',
        className,
      )}
    >
      {initials(name)}
    </span>
  )
}
