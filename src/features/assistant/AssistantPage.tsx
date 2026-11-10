import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Історія чатів',
  'Чат зі стрімінгом відповідей; цифри — лише з live-даних через інструменти',
  'Підказки: порівняти комісії бірж, оцінити ризик продавця, щоденний огляд ринку',
]

export function AssistantPage() {
  return (
    <>
      <PageHeader
        title="AI-асистент"
        description="Відповідає українською на основі live-даних ринку"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
