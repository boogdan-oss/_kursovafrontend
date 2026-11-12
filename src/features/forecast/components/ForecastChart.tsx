import {
  ColorType,
  createChart,
  LineSeries,
  LineStyle,
  type IChartApi,
  type ISeriesApi,
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'

import { ForecastBand } from '@/features/forecast/components/forecast-band'
import type { ForecastResponse } from '@/shared/api/forecast-types'
import { chartTimestamp, tokenColor } from '@/shared/lib/chart'
import { cn } from '@/shared/lib/utils'

export interface FactPoint {
  time: string
  value: number
}

interface ForecastChartProps {
  fact: FactPoint[]
  forecast: ForecastResponse | undefined
  className?: string
}

interface ChartParts {
  chart: IChartApi
  fact: ISeriesApi<'Line'>
  forecast: ISeriesApi<'Line'>
  band: ForecastBand
}

function ascending<T extends { time: number }>(points: T[]) {
  const sorted = [...points].sort((a, b) => a.time - b.time)
  return sorted.filter((point, index) => index === 0 || point.time > sorted[index - 1].time)
}

export function ForecastChart({ fact, forecast, className }: ForecastChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const partsRef = useRef<ChartParts | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: tokenColor('muted-foreground'),
        fontFamily: "'Inter Variable', sans-serif",
      },
      grid: { vertLines: { visible: false }, horzLines: { color: tokenColor('border') } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      localization: { locale: 'uk-UA' },
    })
    const factSeries = chart.addSeries(LineSeries, {
      color: tokenColor('foreground'),
      lineWidth: 2,
      priceLineVisible: false,
      lastValueVisible: false,
    })
    const forecastSeries = chart.addSeries(LineSeries, {
      color: tokenColor('primary'),
      lineWidth: 2,
      lineStyle: LineStyle.Dashed,
      priceLineVisible: false,
      lastValueVisible: true,
    })
    const band = new ForecastBand({
      fill: tokenColor('primary', 0.18),
      now: tokenColor('muted-foreground', 0.8),
      label: tokenColor('muted-foreground'),
    })
    forecastSeries.attachPrimitive(band)
    partsRef.current = { chart, fact: factSeries, forecast: forecastSeries, band }
    return () => {
      partsRef.current = null
      chart.remove()
    }
  }, [])

  useEffect(() => {
    const parts = partsRef.current
    if (!parts) return

    const factPoints = fact.map((point) => ({
      time: chartTimestamp(point.time),
      value: point.value,
    }))

    if (!forecast) {
      parts.fact.setData(ascending(factPoints))
      parts.forecast.setData([])
      parts.band.setData([], null)
      parts.chart.timeScale().fitContent()
      return
    }

    const now = chartTimestamp(forecast.current_time)
    const current = Number(forecast.current_price)
    const lastFact = factPoints.at(-1)
    if (!lastFact || lastFact.time < now) factPoints.push({ time: now, value: current })

    parts.fact.setData(ascending(factPoints))
    parts.forecast.setData(
      ascending([
        { time: now, value: current },
        ...forecast.forecast.map((point) => ({
          time: chartTimestamp(point.time),
          value: Number(point.price),
        })),
      ]),
    )
    parts.band.setData(
      ascending([
        { time: now, lower: current, upper: current },
        ...forecast.forecast.map((point) => ({
          time: chartTimestamp(point.time),
          lower: Number(point.lower),
          upper: Number(point.upper),
        })),
      ]),
      now,
    )
    parts.chart.timeScale().fitContent()
  }, [fact, forecast])

  return <div ref={containerRef} className={cn('size-full', className)} />
}
