import { useId, useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'

import { AuthCard } from '@/features/auth/components/AuthCard'
import {
  AuthField,
  Checkbox,
  FormError,
  GoogleButton,
  PasswordStrength,
} from '@/features/auth/components/AuthForm'
import { googleStartUrl } from '@/features/auth/api'
import {
  rememberForGoogle,
  useAuthRedirectTarget,
  useGoogleError,
  useRegister,
} from '@/features/auth/hooks'
import { validateRegistration, type RegisterField } from '@/features/auth/validation'
import { toApiError } from '@/shared/api/client'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

const SERVER_HINTS: Record<RegisterField, string> = {
  username: '3–32 символи: латинські літери, цифри, «_» або «.»',
  email: 'Вкажіть коректний email',
  password: 'Від 8 до 128 символів',
}

export function RegisterPage() {
  const id = useId()
  const [values, setValues] = useState({ username: '', email: '', password: '', confirm: '' })
  const [agreed, setAgreed] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const mutation = useRegister()
  const googleError = useGoogleError()
  const session = useAuthStore((state) => state.session)
  const target = useAuthRedirectTarget()

  if (session) return <Navigate to={target} replace />

  const errors = submitted ? validateRegistration(values) : {}
  const serverError = mutation.isError ? toApiError(mutation.error) : null
  const serverFields = Object.keys(serverError?.fields ?? {}).filter(
    (field): field is RegisterField => field in SERVER_HINTS,
  )
  const fieldError = (field: RegisterField) =>
    errors[field] ?? (serverFields.includes(field) ? SERVER_HINTS[field] : undefined)

  function update(field: keyof typeof values, value: string) {
    setValues((previous) => ({ ...previous, [field]: value }))
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validateRegistration(values)).length > 0) return
    mutation.mutate({
      username: values.username,
      email: values.email.trim(),
      password: values.password,
    })
  }

  return (
    <AuthCard mode="register">
      <form noValidate onSubmit={submit} className="flex flex-col gap-4">
        <AuthField
          id={`${id}-username`}
          label="Нікнейм"
          adornment="@"
          autoComplete="username"
          placeholder="bohdan"
          value={values.username}
          onChange={(event) => update('username', event.target.value.replace(/^@/, '').trim())}
          error={fieldError('username')}
        />
        <AuthField
          id={`${id}-email`}
          label="Email"
          type="email"
          autoComplete="email"
          placeholder="bohdan@example.com"
          value={values.email}
          onChange={(event) => update('email', event.target.value)}
          error={fieldError('email')}
        />
        <AuthField
          id={`${id}-password`}
          label="Пароль"
          type="password"
          autoComplete="new-password"
          value={values.password}
          onChange={(event) => update('password', event.target.value)}
          error={fieldError('password')}
        />
        <AuthField
          id={`${id}-confirm`}
          label="Підтвердження пароля"
          type="password"
          autoComplete="new-password"
          value={values.confirm}
          onChange={(event) => update('confirm', event.target.value)}
          error={errors.confirm}
        />
        <PasswordStrength password={values.password} />
        <Checkbox checked={agreed} onCheckedChange={setAgreed}>
          Погоджуюсь із правилами спільноти
        </Checkbox>
        {serverError && serverFields.length === 0 && <FormError>{serverError.message}</FormError>}
        <Button type="submit" className="h-[38px] text-ui" disabled={!agreed || mutation.isPending}>
          {mutation.isPending ? 'Створюємо акаунт…' : 'Створити акаунт'}
        </Button>
      </form>
      <div className="mt-5">
        <GoogleButton
          href={googleStartUrl(target)}
          error={googleError}
          onClick={() => rememberForGoogle(true)}
        />
      </div>
    </AuthCard>
  )
}
