import { House } from 'lucide-react'
import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-6xl font-bold text-primary">404</p>
      <h1 className="text-2xl font-semibold tracking-tight">Сторінку не знайдено</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Можливо, посилання застаріло або в адресі помилка.
      </p>
      <Button asChild>
        <Link to="/">
          <House />
          На дашборд
        </Link>
      </Button>
    </div>
  )
}
