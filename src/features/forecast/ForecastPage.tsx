import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Показники: поточна ціна, прогноз, інтервал довіри, MAE, порівняння з бейзлайном',
  'Графік «факт і прогноз» з інтервалом довіри',
  'Важливість ознак, таблиця «прогноз vs факт», список моделей',
]

export function ForecastPage() {
  return (
    <>
      <PageHeader
        title="AI-прогноз ціни"
        description="Прогноз на 15–60 хв на основі історії ринку"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
