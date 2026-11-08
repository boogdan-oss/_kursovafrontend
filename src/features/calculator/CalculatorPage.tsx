import { PageHeader } from '@/shared/ui/page-header'
import { PagePlaceholder } from '@/shared/ui/page-placeholder'

const PLANNED = [
  'Кількість активу, чистий прибуток, ROI і RR',
  'Комісії та slippage за глибиною оголошень',
  'Оцінка ризику угоди',
]

export function CalculatorPage() {
  return (
    <>
      <PageHeader title="Калькулятор" description="Симулятор угоди для заданої суми інвестиції" />
      <PagePlaceholder planned={PLANNED} />
    </>
  )
}
