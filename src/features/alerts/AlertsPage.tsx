import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Правила: мін. Spread, Net Spread, AI Score, RR, чистий прибуток',
  'Канали: в застосунку, Telegram, email',
  'Історія сповіщень і Watchlist',
]

export function AlertsPage() {
  return (
    <>
      <PageHeader title="Сповіщення" description="Smart Alerts і обрані пари" />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
