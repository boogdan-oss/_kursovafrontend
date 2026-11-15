import { useState } from 'react'

import { AlertRuleForm } from '@/features/alerts/components/AlertRuleForm'
import { NotificationList } from '@/features/alerts/components/NotificationList'
import { RulesList } from '@/features/alerts/components/RulesList'
import { WatchlistTable } from '@/features/alerts/components/WatchlistTable'
import { useRules, useWatchlist } from '@/features/alerts/hooks'
import { ANY_EXCHANGE, emptyDraft, pairText, samePair, type RuleDraft } from '@/features/alerts/lib'
import type { WatchlistItem } from '@/shared/api/types'
import { useNow } from '@/shared/hooks/useNow'
import { useFiltersStore } from '@/store/useFiltersStore'

const CLOCK_MS = 30_000

export function AlertsPage() {
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const now = useNow(CLOCK_MS)
  const rulesQuery = useRules()
  const watchlistQuery = useWatchlist()
  const [draft, setDraft] = useState<RuleDraft>(() => emptyDraft(asset, fiat))
  const [selected, setSelected] = useState<WatchlistItem | null>(null)

  const rules = rulesQuery.data?.items ?? []
  const watchlist = watchlistQuery.data?.items ?? []
  const visibleRules = selected ? rules.filter((rule) => samePair(rule, selected)) : rules

  function select(item: WatchlistItem) {
    setSelected(item)
    setDraft((current) => ({
      ...current,
      asset: item.asset,
      fiat: item.fiat,
      exchange: item.exchange ?? ANY_EXCHANGE,
    }))
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-col gap-1 px-2 pb-1 pt-3">
        <h1 className="text-kpi-lg">Watchlist і сповіщення</h1>
        <p className="text-ui-lg text-muted-foreground">
          Оберіть пару, біржу й пороги спреду та AI Score — і куди надсилати сповіщення, коли
          з’явиться відповідна можливість
        </p>
      </div>

      <div className="grid gap-2 xl:grid-cols-[minmax(0,1fr)_440px]">
        <div className="flex min-w-0 flex-col gap-2 self-start">
          <WatchlistTable
            items={watchlist}
            rules={rules}
            selectedId={selected?.id ?? null}
            onSelect={select}
            isLoading={watchlistQuery.isPending}
            failed={watchlistQuery.isError}
          />
          <RulesList
            rules={visibleRules}
            filterLabel={selected ? pairText(selected) : null}
            onClearFilter={() => setSelected(null)}
            isLoading={rulesQuery.isPending}
          />
        </div>
        <aside className="flex min-w-0 flex-col gap-2" aria-label="Нове сповіщення та історія">
          <AlertRuleForm
            draft={draft}
            onChange={setDraft}
            onCreated={() =>
              setDraft((current) => ({
                ...emptyDraft(current.asset, current.fiat),
                exchange: current.exchange,
              }))
            }
          />
          <NotificationList now={now} className="xl:flex-1" />
        </aside>
      </div>
    </div>
  )
}
