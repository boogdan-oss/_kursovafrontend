import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
      <p className="text-num-lg text-primary">404</p>
      <h1 className="text-h1">Сторінку не знайдено</h1>
      <p className="max-w-md text-caption text-muted-foreground">
        Можливо, посилання застаріло або в адресі помилка.
      </p>
      <Button asChild>
        <Link to="/">На головну</Link>
      </Button>
    </div>
  )
}
