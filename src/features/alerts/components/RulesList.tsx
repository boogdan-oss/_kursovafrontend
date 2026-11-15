import { Trash2 } from 'lucide-react'
import { useState } from 'react'

import { ChannelsDialog } from '@/features/alerts/components/ChannelsDialog'
import { useDeleteRule, useUpdateRule } from '@/features/alerts/hooks'
import { CHANNEL_TAGS, pairText, ruleConditions, ruleTitle } from '@/features/alerts/lib'
import { toApiError } from '@/shared/api/client'
import type { AlertRule } from '@/shared/api/types'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { Switch } from '@/shared/ui/switch'
import { Tag } from '@/shared/ui/tag'

function RuleRow({ rule, onChannels }: { rule: AlertRule; onChannels: () => void }) {
  const update = useUpdateRule()
  const remove = useDeleteRule()
  const error = update.isError ? update.error : remove.isError ? remove.error : null

  return (
    <li className="flex flex-col gap-2 border-b px-4 py-3 last:border-b-0">
      <div className="flex items-start gap-3">
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <span className="truncate text-ui-lg font-semibold">{ruleTitle(rule)}</span>
          {rule.title && <span className="text-meta text-muted-foreground">{pairText(rule)}</span>}
          <div className="flex flex-wrap gap-1.5">
            {ruleConditions(rule).map((condition) => (
              <Tag key={condition} tone="accent" className="normal-case tracking-normal">
                {condition}
              </Tag>
            ))}
          </div>
        </div>
        <Switch
          aria-label={rule.enabled ? 'Вимкнути правило' : 'Увімкнути правило'}
          checked={rule.enabled}
          disabled={update.isPending}
          onCheckedChange={(enabled) => update.mutate({ id: rule.id, patch: { enabled } })}
        />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onChannels}
          className="flex flex-wrap items-center gap-1.5 rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          aria-label="Змінити канали сповіщень"
        >
          {rule.channels.map((channel) => (
            <Tag key={channel}>{CHANNEL_TAGS[channel]}</Tag>
          ))}
        </button>
        <span className="text-meta text-muted-foreground">
          {rule.triggered_today > 0
            ? `сьогодні: ${rule.triggered_today}`
            : 'сьогодні не спрацьовувало'}
          {rule.last_triggered_at && ` · востаннє ${formatDateTime(rule.last_triggered_at)}`}
        </span>
        <Button
          variant="ghost"
          size="terminal-sm"
          className="ml-auto text-destructive hover:bg-destructive/10"
          disabled={remove.isPending}
          onClick={() => remove.mutate(rule.id)}
        >
          <Trash2 className="!size-3" />
          Видалити
        </Button>
      </div>
      {error && <p className="text-meta text-destructive">{toApiError(error).message}</p>}
    </li>
  )
}

interface RulesListProps {
  rules: AlertRule[]
  filterLabel: string | null
  onClearFilter: () => void
  isLoading: boolean
}

export function RulesList({ rules, filterLabel, onClearFilter, isLoading }: RulesListProps) {
  const update = useUpdateRule()
  const [editing, setEditing] = useState<AlertRule | null>(null)

  return (
    <Panel aria-label="Мої правила">
      <PanelHeader
        title="Мої правила"
        meta={filterLabel ?? `${rules.length} правил`}
        actions={
          filterLabel && (
            <Button variant="ghost" size="terminal-sm" onClick={onClearFilter}>
              Показати всі
            </Button>
          )
        }
      />
      {isLoading ? (
        <div className="flex flex-col gap-2 p-4">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      ) : rules.length === 0 ? (
        <p className="px-4 py-8 text-center text-ui text-muted-foreground">
          {filterLabel ? 'Для цієї пари правил ще немає.' : 'Правил ще немає.'}
        </p>
      ) : (
        <ul>
          {rules.map((rule) => (
            <RuleRow key={rule.id} rule={rule} onChannels={() => setEditing(rule)} />
          ))}
        </ul>
      )}
      <ChannelsDialog
        open={editing !== null}
        onOpenChange={(open) => {
          if (!open) {
            setEditing(null)
            update.reset()
          }
        }}
        title="Куди надсилати сповіщення?"
        summary={editing ? [ruleTitle(editing), ...ruleConditions(editing)] : []}
        initial={editing?.channels ?? ['in_app']}
        confirmLabel="Зберегти"
        pending={update.isPending}
        error={update.isError ? toApiError(update.error).message : null}
        onConfirm={(channels) =>
          editing &&
          update.mutate(
            { id: editing.id, patch: { channels } },
            { onSuccess: () => setEditing(null) },
          )
        }
      />
    </Panel>
  )
}
