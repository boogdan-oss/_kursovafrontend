import type { ReactNode } from 'react'

import { useOpportunities } from '@/features/arbitrage/hooks'
import { QUICK_PROMPTS, type PromptTemplate } from '@/features/assistant/lib'
import { bestSnapshot } from '@/features/offers/lib'
import { useMarketSnapshot } from '@/shared/api/queries/market'
import { formatNumber, formatRelativeTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { useFiltersStore } from '@/store/useFiltersStore'

function Row({ label, value, tone }: { label: string; value: ReactNode; tone?: 'success' }) {
  return (
    <div className="flex min-h-7 items-center justify-between gap-3 border-b px-3 text-ui last:border-b-0">
      <dt className="text-muted-foreground">{label}</dt>
      <dd className={cn('truncate font-mono', tone === 'success' && 'text-success')}>{value}</dd>
    </div>
  )
}

export function MarketContext({ now }: { now: number }) {
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const exchanges = useFiltersStore((state) => state.exchanges)
  const snapshotQuery = useMarketSnapshot({ asset, fiat })
  const opportunitiesQuery = useOpportunities({ asset, fiat })

  const items = snapshotQuery.data?.items ?? []
  const buy = bestSnapshot(items, exchanges, null, 'BUY')
  const sell = bestSnapshot(items, exchanges, null, 'SELL')
  const opportunities = opportunitiesQuery.data?.items
  const scores = (opportunities ?? []).flatMap((item) =>
    item.ai_score == null ? [] : [item.ai_score],
  )
  const maxScore = scores.length ? Math.max(...scores) : null
  const quote = (price: string | null | undefined, exchange: string | undefined) =>
    price && exchange ? `${formatNumber(price, { minDigits: 2 })} · ${exchangeName(exchange)}` : '—'

  return (
    <Panel aria-label="Контекст ринку">
      <PanelHeader title="Контекст ринку" meta={`${asset}/${fiat} · зараз`} />
      <dl>
        <Row label="Найкраща купівля" value={quote(buy?.buy_price, buy?.exchange)} tone="success" />
        <Row label="Найкращий продаж" value={quote(sell?.sell_price, sell?.exchange)} />
        <Row label="Активні можливості" value={opportunities ? opportunities.length : '—'} />
        <Row
          label="Макс. AI Score"
          value={maxScore ?? '—'}
          tone={maxScore !== null ? 'success' : undefined}
        />
        <Row
          label="Свіжість даних"
          value={
            snapshotQuery.dataUpdatedAt ? formatRelativeTime(snapshotQuery.dataUpdatedAt, now) : '—'
          }
        />
      </dl>
    </Panel>
  )
}

interface QuickPromptsProps {
  onPrompt: (prompt: PromptTemplate) => void
  disabled: boolean
}

export function QuickPrompts({ onPrompt, disabled }: QuickPromptsProps) {
  return (
    <Panel aria-label="Швидкі запити">
      <PanelHeader title="Швидкі запити" />
      <ul>
        {QUICK_PROMPTS.map((prompt) => (
          <li key={prompt.label} className="border-b last:border-b-0">
            <button
              type="button"
              disabled={disabled}
              onClick={() => onPrompt(prompt)}
              className="flex h-7 w-full items-center justify-between px-3 text-left text-ui transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring enabled:hover:bg-accent disabled:opacity-50"
            >
              {prompt.label}
              <span aria-hidden className="text-primary">
                →
              </span>
            </button>
          </li>
        ))}
      </ul>
    </Panel>
  )
}
