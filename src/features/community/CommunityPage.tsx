import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Стрічка публікацій з лайками, коментарями й репостами',
  'Прикріплення валютної пари або можливості до публікації',
  'Профілі користувачів і скарги на публікації',
]

export function CommunityPage() {
  return (
    <>
      <PageHeader
        title="Спільнота"
        description="Публікації трейдерів про ринок і знайдені можливості"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
