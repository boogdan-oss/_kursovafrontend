import { useId, type ReactNode } from 'react'

import {
  DEFAULT_ADVERSE_MOVE_PCT,
  MIN_RR_OPTIONS,
  type CalculatorForm as FormState,
} from '@/features/calculator/lib'
import { usePairOptions } from '@/shared/api/queries/market'
import { paymentLabel, sortPayments } from '@/shared/lib/payments'
import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Card, CardTitle } from '@/shared/ui/card'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Field } from '@/shared/ui/field'
import { NumberInput } from '@/shared/ui/number-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { EXCHANGES } from '@/store/useFiltersStore'

const NONE = 'none'

function Pair({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">{children}</div>
}

interface OptionSelectProps {
  id: string
  value: string | null
  onChange: (value: string | null) => void
  options: readonly string[]
  label: (code: string) => string
  emptyLabel?: string
}

function OptionSelect({ id, value, onChange, options, label, emptyLabel }: OptionSelectProps) {
  return (
    <Select value={value ?? NONE} onValueChange={(next) => onChange(next === NONE ? null : next)}>
      <SelectTrigger id={id}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {emptyLabel && <SelectItem value={NONE}>{emptyLabel}</SelectItem>}
        {options.map((code) => (
          <SelectItem key={code} value={code}>
            {label(code)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

interface CalculatorFormProps {
  form: FormState
  onChange: (patch: Partial<FormState>) => void
  onSubmit: () => void
  error: string | null
  isCalculating: boolean
  className?: string
}

export function CalculatorForm({
  form,
  onChange,
  onSubmit,
  error,
  isCalculating,
  className,
}: CalculatorFormProps) {
  const id = useId()
  const market = form.mode === 'market'
  const { assets, fiats, markets } = usePairOptions(form.asset, form.fiat)
  const exchangeEmpty = market ? undefined : 'Без біржі (без комісій)'

  const methods = new Set<string>(form.payment ? [form.payment] : [])
  for (const item of markets) {
    if (item.asset !== form.asset) continue
    if (item.exchange !== form.buyExchange && item.exchange !== form.sellExchange) continue
    for (const method of item.payment_methods) methods.add(method)
  }
  const banks = sortPayments([...methods])
  const same = (code: string) => code

  return (
    <Card className={className}>
      <form
        className="flex flex-col gap-3.5 p-5"
        onSubmit={(event) => {
          event.preventDefault()
          onSubmit()
        }}
      >
        <div className="flex items-center justify-between gap-3">
          <CardTitle>Параметри угоди</CardTitle>
          <Badge variant="accent">
            {form.asset}/{form.fiat}
          </Badge>
        </div>

        <Pair>
          <Field label="Біржа купівлі" htmlFor={`${id}-buy-exchange`}>
            <OptionSelect
              id={`${id}-buy-exchange`}
              value={form.buyExchange}
              onChange={(buyExchange) => onChange({ buyExchange })}
              options={EXCHANGES}
              label={exchangeName}
              emptyLabel={exchangeEmpty}
            />
          </Field>
          <Field label="Біржа продажу" htmlFor={`${id}-sell-exchange`}>
            <OptionSelect
              id={`${id}-sell-exchange`}
              value={form.sellExchange}
              onChange={(sellExchange) => onChange({ sellExchange })}
              options={EXCHANGES}
              label={exchangeName}
              emptyLabel={exchangeEmpty}
            />
          </Field>
        </Pair>

        <Pair>
          <Field label="Актив" htmlFor={`${id}-asset`}>
            <OptionSelect
              id={`${id}-asset`}
              value={form.asset}
              onChange={(asset) => asset && onChange({ asset })}
              options={assets}
              label={same}
            />
          </Field>
          <Field label="Фіат" htmlFor={`${id}-fiat`}>
            <OptionSelect
              id={`${id}-fiat`}
              value={form.fiat}
              onChange={(fiat) => fiat && onChange({ fiat, payment: null })}
              options={fiats}
              label={same}
            />
          </Field>
        </Pair>

        <Field label="Сума інвестиції" htmlFor={`${id}-investment`}>
          <NumberInput
            id={`${id}-investment`}
            value={form.investment}
            onValueChange={(investment) => onChange({ investment })}
            suffix={form.fiat}
          />
        </Field>

        {market ? (
          <Field label="Спосіб оплати" htmlFor={`${id}-payment`}>
            <OptionSelect
              id={`${id}-payment`}
              value={form.payment}
              onChange={(payment) => onChange({ payment })}
              options={banks}
              label={paymentLabel}
              emptyLabel="Усі способи оплати"
            />
          </Field>
        ) : (
          <Pair>
            <Field label="Ціна купівлі (P_buy)" htmlFor={`${id}-buy-price`}>
              <NumberInput
                id={`${id}-buy-price`}
                value={form.buyPrice}
                onValueChange={(buyPrice) => onChange({ buyPrice })}
                suffix={form.fiat}
              />
            </Field>
            <Field label="Ціна продажу (P_sell)" htmlFor={`${id}-sell-price`}>
              <NumberInput
                id={`${id}-sell-price`}
                value={form.sellPrice}
                onValueChange={(sellPrice) => onChange({ sellPrice })}
                suffix={form.fiat}
              />
            </Field>
          </Pair>
        )}
        <p className="text-small text-muted-foreground">
          {market
            ? 'Ціни беруться з поточних оголошень обраних бірж на вашу суму, разом зі slippage.'
            : 'Ціни задаєте ви. Комісії P2P і виводу рахуються за тарифами обраних бірж.'}
        </p>

        <hr className="border-border" />
        <span className="text-body font-semibold">Комісії та ризик</span>

        <Pair>
          <Field label="Додаткові витрати (банк)" htmlFor={`${id}-extra`}>
            <NumberInput
              id={`${id}-extra`}
              value={form.extraFees}
              onValueChange={(extraFees) => onChange({ extraFees })}
              suffix={form.fiat}
              placeholder="0"
            />
          </Field>
          <Field label="Рух ціни проти угоди" htmlFor={`${id}-adverse`}>
            <NumberInput
              id={`${id}-adverse`}
              value={form.adverseMove}
              onValueChange={(adverseMove) => onChange({ adverseMove })}
              suffix="%"
              placeholder={String(DEFAULT_ADVERSE_MOVE_PCT)}
            />
          </Field>
        </Pair>

        <Field label="Мінімальний RR" htmlFor={`${id}-rr`}>
          <OptionSelect
            id={`${id}-rr`}
            value={String(form.minRr)}
            onChange={(value) => value && onChange({ minRr: Number(value) })}
            options={MIN_RR_OPTIONS.map(String)}
            label={(value) => `${value} : 1`}
          />
        </Field>

        {error && (
          <p role="alert" className="text-caption text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" disabled={isCalculating}>
          {isCalculating ? 'Рахуємо…' : 'Розрахувати'}
        </Button>
      </form>
    </Card>
  )
}
