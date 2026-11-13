import { useId, useState, type ReactNode } from 'react'

import { useBanUser, useReport } from '@/features/community/hooks'
import {
  BAN_REASON_MAX,
  BAN_TERMS,
  REPORT_DETAILS_MAX,
  REPORT_REASONS,
} from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { Author, ReportReason } from '@/shared/api/community-types'
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
import { FieldLabel } from '@/shared/ui/panel'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'

const CONTENT = 'max-w-[440px] gap-4 rounded-sm border-border-strong p-5 sm:rounded-sm'

function ErrorText({ children }: { children: ReactNode }) {
  return (
    <p role="alert" className="text-ui text-destructive">
      {children}
    </p>
  )
}

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  confirmLabel: string
  pending?: boolean
  error?: string | null
  onConfirm: () => void
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  pending = false,
  error,
  onConfirm,
}: ConfirmDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-h3">{title}</DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            {description}
          </DialogDescription>
        </DialogHeader>
        {error && <ErrorText>{error}</ErrorText>}
        <DialogFooter className="gap-2">
          <Button variant="secondary" size="terminal" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button variant="destructive" size="terminal" disabled={pending} onClick={onConfirm}>
            {pending ? 'Зачекайте…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

interface ReportDialogProps {
  target: { post_id: number } | { comment_id: number } | null
  onClose: () => void
}

export function ReportDialog({ target, onClose }: ReportDialogProps) {
  const id = useId()
  const [reason, setReason] = useState<ReportReason>('scam')
  const [details, setDetails] = useState('')
  const report = useReport()
  const what = target && 'comment_id' in target ? 'коментар' : 'публікацію'

  function close() {
    report.reset()
    setDetails('')
    onClose()
  }

  function submit() {
    if (!target) return
    report.mutate(
      { ...target, reason, details: details.trim() || undefined },
      { onSuccess: () => setTimeout(close, 1200) },
    )
  }

  return (
    <Dialog open={target !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className={CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-h3">Поскаржитися на {what}</DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Скаргу перегляне модератор. Автор не дізнається, хто поскаржився.
          </DialogDescription>
        </DialogHeader>

        {report.isSuccess ? (
          <p role="status" className="text-ui-lg text-success">
            Дякуємо! Скаргу надіслано модераторам.
          </p>
        ) : (
          <>
            <fieldset className="flex flex-col gap-1">
              <legend className="mb-1.5 text-label uppercase text-tertiary">Причина</legend>
              {REPORT_REASONS.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex h-8 cursor-pointer items-center gap-2.5 rounded-sm border px-3 text-ui transition-colors',
                    reason === option.value
                      ? 'border-primary/70 bg-primary/10'
                      : 'border-border-strong hover:bg-accent',
                  )}
                >
                  <input
                    type="radio"
                    name={`${id}-reason`}
                    value={option.value}
                    checked={reason === option.value}
                    onChange={() => setReason(option.value)}
                    className="accent-[rgb(var(--primary))]"
                  />
                  {option.label}
                </label>
              ))}
            </fieldset>
            <div className="flex flex-col gap-1.5">
              <FieldLabel htmlFor={`${id}-details`}>Подробиці (необов’язково)</FieldLabel>
              <Textarea
                id={`${id}-details`}
                rows={3}
                maxLength={REPORT_DETAILS_MAX}
                value={details}
                onChange={(event) => setDetails(event.target.value)}
              />
            </div>
            {report.isError && <ErrorText>{toApiError(report.error).message}</ErrorText>}
            <DialogFooter className="gap-2">
              <Button variant="secondary" size="terminal" onClick={close}>
                Скасувати
              </Button>
              <Button size="terminal" disabled={report.isPending} onClick={submit}>
                {report.isPending ? 'Надсилаємо…' : 'Надіслати скаргу'}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}

interface BanDialogProps {
  user: Author | null
  onClose: () => void
}

export function BanDialog({ user, onClose }: BanDialogProps) {
  const id = useId()
  const [term, setTerm] = useState(BAN_TERMS[1].value)
  const [reason, setReason] = useState('')
  const ban = useBanUser()
  const tooLong = reason.length > BAN_REASON_MAX

  function close() {
    ban.reset()
    setReason('')
    onClose()
  }

  function submit() {
    if (!user || !reason.trim() || tooLong) return
    const days = BAN_TERMS.find((option) => option.value === term)?.days ?? null
    ban.mutate({ user_id: user.id, days, reason: reason.trim() }, { onSuccess: close })
  }

  return (
    <Dialog open={user !== null} onOpenChange={(open) => !open && close()}>
      <DialogContent className={CONTENT}>
        <DialogHeader>
          <DialogTitle className="text-h3">Заблокувати @{user?.username}</DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            Користувач не зможе входити й писати, усі його сесії буде завершено.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <FieldLabel htmlFor={`${id}-term`}>Термін</FieldLabel>
            <Select value={term} onValueChange={setTerm}>
              <SelectTrigger id={`${id}-term`} className="h-8 text-ui">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {BAN_TERMS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <FieldLabel htmlFor={`${id}-reason`}>Причина</FieldLabel>
          <Textarea
            id={`${id}-reason`}
            rows={3}
            value={reason}
            aria-invalid={tooLong || undefined}
            onChange={(event) => setReason(event.target.value)}
            placeholder="Напр.: шахрайство, повторні скарги"
          />
        </div>
        {ban.isError && <ErrorText>{toApiError(ban.error).message}</ErrorText>}
        <DialogFooter className="gap-2">
          <Button variant="secondary" size="terminal" onClick={close}>
            Скасувати
          </Button>
          <Button
            variant="destructive"
            size="terminal"
            disabled={!reason.trim() || tooLong || ban.isPending}
            onClick={submit}
          >
            {ban.isPending ? 'Блокуємо…' : 'Заблокувати'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
