import { useHealth, usePing } from '@/features/dashboard/hooks'
import { formatTime } from '@/shared/lib/format'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'
import { Skeleton } from '@/shared/ui/skeleton'

const COMPONENT_LABELS: Record<string, string> = {
  api: 'API',
  db: 'PostgreSQL',
  redis: 'Redis',
}

const PLANNED = [
  'Вибір пари, банку й суми угоди',
  'Показники: активні можливості, найкращий спред, найкращий AI Score, біржі онлайн, сповіщення',
  'Графік ціни купівлі по біржах і таблиця ефективних цін',
  'Топ-3 можливості, AI-висновок і популярне в спільноті',
]

export function DashboardPage() {
  const health = useHealth()
  const ping = usePing()

  return (
    <>
      <PageHeader
        title="Огляд ринку"
        description="Ціни, спреди й можливості на P2P-біржах Binance, Bybit та OKX"
      />
      <PagePlaceholder planned={PLANNED} />

      <Card>
        <CardHeader className="flex-row items-center justify-between space-y-0">
          <CardTitle>Стан системи</CardTitle>
          {health.data && (
            <span className="text-xs text-muted-foreground">
              оновлено о {formatTime(health.data.time)}
            </span>
          )}
        </CardHeader>
        <CardContent>
          {health.isPending && (
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.keys(COMPONENT_LABELS).map((name) => (
                <Skeleton key={name} className="h-20" />
              ))}
            </div>
          )}
          {health.isError && (
            <p className="text-sm text-destructive">
              Не вдалося з'єднатися з API. Перевірте, чи запущений бекенд на порту 8000.
            </p>
          )}
          {health.data && (
            <div className="grid gap-3 sm:grid-cols-3">
              {Object.entries(health.data.components).map(([name, component]) => (
                <div key={name} className="rounded-lg border bg-background/60 p-4">
                  <div className="text-sm text-muted-foreground">
                    {COMPONENT_LABELS[name] ?? name}
                  </div>
                  <Badge
                    variant={component.status === 'ok' ? 'success' : 'danger'}
                    className="mt-2"
                  >
                    {component.status === 'ok' ? 'Працює' : 'Помилка'}
                  </Badge>
                  {component.detail && (
                    <div className="mt-2 text-xs text-muted-foreground">{component.detail}</div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Перевірка з'єднання</CardTitle>
          <CardDescription>
            Надсилає запит <code className="text-primary">GET /api/v1/ping</code> на бекенд. Той
            самий ендпоінт можна викликати у Swagger:{' '}
            <a
              href="/docs"
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              /docs
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-4">
          <Button onClick={() => ping.mutate()} disabled={ping.isPending}>
            {ping.isPending ? 'Надсилаємо…' : 'Надіслати ping'}
          </Button>
          {ping.data && (
            <span className="text-sm text-success">
              Відповідь: {ping.data.message} ({formatTime(ping.data.time)})
            </span>
          )}
          {ping.isError && (
            <span className="text-sm text-destructive">Немає відповіді від API</span>
          )}
        </CardContent>
      </Card>
    </>
  )
}
