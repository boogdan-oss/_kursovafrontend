import { Lock, ShieldAlert } from 'lucide-react'
import type { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { isStaff } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Panel } from '@/shared/ui/panel'
import { useAuthStore } from '@/store/useAuthStore'

interface RequireAuthProps {
  title: string
  description: string
  children: ReactNode
}

export function RequireAuth({ title, description, children }: RequireAuthProps) {
  const signedIn = useAuthStore((state) => state.session !== null)
  const { pathname, search } = useLocation()

  if (signedIn) return children

  const from = { from: pathname + search }
  return (
    <div className="flex flex-1 items-center justify-center p-4 py-16">
      <Panel className="flex w-full max-w-[460px] flex-col items-center gap-4 px-6 py-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-sm border border-primary/70 bg-primary/10 text-primary">
          <Lock className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h3">{title}</h1>
          <p className="text-ui-lg text-muted-foreground">{description}</p>
        </div>
        <div className="flex flex-wrap justify-center gap-2">
          <Button asChild size="terminal" className="h-9 px-5">
            <Link to="/login" state={from}>
              Увійти
            </Link>
          </Button>
          <Button asChild variant="secondary" size="terminal" className="h-9 px-5">
            <Link to="/register" state={from}>
              Зареєструватися
            </Link>
          </Button>
        </div>
        <p className="text-meta text-tertiary">
          Огляд ринку, калькулятор і спільнота доступні без входу.
        </p>
      </Panel>
    </div>
  )
}

export function RequireStaff({ children }: { children: ReactNode }) {
  const role = useAuthStore((state) => state.session?.user.role)

  if (!role) {
    return (
      <RequireAuth
        title="Адмін-панель"
        description="Увійдіть як адміністратор або власник, щоб модерувати спільноту."
      >
        {children}
      </RequireAuth>
    )
  }
  if (isStaff(role)) return children

  return (
    <div className="flex flex-1 items-center justify-center p-4 py-16">
      <Panel className="flex w-full max-w-[460px] flex-col items-center gap-4 px-6 py-8 text-center">
        <span className="flex size-11 items-center justify-center rounded-sm border border-destructive/70 bg-destructive/10 text-destructive">
          <ShieldAlert className="size-5" aria-hidden />
        </span>
        <div className="flex flex-col gap-1.5">
          <h1 className="text-h3">Доступ лише для адміністраторів</h1>
          <p className="text-ui-lg text-muted-foreground">
            Адмін-панель бачать адміністратори й власник платформи.
          </p>
        </div>
        <Button asChild variant="secondary" size="terminal" className="h-9 px-5">
          <Link to="/">На головну</Link>
        </Button>
      </Panel>
    </div>
  )
}
