import { ArrowLeft } from 'lucide-react'
import { useState } from 'react'
import { Link, Navigate, useLocation, useParams } from 'react-router-dom'

import { BanDialog, ConfirmDialog } from '@/features/community/components/Dialogs'
import { ProfileFeed, ProfileHeader } from '@/features/community/components/ProfileHeader'
import { useCurrentUser, useProfile, useUnbanUser } from '@/features/community/hooks'
import { toApiError } from '@/shared/api/client'
import type { ProfileView } from '@/shared/api/community-types'
import { useNow } from '@/shared/hooks/useNow'
import { formatDateTime } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'

const CLOCK_MS = 30_000

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
  const { search } = useLocation()
  const user = useCurrentUser()
  const now = useNow(CLOCK_MS)
  const profile = useProfile(username)
  const data = profile.data

  if (user?.username === username) return <Navigate to={`/profile${search}`} replace />

  return (
    <div className="flex flex-col gap-2 p-2">
      <Link
        to="/community"
        className="inline-flex items-center gap-1.5 self-start px-2 pt-2 text-ui text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" />
        Спільнота
      </Link>

      <ProfileHeader
        profile={data}
        username={username}
        isPending={profile.isPending}
        error={profile.error}
        own={false}
        displayName={data?.display_name}
        bio={data?.bio}
        actions={data && user?.isAdmin ? <AdminActions profile={data} /> : undefined}
      />

      {data && (
        <ProfileFeed
          username={username}
          counts={{ posts: data.posts }}
          now={now}
          className="max-w-[1040px]"
        />
      )}
    </div>
  )
}
