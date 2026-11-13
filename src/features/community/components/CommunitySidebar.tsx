import { Link, useLocation } from 'react-router-dom'

import { UserAvatar } from '@/features/community/components/UserAvatar'
import { useCurrentUser, useProfile, useTrendingPairs } from '@/features/community/hooks'
import { COMMUNITY_RULES, pairLabel } from '@/features/community/lib'
import type { PairRef } from '@/shared/api/community-types'
import { formatCompact, formatPercent, plural } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'

const POST_FORMS = ['публікація', 'публікації', 'публікацій'] as const

function Stat({ value, label }: { value: number | undefined; label: string }) {
  return (
    <div className="flex flex-col">
      <span className="font-mono text-kpi">{value === undefined ? '—' : formatCompact(value)}</span>
      <span className="text-meta text-muted-foreground">{label}</span>
    </div>
  )
}

export function MyProfileCard() {
  const user = useCurrentUser()
  const { pathname } = useLocation()
  const profile = useProfile(user?.username)

  return (
    <Panel aria-label="Мій профіль">
      <PanelHeader title="Мій профіль" />
      {user ? (
        <div className="flex flex-col gap-4 p-4">
          <div className="flex items-center gap-3">
            <UserAvatar username={user.username} size="lg" accent />
            <div className="flex min-w-0 flex-col">
              <span className="truncate text-ui-lg font-semibold">{user.username}</span>
              <span className="truncate text-ui text-muted-foreground">{user.email}</span>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <Stat value={profile.data?.posts} label="публікацій" />
            <Stat value={profile.data?.likes_received} label="вподобань" />
            <Stat value={profile.data?.reposts_received} label="репостів" />
          </div>
          <Button asChild variant="secondary" size="terminal">
            <Link to={`/community/u/${user.username}`}>Переглянути профіль</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-3 p-4">
          <p className="text-ui text-muted-foreground">
            Увійдіть, щоб бачити свою статистику: публікації, вподобання й репости.
          </p>
          <Button asChild size="terminal">
            <Link to="/login" state={{ from: pathname }}>
              Увійти
            </Link>
          </Button>
        </div>
      )}
    </Panel>
  )
}

interface TrendingPairsProps {
  active: PairRef | null
  onSelect: (pair: PairRef | null) => void
}

export function TrendingPairs({ active, onSelect }: TrendingPairsProps) {
  const trending = useTrendingPairs()
  const items = trending.data?.items ?? []

  return (
    <Panel aria-label="Обговорювані пари">
      <PanelHeader title="Обговорювані пари" meta="24 год" />
      {trending.isPending ? (
        <div className="flex flex-col gap-2 p-3">
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
          <Skeleton className="h-9" />
        </div>
      ) : items.length === 0 ? (
        <p className="px-3 py-4 text-ui text-muted-foreground">
          {trending.isError
            ? 'Не вдалося завантажити'
            : 'За добу ще ніхто не прикріплював пари до публікацій.'}
        </p>
      ) : (
        <ul>
          {items.map((item) => {
            const selected = active?.asset === item.asset && active.fiat === item.fiat
            const change = item.change_pct == null ? null : Number(item.change_pct)
            return (
              <li key={pairLabel(item)} className="border-b last:border-b-0">
                <button
                  type="button"
                  aria-pressed={selected}
                  onClick={() => onSelect(selected ? null : { asset: item.asset, fiat: item.fiat })}
                  className={cn(
                    'flex w-full items-center gap-3 px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
                    selected && 'bg-primary/10',
                  )}
                >
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="text-ui-lg font-semibold">{pairLabel(item)}</span>
                    <span className="text-meta text-muted-foreground">
                      {item.posts} {plural(item.posts, POST_FORMS)}
                    </span>
                  </span>
                  {change !== null && (
                    <Tag tone={change >= 0 ? 'success' : 'danger'} className="font-mono">
                      {formatPercent(change, { signed: true, minDigits: 1, maxDigits: 1 })}
                    </Tag>
                  )}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </Panel>
  )
}

export function CommunityRules() {
  return (
    <Panel aria-label="Правила спільноти">
      <PanelHeader title="Правила спільноти" />
      <ul className="flex flex-col gap-2 p-4 text-ui text-muted-foreground">
        {COMMUNITY_RULES.map((rule) => (
          <li key={rule} className="flex gap-2">
            <span aria-hidden className="text-primary">
              •
            </span>
            {rule}
          </li>
        ))}
      </ul>
    </Panel>
  )
}
