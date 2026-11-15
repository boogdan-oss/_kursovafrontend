import { Menu } from 'lucide-react'
import { useState } from 'react'
import { NavLink } from 'react-router-dom'

import { Logo } from '@/app/layout/Logo'
import { ADMIN_NAV_ITEM, NAV_ITEMS } from '@/app/navigation'
import { isStaff } from '@/shared/lib/roles'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
import { useAuthStore } from '@/store/useAuthStore'

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const staff = useAuthStore((state) => isStaff(state.session?.user.role))
  const items = staff ? [...NAV_ITEMS, ADMIN_NAV_ITEM] : NAV_ITEMS
  return (
    <>
      {items.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'whitespace-nowrap rounded-md px-3 py-2 text-caption transition-colors',
              isActive
                ? 'bg-accent font-semibold text-foreground'
                : 'text-muted-foreground hover:text-foreground',
            )
          }
        >
          {label}
        </NavLink>
      ))}
    </>
  )
}

export function MainNav({ className }: { className?: string }) {
  return (
    <nav className={cn('items-center gap-1', className)} aria-label="Основна навігація">
      <NavItems />
    </nav>
  )
}

export function MobileNav({ className }: { className?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="icon" className={className} aria-label="Відкрити меню">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="flex w-72 flex-col gap-6" aria-describedby={undefined}>
        <SheetTitle className="sr-only">Навігація</SheetTitle>
        <Logo />
        <nav className="flex flex-col gap-1" aria-label="Основна навігація">
          <NavItems onNavigate={() => setOpen(false)} />
        </nav>
      </SheetContent>
    </Sheet>
  )
}
