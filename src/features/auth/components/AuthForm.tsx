import type { ComponentProps, ReactNode } from 'react'

import { passwordScore } from '@/features/auth/validation'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
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

function GoogleLogo() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden className="!size-4">
      <path
        fill="#FFC107"
        d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.6-.4-3.9z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 7.9 3.1l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z"
      />
    </svg>
  )
}

interface GoogleButtonProps {
  href: string
  error: string | null
  onClick?: () => void
}

export function GoogleButton({ href, error, onClick }: GoogleButtonProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3 text-meta uppercase text-tertiary" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        або
        <span className="h-px flex-1 bg-border" />
      </div>
      {error && <FormError>{error}</FormError>}
      <Button asChild variant="secondary" className="h-[38px] text-ui">
        <a href={href} onClick={onClick}>
          <GoogleLogo />
          Продовжити з Google
        </a>
      </Button>
    </div>
  )
}
