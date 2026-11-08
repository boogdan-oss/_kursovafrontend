import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Список можливостей: чистий прибуток у %, доступний обсяг, AI Score',
  'Кроки ланцюжка: біржа, дія, актив, ціна, банк',
  'Розклад комісій: P2P, виведення, мережа',
]

export function ArbitragePage() {
  return (
    <>
      <PageHeader title="Арбітраж" description="Міжбіржові можливості та ланцюжки угод" />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
