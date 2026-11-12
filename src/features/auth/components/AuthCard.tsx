import * as TabsPrimitive from '@radix-ui/react-tabs'
import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

type AuthMode = 'login' | 'register'

const COPY: Record<
  AuthMode,
  { title: string; switchText: string; switchLink: string; switchTo: string }
> = {
  login: {
    title: 'Вхід',
    switchText: 'Немає акаунта?',
    switchLink: 'Зареєструватися',
    switchTo: '/register',
  },
  register: {
    title: 'Реєстрація',
    switchText: 'Вже є акаунт?',
    switchLink: 'Увійти',
    switchTo: '/login',
  },
}

const TAB =
  'relative flex-1 text-ui-lg font-semibold text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring data-[state=active]:text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100'

export function AuthCard({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const navigate = useNavigate()
  const copy = COPY[mode]

  return (
    <>
      <section className="w-full max-w-[400px] rounded-sm border border-border-strong bg-card">
        <h1 className="sr-only">{copy.title}</h1>
        <TabsPrimitive.Root value={mode} onValueChange={(value) => navigate(`/${value}`)}>
          <TabsPrimitive.List aria-label="Вхід або реєстрація" className="flex h-11 border-b">
            <TabsPrimitive.Trigger value="login" className={TAB}>
              Вхід
            </TabsPrimitive.Trigger>
            <TabsPrimitive.Trigger value="register" className={TAB}>
              Реєстрація
            </TabsPrimitive.Trigger>
          </TabsPrimitive.List>
        </TabsPrimitive.Root>
        <div className="px-[22px] pb-6 pt-5">{children}</div>
      </section>
      <p className="flex justify-center gap-1.5 text-ui text-muted-foreground">
        {copy.switchText}
        <Link to={copy.switchTo} className="font-semibold text-primary hover:underline">
          {copy.switchLink}
        </Link>
      </p>
    </>
  )
}
