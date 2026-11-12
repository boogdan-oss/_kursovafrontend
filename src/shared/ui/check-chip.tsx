import * as React from 'react'

import { cn } from '@/shared/lib/utils'

export interface CheckChipProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  checked: boolean
}

export const CheckChip = React.forwardRef<HTMLButtonElement, CheckChipProps>(
  ({ checked, className, children, type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      aria-pressed={checked}
      className={cn(
        'inline-flex h-7 items-center gap-1.5 whitespace-nowrap rounded-sm border px-2 text-ui transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-40',
        checked
          ? 'border-primary bg-primary/15 text-foreground'
          : 'border-border-strong text-muted-foreground enabled:hover:text-foreground',
        className,
      )}
      {...props}
    >
      <span
        aria-hidden
        className={cn(
          'size-2.5 shrink-0 border',
          checked ? 'border-primary bg-primary' : 'border-muted-foreground',
        )}
      />
      {children}
    </button>
  ),
)
CheckChip.displayName = 'CheckChip'
