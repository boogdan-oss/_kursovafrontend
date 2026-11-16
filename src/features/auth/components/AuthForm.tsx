import type { ComponentProps, ReactNode } from 'react'

import { passwordScore } from '@/features/auth/validation'
import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'
import { FieldLabel } from '@/shared/ui/panel'

const INPUT =
  'h-7 rounded-sm border-border-strong bg-elevated px-2.5 text-ui placeholder:text-tertiary aria-[invalid=true]:border-destructive'

interface AuthFieldProps extends ComponentProps<'input'> {
  id: string
  label: string
  error?: string
  adornment?: ReactNode
}

export function AuthField({ id, label, error, adornment, className, ...props }: AuthFieldProps) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        {adornment && (
          <span className="pointer-events-none absolute inset-y-0 left-2.5 flex items-center text-ui text-tertiary">
            {adornment}
          </span>
        )}
        <Input
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-error` : undefined}
          className={cn(INPUT, adornment && 'pl-6', props.type === 'password' && 'font-mono')}
          {...props}
        />
      </div>
      {error && (
        <p id={`${id}-error`} className="text-meta text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}

interface CheckboxProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  children: ReactNode
  className?: string
}

export function Checkbox({ checked, onCheckedChange, children, className }: CheckboxProps) {
  return (
    <label
      className={cn(
        'flex cursor-pointer items-center gap-2 text-ui text-muted-foreground',
        className,
      )}
    >
      <input
        type="checkbox"
        className="peer sr-only"
        checked={checked}
        onChange={(event) => onCheckedChange(event.target.checked)}
      />
      <span
        aria-hidden
        className="size-2.5 shrink-0 border border-muted-foreground peer-checked:border-primary peer-checked:bg-primary peer-focus-visible:ring-1 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-1 peer-focus-visible:ring-offset-card"
      />
      {children}
    </label>
  )
}

const STRENGTH = ['', 'слабкий', 'слабкий', 'середній', 'надійний'] as const
const SEGMENTS = 4

export function PasswordStrength({ password }: { password: string }) {
  const score = passwordScore(password)
  const color = score >= 3 ? 'bg-success' : score === 2 ? 'bg-warning' : 'bg-destructive'
  return (
    <div
      role="meter"
      aria-label="Надійність пароля"
      aria-valuemin={0}
      aria-valuemax={SEGMENTS}
      aria-valuenow={score}
      aria-valuetext={score ? STRENGTH[score] : 'не задано'}
      className="grid grid-cols-4 gap-[3px]"
    >
      {Array.from({ length: SEGMENTS }, (_, index) => (
        <span key={index} className={cn('h-[3px]', index < score ? color : 'bg-border-strong')} />
      ))}
    </div>
  )
}

export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-sm border border-destructive/40 bg-destructive-soft px-2.5 py-2 text-ui text-destructive"
    >
      {children}
    </p>
  )
}
