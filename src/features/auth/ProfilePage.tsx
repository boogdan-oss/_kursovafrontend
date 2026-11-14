import { useRef } from 'react'
import { Navigate } from 'react-router-dom'

import {
  AccountPanel,
  DefaultsPanel,
  NotificationsPanel,
  ProfileInfoPanel,
} from '@/features/auth/components/ProfileSections'
import { useMe } from '@/features/auth/hooks'
import { ProfileFeed, ProfileHeader } from '@/features/community/components/ProfileHeader'
import { useProfile } from '@/features/community/hooks'
import { useNow } from '@/shared/hooks/useNow'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

const CLOCK_MS = 30_000

export function ProfilePage() {
  const user = useAuthStore((state) => state.session?.user)
  const me = useMe(Boolean(user))
  const profile = useProfile(user?.username)
  const now = useNow(CLOCK_MS)
  const nameRef = useRef<HTMLInputElement>(null)

  if (!user) return <Navigate to="/login" replace state={{ from: '/profile' }} />

  function editProfile() {
    const input = nameRef.current
    if (!input) return
    input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    input.focus({ preventScroll: true })
  }

  return (
    <div className="flex flex-col gap-2 p-2">
      <ProfileHeader
        profile={profile.data}
        username={user.username}
        isPending={profile.isPending}
        error={profile.error}
        own
        displayName={user.display_name}
        bio={user.bio}
        actions={
          <Button variant="secondary" size="terminal" className="h-9" onClick={editProfile}>
            Редагувати профіль
          </Button>
        }
      />

      <div className="grid items-start gap-2 xl:grid-cols-[minmax(0,1fr)_420px]">
        <ProfileFeed
          username={user.username}
          counts={{ posts: profile.data?.posts }}
          now={now}
          className="order-2 xl:order-1"
        />
        <aside className="order-1 flex min-w-0 flex-col gap-2 xl:order-2" aria-label="Налаштування">
          <ProfileInfoPanel key={`info-${user.id}`} ref={nameRef} user={user} />
          <DefaultsPanel key={`defaults-${user.id}`} user={user} />
          <NotificationsPanel
            user={user}
            checking={me.isFetching}
            onCheck={() => void me.refetch()}
          />
          <AccountPanel user={user} />
        </aside>
      </div>
    </div>
  )
}
