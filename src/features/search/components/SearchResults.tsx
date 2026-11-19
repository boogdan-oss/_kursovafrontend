import { optionId, pairKey, type PairContext, type SearchItem } from '@/features/search/lib'
import { formatNumber, plural } from '@/shared/lib/format'
import { ROLE_LABELS, ROLE_TONES } from '@/shared/lib/roles'
import { cn } from '@/shared/lib/utils'
import { Avatar } from '@/shared/ui/avatar'
import { ExchangeLabel, exchangeName } from '@/shared/ui/exchange-label'
import { Tag } from '@/shared/ui/tag'

const EXCHANGE_NAMES_SHOWN = 2

const GROUPS: Record<string, string> = {
  recent: 'Нещодавні пари',
  exchange: 'Біржі',
  pair: 'Пари',
  user: 'Користувачі спільноти',
}

const SEARCH_HINTS = [
  { example: 'btc eur', meaning: 'пара' },
  { example: 'bybit', meaning: 'біржа' },
  { example: '@нік', meaning: 'користувач' },
]

function groupOf(item: SearchItem) {
  return item.kind === 'pair' && item.recent ? 'recent' : item.kind
}

function exchangesText(exchanges: string[]) {
  if (exchanges.length === 0) return ''
  if (exchanges.length <= EXCHANGE_NAMES_SHOWN) return exchanges.map(exchangeName).join(', ')
  return `${exchanges.length} ${plural(exchanges.length, ['біржа', 'біржі', 'бірж'])}`
}

function ItemBody({ item, current }: { item: SearchItem; current: PairContext }) {
  if (item.kind === 'pair') {
    const { pair } = item
    const isCurrent = pairKey(pair) === pairKey(current)
    return (
      <>
        <span className="flex min-w-0 items-center gap-2">
          <span className="font-mono font-semibold">
            {pair.asset} <span className="text-tertiary">/</span> {pair.fiat}
          </span>
          {isCurrent && <Tag tone="accent">поточна</Tag>}
        </span>
        <span className="shrink-0 text-meta text-muted-foreground">
          {pair.collected ? exchangesText(pair.exchanges) : 'ще не збирали'}
        </span>
      </>
    )
  }
  if (item.kind === 'exchange') {
    return (
      <>
        <ExchangeLabel exchange={item.exchange} />
        <span className="shrink-0 text-meta text-muted-foreground">
          {formatNumber(item.pairs)} {plural(item.pairs, ['пара', 'пари', 'пар'])} · лише ця біржа
        </span>
      </>
    )
  }
  const { user } = item
  return (
    <>
      <span className="flex min-w-0 items-center gap-2">
        <Avatar name={user.username} className="size-6 text-label" />
        <span className="min-w-0 truncate">
          <span className="font-semibold">{user.display_name || user.username}</span>{' '}
          <span className="text-muted-foreground">@{user.username}</span>
        </span>
        {user.role !== 'user' && <Tag tone={ROLE_TONES[user.role]}>{ROLE_LABELS[user.role]}</Tag>}
      </span>
      <span className="shrink-0 text-meta text-muted-foreground">
        {user.posts} {plural(user.posts, ['публікація', 'публікації', 'публікацій'])}
      </span>
    </>
  )
}

function Hints() {
  return (
    <p className="text-meta text-muted-foreground">
      Шукайте:{' '}
      {SEARCH_HINTS.map(({ example, meaning }, index) => (
        <span key={example}>
          {index > 0 && ' · '}
          {meaning} <span className="font-mono text-foreground">{example}</span>
        </span>
      ))}
    </p>
  )
}

interface SearchResultsProps {
  listId: string
  items: SearchItem[]
  active: number
  current: PairContext
  query: string
  loading: boolean
  failed: boolean
  onActive: (index: number) => void
  onSelect: (item: SearchItem) => void
}

export function SearchResults({
  listId,
  items,
  active,
  current,
  query,
  loading,
  failed,
  onActive,
  onSelect,
}: SearchResultsProps) {
  const typed = query.trim().length > 0

  return (
    <div className="flex flex-col">
      {items.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Результати пошуку"
          className="max-h-[360px] overflow-y-auto py-1"
        >
          {items.map((item, index) => {
            const group = groupOf(item)
            const heading = index === 0 || groupOf(items[index - 1]) !== group
            return (
              <li key={item.key} role="presentation">
                {heading && (
                  <span className="block px-3 pb-1 pt-2 text-label uppercase text-tertiary">
                    {GROUPS[group]}
                  </span>
                )}
                <div
                  id={optionId(listId, index)}
                  role="option"
                  aria-selected={index === active}
                  className={cn(
                    'flex cursor-pointer items-center justify-between gap-3 px-3 py-1.5 text-caption',
                    index === active && 'bg-primary/15',
                  )}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseMove={() => index !== active && onActive(index)}
                  onClick={() => onSelect(item)}
                >
                  <ItemBody item={item} current={current} />
                </div>
              </li>
            )
          })}
        </ul>
      )}

      <div className="flex flex-col gap-1 border-t px-3 py-2">
        {loading && items.length === 0 && <p className="text-meta text-muted-foreground">Шукаю…</p>}
        {failed && (
          <p className="text-meta text-destructive">Пошук зараз недоступний, спробуйте пізніше</p>
        )}
        {typed && !loading && !failed && items.length === 0 && (
          <p className="text-caption">Нічого не знайдено</p>
        )}
        {(!typed || items.length === 0) && <Hints />}
        {items.length > 0 && (
          <p className="text-meta text-tertiary">↑ ↓ — вибір · Enter — перейти · Esc — закрити</p>
        )}
      </div>
    </div>
  )
}
