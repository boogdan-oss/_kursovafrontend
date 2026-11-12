import type { CanvasRenderingTarget2D } from 'fancy-canvas'
import type {
  AutoscaleInfo,
  IChartApiBase,
  IPrimitivePaneRenderer,
  IPrimitivePaneView,
  ISeriesApi,
  ISeriesPrimitive,
  PrimitivePaneViewZOrder,
  SeriesAttachedParameter,
  SeriesType,
  Time,
  UTCTimestamp,
} from 'lightweight-charts'

export interface BandPoint {
  time: UTCTimestamp
  lower: number
  upper: number
}

interface BandColors {
  fill: string
  now: string
  label: string
}

interface Coordinates {
  band: { x: number; lower: number; upper: number }[]
  nowX: number | null
}

const NOW_LABEL = 'зараз'

class BandRenderer implements IPrimitivePaneRenderer {
  constructor(
    private readonly coordinates: Coordinates,
    private readonly colors: BandColors,
  ) {}

  draw(target: CanvasRenderingTarget2D) {
    target.useBitmapCoordinateSpace(
      ({ context, bitmapSize, horizontalPixelRatio, verticalPixelRatio }) => {
        const { band, nowX } = this.coordinates

        if (band.length > 1) {
          context.beginPath()
          band.forEach((point, index) => {
            const x = point.x * horizontalPixelRatio
            const y = point.upper * verticalPixelRatio
            if (index === 0) context.moveTo(x, y)
            else context.lineTo(x, y)
          })
          for (const point of [...band].reverse()) {
            context.lineTo(point.x * horizontalPixelRatio, point.lower * verticalPixelRatio)
          }
          context.closePath()
          context.fillStyle = this.colors.fill
          context.fill()
        }

        if (nowX !== null) {
          const x = Math.round(nowX * horizontalPixelRatio)
          context.save()
          context.strokeStyle = this.colors.now
          context.lineWidth = Math.max(1, Math.floor(horizontalPixelRatio))
          context.setLineDash([4 * horizontalPixelRatio, 4 * horizontalPixelRatio])
          context.beginPath()
          context.moveTo(x, 0)
          context.lineTo(x, bitmapSize.height)
          context.stroke()
          context.restore()

          context.fillStyle = this.colors.label
          context.font = `500 ${11 * verticalPixelRatio}px 'Inter Variable', sans-serif`
          context.textBaseline = 'top'
          context.fillText(NOW_LABEL, x + 6 * horizontalPixelRatio, 6 * verticalPixelRatio)
        }
      },
    )
  }
}

class BandPaneView implements IPrimitivePaneView {
  private coordinates: Coordinates = { band: [], nowX: null }

  constructor(private readonly source: ForecastBand) {}

  update() {
    const { chart, series } = this.source
    if (!chart || !series) return
    const timeScale = chart.timeScale()
    const band: Coordinates['band'] = []
    for (const point of this.source.points) {
      const x = timeScale.timeToCoordinate(point.time)
      const lower = series.priceToCoordinate(point.lower)
      const upper = series.priceToCoordinate(point.upper)
      if (x === null || lower === null || upper === null) continue
      band.push({ x, lower, upper })
    }
    const nowX = this.source.now === null ? null : timeScale.timeToCoordinate(this.source.now)
    this.coordinates = { band, nowX }
  }

  zOrder(): PrimitivePaneViewZOrder {
    return 'bottom'
  }

  renderer() {
    return new BandRenderer(this.coordinates, this.source.colors)
  }
}

export class ForecastBand implements ISeriesPrimitive<Time> {
  chart: IChartApiBase<Time> | null = null
  series: ISeriesApi<SeriesType, Time> | null = null
  points: BandPoint[] = []
  now: UTCTimestamp | null = null
  private requestUpdate: (() => void) | null = null
  private readonly view = new BandPaneView(this)

  constructor(readonly colors: BandColors) {}

  attached({ chart, series, requestUpdate }: SeriesAttachedParameter<Time>) {
    this.chart = chart
    this.series = series
    this.requestUpdate = requestUpdate
  }

  detached() {
    this.chart = null
    this.series = null
    this.requestUpdate = null
  }

  setData(points: BandPoint[], now: UTCTimestamp | null) {
    this.points = points
    this.now = now
    this.requestUpdate?.()
  }

  updateAllViews() {
    this.view.update()
  }

  paneViews() {
    return [this.view]
  }

  autoscaleInfo(): AutoscaleInfo | null {
    if (!this.points.length) return null
    return {
      priceRange: {
        minValue: Math.min(...this.points.map((point) => point.lower)),
        maxValue: Math.max(...this.points.map((point) => point.upper)),
      },
    }
  }
}
