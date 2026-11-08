import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Таблиця: пара, біржа купівлі й продажу, Spread, Net Spread, RR, обсяг, AI Score, ризик',
  'Фільтри: мін. Spread, Net Spread, AI Score, RR, обсяг, сума інвестиції, біржі, актив, фіат, спосіб оплати',
  'Приховування низьколіквідних оголошень і сортування за будь-якою колонкою',
]

export function OffersPage() {
  return (
    <>
      <PageHeader
        title="Market Scanner"
        description="P2P-оголошення і спреди по всіх парах та біржах"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
