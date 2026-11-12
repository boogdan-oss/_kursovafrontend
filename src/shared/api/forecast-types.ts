import type { DecimalString } from '@/shared/api/types'

export type ForecastSide = 'BUY' | 'SELL'
export type ForecastHorizon = 15 | 30 | 60

export interface ForecastParams {
  asset: string
  fiat: string
  exchange: string
  side: ForecastSide
  horizon: ForecastHorizon
}

export interface ForecastPoint {
  time: string
  price: DecimalString
  lower: DecimalString
  upper: DecimalString
}

export interface ForecastFeature {
  name: string
  importance_pct: DecimalString
}

export interface BacktestItem {
  time: string
  predicted: DecimalString
  actual: DecimalString
  error: DecimalString
}

export interface ForecastResponse {
  asset: string
  fiat: string
  exchange: string
  side: ForecastSide
  horizon_min: number
  model: string
  generated_at: string
  current_time: string
  current_price: DecimalString
  predicted_price: DecimalString
  change_pct: DecimalString
  confidence_level: DecimalString
  lower: DecimalString
  upper: DecimalString
  interval_width_pct: DecimalString
  mae: DecimalString | null
  mape_pct: DecimalString | null
  baseline_mae: DecimalString | null
  improvement_pct: DecimalString | null
  forecast: ForecastPoint[]
  features: ForecastFeature[]
  backtest: BacktestItem[]
  note: string | null
}

export type ForecastModelStatus = 'active' | 'archived' | 'baseline' | 'planned'

export interface ForecastModel {
  name: string
  status: ForecastModelStatus
  mae: DecimalString | null
  trained_at: string | null
  description: string | null
}

export interface ForecastModelsResponse {
  count: number
  items: ForecastModel[]
}
