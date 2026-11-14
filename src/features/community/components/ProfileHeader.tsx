import type { ReactNode } from 'react'
import { useSearchParams } from 'react-router-dom'

import { FeedList } from '@/features/community/components/FeedList'
import { UserAvatar } from '@/features/community/components/UserAvatar'
import { useUserFeed } from '@/features/community/hooks'
import { PROFILE_TABS } from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { ProfileTab, ProfileView } from '@/shared/api/community-types'
import { formatCompact } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Panel } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'

const DATE_PARTS = new Intl.DateTimeFormat('uk-UA', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const EMPTY: Record<ProfileTab, string> = {
  posts: 'Публікацій ще немає.',
  reposts: 'Репостів ще немає.',
  likes: 'Вподобаних публікацій ще немає.',
}

function joinedText(value: string) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  const parts = DATE_PARTS.formatToParts(date)
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''
  return `на платформі з ${part('month')} ${part('year')}`
}

function Stat({ label, value }: { label: string; value: number | undefined }) {
  return (
    <div className="flex min-w-[104px] flex-1 flex-col gap-1 border-l px-4 py-3 first:border-l-0">
      <span className="text-label uppercase text-tertiary">{label}</span>
      <span className="font-mono text-kpi-lg">
        {value === undefined ? '—' : formatCompact(value)}
      </span>
    </div>
  )
}

function StatusTag({ profile }: { profile: ProfileView }) {
  if (profile.status === 'banned') return <Tag tone="danger">Заблоковано</Tag>
  if (profile.status === 'suspended') return <Tag tone="warning">Тимчасово заблоковано</Tag>
  return profile.is_admin ? <Tag tone="warning">Адмін</Tag> : <Tag tone="accent">Учасник</Tag>
}

interface ProfileHeaderProps {
  profile: ProfileView | undefined
  username: string
  isPending: boolean
  error: unknown
  own: boolean
  displayName?: string | null
  bio?: string | null
  actions?: ReactNode
}

export function ProfileHeader({
  profile,
  username,
  isPending,
  error,
  own,
  displayName,
  bio,
  actions,
}: ProfileHeaderProps) {
  if (isPending) {
    return (
      <Panel className="p-6">
        <Skeleton className="h-24 w-full" />
      </Panel>
    )
  }

  if (!profile) {
    const apiError = toApiError(error)
    return (
      <Panel className="flex flex-col gap-1 p-6">
        <h1 className="text-kpi-lg">@{username}</h1>
        <p className="text-ui text-muted-foreground">
          {apiError.code === 'not_found' ? 'Такого користувача не знайдено.' : apiError.message}
        </p>
      </Panel>
    )
  }

  const name = displayName?.trim() || profile.username

  return (
    <Panel aria-label="Профіль" className="flex flex-wrap items-center gap-x-8 gap-y-5 px-6 py-6">
      <UserAvatar
        username={name}
        size="xl"
        accent={own}
        className={cn('size-[100px] text-h1', own && 'border-2')}
      />
      <div className="flex min-w-[260px] flex-1 flex-col gap-1.5">
        <div className="flex flex-wrap items-center gap-2.5">
          <h1 className="truncate text-h2">{name}</h1>
          <StatusTag profile={profile} />
        </div>
        <p className="text-ui-lg text-muted-foreground">
          @{profile.username} · {joinedText(profile.joined_at)}
        </p>
        {bio && <p className="max-w-[720px] whitespace-pre-wrap break-words text-body">{bio}</p>}
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex rounded-sm border" aria-label="Статистика профілю">
          <Stat label="Публікацій" value={profile.posts} />
          <Stat label="Вподобань" value={profile.likes_received} />
          <Stat label="Репостів" value={profile.reposts_received} />
          <Stat label="Коментарів" value={profile.comments} />
        </div>
        {actions}
      </div>
    </Panel>
  )
}

interface ProfileFeedProps {
  username: string
  counts: Partial<Record<ProfileTab, number>>
  now: number
  className?: string
}

export function ProfileFeed({ username, counts, now, className }: ProfileFeedProps) {
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') as ProfileTab | null
  const tab = PROFILE_TABS.some((option) => option.value === tabParam) ? tabParam! : 'posts'
  const feed = useUserFeed(username, tab)
  const options = PROFILE_TABS.map((option) => ({
    ...option,
    label:
      counts[option.value] === undefined
        ? option.label
        : `${option.label} · ${counts[option.value]}`,
  }))

  return (
    <section
      className={cn('flex min-w-0 flex-col gap-2', className)}
      aria-label="Публікації профілю"
    >
      <div className="flex flex-wrap items-center gap-2">
        <Segmented
          label="Розділ профілю"
          value={tab}
          onValueChange={(value) =>
            setSearchParams(
              (previous) => {
                const next = new URLSearchParams(previous)
                if (value === 'posts') next.delete('tab')
                else next.set('tab', value)
                return next
              },
              { replace: true },
            )
          }
          options={options}
        />
        <span className="ml-auto text-ui text-muted-foreground">Нові спочатку ↓</span>
      </div>
      <FeedList query={feed} now={now} empty={EMPTY[tab]} />
    </section>
  )
}
