import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ExchangeStatus } from '@/features/admin/components/ExchangeStatus'
import { HiddenPanel } from '@/features/admin/components/HiddenPanel'
import { ReportDetails } from '@/features/admin/components/ReportDetails'
import { ReportsPanel } from '@/features/admin/components/ReportsPanel'
import { UsersPanel } from '@/features/admin/components/UsersPanel'
import { useHidden, useModerationStats, useReports } from '@/features/admin/hooks'
import type { AdminTab } from '@/features/admin/lib'
import { useCurrentUser } from '@/features/community/hooks'
import { useHealth } from '@/features/dashboard/hooks'
import type { ReportState } from '@/shared/api/community-types'
import { useNow } from '@/shared/hooks/useNow'
import { formatCompact } from '@/shared/lib/format'
import { ROLE_LABELS } from '@/shared/lib/roles'
import { cn } from '@/shared/lib/utils'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'

const CLOCK_MS = 30_000
const TABS: AdminTab[] = ['reports', 'hidden', 'users']

function Kpi({
  label,
  value,
  note,
  danger,
}: {
  label: string
  value: number | undefined
  note?: string
  danger?: boolean
}) {
  return (
    <div className="flex min-w-[150px] flex-1 flex-col gap-1 border-l px-5 py-3.5 first:border-l-0">
      <span className="text-label uppercase text-tertiary">{label}</span>
      <span className={cn('font-mono text-kpi-lg', danger && value ? 'text-destructive' : '')}>
        {value === undefined ? '—' : formatCompact(value)}
      </span>
      {note && <span className="text-meta text-muted-foreground">{note}</span>}
    </div>
  )
}

export function AdminPage() {
  const user = useCurrentUser()
  const now = useNow(CLOCK_MS)
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as AdminTab | null
  const tab = tabParam && TABS.includes(tabParam) ? tabParam : 'reports'
  const [filter, setFilter] = useState<ReportState | 'all'>('pending')
  const [selectedId, setSelectedId] = useState<number | null>(null)

  const stats = useModerationStats()
  const reports = useReports(filter === 'all' ? null : filter)
  const hidden = useHidden()
  const health = useHealth()
  const reportItems = reports.data?.items ?? []
  const selected = reportItems.find((item) => item.id === selectedId) ?? reportItems[0]

  const tabs = [
    { value: 'reports' as const, label: `Скарги · ${stats.data?.reports_pending ?? '…'}` },
    { value: 'hidden' as const, label: `Приховані · ${stats.data?.hidden ?? '…'}` },
    { value: 'users' as const, label: 'Користувачі й ролі' },
  ]

  return (
    <div className="flex flex-col gap-2 p-2">
      <div className="flex flex-wrap items-end justify-between gap-2 px-2 pb-1 pt-3">
        <div className="flex flex-col gap-1">
          <h1 className="text-kpi-lg">Адмін-панель</h1>
          <p className="text-ui-lg text-muted-foreground">
            Модерація спільноти, користувачі й стан бірж · ви —{' '}
            {user ? ROLE_LABELS[user.role].toLowerCase() : ''}
          </p>
        </div>
      </div>

      <Panel aria-label="Статистика модерації" className="flex flex-wrap">
        <Kpi label="Нові скарги" value={stats.data?.reports_new} note="за 24 год" danger />
        <Kpi label="На розгляді" value={stats.data?.reports_pending} note="усі відкриті" />
        <Kpi label="Приховані" value={stats.data?.hidden} note="пости й коментарі" />
        <Kpi label="Видалено за 7 д" value={stats.data?.deleted_7d} note="модераторами" />
        <Kpi label="Заблоковані" value={stats.data?.banned} note="чинні блокування" />
      </Panel>

      <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Panel aria-label="Модерація" className="overflow-hidden">
          <PanelHeader
            title={tab === 'reports' ? 'Скарги' : tab === 'hidden' ? 'Приховане' : 'Користувачі'}
            meta={tab === 'reports' ? 'FR-43, FR-44' : tab === 'hidden' ? 'FR-46' : 'FR-45 · ролі'}
            actions={
              <Segmented
                size="sm"
                label="Розділ адмін-панелі"
                value={tab}
                onValueChange={(value) =>
                  setSearchParams(value === 'reports' ? {} : { tab: value }, { replace: true })
                }
                options={tabs}
              />
            }
          />
          {tab === 'reports' && (
            <ReportsPanel
              reports={reportItems}
              filter={filter}
              onFilterChange={(value) => {
                setFilter(value)
                setSelectedId(null)
              }}
              selectedId={selected?.id ?? null}
              onSelect={(report) => setSelectedId(report.id)}
              now={now}
              isLoading={reports.isPending}
              failed={reports.isError}
            />
          )}
          {tab === 'hidden' && (
            <HiddenPanel
              data={hidden.data}
              now={now}
              isLoading={hidden.isPending}
              failed={hidden.isError}
            />
          )}
          {tab === 'users' && <UsersPanel />}
        </Panel>

        <aside className="flex min-w-0 flex-col gap-2" aria-label="Деталі й стан системи">
          {tab === 'reports' && <ReportDetails report={selected} now={now} />}
          <ExchangeStatus health={health.data} failed={health.isError} />
        </aside>
      </div>
    </div>
  )
}
