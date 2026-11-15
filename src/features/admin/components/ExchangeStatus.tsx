import { isOnline } from '@/features/dashboard/lib'
import type { HealthResponse } from '@/shared/api/types'
import { formatDuration, formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'
import { Card, CardDescription, CardTitle } from '@/shared/ui/card'
import { ExchangeLabel } from '@/shared/ui/exchange-label'
import { Skeleton } from '@/shared/ui/skeleton'

const COMPONENT_LABELS: Record<string, string> = {
  api: 'API',
  db: 'PostgreSQL',
  redis: 'Redis',
}

const LIMITER_LABELS: Record<string, string> = {
  paused: 'Пауза',
  cooldown: 'Кулдаун',
}

interface ExchangeStatusProps {
  health: HealthResponse | undefined
  failed: boolean
  className?: string
}

export function ExchangeStatus({ health, failed, className }: ExchangeStatusProps) {
  const exchanges = health?.exchanges ?? []

  return (
    <Card className={cn('flex flex-col gap-4 p-5', className)}>
      <div className="flex flex-col gap-0.5">
        <CardTitle>Стан бірж</CardTitle>
        <CardDescription>Коли collector востаннє отримав дані й з якою швидкістю</CardDescription>
      </div>

      {failed && !health && (
        <p className="text-caption text-destructive">Не вдалося з'єднатися з API.</p>
      )}
      {!health && !failed && <Skeleton className="h-40 w-full" />}

      {exchanges.length > 0 && (
        <ul className="flex flex-col gap-2.5">
          {exchanges.map((exchange) => {
            const online = isOnline(exchange)
            const limited = exchange.limiter_state ? LIMITER_LABELS[exchange.limiter_state] : null
            return (
              <li key={exchange.exchange} className="flex items-center gap-3">
                <ExchangeLabel exchange={exchange.exchange} className="min-w-0 flex-1" />
                <span className="whitespace-nowrap text-small tabular-nums text-muted-foreground">
                  {exchange.age_sec == null
                    ? 'даних ще немає'
                    : `${formatDuration(exchange.age_sec)} тому`}
                  {exchange.rps != null &&
                    ` · ${formatNumber(exchange.rps, { maxDigits: 1 })} зап/с`}
                </span>
                <Badge variant={online ? 'success' : limited ? 'warning' : 'danger'}>
                  {online ? 'Онлайн' : (limited ?? 'Офлайн')}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}

      {health && (
        <div className="mt-auto flex flex-wrap gap-2 border-t pt-4">
          {Object.entries(health.components).map(([name, component]) => (
            <Badge key={name} variant={component.status === 'ok' ? 'success' : 'danger'}>
              {COMPONENT_LABELS[name] ?? name}: {component.status === 'ok' ? 'працює' : 'помилка'}
            </Badge>
          ))}
        </div>
      )}
    </Card>
  )
}
