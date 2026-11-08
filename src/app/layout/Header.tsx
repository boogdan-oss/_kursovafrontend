import { LogIn, Menu, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { Link } from 'react-router-dom'

import { Logo, SidebarFooter, SidebarNav } from '@/app/layout/Sidebar'
import { useHealth } from '@/features/dashboard/hooks'
import { formatTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/shared/ui/sheet'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'
import { useSettingsStore } from '@/store/useSettingsStore'

function MobileNav() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden" aria-label="Відкрити меню">
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="flex w-64 flex-col gap-4 bg-card p-0 pb-6"
        aria-describedby={undefined}
      >
        <SheetTitle className="sr-only">Навігація</SheetTitle>
        <Logo className="h-16 px-6" />
        <SidebarNav onNavigate={() => setOpen(false)} />
        <div className="mt-auto">
          <SidebarFooter />
        </div>
      </SheetContent>
    </Sheet>
  )
}

function ApiStatus() {
  const { data, isError } = useHealth()
  const online = !isError && data !== undefined

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex cursor-default items-center gap-2 text-sm text-muted-foreground">
          <span className={cn('size-2 rounded-full', online ? 'bg-success' : 'bg-destructive')} />
          <span className="hidden sm:inline">{online ? 'API онлайн' : 'API недоступний'}</span>
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {online ? `Перевірено о ${formatTime(data.time)}` : 'Бекенд не відповідає на /health'}
      </TooltipContent>
    </Tooltip>
  )
}

function ThemeToggle() {
  const theme = useSettingsStore((state) => state.theme)
  const toggleTheme = useSettingsStore((state) => state.toggleTheme)
  const label = theme === 'dark' ? 'Світла тема' : 'Темна тема'

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={label}>
          {theme === 'dark' ? <Sun /> : <Moon />}
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-16 items-center gap-3 border-b bg-background/80 px-4 backdrop-blur md:px-6">
      <MobileNav />
      <Logo className="md:hidden" />
      <span className="hidden text-sm text-muted-foreground md:inline">Аналіз P2P-ринку</span>
      <div className="ml-auto flex items-center gap-2">
        <ApiStatus />
        <ThemeToggle />
        <Button asChild variant="outline" size="sm">
          <Link to="/login">
            <LogIn />
            <span className="hidden sm:inline">Увійти</span>
          </Link>
        </Button>
      </div>
    </header>
  )
}
