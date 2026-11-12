import { Outlet, useLocation } from 'react-router-dom'

import { Footer } from '@/app/layout/Footer'
import { Header } from '@/app/layout/Header'
import { cn } from '@/shared/lib/utils'

const TERMINAL_ROUTES = ['/arbitrage']

export function AppLayout() {
  const { pathname } = useLocation()
  const terminal = TERMINAL_ROUTES.some((route) => pathname.startsWith(route))

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main
        className={cn(
          'flex w-full flex-1 flex-col',
          !terminal && 'mx-auto max-w-[1440px] gap-5 px-4 pb-12 pt-8 md:px-10',
        )}
      >
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
