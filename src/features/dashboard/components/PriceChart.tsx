import {
  ColorType,
  createChart,
  LineSeries,
  type IChartApi,
  type UTCTimestamp,
} from 'lightweight-charts'
import { useEffect, useRef } from 'react'

import { cn } from '@/shared/lib/utils'

const TEXT_COLOR = '#8E8E8E'
const GRID_COLOR = '#3A3A3A'

export interface ChartSeries {
  id: string
  title: string
  color: string
  points: { time: string; value: number }[]
}

function localTimestamp(time: string) {
  const date = new Date(time)
  return (date.getTime() / 1000 - date.getTimezoneOffset() * 60) as UTCTimestamp
}

interface PriceChartProps {
  series: ChartSeries[]
  className?: string
}

export function PriceChart({ series, className }: PriceChartProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)

  useEffect(() => {
    if (!containerRef.current) return
    const chart = createChart(containerRef.current, {
      autoSize: true,
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: TEXT_COLOR,
        fontFamily: "'Inter Variable', sans-serif",
      },
      grid: { vertLines: { visible: false }, horzLines: { color: GRID_COLOR } },
      rightPriceScale: { borderVisible: false },
      timeScale: { borderVisible: false, timeVisible: true, secondsVisible: false },
      localization: { locale: 'uk-UA' },
    })
    chartRef.current = chart
    return () => {
      chartRef.current = null
      chart.remove()
    }
  }, [])

  useEffect(() => {
    const chart = chartRef.current
    if (!chart) return
    const lines = series.map(({ color, points }) => {
      const line = chart.addSeries(LineSeries, {
        color,
        lineWidth: 2,
        priceLineVisible: false,
        lastValueVisible: false,
      })
      line.setData(points.map(({ time, value }) => ({ time: localTimestamp(time), value })))
      return line
    })
    chart.timeScale().fitContent()
    return () => {
      if (chartRef.current !== chart) return
      for (const line of lines) chart.removeSeries(line)
    }
  }, [series])

  return <div ref={containerRef} className={cn('size-full', className)} />
}
