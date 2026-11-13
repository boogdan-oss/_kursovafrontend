import { Fragment } from 'react'

import { currencyName, currencyPath, foreignFiats } from '@/features/arbitrage/lib'
import type { Deal, OpportunityItem, OpportunityStep } from '@/shared/api/types'
import { formatCrypto, formatFiat, formatNumber } from '@/shared/lib/format'
import { paymentLabel } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Tag } from '@/shared/ui/tag'

interface StepView {
  title: string
  flow: string | null
  detail: string
  foreignFiat: string | null
}

function cryptoAmount(value: string | null | undefined, asset: string) {
  const size = Math.abs(Number(value))
  const digits = size >= 100 ? 2 : size >= 1 ? 4 : 8
  return formatCrypto(value, asset, { minDigits: 0, maxDigits: digits })
}

function withPayment(text: string, step: OpportunityStep) {
  return step.payment_method ? `${text} · ${paymentLabel(step.payment_method)}` : text
}

function detailedStep(step: OpportunityStep, next: OpportunityStep | undefined, page: string) {
  const exchange = exchangeName(step.exchange)
  if (step.action === 'TRANSFER') {
    const fee = Number(step.amount_in) - Number(step.amount_out)
    return {
      title: `Переказати ${step.asset}: ${exchange} → ${exchangeName(next?.exchange ?? step.exchange)}`,
      flow: `Відправляєте ${cryptoAmount(step.amount_in, step.asset)} → надійде ${cryptoAmount(step.amount_out, step.asset)}`,
      detail: `комісія виводу ${cryptoAmount(String(fee), step.asset)}`,
      foreignFiat: null,
    }
  }
  const fiat = step.fiat ?? page
  const fiatMoney = (value: string | null | undefined) => formatFiat(value, fiat)
  const buying = step.action === 'BUY'
  const flow = buying
    ? `Віддаєте ${fiatMoney(step.amount_in)} → отримуєте ${cryptoAmount(step.amount_out, step.asset)}`
    : `Віддаєте ${cryptoAmount(step.amount_in, step.asset)} → отримуєте ${fiatMoney(step.amount_out)}`
  return {
    title: `${buying ? 'Купити' : 'Продати'} ${step.asset} за ${fiat} · ${exchange} P2P`,
    flow,
    detail: withPayment(`курс ${fiatMoney(step.price)} за 1 ${step.asset}`, step),
    foreignFiat: fiat !== page ? fiat : null,
  }
}

function legacyStep(
  step: OpportunityStep,
  index: number,
  opportunity: OpportunityItem,
  deal: Deal | undefined,
): StepView {
  const { steps, fiat } = opportunity
  const chain = opportunity.kind === 'chain'
  const exchange = exchangeName(step.exchange)
  if (step.action === 'TRANSFER') {
    const target = exchangeName(steps[index + 1]?.exchange ?? opportunity.sell_exchange)
    const fee = deal ? Number(deal.quantity) - Number(deal.sell_quantity) : null
    return {
      title: `Переказ ${exchange} → ${target}`,
      flow: null,
      detail:
        fee === null
          ? 'комісія виводу врахована в Net %'
          : `комісія виводу ${formatCrypto(fee, step.asset, { minDigits: 0 })}`,
      foreignFiat: null,
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
    flow: null,
    detail: withPayment(`ціна ${price}`, step),
    foreignFiat: null,
  }
}

function describeSteps(opportunity: OpportunityItem, deal?: Deal): StepView[] {
  const { steps } = opportunity
  return steps.map((step, index) => {
    const detailed =
      step.amount_in != null && step.amount_out != null && (step.fiat || step.action === 'TRANSFER')
    return detailed
      ? detailedStep(step, steps[index + 1], opportunity.fiat)
      : legacyStep(step, index, opportunity, deal)
  })
}

function CurrencyRoute({ opportunity }: { opportunity: OpportunityItem }) {
  const path = currencyPath(opportunity)
  if (!path || path.length < 3) return null
  const foreign = new Set(foreignFiats(opportunity))
  return (
    <p
      aria-label="Маршрут грошей"
      className="flex flex-wrap items-center gap-1.5 border-b px-3 py-2 font-mono text-ui"
    >
      {path.map((code, index) => (
        <Fragment key={index}>
          {index > 0 && <span className="text-tertiary">→</span>}
          <span className={cn(foreign.has(code) && 'font-semibold text-warning')}>{code}</span>
        </Fragment>
      ))}
    </p>
  )
}

export function ForeignCurrencyNote({ opportunity }: { opportunity: OpportunityItem }) {
  const foreign = foreignFiats(opportunity)
  if (foreign.length > 0) {
    const names = foreign.map((code) => `${currencyName(code)} (${code})`).join(', ')
    return (
      <p className="border-b px-3 py-2 text-meta text-warning">
        Потрібні банківські рахунки у валютах: {names}. Без них цей ланцюжок не пройти. Перед угодою
        перевірте ліміти оголошень на кожному кроці.
      </p>
    )
  }
  if (opportunity.kind !== 'chain') return null
  const known = currencyPath(opportunity) !== null
  return (
    <p className="border-b px-3 py-2 text-meta text-warning">
      {known
        ? `Усі кроки в ${opportunity.fiat}; потрібні акаунти на біржах ланцюжка.`
        : 'Для такої угоди потрібні рахунки в усіх валютах ланцюжка.'}
    </p>
  )
}

interface ChainDetailsProps {
  opportunity: OpportunityItem
  deal?: Deal
}

export function ChainDetails({ opportunity, deal }: ChainDetailsProps) {
  return (
    <>
      <CurrencyRoute opportunity={opportunity} />
      <ol className="flex flex-col">
        {describeSteps(opportunity, deal).map((step, index) => (
          <li key={index} className="flex gap-2.5 border-b px-3 py-2">
            <span className="font-mono text-ui-lg font-semibold text-primary">{index + 1}</span>
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="flex flex-wrap items-center gap-1.5 text-ui-lg font-semibold">
                {step.title}
                {step.foreignFiat && <Tag tone="warning">інша валюта · {step.foreignFiat}</Tag>}
              </span>
              {step.flow && <span className="font-mono text-ui">{step.flow}</span>}
              <span className="text-meta text-muted-foreground">{step.detail}</span>
            </div>
          </li>
        ))}
      </ol>
    </>
  )
}
