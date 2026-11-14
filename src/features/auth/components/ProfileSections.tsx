import { forwardRef, useId, useState, type FormEvent, type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'

import { FormError, PasswordStrength } from '@/features/auth/components/AuthForm'
import {
  useChangePassword,
  useLogout,
  useTelegramLink,
  useUnlinkTelegram,
  useUpdateProfile,
  useUpdateSettings,
} from '@/features/auth/hooks'
import { parseAmount, validatePasswordChange } from '@/features/auth/validation'
import { toApiError } from '@/shared/api/client'
import { usePairOptions } from '@/shared/api/queries/market'
import type { User } from '@/shared/api/types'
import { paymentLabel, sortPayments } from '@/shared/lib/payments'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { FieldLabel, Panel, PanelHeader, SectionLabel } from '@/shared/ui/panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Switch } from '@/shared/ui/switch'
import { Tag } from '@/shared/ui/tag'
import { Textarea } from '@/shared/ui/textarea'

export const DISPLAY_NAME_MAX = 64
export const BIO_MAX = 300

const CONTROL =
  'h-8 rounded-sm border-border-strong bg-elevated px-2.5 text-ui-lg aria-[invalid=true]:border-destructive'
const ANY_BANK = 'any'

function Field({
  label,
  htmlFor,
  error,
  hint,
  className,
  children,
}: {
  label: string
  htmlFor: string
  error?: string
  hint?: ReactNode
  className?: string
  children: ReactNode
}) {
  return (
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
      <FieldLabel htmlFor={htmlFor}>{label}</FieldLabel>
      {children}
      {error ? (
        <p className="text-meta text-destructive">{error}</p>
      ) : (
        hint && <p className="text-meta text-tertiary">{hint}</p>
      )}
    </div>
  )
}

function Saved({ children }: { children: ReactNode }) {
  return (
    <span role="status" className="mr-auto text-ui text-success">
      {children}
    </span>
  )
}

interface ProfileInfoValues {
  displayName: string
  bio: string
}

function profileValues(user: User): ProfileInfoValues {
  return { displayName: user.display_name ?? '', bio: user.bio ?? '' }
}

export const ProfileInfoPanel = forwardRef<HTMLInputElement, { user: User }>(
  function ProfileInfoPanel({ user }, nameRef) {
    const id = useId()
    const update = useUpdateProfile()
    const initial = profileValues(user)
    const [values, setValues] = useState(initial)
    const dirty = values.displayName !== initial.displayName || values.bio !== initial.bio
    const errors = {
      displayName:
        values.displayName.trim().length > DISPLAY_NAME_MAX
          ? `Максимум ${DISPLAY_NAME_MAX} символи`
          : undefined,
      bio: values.bio.trim().length > BIO_MAX ? `Максимум ${BIO_MAX} символів` : undefined,
    }

    function change(patch: Partial<ProfileInfoValues>) {
      setValues((current) => ({ ...current, ...patch }))
      update.reset()
    }

    function submit(event: FormEvent) {
      event.preventDefault()
      if (errors.displayName || errors.bio) return
      update.mutate(
        { display_name: values.displayName.trim() || null, bio: values.bio.trim() || null },
        { onSuccess: (saved) => setValues(profileValues(saved)) },
      )
    }

    return (
      <Panel aria-label="Налаштування профілю">
        <PanelHeader title="Налаштування профілю" />
        <form noValidate onSubmit={submit} className="flex flex-col gap-3.5 p-4">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ім’я" htmlFor={`${id}-name`} error={errors.displayName}>
              <Input
                ref={nameRef}
                id={`${id}-name`}
                autoComplete="name"
                placeholder="Як вас показувати"
                value={values.displayName}
                aria-invalid={errors.displayName ? true : undefined}
                onChange={(event) => change({ displayName: event.target.value })}
                className={CONTROL}
              />
            </Field>
            <Field label="Нікнейм" htmlFor={`${id}-username`}>
              <Input
                id={`${id}-username`}
                value={`@${user.username}`}
                readOnly
                className={cn(CONTROL, 'text-muted-foreground')}
              />
            </Field>
            <Field
              label="Email"
              htmlFor={`${id}-email`}
              className="col-span-2"
              hint="Бачите лише ви. Нікнейм і email змінити не можна."
            >
              <Input
                id={`${id}-email`}
                value={user.email}
                readOnly
                className={cn(CONTROL, 'text-muted-foreground')}
              />
            </Field>
            <Field
              label="Про себе"
              htmlFor={`${id}-bio`}
              error={errors.bio}
              className="col-span-2"
              hint={`${values.bio.trim().length} / ${BIO_MAX}`}
            >
              <Textarea
                id={`${id}-bio`}
                rows={3}
                placeholder="Кілька слів про ваш досвід у P2P"
                value={values.bio}
                aria-invalid={errors.bio ? true : undefined}
                onChange={(event) => change({ bio: event.target.value })}
              />
            </Field>
          </div>
          {update.isError && <FormError>{toApiError(update.error).message}</FormError>}
          <div className="flex items-center justify-end gap-2">
            {update.isSuccess && !dirty && <Saved>Збережено</Saved>}
            <Button
              type="button"
              variant="secondary"
              size="terminal"
              disabled={!dirty || update.isPending}
              onClick={() => change(initial)}
            >
              Скасувати
            </Button>
            <Button type="submit" size="terminal" disabled={!dirty || update.isPending}>
              {update.isPending ? 'Зберігаємо…' : 'Зберегти'}
            </Button>
          </div>
        </form>
      </Panel>
    )
  },
)

interface DefaultsValues {
  asset: string
  fiat: string
  payment: string
  investment: string
  minRr: string
  extraFees: string
  hideIlliquid: boolean
}

function defaultsValues(user: User): DefaultsValues {
  const { settings } = user
  const number = (value: string | null | undefined) => (value ? String(Number(value)) : '')
  return {
    asset: settings.default_asset ?? 'USDT',
    fiat: settings.default_fiat ?? 'UAH',
    payment: settings.default_payment ?? ANY_BANK,
    investment: number(settings.default_investment),
    minRr: number(settings.min_rr),
    extraFees: number(settings.extra_fees),
    hideIlliquid: settings.hide_illiquid ?? false,
  }
}

export function DefaultsPanel({ user }: { user: User }) {
  const id = useId()
  const update = useUpdateSettings()
  const initial = defaultsValues(user)
  const [values, setValues] = useState(initial)
  const { assets, fiats, markets } = usePairOptions(values.asset, values.fiat)

  const pair = `${values.asset}/${values.fiat}`
  const pairs = [
    ...new Set([
      pair,
      ...assets.map((code) => `${code}/${values.fiat}`),
      ...fiats.map((code) => `${values.asset}/${code}`),
    ]),
  ]
  const banks = sortPayments([
    ...new Set(
      markets
        .filter((market) => market.asset === values.asset)
        .flatMap((market) => market.payment_methods),
    ),
  ])
  const bankOptions =
    values.payment !== ANY_BANK && !banks.includes(values.payment)
      ? [values.payment, ...banks]
      : banks

  const investment = parseAmount(values.investment)
  const minRr = parseAmount(values.minRr, true)
  const extraFees = parseAmount(values.extraFees, true)
  const invalid = investment === undefined || minRr === undefined || extraFees === undefined
  const dirty = (Object.keys(values) as (keyof DefaultsValues)[]).some(
    (key) => values[key] !== initial[key],
  )

  function change(patch: Partial<DefaultsValues>) {
    setValues((current) => ({ ...current, ...patch }))
    update.reset()
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    if (invalid) return
    update.mutate(
      {
        default_asset: values.asset,
        default_fiat: values.fiat,
        default_payment: values.payment === ANY_BANK ? null : values.payment,
        default_investment: investment,
        min_rr: minRr,
        extra_fees: extraFees,
        hide_illiquid: values.hideIlliquid,
      },
      { onSuccess: (saved) => setValues(defaultsValues(saved)) },
    )
  }

  return (
    <Panel aria-label="Налаштування за замовчуванням">
      <PanelHeader title="За замовчуванням" />
      <form noValidate onSubmit={submit} className="flex flex-col gap-3.5 p-4">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Пара" htmlFor={`${id}-pair`}>
            <Select
              value={pair}
              onValueChange={(next) => {
                const [asset, fiat] = next.split('/')
                change({ asset, fiat, payment: fiat === values.fiat ? values.payment : ANY_BANK })
              }}
            >
              <SelectTrigger id={`${id}-pair`} className={cn(CONTROL, 'font-mono')}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pairs.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field label="Банк" htmlFor={`${id}-bank`}>
            <Select value={values.payment} onValueChange={(payment) => change({ payment })}>
              <SelectTrigger id={`${id}-bank`} className={CONTROL}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ANY_BANK}>Усі способи оплати</SelectItem>
                {bankOptions.map((code) => (
                  <SelectItem key={code} value={code}>
                    {paymentLabel(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>
          <Field
            label={`Сума, ${values.fiat}`}
            htmlFor={`${id}-amount`}
            error={investment === undefined ? 'Число більше нуля' : undefined}
          >
            <Input
              id={`${id}-amount`}
              inputMode="decimal"
              placeholder="20 000"
              value={values.investment}
              aria-invalid={investment === undefined ? true : undefined}
              onChange={(event) => change({ investment: event.target.value })}
              className={cn(CONTROL, 'font-mono')}
            />
          </Field>
          <Field label="Мова" htmlFor={`${id}-language`}>
            <Select value="uk" disabled>
              <SelectTrigger id={`${id}-language`} className={CONTROL}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="uk">Українська</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <SectionLabel className="pt-1">Розрахунки</SectionLabel>
        <div className="grid grid-cols-2 gap-3">
          <Field
            label={`Додаткові комісії, ${values.fiat}`}
            htmlFor={`${id}-fees`}
            error={extraFees === undefined ? 'Число від нуля' : undefined}
          >
            <Input
              id={`${id}-fees`}
              inputMode="decimal"
              placeholder="0"
              value={values.extraFees}
              aria-invalid={extraFees === undefined ? true : undefined}
              onChange={(event) => change({ extraFees: event.target.value })}
              className={cn(CONTROL, 'font-mono')}
            />
          </Field>
          <Field
            label="Мінімальний RR"
            htmlFor={`${id}-rr`}
            error={minRr === undefined ? 'Число від нуля' : undefined}
          >
            <Input
              id={`${id}-rr`}
              inputMode="decimal"
              placeholder="1.5"
              value={values.minRr}
              aria-invalid={minRr === undefined ? true : undefined}
              onChange={(event) => change({ minRr: event.target.value })}
              className={cn(CONTROL, 'font-mono')}
            />
          </Field>
        </div>
        <label className="flex cursor-pointer items-center gap-2 text-ui">
          <Switch
            checked={values.hideIlliquid}
            onCheckedChange={(hideIlliquid) => change({ hideIlliquid })}
          />
          Ховати низьколіквідні можливості
        </label>

        {update.isError && <FormError>{toApiError(update.error).message}</FormError>}
        <div className="flex items-center justify-end gap-2">
          {update.isSuccess && !dirty && <Saved>Збережено й застосовано на сторінках</Saved>}
          <Button
            type="button"
            variant="secondary"
            size="terminal"
            disabled={!dirty || update.isPending}
            onClick={() => change(initial)}
          >
            Скасувати
          </Button>
          <Button type="submit" size="terminal" disabled={!dirty || invalid || update.isPending}>
            {update.isPending ? 'Зберігаємо…' : 'Зберегти'}
          </Button>
        </div>
      </form>
    </Panel>
  )
}

function ToggleRow({
  id,
  label,
  hint,
  badge,
  checked,
  disabled,
  onCheckedChange,
}: {
  id: string
  label: string
  hint?: ReactNode
  badge?: ReactNode
  checked: boolean
  disabled?: boolean
  onCheckedChange: (checked: boolean) => void
}) {
  return (
    <div className="flex min-h-11 items-center gap-3 border-b px-4 py-2 last:border-b-0">
      <div className="flex min-w-0 flex-1 flex-col">
        <label htmlFor={id} className="flex cursor-pointer items-center gap-2 text-ui-lg">
          {label}
          {badge}
        </label>
        {hint && <span className="text-meta text-muted-foreground">{hint}</span>}
      </div>
      <Switch id={id} checked={checked} disabled={disabled} onCheckedChange={onCheckedChange} />
    </div>
  )
}

interface NotificationsPanelProps {
  user: User
  checking: boolean
  onCheck: () => void
}

export function NotificationsPanel({ user, checking, onCheck }: NotificationsPanelProps) {
  const id = useId()
  const settings = useUpdateSettings()
  const link = useTelegramLink()
  const unlink = useUnlinkTelegram()
  const error = [settings, link, unlink].find((mutation) => mutation.isError)?.error
  const soon = <Tag tone="neutral">незабаром</Tag>

  function toggleTelegram(enabled: boolean) {
    if (!enabled) {
      unlink.mutate()
      return
    }
    link.mutate(undefined, {
      onSuccess: ({ url }) => window.open(url, '_blank', 'noopener,noreferrer'),
    })
  }

  return (
    <Panel aria-label="Сповіщення">
      <PanelHeader title="Сповіщення" />
      <ToggleRow
        id={`${id}-comments`}
        label="Відповіді та коментарі"
        badge={soon}
        hint="Налаштування збережеться; самі сповіщення ще в роботі"
        checked={user.settings.notify_comments ?? true}
        disabled={settings.isPending}
        onCheckedChange={(notify_comments) => settings.mutate({ notify_comments })}
      />
      <ToggleRow
        id={`${id}-likes`}
        label="Вподобання й репости"
        badge={soon}
        checked={user.settings.notify_likes ?? false}
        disabled={settings.isPending}
        onCheckedChange={(notify_likes) => settings.mutate({ notify_likes })}
      />
      <ToggleRow
        id={`${id}-telegram`}
        label="Telegram-бот"
        hint={
          user.telegram_connected
            ? 'Підключено: Smart Alerts приходять у Telegram'
            : link.data
              ? 'Натисніть Start у боті й поверніться сюди'
              : 'Сповіщення за вашими правилами — у Telegram'
        }
        checked={user.telegram_connected}
        disabled={link.isPending || unlink.isPending}
        onCheckedChange={toggleTelegram}
      />
      {link.data && !user.telegram_connected && (
        <div className="flex flex-col gap-2 border-t px-4 py-3">
          <a
            href={link.data.url}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all font-mono text-ui text-primary hover:underline"
          >
            {link.data.url}
          </a>
          <Button
            variant="secondary"
            size="terminal"
            className="self-start"
            disabled={checking}
            onClick={onCheck}
          >
            {checking ? 'Перевіряємо…' : 'Я натиснув Start'}
          </Button>
        </div>
      )}
      {error && (
        <div className="border-t px-4 py-3">
          <FormError>{toApiError(error).message}</FormError>
        </div>
      )}
    </Panel>
  )
}

function PasswordDialog({
  user,
  open,
  onOpenChange,
}: {
  user: User
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const id = useId()
  const navigate = useNavigate()
  const change = useChangePassword()
  const empty = { current: '', next: '', confirm: '' }
  const [values, setValues] = useState(empty)
  const [submitted, setSubmitted] = useState(false)
  const errors = submitted ? validatePasswordChange(values) : {}

  function close(next: boolean) {
    if (!next) {
      setValues(empty)
      setSubmitted(false)
      change.reset()
    }
    onOpenChange(next)
  }

  function submit(event: FormEvent) {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(validatePasswordChange(values)).length > 0) return
    change.mutate(
      { current: values.current, next: values.next },
      { onSuccess: () => navigate('/login', { replace: true, state: { from: '/profile' } }) },
    )
  }

  const field = (key: keyof typeof values, label: string, autoComplete: string) => (
    <Field label={label} htmlFor={`${id}-${key}`} error={errors[key]}>
      <Input
        id={`${id}-${key}`}
        type="password"
        autoComplete={autoComplete}
        value={values[key]}
        aria-invalid={errors[key] ? true : undefined}
        onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))}
        className={cn(CONTROL, 'font-mono')}
      />
    </Field>
  )

  return (
    <Dialog open={open} onOpenChange={close}>
      <DialogContent className="max-w-[420px] gap-4 rounded-sm border-border-strong p-5 sm:rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-h3">Змінити пароль</DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Після зміни всі сеанси завершаться — увійдіть знову з новим паролем.
          </DialogDescription>
        </DialogHeader>
        <form noValidate onSubmit={submit} className="flex flex-col gap-3">
          {user.google_connected && (
            <p className="text-meta text-muted-foreground">
              Якщо ви реєструвалися через Google і пароля не задавали, змінити його тут не вдасться.
            </p>
          )}
          {field('current', 'Поточний пароль', 'current-password')}
          {field('next', 'Новий пароль', 'new-password')}
          <PasswordStrength password={values.next} />
          {field('confirm', 'Повторіть новий пароль', 'new-password')}
          {change.isError && <FormError>{toApiError(change.error).message}</FormError>}
          <DialogFooter className="gap-2">
            <Button type="button" variant="secondary" size="terminal" onClick={() => close(false)}>
              Скасувати
            </Button>
            <Button type="submit" size="terminal" disabled={change.isPending}>
              {change.isPending ? 'Змінюємо…' : 'Змінити пароль'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function AccountPanel({ user }: { user: User }) {
  const navigate = useNavigate()
  const logout = useLogout()
  const [changing, setChanging] = useState(false)

  return (
    <Panel aria-label="Обліковий запис" className="grid grid-cols-2 gap-2 p-4">
      <Button variant="secondary" size="terminal" className="h-9" onClick={() => setChanging(true)}>
        Змінити пароль
      </Button>
      <Button
        variant="outline"
        size="terminal"
        className="h-9 border-destructive font-semibold text-destructive hover:bg-destructive/10"
        disabled={logout.isPending}
        onClick={() => {
          navigate('/', { replace: true })
          logout.mutate()
        }}
      >
        Вийти
      </Button>
      <PasswordDialog user={user} open={changing} onOpenChange={setChanging} />
    </Panel>
  )
}
