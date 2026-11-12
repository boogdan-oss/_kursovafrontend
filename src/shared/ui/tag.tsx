import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'

import { cn } from '@/shared/lib/utils'

const tagVariants = cva(
  'inline-flex h-[18px] items-center whitespace-nowrap rounded-sm border px-1.5 text-label font-semibold uppercase tracking-[0.04em]',
  {
    variants: {
      tone: {
        neutral: 'border-border-strong text-muted-foreground',
        accent: 'border-primary text-primary',
        success: 'border-success text-success',
        danger: 'border-destructive text-destructive',
        warning: 'border-warning text-warning',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export type TagTone = NonNullable<VariantProps<typeof tagVariants>['tone']>

interface TagProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof tagVariants> {}

export function Tag({ className, tone, ...props }: TagProps) {
  return <span className={cn(tagVariants({ tone }), className)} {...props} />
}
