import { Check, Info } from 'lucide-react'
import { useEffect, useId, useState } from 'react'

import { MIN_COMPLETION_RATE, MIN_ORDERS_30D, type Side } from '@/features/offers/lib'
import { useMarkets } from '@/shared/api/queries/market'
import { formatRatio } from '@/shared/lib/format'
import { paymentLabel, sortPayments } from '@/shared/lib/payments'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Chip } from '@/shared/ui/chip'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Field } from '@/shared/ui/field'
import { Input } from '@/shared/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const PREFERRED_ASSETS = ['USDT', 'BTC', 'ETH', 'USDC', 'BNB', 'SOL']
const ANY_BANK = 'all'
const AMOUNT_DEBOUNCE_MS = 500

function parseAmount(text: string): number | null {
  const normalized = text.split(' ').join('').replace(',', '.')
  if (!normalized) return null
  const value = Number(normalized)
  return Number.isFinite(value) && value > 0 ? value : null
}

function AmountInput({ id, fiat }: { id: string; fiat: string }) {
  const amount = useFiltersStore((state) => state.amount)
  const setAmount = useFiltersStore((state) => state.setAmount)
  const [text, setText] = useState(amount === null ? '' : String(amount))

  if (parseAmount(text) !== amount && document.activeElement?.id !== id) {
    setText(amount === null ? '' : String(amount))
  }

  useEffect(() => {
    const parsed = parseAmount(text)
    if (parsed === amount) return
    const timer = setTimeout(() => setAmount(parsed), AMOUNT_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [text, amount, setAmount])

  return (
    <div className="relative">
      <Input
        id={id}
        inputMode="decimal"
        autoComplete="off"
        placeholder="будь-яка"
        value={text}
        onChange={(event) => setText(event.target.value)}
        onBlur={() => setAmount(parseAmount(text))}
        className="pr-12 tabular-nums"
      />
      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-small text-muted-foreground">
        {fiat}
      </span>
    </div>
  )
}

interface OffersFiltersProps {
  side: Side
  onSideChange: (side: Side) => void
  reliableOnly: boolean
  onReliableOnlyChange: (value: boolean) => void
  onReset: () => void
}

export function OffersFilters({
  side,
  onSideChange,
  reliableOnly,
  onReliableOnlyChange,
  onReset,
}: OffersFiltersProps) {
  const id = useId()
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const bank = useFiltersStore((state) => state.bank)
  const exchanges = useFiltersStore((state) => state.exchanges)
  const setPair = useFiltersStore((state) => state.setPair)
  const setBank = useFiltersStore((state) => state.setBank)
  const toggleExchange = useFiltersStore((state) => state.toggleExchange)

  const fiatMarkets = useMarkets({ fiat })
  const assetMarkets = useMarkets({ asset })

  const available = fiatMarkets.data?.assets ?? []
  const assets = [
    ...PREFERRED_ASSETS.filter((code) => available.includes(code)),
    ...(PREFERRED_ASSETS.includes(asset) && available.includes(asset) ? [] : [asset]),
  ]
  const uniqueAssets = [...new Set(assets)]

  const fiats = [...new Set([fiat, ...(assetMarkets.data?.fiats ?? [])])].sort()

  const methods = new Set<string>(bank ? [bank] : [])
  for (const market of fiatMarkets.data?.items ?? []) {
    if (market.asset !== asset || !(exchanges as string[]).includes(market.exchange)) continue
    for (const method of market.payment_methods) methods.add(method)
  }
  const banks = sortPayments([...methods])

  const withPair = new Set(
    (fiatMarkets.data?.items ?? [])
      .filter((market) => market.asset === asset)
      .map((market) => market.exchange),
  )

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Дія">
          <Tabs value={side} onValueChange={(value) => onSideChange(value as Side)}>
            <TabsList>
              <TabsTrigger value="BUY">Купити</TabsTrigger>
              <TabsTrigger value="SELL">Продати</TabsTrigger>
            </TabsList>
          </Tabs>
        </Field>

        <Field label="Актив">
          <div className="flex h-10 flex-wrap items-center gap-1.5">
            {uniqueAssets.map((code) => (
              <Chip key={code} active={code === asset} onClick={() => setPair(code, fiat)}>
                {code}
              </Chip>
            ))}
          </div>
        </Field>

        <Field label="Фіат" htmlFor={`${id}-fiat`} className="w-[110px]">
          <Select
            value={fiat}
            onValueChange={(value) => {
              setPair(asset, value)
              setBank(null)
            }}
          >
            <SelectTrigger id={`${id}-fiat`}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {fiats.map((code) => (
                <SelectItem key={code} value={code}>
                  {code}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>

        <Field label="Сума" htmlFor={`${id}-amount`} className="w-[160px]">
          <AmountInput id={`${id}-amount`} fiat={fiat} />
        </Field>

        <Field label="Банк" htmlFor={`${id}-bank`} className="min-w-[200px] flex-1">
          <Select
            value={bank ?? ANY_BANK}
            onValueChange={(value) => setBank(value === ANY_BANK ? null : value)}
          >
            <SelectTrigger id={`${id}-bank`}>
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
        </Field>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="text-caption text-muted-foreground">Біржі:</span>
        <div className="flex flex-wrap gap-1.5">
          {EXCHANGES.map((code) => {
            const unavailable = withPair.size > 0 && !withPair.has(code)
            const active = exchanges.includes(code) && !unavailable
            return (
              <Chip
                key={code}
                active={active}
                disabled={unavailable}
                title={
                  unavailable ? `${exchangeName(code)} не збирає пару ${asset}/${fiat}` : undefined
                }
                onClick={() => toggleExchange(code)}
              >
                {active && <Check strokeWidth={3} />}
                {exchangeName(code)}
              </Chip>
            )
          })}
        </div>

        <span className="hidden h-6 w-px bg-border sm:block" aria-hidden />

        <div className="flex items-center gap-2">
          <Switch
            id={`${id}-reliable`}
            checked={reliableOnly}
            onCheckedChange={onReliableOnlyChange}
          />
          <label htmlFor={`${id}-reliable`} className="cursor-pointer text-caption">
            Тільки надійні продавці
          </label>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                type="button"
                className="rounded-full text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Кого вважаємо надійним продавцем"
              >
                <Info className="size-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              Від {MIN_ORDERS_30D} угод за 30 днів і від {formatRatio(MIN_COMPLETION_RATE)}{' '}
              завершених
            </TooltipContent>
          </Tooltip>
        </div>

        <Button variant="ghost" className="ml-auto" onClick={onReset}>
          Скинути фільтри
        </Button>
      </div>
    </Card>
  )
}
