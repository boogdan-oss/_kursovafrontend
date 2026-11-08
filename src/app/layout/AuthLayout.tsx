import { Outlet } from 'react-router-dom'

import { Logo } from '@/app/layout/Sidebar'

// Вхід і реєстрація — без бічного меню, по центру екрана
export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-4">
      <Logo />
      <main className="w-full max-w-sm">
        <Outlet />
      </main>
    </div>
  )
}
