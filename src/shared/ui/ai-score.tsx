import { cn } from '@/shared/lib/utils'

export type ScoreTone = 'success' | 'warning' | 'danger'

export const SCORE_TEXT: Record<ScoreTone, string> = {
  success: 'text-success',
  warning: 'text-warning',
  danger: 'text-destructive',
}

export const SCORE_FILL: Record<ScoreTone, string> = {
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-destructive',
}

export function scoreTone(score: number): ScoreTone {
  if (score >= 80) return 'success'
  return score >= 60 ? 'warning' : 'danger'
}

interface ScoreBarProps {
  score: number
  className?: string
}

export function ScoreBar({ score, className }: ScoreBarProps) {
  return (
    <span
      className={cn('block h-1.5 overflow-hidden rounded-full bg-muted', className)}
      aria-hidden
    >
      <span
        className={cn('block h-full rounded-full', SCORE_FILL[scoreTone(score)])}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </span>
  )
}

interface AiScoreProps {
  score: number | null | undefined
  className?: string
}

export function AiScore({ score, className }: AiScoreProps) {
  if (score === null || score === undefined) {
    return <span className="text-caption text-muted-foreground">—</span>
  }
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span className={cn('text-caption font-semibold tabular-nums', SCORE_TEXT[scoreTone(score)])}>
        {score}
      </span>
      <ScoreBar score={score} className="w-14" />
    </span>
  )
}
