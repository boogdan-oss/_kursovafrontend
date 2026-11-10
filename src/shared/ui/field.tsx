import type { ReactNode } from 'react'

import { cn } from '@/shared/lib/utils'
import { Label } from '@/shared/ui/label'

interface FieldProps {
  label: string
  htmlFor?: string
  className?: string
  children: ReactNode
}

export function Field({ label, htmlFor, className, children }: FieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor} className="text-small text-muted-foreground">
        {label}
      </Label>
      {children}
    </div>
  )
}
