import { LogOut } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { Logo } from '@/app/layout/Logo'
import { MainNav, MobileNav } from '@/app/layout/Nav'
import { NotificationsBell } from '@/features/alerts/components/NotificationsBell'
import { useLogout } from '@/features/auth/hooks'
import { GlobalSearch } from '@/features/search/GlobalSearch'
import { Avatar } from '@/shared/ui/avatar'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

function Account() {
  const user = useAuthStore((state) => state.session?.user)
  const logout = useLogout()
  const { pathname, search } = useLocation()

  if (!user) {
    return (
      <Button asChild variant="secondary">
        <Link to="/login" state={{ from: pathname + search }}>
          Увійти
        </Link>
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-1.5">
      <Link
        to="/profile"
        title={user.username}
        aria-label={`Профіль ${user.username}`}
        className="rounded-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        <Avatar
          name={user.username}
          className="size-[26px] rounded-sm border border-border-strong bg-elevated text-meta"
        />
      </Link>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Вийти"
        disabled={logout.isPending}
        onClick={() => logout.mutate()}
      >
        <LogOut />
      </Button>
    </div>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between gap-2 border-b bg-card px-4 md:px-8">
      <div className="flex items-center gap-2 sm:gap-3">
        <MobileNav className="xl:hidden" />
        <Logo />
      </div>
      <MainNav className="hidden xl:flex" />
      <div className="flex items-center gap-2 sm:gap-3">
        <GlobalSearch />
        <NotificationsBell />
        <Account />
      </div>
    </header>
  )
}
