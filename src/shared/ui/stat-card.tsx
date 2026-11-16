import { cn } from '@/shared/lib/utils'

const DELTA_TONES = {
  muted: 'text-muted-foreground',
  success: 'text-success',
  danger: 'text-destructive',
  warning: 'text-warning',
} as const

const VALUE_SIZES = [
  { maxLength: 10, className: 'text-num' },
  { maxLength: 14, className: 'text-[24px] font-semibold leading-8 tracking-[-0.01em]' },
  { maxLength: Infinity, className: 'text-[20px] font-semibold leading-7 tracking-[-0.01em]' },
] as const

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaTone?: keyof typeof DELTA_TONES
  className?: string
}

export function StatCard({ label, value, delta, deltaTone = 'muted', className }: StatCardProps) {
  const valueSize = VALUE_SIZES.find((size) => value.length <= size.maxLength)!.className

  return (
    <div
      className={cn(
        'flex min-w-0 flex-col gap-1 rounded-xl border bg-card px-[18px] py-4',
        className,
      )}
    >
      <span className="break-words text-caption text-muted-foreground">{label}</span>
      <span className={cn('tabular-nums [overflow-wrap:anywhere]', valueSize)} title={value}>
        {value}
      </span>
      {delta && (
        <span className={cn('break-words text-small', DELTA_TONES[deltaTone])}>{delta}</span>
      )}
    </div>
  )
}
