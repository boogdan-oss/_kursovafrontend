import { useEffect, useState } from 'react'

import { cn } from '@/shared/lib/utils'
import { Input } from '@/shared/ui/input'

const DEBOUNCE_MS = 500

interface ParseOptions {
  max?: number
  integer?: boolean
}

export function parseNumber(text: string, { max, integer = false }: ParseOptions = {}) {
  const normalized = text.split(' ').join('').replace(',', '.')
  if (!normalized) return null
  const value = Number(normalized)
  if (!Number.isFinite(value) || value <= 0) return null
  const limited = max === undefined ? value : Math.min(value, max)
  return integer ? Math.round(limited) : limited
}

interface NumberInputProps extends ParseOptions {
  id: string
  value: number | null
  onValueChange: (value: number | null) => void
  suffix?: string
  placeholder?: string
  className?: string
}

export function NumberInput({
  id,
  value,
  onValueChange,
  suffix,
  placeholder,
  max,
  integer,
  className,
}: NumberInputProps) {
  const [text, setText] = useState(value === null ? '' : String(value))
  const parsed = parseNumber(text, { max, integer })

  if (parsed !== value && document.activeElement?.id !== id) {
    setText(value === null ? '' : String(value))
  }

  useEffect(() => {
    if (parsed === value) return
    const timer = setTimeout(() => onValueChange(parsed), DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [parsed, value, onValueChange])

  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => {
          onValueChange(parsed)
          setText(parsed === null ? '' : String(parsed))
        }}
        className={cn('tabular-nums', suffix && 'pr-12', className)}
      />
      {suffix && (
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-small text-muted-foreground">
          {suffix}
        </span>
      )}
    </div>
  )
}
