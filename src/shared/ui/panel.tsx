import * as React from 'react'

import { cn } from '@/shared/lib/utils'

const Panel = React.forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  ({ className, ...props }, ref) => (
    <section
      ref={ref}
      className={cn('min-w-0 rounded-sm border bg-card text-card-foreground', className)}
      {...props}
    />
  ),
)
Panel.displayName = 'Panel'

interface PanelHeaderProps {
  title: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

function PanelHeader({ title, meta, actions, className }: PanelHeaderProps) {
  return (
    <div
      className={cn(
        'flex min-h-[34px] flex-wrap items-center gap-x-2.5 gap-y-1 border-b px-3 py-1.5',
        className,
      )}
    >
      <h2 className="text-ui font-semibold uppercase tracking-[0.06em]">{title}</h2>
      {meta && <span className="text-meta text-tertiary">{meta}</span>}
      {actions && <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  )
}

function FieldLabel({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return <label className={cn('block text-label uppercase text-tertiary', className)} {...props} />
}

function SectionLabel({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn('text-label uppercase text-tertiary', className)} {...props} />
}

export { Panel, PanelHeader, FieldLabel, SectionLabel }
