import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Фільтри: тип можливості, мін. Net %, мін. AI Score, мін. обсяг, сума угоди',
  'Таблиця активних можливостей і деталі: кроки угоди, комісії, чистий прибуток, ROI',
  'Історія можливостей і тривалість їх існування',
]

export function ArbitragePage() {
  return (
    <>
      <PageHeader
        title="Арбітражні можливості"
        description="Міжбіржові угоди, спред усередині біржі та ланцюжки · з урахуванням усіх комісій"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
