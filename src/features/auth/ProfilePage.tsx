import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  "Особисті дані: ім'я, email, нікнейм у спільноті",
  'Зміна пароля',
  'Комісії бірж для розрахунку Net Spread',
  'Параметри за замовчуванням: пара, банк, сума угоди',
]

export function ProfilePage() {
  return (
    <>
      <PageHeader
        title="Налаштування"
        description="Особисті дані, безпека та параметри розрахунків"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
