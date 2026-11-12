import { useId } from 'react'

import {
  KIND_FILTERS,
  KIND_TAB_LABELS,
  type KindFilter,
  type Thresholds,
} from '@/features/arbitrage/lib'
import { Button } from '@/shared/ui/button'
import { CheckChip } from '@/shared/ui/check-chip'
import { exchangeName } from '@/shared/ui/exchange-label'
import { NumberInput } from '@/shared/ui/number-input'
import { FieldLabel, Panel, SectionLabel } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'
import { Switch } from '@/shared/ui/switch'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const INPUT = 'h-7 rounded-sm border-border-strong bg-elevated px-2.5 font-mono text-ui'

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
  const exchanges = useFiltersStore((state) => state.exchanges)
  const setAmount = useFiltersStore((state) => state.setAmount)
  const setMinSpread = useFiltersStore((state) => state.setMinSpread)
  const setMinAiScore = useFiltersStore((state) => state.setMinAiScore)
  const toggleExchange = useFiltersStore((state) => state.toggleExchange)

  const kindOptions = KIND_FILTERS.map((value) => ({
    value,
    label: `${KIND_TAB_LABELS[value]} · ${chainsLoading && value === 'chain' ? '…' : counts[value]}`,
  }))

  return (
    <Panel className="flex flex-wrap items-end gap-x-3.5 gap-y-3 px-3 py-3">
      <div className="flex flex-col gap-1.5">
        <SectionLabel>Тип</SectionLabel>
        <Segmented value={kind} onValueChange={onKindChange} options={kindOptions} label="Тип" />
      </div>

      <div className="flex w-[86px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-net`}>Мін. Net, %</FieldLabel>
        <NumberInput
          id={`${id}-net`}
          value={thresholds.minNet || null}
          onValueChange={(value) => setMinSpread(value ?? 0)}
          placeholder="0"
          className={INPUT}
        />
      </div>

      <div className="flex w-[86px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-score`}>Мін. AI Score</FieldLabel>
        <NumberInput
          id={`${id}-score`}
          value={thresholds.minAiScore || null}
          onValueChange={(value) => setMinAiScore(value ?? 0)}
          max={100}
          integer
          placeholder="0"
          className={INPUT}
        />
      </div>

      <div className="flex w-[110px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-volume`}>Мін. обсяг, {asset}</FieldLabel>
        <NumberInput
          id={`${id}-volume`}
          value={thresholds.minVolume}
          onValueChange={onMinVolumeChange}
          placeholder="будь-який"
          className={INPUT}
        />
      </div>

      <div className="flex w-[100px] flex-col gap-1.5">
        <FieldLabel htmlFor={`${id}-amount`}>Сума, {fiat}</FieldLabel>
        <NumberInput
          id={`${id}-amount`}
          value={amount}
          onValueChange={setAmount}
          placeholder="типова"
          className={INPUT}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <SectionLabel>Біржі</SectionLabel>
        <div className="flex flex-wrap gap-1">
          {EXCHANGES.map((code) => (
            <CheckChip
              key={code}
              checked={exchanges.includes(code)}
              onClick={() => toggleExchange(code)}
            >
              {exchangeName(code)}
            </CheckChip>
          ))}
        </div>
      </div>

      <div className="flex h-7 items-center gap-2">
        <Switch
          id={`${id}-liquid`}
          checked={thresholds.liquidOnly}
          onCheckedChange={onLiquidOnlyChange}
        />
        <label htmlFor={`${id}-liquid`} className="cursor-pointer text-ui text-muted-foreground">
          Тільки ліквідні
        </label>
      </div>

      <Button variant="secondary" size="terminal" className="ml-auto" onClick={onReset}>
        Скинути
      </Button>
    </Panel>
  )
}
