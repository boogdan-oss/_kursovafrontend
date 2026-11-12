import { useId } from 'react'

import {
  MIN_COMPLETION_RATE,
  MIN_ORDERS_30D,
  type MerchantFilters,
  type Side,
} from '@/features/offers/lib'
import { usePairOptions } from '@/shared/api/queries/market'
import { formatRatio } from '@/shared/lib/format'
import { paymentLabel, sortPayments } from '@/shared/lib/payments'
import { Button } from '@/shared/ui/button'
import { CheckChip } from '@/shared/ui/check-chip'
import { exchangeName } from '@/shared/ui/exchange-label'
import { NumberInput } from '@/shared/ui/number-input'
import { FieldLabel, Panel, SectionLabel } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const ANY_BANK = 'all'
const CONTROL = 'h-7 rounded-sm border-border-strong bg-elevated px-2.5 text-ui'
const SIDE_OPTIONS: { value: Side; label: string }[] = [
  { value: 'BUY', label: 'Купити' },
  { value: 'SELL', label: 'Продати' },
]

interface OffersFiltersProps {
  side: Side
  onSideChange: (side: Side) => void
  merchantFilters: MerchantFilters
  onMerchantFiltersChange: (filters: MerchantFilters) => void
  onReset: () => void
}

export function OffersFilters({
  side,
  onSideChange,
  merchantFilters,
  onMerchantFiltersChange,
  onReset,
}: OffersFiltersProps) {
  const id = useId()
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const bank = useFiltersStore((state) => state.bank)
  const amount = useFiltersStore((state) => state.amount)
  const exchanges = useFiltersStore((state) => state.exchanges)
  const setPair = useFiltersStore((state) => state.setPair)
  const setBank = useFiltersStore((state) => state.setBank)
  const setAmount = useFiltersStore((state) => state.setAmount)
  const toggleExchange = useFiltersStore((state) => state.toggleExchange)

  const { assets, fiats, markets } = usePairOptions(asset, fiat)

  const methods = new Set<string>(bank ? [bank] : [])
  for (const market of markets) {
    if (market.asset !== asset || !(exchanges as string[]).includes(market.exchange)) continue
    for (const method of market.payment_methods) methods.add(method)
  }
  const banks = sortPayments([...methods])

  const withPair = new Set(
    markets.filter((market) => market.asset === asset).map((market) => market.exchange),
  )
  const assetOptions = [...new Set([asset, ...assets])].map((code) => ({
    value: code,
    label: code,
  }))

  return (
    <Panel className="flex flex-wrap items-end gap-x-3.5 gap-y-3 px-3 py-3">
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Дія</SectionLabel>
        <Segmented value={side} onValueChange={onSideChange} options={SIDE_OPTIONS} label="Дія" />
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Актив</SectionLabel>
        <Segmented
          value={asset}
          onValueChange={(code) => setPair(code, fiat)}
          options={assetOptions}
          label="Актив"
        />
      </div>

      <div className="flex w-[84px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-fiat`}>Фіат</FieldLabel>
        <Select
          value={fiat}
          onValueChange={(value) => {
            setPair(asset, value)
            setBank(null)
          }}
        >
          <SelectTrigger id={`${id}-fiat`} className={`${CONTROL} font-mono`}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[...new Set([fiat, ...fiats])].map((code) => (
              <SelectItem key={code} value={code}>
                {code}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex w-[110px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-amount`}>Сума, {fiat}</FieldLabel>
        <NumberInput
          id={`${id}-amount`}
          value={amount}
          onValueChange={setAmount}
          placeholder="будь-яка"
          className={`${CONTROL} font-mono`}
        />
      </div>

      <div className="flex w-[190px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-bank`}>Банк</FieldLabel>
        <Select
          value={bank ?? ANY_BANK}
          onValueChange={(value) => setBank(value === ANY_BANK ? null : value)}
        >
          <SelectTrigger id={`${id}-bank`} className={CONTROL}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY_BANK}>Усі способи оплати</SelectItem>
            {banks.map((code) => (
              <SelectItem key={code} value={code}>
                {paymentLabel(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Біржі</SectionLabel>
        <div className="flex flex-wrap gap-1">
          {EXCHANGES.map((code) => {
            const unavailable = withPair.size > 0 && !withPair.has(code)
            return (
              <CheckChip
                key={code}
                checked={exchanges.includes(code) && !unavailable}
                disabled={unavailable}
                title={
                  unavailable ? `${exchangeName(code)} не збирає пару ${asset}/${fiat}` : undefined
                }
                onClick={() => toggleExchange(code)}
              >
                {exchangeName(code)}
              </CheckChip>
            )
          })}
        </div>
      </div>

      <div className="flex h-7 items-center gap-2">
        <Switch
          id={`${id}-rate`}
          checked={merchantFilters.minRate}
          onCheckedChange={(minRate) => onMerchantFiltersChange({ ...merchantFilters, minRate })}
        />
        <label htmlFor={`${id}-rate`} className="cursor-pointer text-ui text-muted-foreground">
          Виконання від {formatRatio(MIN_COMPLETION_RATE)}
        </label>
      </div>

      <div className="flex h-7 items-center gap-2">
        <Switch
          id={`${id}-orders`}
          checked={merchantFilters.minOrders}
          onCheckedChange={(minOrders) =>
            onMerchantFiltersChange({ ...merchantFilters, minOrders })
          }
        />
        <label htmlFor={`${id}-orders`} className="cursor-pointer text-ui text-muted-foreground">
          Мін. {MIN_ORDERS_30D} угод
        </label>
      </div>

      <Button variant="secondary" size="terminal" className="ml-auto" onClick={onReset}>
        Скинути
      </Button>
    </Panel>
  )
}
