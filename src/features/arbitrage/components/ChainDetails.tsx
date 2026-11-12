import type { Deal, OpportunityItem, OpportunityStep } from '@/shared/api/types'
import { formatCrypto, formatFiat, formatNumber } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { exchangeName } from '@/shared/ui/exchange-label'

interface StepText {
  title: string
  detail: string
}

function tradeDetail(step: OpportunityStep, price: string) {
  return step.payment_method
    ? `ціна ${price} · ${paymentLabel(step.payment_method)}`
    : `ціна ${price}`
}

function describeSteps(opportunity: OpportunityItem, deal: Deal | undefined): StepText[] {
  const { steps, fiat } = opportunity
  const chain = opportunity.kind === 'chain'

  return steps.map((step, index) => {
    const exchange = exchangeName(step.exchange)
    if (step.action === 'TRANSFER') {
      const target = exchangeName(steps[index + 1]?.exchange ?? opportunity.sell_exchange)
      const fee = deal ? Number(deal.quantity) - Number(deal.sell_quantity) : null
      return {
        title: `Переказ ${exchange} → ${target}`,
        detail:
          fee === null
            ? 'комісія виводу врахована в Net %'
            : `комісія виводу ${formatCrypto(fee, step.asset, { minDigits: 0 })}`,
      }
    }

    const buying = step.action === 'BUY'
    const inPageFiat = !chain || index === 0 || index === steps.length - 1
    const price = inPageFiat
      ? formatFiat(step.price, fiat)
      : `${formatNumber(step.price, { minDigits: 2 })} в іншій валюті`
    const quantity = deal && !chain ? (buying ? deal.quantity : deal.sell_quantity) : null
    const amount =
      quantity === null ? step.asset : formatCrypto(quantity, step.asset, { maxDigits: 2 })
    return {
      title: `${buying ? 'Купити' : 'Продати'} ${amount} · ${exchange} P2P`,
      detail: tradeDetail(step, price),
    }
  })
}

interface ChainDetailsProps {
  opportunity: OpportunityItem
  deal?: Deal
}

export function ChainDetails({ opportunity, deal }: ChainDetailsProps) {
  return (
    <ol className="flex flex-col">
      {describeSteps(opportunity, deal).map((step, index) => (
        <li key={index} className="flex gap-2.5 border-b px-3 py-2">
          <span className="font-mono text-ui-lg font-semibold text-primary">{index + 1}</span>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="text-ui-lg font-semibold">{step.title}</span>
            <span className="text-meta text-muted-foreground">{step.detail}</span>
          </div>
        </li>
      ))}
    </ol>
  )
}
