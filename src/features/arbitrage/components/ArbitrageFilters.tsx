import { useId } from 'react'

import {
  KIND_FILTERS,
  KIND_TAB_LABELS,
  type KindFilter,
  type Thresholds,
} from '@/features/arbitrage/lib'
import { usePairOptions } from '@/shared/api/queries/market'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Chip } from '@/shared/ui/chip'
import { Field } from '@/shared/ui/field'
import { NumberInput } from '@/shared/ui/number-input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { useFiltersStore } from '@/store/useFiltersStore'

interface ArbitrageFiltersProps {
  kind: KindFilter
  onKindChange: (kind: KindFilter) => void
  counts: Record<KindFilter, number>
  chainsLoading: boolean
  thresholds: Thresholds
  onMinVolumeChange: (value: number | null) => void
  onLiquidOnlyChange: (value: boolean) => void
  onReset: () => void
}

export function ArbitrageFilters({
  kind,
  onKindChange,
  counts,
  chainsLoading,
  thresholds,
  onMinVolumeChange,
  onLiquidOnlyChange,
  onReset,
}: ArbitrageFiltersProps) {
  const id = useId()
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const amount = useFiltersStore((state) => state.amount)
  const setPair = useFiltersStore((state) => state.setPair)
  const setBank = useFiltersStore((state) => state.setBank)
  const setAmount = useFiltersStore((state) => state.setAmount)
  const setMinSpread = useFiltersStore((state) => state.setMinSpread)
  const setMinAiScore = useFiltersStore((state) => state.setMinAiScore)

  const { assets, fiats } = usePairOptions(asset, fiat)

  function tabLabel(value: KindFilter) {
    const count = chainsLoading && value === 'chain' ? '…' : counts[value]
    return `${KIND_TAB_LABELS[value]} · ${count}`
  }

  return (
    <Card className="flex flex-col gap-4 p-5">
      <div className="flex flex-wrap items-end gap-4">
        <Field label="Тип">
          <Tabs value={kind} onValueChange={(value) => onKindChange(value as KindFilter)}>
            <TabsList className="h-auto min-h-10 flex-wrap justify-start">
              {KIND_FILTERS.map((value) => (
                <TabsTrigger key={value} value={value} className="h-8">
                  {tabLabel(value)}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </Field>

        <Field label="Мін. Net %" htmlFor={`${id}-net`} className="w-[120px]">
          <NumberInput
            id={`${id}-net`}
            value={thresholds.minNet || null}
            onValueChange={(value) => setMinSpread(value ?? 0)}
            suffix="%"
            placeholder="0"
          />
        </Field>

        <Field label="Мін. AI Score" htmlFor={`${id}-score`} className="w-[120px]">
          <NumberInput
            id={`${id}-score`}
            value={thresholds.minAiScore || null}
            onValueChange={(value) => setMinAiScore(value ?? 0)}
            max={100}
            integer
            placeholder="0"
          />
        </Field>

        <Field label="Мін. обсяг" htmlFor={`${id}-volume`} className="w-[140px]">
          <NumberInput
            id={`${id}-volume`}
            value={thresholds.minVolume}
            onValueChange={onMinVolumeChange}
            suffix={asset}
            placeholder="будь-який"
          />
        </Field>

        <Field label="Сума угоди" htmlFor={`${id}-amount`} className="w-[150px]">
          <NumberInput
            id={`${id}-amount`}
            value={amount}
            onValueChange={setAmount}
            suffix={fiat}
            placeholder="типова"
          />
        </Field>

        <div className="ml-auto flex h-10 items-center gap-2">
          <Switch
            id={`${id}-liquid`}
            checked={thresholds.liquidOnly}
            onCheckedChange={onLiquidOnlyChange}
          />
          <label htmlFor={`${id}-liquid`} className="cursor-pointer text-caption">
            Тільки ліквідні
          </label>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
        <span className="text-caption text-muted-foreground">Пара:</span>
        <div className="flex flex-wrap gap-1.5">
          {assets.map((code) => (
            <Chip key={code} active={code === asset} onClick={() => setPair(code, fiat)}>
              {code}
            </Chip>
          ))}
        </div>
        <Select
          value={fiat}
          onValueChange={(value) => {
            setPair(asset, value)
            setBank(null)
          }}
        >
          <SelectTrigger className="h-8 w-[100px]" aria-label="Фіат">
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

        <Button variant="ghost" className="ml-auto" onClick={onReset}>
          Скинути фільтри
        </Button>
      </div>
    </Card>
  )
}
