import { Link } from 'react-router-dom'

import { AuthCard } from '@/features/auth/components/AuthCard'
import { Button } from '@/shared/ui/button'

export function LoginPage() {
  return (
    <AuthCard mode="login">
      <p className="text-caption text-muted-foreground">
        Форма входу з'явиться разом з обліковими записами: персональні комісії, сповіщення й
        Watchlist.
      </p>
      <Button asChild className="w-full">
        <Link to="/">Продовжити без входу</Link>
      </Button>
    </AuthCard>
  )
}
