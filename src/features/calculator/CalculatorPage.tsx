import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Параметри: біржі, актив, фіат, сума, ціни купівлі й продажу, комісії, поріг ризику',
  'Результат: чистий прибуток, ROI, кількість, Spread, slippage, RR, AI Score',
  'Структура комісій і стакан продавців для розрахунку slippage',
]

export function CalculatorPage() {
  return (
    <>
      <PageHeader
        title="Калькулятор угоди"
        description="Прибуток, комісії, slippage та співвідношення ризик/прибуток для вашої суми"
      />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
