import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function LoginPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl">Вхід</h1>
        </CardTitle>
        <CardDescription>
          Форма входу з'явиться разом з обліковими записами: персональні налаштування комісій,
          сповіщення і Watchlist.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild>
          <Link to="/">Продовжити без входу</Link>
        </Button>
        <Button asChild variant="link">
          <Link to="/register">Немає акаунта? Зареєструватися</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
