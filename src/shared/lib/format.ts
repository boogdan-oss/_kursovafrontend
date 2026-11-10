const LOCALE = 'uk-UA'
const EMPTY = '—'
const NBSP = String.fromCharCode(160)

type Numeric = string | number | null | undefined

function toNumber(value: Numeric): number | null {
  if (value === null || value === undefined || value === '') return null
  const number = typeof value === 'number' ? value : Number(value)
  return Number.isFinite(number) ? number : null
}

const numberFormatters = new Map<string, Intl.NumberFormat>()

function numberFormatter(options: Intl.NumberFormatOptions) {
  const key = JSON.stringify(options)
  let formatter = numberFormatters.get(key)
  if (!formatter) {
    formatter = new Intl.NumberFormat(LOCALE, options)
    numberFormatters.set(key, formatter)
  }
  return formatter
}

interface NumberOptions {
  minDigits?: number
  maxDigits?: number
  signed?: boolean
}

export function formatNumber(value: Numeric, options: NumberOptions = {}) {
  const number = toNumber(value)
  if (number === null) return EMPTY
  const { minDigits = 0, maxDigits = Math.max(2, minDigits), signed = false } = options
  return numberFormatter({
    minimumFractionDigits: minDigits,
    maximumFractionDigits: maxDigits,
    signDisplay: signed ? 'exceptZero' : 'auto',
  }).format(number)
}

export function formatFiat(value: Numeric, fiat = 'UAH', options: NumberOptions = {}) {
  const number = toNumber(value)
  if (number === null) return EMPTY
  const { minDigits = 2, maxDigits = Math.max(2, minDigits), signed = false } = options
  try {
    return numberFormatter({
      style: 'currency',
      currency: fiat.toUpperCase(),
      currencyDisplay: 'narrowSymbol',
      minimumFractionDigits: minDigits,
      maximumFractionDigits: maxDigits,
      signDisplay: signed ? 'exceptZero' : 'auto',
    }).format(number)
  } catch {
    return `${formatNumber(number, { minDigits, maxDigits, signed })}${NBSP}${fiat.toUpperCase()}`
  }
}

export function formatCrypto(value: Numeric, asset: string, options: NumberOptions = {}) {
  const number = toNumber(value)
  if (number === null) return EMPTY
  const { minDigits = 2, maxDigits = 8, signed = false } = options
  return `${formatNumber(number, { minDigits, maxDigits, signed })}${NBSP}${asset.toUpperCase()}`
}

export function formatPercent(value: Numeric, options: NumberOptions = {}) {
  const number = toNumber(value)
  if (number === null) return EMPTY
  const { minDigits = 2, maxDigits = Math.max(2, minDigits), signed = false } = options
  return `${formatNumber(number, { minDigits, maxDigits, signed })}%`
}

type DateInput = string | number | Date | null | undefined

function toDate(value: DateInput): Date | null {
  if (value === null || value === undefined || value === '') return null
  const date = value instanceof Date ? value : new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

const timeFormatter = new Intl.DateTimeFormat(LOCALE, {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})
const shortTimeFormatter = new Intl.DateTimeFormat(LOCALE, { hour: '2-digit', minute: '2-digit' })
const dateFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
})
const dateTimeFormatter = new Intl.DateTimeFormat(LOCALE, {
  day: '2-digit',
  month: '2-digit',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})
const relativeFormatter = new Intl.RelativeTimeFormat(LOCALE, { numeric: 'auto', style: 'short' })

export function formatTime(value: DateInput) {
  const date = toDate(value)
  return date ? timeFormatter.format(date) : EMPTY
}

export function formatShortTime(value: DateInput) {
  const date = toDate(value)
  return date ? shortTimeFormatter.format(date) : EMPTY
}

export function formatDate(value: DateInput) {
  const date = toDate(value)
  return date ? dateFormatter.format(date) : EMPTY
}

export function formatDateTime(value: DateInput) {
  const date = toDate(value)
  return date ? dateTimeFormatter.format(date) : EMPTY
}

const RELATIVE_UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ['day', 86_400],
  ['hour', 3_600],
  ['minute', 60],
  ['second', 1],
]

export function formatRelativeTime(value: DateInput, now: DateInput = Date.now()) {
  const date = toDate(value)
  const base = toDate(now)
  if (!date || !base) return EMPTY
  const diffSec = Math.round((date.getTime() - base.getTime()) / 1000)
  for (const [unit, seconds] of RELATIVE_UNITS) {
    if (Math.abs(diffSec) >= seconds || unit === 'second') {
      return relativeFormatter.format(Math.trunc(diffSec / seconds), unit)
    }
  }
  return EMPTY
}

export function formatDuration(seconds: number | null | undefined) {
  if (seconds === null || seconds === undefined || !Number.isFinite(seconds)) return EMPTY
  const total = Math.max(0, Math.round(seconds))
  if (total < 60) return `${total} с`
  const minutes = Math.floor(total / 60) % 60
  const hours = Math.floor(total / 3_600) % 24
  const days = Math.floor(total / 86_400)
  const parts = [days && `${days} д`, hours && `${hours} год`, minutes && `${minutes} хв`]
  return parts.filter(Boolean).join(' ')
}
