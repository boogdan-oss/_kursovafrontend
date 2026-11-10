import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Фільтри: купівля чи продаж, актив, фіат, сума, банк, біржі, тільки перевірені продавці',
  'Підсумок: найкраща ціна, медіана топ-5, спред купівлі й продажу, ризиковані оголошення',
  'Таблиця: продавець, біржа, ціна, доступний обсяг і ліміти, способи оплати, ризик AI',
]

export function OffersPage() {
  return (
    <>
      <PageHeader
        title="Сканер P2P-оголошень"
        description="Оголошення з Binance, Bybit та OKX з фільтрами за банком, сумою й рейтингом"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
