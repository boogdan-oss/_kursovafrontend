import { Outlet } from 'react-router-dom'

import { Footer } from '@/app/layout/Footer'
import { Header } from '@/app/layout/Header'

export function AppLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="mx-auto flex w-full max-w-[1440px] flex-1 flex-col gap-5 px-4 pb-12 pt-8 md:px-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
