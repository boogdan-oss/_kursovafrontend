import type {
  BacktestItem,
  ForecastFeature,
  ForecastHorizon,
  ForecastParams,
  ForecastPoint,
  ForecastResponse,
} from '@/shared/api/forecast-types'

export interface PricePoint {
  time: number
  price: number
}

export const DEMO_MODEL = 'Демо: лінійний тренд'
const MINUTE_MS = 60_000
const TREND_WINDOW = 60
const VOLATILITY_WINDOW = 240
const TREND_DAMPING = 0.5
const STEP_MIN = 5
const Z_80 = 1.2816
const BACKTEST_EVERY_MIN = 15
const BACKTEST_ROWS = 5
export const MIN_POINTS = TREND_WINDOW + 15

const DEMO_FEATURES: ForecastFeature[] = [
  { name: 'Ціна 15 хв тому', importance_pct: '28' },
  { name: 'Спред купівля / продаж', importance_pct: '19' },
  { name: 'Кількість оголошень', importance_pct: '14' },
  { name: 'Міжбіржова різниця', importance_pct: '12' },
  { name: 'Година доби', importance_pct: '11' },
  { name: 'Обсяг пропозиції', importance_pct: '9' },
  { name: 'Інше', importance_pct: '7' },
]

const DEMO_NOTE =
  'Демо-прогноз: AI-модуль на бекенді ще не підключений. Ціни й інтервал рахує простий тренд ' +
  'за реальною історією, а фактори впливу — приклад із макета.'

interface Trend {
  last: PricePoint
  slopePerMin: number
  sigmaPerMin: number
}

function fitTrend(points: PricePoint[]): Trend {
  const window = points.slice(-TREND_WINDOW)
  const last = window[window.length - 1]
  const xs = window.map((point) => (point.time - last.time) / MINUTE_MS)
  const meanX = xs.reduce((sum, x) => sum + x, 0) / xs.length
  const meanY = window.reduce((sum, point) => sum + point.price, 0) / window.length
  let covariance = 0
  let variance = 0
  window.forEach((point, index) => {
    covariance += (xs[index] - meanX) * (point.price - meanY)
    variance += (xs[index] - meanX) ** 2
  })
  const slopePerMin = variance ? (covariance / variance) * TREND_DAMPING : 0

  const recent = points.slice(-VOLATILITY_WINDOW)
  let squared = 0
  let steps = 0
  for (let index = 1; index < recent.length; index++) {
    const minutes = (recent[index].time - recent[index - 1].time) / MINUTE_MS
    if (minutes <= 0) continue
    squared += (recent[index].price - recent[index - 1].price) ** 2 / minutes
    steps++
  }
  return { last, slopePerMin, sigmaPerMin: steps ? Math.sqrt(squared / steps) : 0 }
}

function predict(trend: Trend, minutes: number) {
  const price = trend.last.price + trend.slopePerMin * minutes
  const half = Z_80 * trend.sigmaPerMin * Math.sqrt(minutes)
  return { price, lower: price - half, upper: price + half }
}

function priceAt(points: PricePoint[], time: number) {
  let best: PricePoint | undefined
  for (const point of points) {
    if (Math.abs(point.time - time) > MINUTE_MS) continue
    if (!best || Math.abs(point.time - time) < Math.abs(best.time - time)) best = point
  }
  return best
}

function decimals(price: number) {
  if (price >= 1000) return 2
  if (price >= 1) return 4
  return 8
}

export function trendForecast(
  points: PricePoint[],
  params: Pick<ForecastParams, 'asset' | 'fiat' | 'exchange' | 'side'> & {
    horizon: ForecastHorizon
  },
  now = Date.now(),
): ForecastResponse | null {
  const sorted = [...points].sort((a, b) => a.time - b.time)
  if (sorted.length < MIN_POINTS) return null

  const trend = fitTrend(sorted)
  const digits = decimals(trend.last.price)
  const fixed = (value: number) => value.toFixed(digits)
  const { horizon } = params

  const forecast: ForecastPoint[] = []
  for (let minutes = STEP_MIN; minutes <= horizon; minutes += STEP_MIN) {
    const value = predict(trend, minutes)
    forecast.push({
      time: new Date(trend.last.time + minutes * MINUTE_MS).toISOString(),
      price: fixed(value.price),
      lower: fixed(value.lower),
      upper: fixed(value.upper),
    })
  }
  const final = predict(trend, horizon)

  const checks: (BacktestItem & { naive: number; absolute: number; actualPrice: number })[] = []
  const latestStart = trend.last.time - horizon * MINUTE_MS
  for (
    let start = latestStart;
    start >= sorted[0].time + TREND_WINDOW * MINUTE_MS;
    start -= BACKTEST_EVERY_MIN * MINUTE_MS
  ) {
    const known = sorted.filter((point) => point.time <= start)
    const actual = priceAt(sorted, start + horizon * MINUTE_MS)
    if (known.length < TREND_WINDOW || !actual) continue
    const past = fitTrend(known)
    const predicted = predict(past, horizon).price
    const absolute = Math.abs(predicted - actual.price)
    checks.push({
      time: new Date(actual.time).toISOString(),
      predicted: fixed(predicted),
      actual: fixed(actual.price),
      error: fixed(absolute),
      naive: Math.abs(past.last.price - actual.price),
      absolute,
      actualPrice: actual.price,
    })
  }

  const mean = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length
  const mae = checks.length ? mean(checks.map((check) => check.absolute)) : null
  const mape = checks.length
    ? mean(checks.map((check) => (check.absolute / check.actualPrice) * 100))
    : null
  const naive = checks.length ? mean(checks.map((check) => check.naive)) : null
  const improvement = mae !== null && naive ? (1 - mae / naive) * 100 : null

  return {
    asset: params.asset,
    fiat: params.fiat,
    exchange: params.exchange,
    side: params.side,
    horizon_min: horizon,
    model: DEMO_MODEL,
    generated_at: new Date(now).toISOString(),
    current_time: new Date(trend.last.time).toISOString(),
    current_price: fixed(trend.last.price),
    predicted_price: fixed(final.price),
    change_pct: (((final.price - trend.last.price) / trend.last.price) * 100).toFixed(4),
    confidence_level: '0.8',
    lower: fixed(final.lower),
    upper: fixed(final.upper),
    interval_width_pct: (((final.upper - final.lower) / trend.last.price) * 100).toFixed(4),
    mae: mae === null ? null : fixed(mae),
    mape_pct: mape === null ? null : mape.toFixed(4),
    baseline_mae: naive === null ? null : fixed(naive),
    improvement_pct: improvement === null ? null : improvement.toFixed(2),
    forecast,
    features: DEMO_FEATURES,
    backtest: checks
      .slice(0, BACKTEST_ROWS)
      .map(({ time, predicted, actual, error }) => ({ time, predicted, actual, error })),
    note: DEMO_NOTE,
  }
}
