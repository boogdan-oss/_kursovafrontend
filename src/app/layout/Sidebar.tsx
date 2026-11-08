import { Link, NavLink } from 'react-router-dom'

import { NAV_ITEMS } from '@/app/navigation'
import { cn } from '@/shared/lib/utils'

export function Logo({ className }: { className?: string }) {
  return (
    <Link to="/" className={cn('flex items-center gap-2', className)}>
      <img src="/favicon.svg" alt="" className="size-7" />
      <span className="text-lg font-semibold tracking-tight">CryptoParser</span>
    </Link>
  )
}

// Спільне для бічного меню на десктопі і висувного на мобільних
export function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex flex-col gap-1 px-3" aria-label="Основна навігація">
      {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
        <NavLink
          key={to}
          to={to}
          end={to === '/'}
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(
              'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
              isActive
                ? 'bg-primary/15 text-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
            )
          }
        >
          <Icon className="size-4 shrink-0" />
          {label}
        </NavLink>
      ))}
    </nav>
  )
}

export function SidebarFooter() {
  return (
    <p className="px-6 text-xs leading-relaxed text-muted-foreground">
      Лише аналітика: система не виконує угод і не гарантує прибутку.
    </p>
  )
}

export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-screen w-60 shrink-0 flex-col gap-4 border-r bg-card pb-6 md:flex">
      <Logo className="h-16 px-6" />
      <SidebarNav />
      <div className="mt-auto">
        <SidebarFooter />
      </div>
    </aside>
  )
}
