import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Чат зі стрімінгом відповідей',
  'Підказки: найкращі ціни, поточні можливості, прогноз, ризик продавця',
]

export function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI-асистент"
        description="Пояснення ринку природною мовою на основі живих даних"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
