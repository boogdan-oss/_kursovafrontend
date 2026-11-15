import { useId, useState, type FormEvent, type ReactNode } from 'react'

import { ChannelsDialog } from '@/features/alerts/components/ChannelsDialog'
import { useAddToWatchlist, useCreateRule } from '@/features/alerts/hooks'
import {
  ANY_EXCHANGE,
  draftToInput,
  hasThreshold,
  pairText,
  TITLE_MAX,
  type RuleDraft,
} from '@/features/alerts/lib'
import { toApiError } from '@/shared/api/client'
import { usePairOptions } from '@/shared/api/queries/market'
import type { AlertChannel } from '@/shared/api/types'
import { formatNumber } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Input } from '@/shared/ui/input'
import { NumberInput } from '@/shared/ui/number-input'
import { FieldLabel, Panel, PanelHeader } from '@/shared/ui/panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { EXCHANGES } from '@/store/useFiltersStore'

const CONTROL = 'h-8 rounded-sm border-border-strong bg-elevated px-2.5 text-ui-lg'

function Field({
  label,
  htmlFor,
  className,
  children,
}: {
  label: string
  htmlFor: string
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
    </div>
  )
}

function summary(draft: RuleDraft) {
  const parts = [
    pairText({ ...draft, exchange: draft.exchange === ANY_EXCHANGE ? null : draft.exchange }),
  ]
  if (draft.minSpread !== null) parts.push(`спред ≥ ${formatNumber(draft.minSpread)}%`)
  if (draft.minNetSpread !== null) parts.push(`Net ≥ ${formatNumber(draft.minNetSpread)}%`)
  if (draft.minAiScore !== null) parts.push(`AI Score ≥ ${draft.minAiScore}`)
  return parts
}

interface AlertRuleFormProps {
  draft: RuleDraft
  onChange: (draft: RuleDraft) => void
  onCreated: () => void
}

export function AlertRuleForm({ draft, onChange, onCreated }: AlertRuleFormProps) {
  const id = useId()
  const create = useCreateRule()
  const watch = useAddToWatchlist()
  const [addToWatchlist, setAddToWatchlist] = useState(true)
  const [choosing, setChoosing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { assets, fiats } = usePairOptions(draft.asset, draft.fiat)
  const ready = hasThreshold(draft)

  function change(patch: Partial<RuleDraft>) {
    onChange({ ...draft, ...patch })
    setError(null)
  }

  function next(event: FormEvent) {
    event.preventDefault()
    if (!ready) {
      setError('Задайте хоча б одну умову: спред, Net або AI Score')
      return
    }
    create.reset()
    setChoosing(true)
  }

  async function save(channels: AlertChannel[]) {
    try {
      await create.mutateAsync(draftToInput(draft, channels))
      if (addToWatchlist) {
        await watch.mutateAsync({
          asset: draft.asset,
          fiat: draft.fiat,
          exchange: draft.exchange === ANY_EXCHANGE ? null : draft.exchange,
        })
      }
      setChoosing(false)
      onCreated()
    } catch {
      return
    }
  }

  const saveError = create.isError
    ? toApiError(create.error).message
    : watch.isError
      ? `Правило створено, але пару не додано в Watchlist: ${toApiError(watch.error).message}`
      : null

  return (
    <Panel aria-label="Нове сповіщення" className="border-primary/60">
      <PanelHeader title="Нове сповіщення" meta="пара · біржа · умови" />
      <form noValidate onSubmit={next} className="flex flex-col gap-3.5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Валюта" htmlFor={`${id}-asset`}>
            <Select value={draft.asset} onValueChange={(asset) => change({ asset })}>
              <SelectTrigger id={`${id}-asset`} className={cn(CONTROL, 'font-mono')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {assets.map((code) => (
                  <SelectItem key={code} value={code}>
                    {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Фіат" htmlFor={`${id}-fiat`}>
            <Select value={draft.fiat} onValueChange={(fiat) => change({ fiat })}>
              <SelectTrigger id={`${id}-fiat`} className={cn(CONTROL, 'font-mono')}>
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
          <Field label="Біржа" htmlFor={`${id}-exchange`} className="col-span-2">
            <Select value={draft.exchange} onValueChange={(exchange) => change({ exchange })}>
              <SelectTrigger id={`${id}-exchange`} className={CONTROL}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_EXCHANGE}>Усі біржі</SelectItem>
                {EXCHANGES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {exchangeName(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Спред від" htmlFor={`${id}-spread`}>
            <NumberInput
              id={`${id}-spread`}
              value={draft.minSpread}
              onValueChange={(minSpread) => change({ minSpread })}
              suffix="%"
              placeholder="напр. 1"
              className={CONTROL}
            />
          </Field>
          <Field label="AI Score від" htmlFor={`${id}-score`}>
            <NumberInput
              id={`${id}-score`}
              value={draft.minAiScore}
              onValueChange={(minAiScore) => change({ minAiScore })}
              max={100}
              integer
              placeholder="напр. 80"
              className={CONTROL}
            />
          </Field>
          <Field label="Net після комісій від" htmlFor={`${id}-net`}>
            <NumberInput
              id={`${id}-net`}
              value={draft.minNetSpread}
              onValueChange={(minNetSpread) => change({ minNetSpread })}
              suffix="%"
              placeholder="необов’язково"
              className={CONTROL}
            />
          </Field>
          <Field label="Назва" htmlFor={`${id}-title`}>
            <Input
              id={`${id}-title`}
              maxLength={TITLE_MAX}
              placeholder="необов’язково"
              value={draft.title}
              onChange={(event) => change({ title: event.target.value })}
              className={CONTROL}
            />
          </Field>
        </div>

        <label className="flex cursor-pointer items-center gap-2 text-ui">
          <Switch checked={addToWatchlist} onCheckedChange={setAddToWatchlist} />
          Додати пару в Watchlist — collector оновлюватиме її частіше
        </label>

        {error && (
          <p role="alert" className="text-ui text-destructive">
            {error}
          </p>
        )}
        <Button type="submit" size="terminal" className="h-9">
          Далі: куди надсилати
        </Button>
      </form>

      <ChannelsDialog
        open={choosing}
        onOpenChange={setChoosing}
        title="Куди надсилати сповіщення?"
        summary={summary(draft)}
        initial={['in_app']}
        confirmLabel="Створити сповіщення"
        pending={create.isPending || watch.isPending}
        error={saveError}
        onConfirm={(channels) => void save(channels)}
      />
    </Panel>
  )
}
