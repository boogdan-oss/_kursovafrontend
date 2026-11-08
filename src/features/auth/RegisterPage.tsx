import { Link } from 'react-router-dom'

import { Button } from '@/shared/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card'

export function RegisterPage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h1 className="text-xl">Реєстрація</h1>
        </CardTitle>
        <CardDescription>Форма реєстрації з'явиться разом з обліковими записами.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Button asChild>
          <Link to="/">Продовжити без входу</Link>
        </Button>
        <Button asChild variant="link">
          <Link to="/login">Вже є акаунт? Увійти</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
