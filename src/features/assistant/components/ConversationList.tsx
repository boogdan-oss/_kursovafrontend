import { Plus, Search } from 'lucide-react'
import { useState } from 'react'

import { groupConversations } from '@/features/assistant/lib'
import type { Conversation } from '@/shared/api/assistant-types'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader, SectionLabel } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'

const SKELETON_ROWS = 6

interface ConversationListProps {
  items: Conversation[]
  activeId: string | null
  onSelect: (id: string | null) => void
  now: number
  isLoading: boolean
  failed: boolean
  className?: string
}

export function ConversationList({
  items,
  activeId,
  onSelect,
  now,
  isLoading,
  failed,
  className,
}: ConversationListProps) {
  const [query, setQuery] = useState('')
  const needle = query.trim().toLowerCase()
  const groups = groupConversations(
    needle ? items.filter((item) => item.title.toLowerCase().includes(needle)) : items,
    now,
  )

  return (
    <Panel className={cn('flex min-h-0 flex-col', className)} aria-label="Розмови">
      <PanelHeader
        title="Розмови"
        actions={
          <Button size="terminal-sm" onClick={() => onSelect(null)}>
            <Plus className="!size-3" />
            Новий
          </Button>
        }
      />

      <div className="px-3 pb-1 pt-2">
        <label className="flex h-7 items-center gap-2 rounded-sm border border-border-strong bg-elevated px-2.5 focus-within:ring-1 focus-within:ring-ring">
          <Search className="size-3.5 shrink-0 text-tertiary" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Пошук у розмовах"
            aria-label="Пошук у розмовах"
            className="min-w-0 flex-1 bg-transparent text-ui outline-none placeholder:text-tertiary"
          />
        </label>
      </div>

      <nav aria-label="Історія розмов" className="min-h-0 flex-1 overflow-y-auto pb-2">
        {isLoading ? (
          <div className="flex flex-col gap-2 px-3 pt-3">
            {Array.from({ length: SKELETON_ROWS }, (_, index) => (
              <Skeleton key={index} className="h-5 w-full" />
            ))}
          </div>
        ) : failed ? (
          <p className="px-3 py-6 text-center text-ui text-muted-foreground">
            Не вдалося завантажити розмови
          </p>
        ) : groups.length === 0 ? (
          <p className="px-3 py-6 text-center text-ui text-muted-foreground">
            {needle ? 'Нічого не знайдено' : 'Розмов ще немає'}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} className="pt-2.5">
              <SectionLabel className="px-3 pb-1">{group.label}</SectionLabel>
              <ul>
                {group.items.map((item) => {
                  const active = item.id === activeId
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        aria-current={active ? 'true' : undefined}
                        title={item.title}
                        onClick={() => onSelect(item.id)}
                        className={cn(
                          'block h-8 w-full truncate px-3 text-left text-ui-lg transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
                          active
                            ? 'bg-primary/15 text-foreground shadow-[inset_2px_0_0_rgb(var(--primary))]'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        {item.title}
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </nav>

      <p className="border-t px-3 py-2.5 text-meta text-muted-foreground">
        Відповіді спираються лише на live-дані UPars
      </p>
    </Panel>
  )
}
