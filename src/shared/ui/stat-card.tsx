import { cn } from '@/shared/lib/utils'

const DELTA_TONES = {
  muted: 'text-muted-foreground',
  success: 'text-success',
  danger: 'text-destructive',
  warning: 'text-warning',
} as const

interface StatCardProps {
  label: string
  value: string
  delta?: string
  deltaTone?: keyof typeof DELTA_TONES
  className?: string
}

export function StatCard({ label, value, delta, deltaTone = 'muted', className }: StatCardProps) {
  return (
    <div className={cn('flex flex-col gap-1 rounded-xl border bg-card px-[18px] py-4', className)}>
      <span className="text-caption text-muted-foreground">{label}</span>
      <span className="text-num">{value}</span>
      {delta && <span className={cn('text-small', DELTA_TONES[deltaTone])}>{delta}</span>}
    </div>
  )
}
