import { Bell, Search } from 'lucide-react'
import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { Logo } from '@/app/layout/Logo'
import { MainNav, MobileNav } from '@/app/layout/Nav'
import { Button } from '@/shared/ui/button'

function HeaderSearch() {
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement
      if (event.key !== '/' || target.closest('input, textarea, select, [contenteditable]')) return
      event.preventDefault()
      inputRef.current?.focus()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <label className="hidden h-9 w-[250px] items-center gap-2 rounded-lg border bg-background px-3 focus-within:ring-1 focus-within:ring-ring min-[1400px]:flex">
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={inputRef}
        type="search"
        placeholder="Пошук пари або біржі"
        aria-label="Пошук пари або біржі"
        className="min-w-0 flex-1 bg-transparent text-caption outline-none placeholder:text-muted-foreground"
      />
      <kbd className="rounded-[4px] border px-1.5 py-px font-sans text-small text-muted-foreground">
        /
      </kbd>
    </label>
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
        <HeaderSearch />
        <Button asChild variant="outline" size="icon" className="[&_svg]:size-[18px]">
          <Link to="/alerts" aria-label="Сповіщення">
            <Bell />
          </Link>
        </Button>
        <Button asChild variant="secondary">
          <Link to="/login">Увійти</Link>
        </Button>
      </div>
    </header>
  )
}
