import type { ForecastHorizon, ForecastModelStatus } from '@/shared/api/forecast-types'
import type { HistoryParams } from '@/shared/api/types'

export const HORIZONS: ForecastHorizon[] = [15, 30, 60]
export const DEFAULT_HORIZON: ForecastHorizon = 60
export const DEFAULT_EXCHANGE = 'bybit'

export const HORIZON_LABELS: Record<ForecastHorizon, string> = {
  15: '15 хв',
  30: '30 хв',
  60: '1 год',
}

export const HORIZON_PHRASES: Record<ForecastHorizon, string> = {
  15: 'через 15 хв',
  30: 'через 30 хв',
  60: 'через 1 год',
}

export type ChartRange = '5m' | '1h' | '1d'
export const CHART_RANGES: ChartRange[] = ['5m', '1h', '1d']
export const DEFAULT_CHART_RANGE: ChartRange = '5m'

export const CHART_RANGE_CONFIG: Record<
  ChartRange,
  { label: string; interval: NonNullable<HistoryParams['interval']>; hours: number }
> = {
  '5m': { label: '5 хв', interval: '5m', hours: 6 },
  '1h': { label: '1 год', interval: '1h', hours: 72 },
  '1d': { label: '1 д', interval: '1d', hours: 24 * 30 },
}

export const MODEL_STATUS: Record<
  ForecastModelStatus,
  { label: string; variant: 'success' | 'neutral' | 'accent' | 'warning' }
> = {
  active: { label: 'Активна', variant: 'success' },
  archived: { label: 'Архів', variant: 'neutral' },
  baseline: { label: 'Бейзлайн', variant: 'accent' },
  planned: { label: 'Заплановано', variant: 'warning' },
}

export function parseHorizon(value: string | null): ForecastHorizon {
  const number = Number(value)
  return HORIZONS.find((horizon) => horizon === number) ?? DEFAULT_HORIZON
}

export function parseChartRange(value: string | null): ChartRange {
  return CHART_RANGES.find((range) => range === value) ?? DEFAULT_CHART_RANGE
}
