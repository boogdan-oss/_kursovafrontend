import * as React from 'react'

import { cn } from '@/shared/lib/utils'

export interface ChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean
}

const Chip = React.forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, active = false, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={active}
      className={cn(
        'inline-flex h-8 items-center gap-1.5 whitespace-nowrap rounded-md border px-3 text-caption font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-3.5 [&_svg]:shrink-0',
        active
          ? 'border-primary/70 bg-primary-soft text-foreground [&_svg]:text-primary'
          : 'bg-background text-muted-foreground enabled:hover:text-foreground',
        className,
      )}
      {...props}
    />
  ),
)
Chip.displayName = 'Chip'

export { Chip }
