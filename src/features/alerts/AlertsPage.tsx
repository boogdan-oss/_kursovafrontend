import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Правила сповіщень з умовами й каналами доставки',
  'Історія сповіщень',
  'Watchlist з live-цінами',
  'Підключення Telegram-бота',
]

export function AlertsPage() {
  return (
    <>
      <PageHeader
        title="Сповіщення та Watchlist"
        description="Smart Alerts у застосунку й Telegram · обрані пари з live-цінами"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
