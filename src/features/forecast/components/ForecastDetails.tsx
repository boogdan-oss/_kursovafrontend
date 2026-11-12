import { HORIZON_LABELS, MODEL_STATUS } from '@/features/forecast/lib'
import type { ForecastHorizon, ForecastModel, ForecastResponse } from '@/shared/api/forecast-types'
import { formatDate, formatFiat, formatNumber, formatShortTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'

function EmptyText({ children }: { children: string }) {
  return <p className="px-5 pb-5 text-caption text-muted-foreground">{children}</p>
}

export function FeatureImportance({ forecast }: { forecast: ForecastResponse | undefined }) {
  const features = forecast?.features ?? []
  const max = Math.max(1, ...features.map((feature) => Number(feature.importance_pct)))

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Що впливає на прогноз</CardTitle>
        <CardDescription>Важливість ознак у моделі</CardDescription>
      </CardHeader>
      {!forecast ? (
        <div className="flex flex-col gap-3 px-5 pb-5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-4 w-full" />
          ))}
        </div>
      ) : features.length === 0 ? (
        <EmptyText>Модель не повідомляє важливість ознак</EmptyText>
      ) : (
        <ul className="flex flex-col gap-3 px-5 pb-5">
          {features.map((feature) => (
            <li key={feature.name} className="flex items-center gap-3">
              <span className="w-[190px] shrink-0 truncate text-caption">{feature.name}</span>
              <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <span
                  className="block h-full rounded-full bg-primary"
                  style={{ width: `${(Number(feature.importance_pct) / max) * 100}%` }}
                />
              </span>
              <span className="w-10 shrink-0 text-right text-caption font-semibold tabular-nums">
                {formatNumber(feature.importance_pct, { maxDigits: 0 })}%
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

interface BacktestTableProps {
  forecast: ForecastResponse | undefined
  horizon: ForecastHorizon
}

export function BacktestTable({ forecast, horizon }: BacktestTableProps) {
  const rows = forecast?.backtest ?? []
  const mae = forecast?.mae == null ? null : Number(forecast.mae)

  return (
    <Card className="flex flex-col overflow-hidden">
      <CardHeader>
        <CardTitle>Прогноз vs факт</CardTitle>
        <CardDescription>Останні перевірки з горизонтом {HORIZON_LABELS[horizon]}</CardDescription>
      </CardHeader>
      {forecast && rows.length === 0 ? (
        <EmptyText>Ще немає перевірок: замало історії для цього горизонту</EmptyText>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Час</TableHead>
              <TableHead className="text-right">Прогноз</TableHead>
              <TableHead className="text-right">Факт</TableHead>
              <TableHead className="text-right">Похибка</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {!forecast
              ? Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index} className="hover:bg-transparent">
                    <TableCell colSpan={4}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  </TableRow>
                ))
              : rows.map((row) => (
                  <TableRow key={row.time} className="text-caption tabular-nums">
                    <TableCell>{formatShortTime(row.time)}</TableCell>
                    <TableCell className="text-right">
                      {formatNumber(row.predicted, { minDigits: 2, maxDigits: 4 })}
                    </TableCell>
                    <TableCell className="text-right">
                      {formatNumber(row.actual, { minDigits: 2, maxDigits: 4 })}
                    </TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-semibold',
                        mae !== null && Number(row.error) <= mae ? 'text-success' : 'text-warning',
                      )}
                    >
                      {formatNumber(row.error, { minDigits: 2, maxDigits: 4 })}
                    </TableCell>
                  </TableRow>
                ))}
          </TableBody>
        </Table>
      )}
    </Card>
  )
}

function modelSubtitle(model: ForecastModel, fiat: string) {
  const parts: string[] = []
  if (model.mae !== null) parts.push(`MAE ${formatFiat(model.mae, fiat, { maxDigits: 4 })}`)
  if (model.trained_at) {
    parts.push(`навчена ${formatDate(model.trained_at)} ${formatShortTime(model.trained_at)}`)
  }
  if (model.description) parts.push(model.description)
  return parts.join(' · ')
}

interface ModelListProps {
  models: ForecastModel[] | undefined
  isError: boolean
  fiat: string
}

export function ModelList({ models, isError, fiat }: ModelListProps) {
  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Моделі</CardTitle>
        <CardDescription>Нова версія активується, лише якщо її MAE краща</CardDescription>
      </CardHeader>
      {isError ? (
        <EmptyText>Список моделей недоступний</EmptyText>
      ) : !models ? (
        <div className="flex flex-col gap-3 px-5 pb-5">
          {Array.from({ length: 4 }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (
        <ul className="flex flex-col px-5 pb-2">
          {models.map((model) => {
            const status = MODEL_STATUS[model.status]
            return (
              <li key={model.name} className="flex items-center gap-3 border-b py-3 last:border-0">
                <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                  <span className="text-caption font-semibold">{model.name}</span>
                  <span className="text-small text-muted-foreground">
                    {modelSubtitle(model, fiat)}
                  </span>
                </div>
                <Badge variant={status.variant}>{status.label}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
