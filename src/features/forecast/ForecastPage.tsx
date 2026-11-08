import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Графік: факт проти прогнозу з інтервалом довіри',
  'Метрики моделі: MAE, MAPE, порівняння з бейзлайном',
  'Вибір пари та горизонту прогнозу',
]

export function ForecastPage() {
  return (
    <>
      <PageHeader title="Прогноз" description="AI-прогноз ціни та спреду на 15–60 хвилин" />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
