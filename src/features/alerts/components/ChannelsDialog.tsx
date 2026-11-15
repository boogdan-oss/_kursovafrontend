import { useState } from 'react'
import { Link } from 'react-router-dom'

import { CHANNEL_LABELS, CHANNELS } from '@/features/alerts/lib'
import type { AlertChannel } from '@/shared/api/types'
import { Button } from '@/shared/ui/button'
import { CheckChip } from '@/shared/ui/check-chip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { useAuthStore } from '@/store/useAuthStore'

interface ChannelsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  summary: string[]
  initial: AlertChannel[]
  confirmLabel: string
  pending: boolean
  error: string | null
  onConfirm: (channels: AlertChannel[]) => void
}

export function ChannelsDialog({
  open,
  onOpenChange,
  title,
  summary,
  initial,
  confirmLabel,
  pending,
  error,
  onConfirm,
}: ChannelsDialogProps) {
  const telegram = useAuthStore((state) => state.session?.user.telegram_connected ?? false)
  const [channels, setChannels] = useState<AlertChannel[]>(initial)

  function toggle(channel: AlertChannel) {
    setChannels((current) =>
      current.includes(channel)
        ? current.filter((item) => item !== channel)
        : CHANNELS.filter((item) => item === channel || current.includes(item)),
    )
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (next) setChannels(initial)
        onOpenChange(next)
      }}
    >
      <DialogContent className="max-w-[440px] gap-4 rounded-sm border-border-strong p-5 sm:rounded-sm">
        <DialogHeader>
          <DialogTitle className="text-h3">{title}</DialogTitle>
          <DialogDescription className="text-ui text-muted-foreground">
            {summary.join(' · ')}
          </DialogDescription>
        </DialogHeader>

        <fieldset className="flex flex-col gap-2">
          <legend className="mb-1 text-label uppercase text-tertiary">Куди надсилати</legend>
          <div className="flex flex-wrap gap-2">
            {CHANNELS.map((channel) => (
              <CheckChip
                key={channel}
                checked={channels.includes(channel)}
                disabled={channel === 'telegram' && !telegram}
                onClick={() => toggle(channel)}
              >
                {CHANNEL_LABELS[channel]}
              </CheckChip>
            ))}
          </div>
          {!telegram && (
            <p className="text-meta text-muted-foreground">
              Telegram недоступний: спершу підключіть бота в{' '}
              <Link to="/profile" className="text-primary hover:underline">
                профілі
              </Link>
              .
            </p>
          )}
          {channels.includes('email') && (
            <p className="text-meta text-muted-foreground">
              Лист прийде на email вашого акаунта, якщо на сервері налаштовано пошту.
            </p>
          )}
        </fieldset>

        {channels.length === 0 && (
          <p className="text-ui text-warning">Оберіть хоча б один канал.</p>
        )}
        {error && (
          <p role="alert" className="text-ui text-destructive">
            {error}
          </p>
        )}

        <DialogFooter className="gap-2">
          <Button variant="secondary" size="terminal" onClick={() => onOpenChange(false)}>
            Скасувати
          </Button>
          <Button
            size="terminal"
            disabled={channels.length === 0 || pending}
            onClick={() => onConfirm(channels)}
          >
            {pending ? 'Зберігаємо…' : confirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
