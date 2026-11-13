import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router-dom'

import { BanDialog, ConfirmDialog } from '@/features/community/components/Dialogs'
import { FeedList } from '@/features/community/components/FeedList'
import { UserAvatar } from '@/features/community/components/UserAvatar'
import { useCurrentUser, useProfile, useUnbanUser, useUserFeed } from '@/features/community/hooks'
import { PROFILE_TABS } from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { ProfileTab, ProfileView } from '@/shared/api/community-types'
import { useNow } from '@/shared/hooks/useNow'
import { formatCompact, formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { Panel } from '@/shared/ui/panel'
import { Segmented } from '@/shared/ui/segmented'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tag } from '@/shared/ui/tag'

const CLOCK_MS = 30_000
const MONTH_FORMAT = new Intl.DateTimeFormat('uk-UA', { month: 'long', year: 'numeric' })

const EMPTY: Record<ProfileTab, string> = {
  posts: 'Публікацій ще немає.',
  reposts: 'Репостів ще немає.',
  likes: 'Вподобаних публікацій ще немає.',
}

function joinedText(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? '' : `на платформі з ${MONTH_FORMAT.format(date)}`
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex min-w-[96px] flex-col gap-0.5 border-l px-4 first:border-l-0">
      <span className="text-label uppercase text-tertiary">{label}</span>
      <span className="font-mono text-kpi">{formatCompact(value)}</span>
    </div>
  )
}

function StatusTag({ profile }: { profile: ProfileView }) {
  if (profile.status === 'banned') return <Tag tone="danger">Заблоковано</Tag>
  if (profile.status === 'suspended') return <Tag tone="warning">Тимчасово заблоковано</Tag>
  return profile.is_admin ? <Tag tone="warning">Адмін</Tag> : <Tag tone="accent">Учасник</Tag>
}

function AdminActions({ profile }: { profile: ProfileView }) {
  const [banning, setBanning] = useState(false)
  const [unbanning, setUnbanning] = useState(false)
  const unban = useUnbanUser()

  if (profile.is_admin) return null

  return (
    <div className="flex flex-col items-end gap-1.5">
      {profile.status === 'active' ? (
        <Button variant="destructive" size="terminal" onClick={() => setBanning(true)}>
          Заблокувати
        </Button>
      ) : (
        <Button variant="secondary" size="terminal" onClick={() => setUnbanning(true)}>
          Розблокувати
        </Button>
      )}
      {profile.status !== 'active' && (
        <span className="max-w-[260px] text-right text-meta text-muted-foreground">
          {profile.ban_until ? `до ${formatDateTime(profile.ban_until)}` : 'назавжди'}
          {profile.ban_reason && ` · ${profile.ban_reason}`}
        </span>
      )}
      <BanDialog
        user={banning ? { id: profile.id, username: profile.username, is_admin: false } : null}
        onClose={() => setBanning(false)}
      />
      <ConfirmDialog
        open={unbanning}
        onOpenChange={setUnbanning}
        title={`Розблокувати @${profile.username}?`}
        description="Користувач знову зможе входити, публікувати й коментувати."
        confirmLabel="Розблокувати"
        pending={unban.isPending}
        error={unban.isError ? toApiError(unban.error).message : null}
        onConfirm={() => unban.mutate(profile.id, { onSuccess: () => setUnbanning(false) })}
      />
    </div>
  )
}

export function UserProfilePage() {
  const { username = '' } = useParams()
  const [searchParams, setSearchParams] = useSearchParams()
  const user = useCurrentUser()
  const now = useNow(CLOCK_MS)
  const tabParam = searchParams.get('tab') as ProfileTab | null
  const tab = PROFILE_TABS.some((option) => option.value === tabParam) ? tabParam! : 'posts'

  const profile = useProfile(username)
  const feed = useUserFeed(username, tab)
  const own = user?.username === username
  const data = profile.data

  return (
    <div className="flex flex-col gap-2 p-2">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 self-start px-2 pt-2 text-ui text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Спільнота
      </Link>

      <Panel className="flex flex-wrap items-center gap-6 p-5">
        {profile.isPending ? (
          <Skeleton className="h-20 w-full" />
        ) : profile.isError || !data ? (
          <div className="flex flex-col gap-1">
            <h1 className="text-kpi-lg">@{username}</h1>
            <p className="text-ui text-muted-foreground">
              {toApiError(profile.error).code === 'not_found'
                ? 'Такого користувача не знайдено.'
                : toApiError(profile.error).message}
            </p>
          </div>
        ) : (
          <>
            <UserAvatar username={data.username} size="xl" accent={own} />
            <div className="flex min-w-0 flex-1 flex-col gap-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="truncate text-kpi-lg">{data.username}</h1>
                <StatusTag profile={data} />
                {own && <Tag tone="accent">Ви</Tag>}
              </div>
              <p className="text-ui-lg text-muted-foreground">
                @{data.username} · {joinedText(data.joined_at)}
              </p>
            </div>
            <div className="flex rounded-sm border py-2">
              <Stat label="Публікацій" value={data.posts} />
              <Stat label="Вподобань" value={data.likes_received} />
              <Stat label="Репостів" value={data.reposts_received} />
            </div>
            {own && (
              <Button asChild variant="secondary" size="terminal">
                <Link to="/profile">Налаштування</Link>
              </Button>
            )}
            {!own && user?.isAdmin && <AdminActions profile={data} />}
          </>
        )}
      </Panel>

      {data && (
        <div className="flex max-w-[1040px] flex-col gap-2">
          <Segmented
            label="Розділ профілю"
            value={tab}
            onValueChange={(value) => setSearchParams(value === 'posts' ? {} : { tab: value })}
            options={PROFILE_TABS}
            className="self-start"
          />
          <FeedList query={feed} now={now} empty={EMPTY[tab]} />
        </div>
      )}
    </div>
  )
}
