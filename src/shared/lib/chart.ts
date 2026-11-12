import type { UTCTimestamp } from 'lightweight-charts'

export function chartTimestamp(time: string | number) {
  const date = new Date(time)
  return (date.getTime() / 1000 - date.getTimezoneOffset() * 60) as UTCTimestamp
}

export function tokenColor(name: string, alpha = 1) {
  const value =
    typeof document === 'undefined'
      ? ''
      : getComputedStyle(document.documentElement).getPropertyValue(`--${name}`).trim()
  const channels = value.split(' ').filter(Boolean)
  if (channels.length !== 3) return `rgba(128, 128, 128, ${alpha})`
  return `rgba(${channels.join(', ')}, ${alpha})`
}
