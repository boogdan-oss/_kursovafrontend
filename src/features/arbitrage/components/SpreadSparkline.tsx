import type { SpreadPoint } from '@/features/arbitrage/lib'
import { formatPercent } from '@/shared/lib/format'
import { Skeleton } from '@/shared/ui/skeleton'

const WIDTH = 336
const HEIGHT = 90
const PAD_Y = 6

interface SpreadSparklineProps {
  points: SpreadPoint[]
  isLoading: boolean
}

export function SpreadSparkline({ points, isLoading }: SpreadSparklineProps) {
  if (isLoading) return <Skeleton className="h-[90px] w-full" />
  if (points.length < 2) {
    return (
      <p className="flex h-[90px] items-center justify-center text-meta text-tertiary">
        Недостатньо історії цін за останню годину
      </p>
    )
  }

  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const x = (index: number) => (index / (points.length - 1)) * WIDTH
  const y = (value: number) => PAD_Y + (1 - (value - min) / range) * (HEIGHT - PAD_Y * 2)
  const line = points
    .map(
      (point, index) => `${index ? 'L' : 'M'}${x(index).toFixed(1)} ${y(point.value).toFixed(1)}`,
    )
    .join(' ')
  const last = values[values.length - 1]
  const positive = last >= 0
  const color = positive ? 'rgb(var(--success))' : 'rgb(var(--destructive))'

  return (
    <div className="flex items-stretch gap-2">
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        className="h-[90px] min-w-0 flex-1"
        role="img"
        aria-label={`Валовий спред маршруту зараз ${formatPercent(last)}`}
      >
        <line
          x1="0"
          x2={WIDTH}
          y1={HEIGHT - PAD_Y}
          y2={HEIGHT - PAD_Y}
          stroke="rgb(var(--border))"
        />
        <path d={`${line} L${WIDTH} ${HEIGHT} L0 ${HEIGHT} Z`} fill={color} fillOpacity="0.1" />
        <path
          d={line}
          fill="none"
          stroke={color}
          strokeWidth="1.5"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <div className="flex w-12 flex-col justify-between py-0.5 text-right font-mono text-label text-tertiary">
        <span>{formatPercent(max, { minDigits: 1, maxDigits: 2 })}</span>
        <span>{formatPercent(min, { minDigits: 1, maxDigits: 2 })}</span>
      </div>
    </div>
  )
}
