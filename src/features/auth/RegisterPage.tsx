import { Link } from 'react-router-dom'

import { AuthCard } from '@/features/auth/components/AuthCard'
import { Button } from '@/shared/ui/button'

export function RegisterPage() {
  return (
    <AuthCard mode="register">
      <p className="text-caption text-muted-foreground">
        Форма реєстрації з'явиться разом з обліковими записами.
      </p>
      <Button asChild className="w-full">
        <Link to="/">Продовжити без входу</Link>
      </Button>
    </AuthCard>
  )
}
