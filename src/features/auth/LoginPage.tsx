import { useId, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'

import { AuthCard } from '@/features/auth/components/AuthCard'
import { AuthField, Checkbox, FormError, GoogleButton } from '@/features/auth/components/AuthForm'
import { googleStartUrl } from '@/features/auth/api'
import {
  rememberForGoogle,
  useAuthRedirectTarget,
  useGoogleError,
  useLogin,
} from '@/features/auth/hooks'
import { toApiError } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

export function LoginPage() {
  const id = useId()
  const [login, setLogin] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [submitted, setSubmitted] = useState(false)
  const mutation = useLogin()
  const googleError = useGoogleError()
  const session = useAuthStore((state) => state.session)
  const target = useAuthRedirectTarget()

  if (session) return <Navigate to={target} replace />

  const errors = {
    login: submitted && !login.trim() ? 'Вкажіть email або нікнейм' : undefined,
    password: submitted && !password ? 'Вкажіть пароль' : undefined,
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (!login.trim() || !password) return
    mutation.mutate({ body: { login: login.trim(), password }, remember })
  }

  return (
    <AuthCard mode="login">
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <AuthField
          id={`${id}-login`}
          label="Email або нікнейм"
          autoComplete="username"
          placeholder="bohdan@example.com"
          value={login}
          onChange={(event) => setLogin(event.target.value)}
          error={errors.login}
        />
        <AuthField
          id={`${id}-password`}
          label="Пароль"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          error={errors.password}
        />
        <Checkbox checked={remember} onCheckedChange={setRemember}>
          Запам’ятати мене
        </Checkbox>
        {mutation.isError && <FormError>{toApiError(mutation.error).message}</FormError>}
        <Button type="submit" className="h-[38px] text-ui" disabled={mutation.isPending}>
          {mutation.isPending ? 'Вхід…' : 'Увійти'}
        </Button>
      </form>
      <div className="mt-5">
        <GoogleButton
          href={googleStartUrl(target)}
          error={googleError}
          onClick={() => rememberForGoogle(remember)}
        />
      </div>
    </AuthCard>
  )
}
