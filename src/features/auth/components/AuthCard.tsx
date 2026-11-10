import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'

type AuthMode = 'login' | 'register'

const COPY: Record<
  AuthMode,
  { title: string; description: string; switchText: string; switchLink: string; switchTo: string }
> = {
  login: {
    title: 'Вхід',
    description: 'Раді бачити вас знову',
    switchText: 'Немає акаунта?',
    switchLink: 'Зареєструватися',
    switchTo: '/register',
  },
  register: {
    title: 'Реєстрація',
    description: 'Створіть акаунт за хвилину',
    switchText: 'Вже є акаунт?',
    switchLink: 'Увійти',
    switchTo: '/login',
  },
}

export function AuthCard({ mode, children }: { mode: AuthMode; children: ReactNode }) {
  const navigate = useNavigate()
  const copy = COPY[mode]

  return (
    <div className="flex w-full max-w-[420px] flex-col gap-[18px] rounded-[20px] border border-primary/60 bg-card p-8 shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
      <div className="flex flex-col gap-1">
        <h1 className="text-h2">{copy.title}</h1>
        <p className="text-caption text-muted-foreground">{copy.description}</p>
      </div>
      <Tabs value={mode} onValueChange={(value) => navigate(`/${value}`)}>
        <TabsList className="w-full">
          <TabsTrigger value="login" className="flex-1">
            Вхід
          </TabsTrigger>
          <TabsTrigger value="register" className="flex-1">
            Реєстрація
          </TabsTrigger>
        </TabsList>
      </Tabs>
      {children}
      <p className="flex justify-center gap-1.5 text-caption text-muted-foreground">
        {copy.switchText}
        <Link to={copy.switchTo} className="font-semibold text-primary hover:underline">
          {copy.switchLink}
        </Link>
      </p>
    </div>
  )
}
