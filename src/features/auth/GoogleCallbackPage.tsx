import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'

import { GOOGLE_ERRORS } from '@/features/auth/api'
import { FormError } from '@/features/auth/components/AuthForm'
import { exchangeOnce, takeGoogleRemember } from '@/features/auth/hooks'
import { safeNext } from '@/features/auth/lib'
import { toApiError } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

export function GoogleCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const signIn = useAuthStore((state) => state.signIn)
  const code = params.get('code')
  const next = safeNext(params.get('next'))
  const [error, setError] = useState<string | null>(code ? null : GOOGLE_ERRORS.google_state)

  useEffect(() => {
    if (!code) return
    let active = true
    exchangeOnce(code)
      .then((response) => {
        if (!active) return
        signIn(response, takeGoogleRemember())
        navigate(next, { replace: true })
      })
      .catch((reason: unknown) => {
        if (active) setError(toApiError(reason).message)
      })
    return () => {
      active = false
    }
  }, [code, next, navigate, signIn])

  return (
    <section className="flex w-full max-w-[400px] flex-col gap-4 rounded-sm border border-border-strong bg-card px-[22px] py-6">
      <h1 className="text-ui-lg font-semibold">Вхід через Google</h1>
      {error ? (
        <>
          <FormError>{error}</FormError>
          <Button asChild className="h-[38px] text-ui">
            <Link to="/login">Спробувати ще раз</Link>
          </Button>
        </>
      ) : (
        <p role="status" className="text-ui text-muted-foreground">
          Входимо через Google…
        </p>
      )}
    </section>
  )
}
