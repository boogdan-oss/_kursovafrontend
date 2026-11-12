import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

import { MessageContent } from '@/features/assistant/components/MessageContent'
import { isInternalPath } from '@/features/assistant/lib'
import type { ChatMessage, ChatRole } from '@/shared/api/assistant-types'
import { formatTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Skeleton } from '@/shared/ui/skeleton'

const ROLE_LABELS: Record<ChatRole, string> = { user: 'Ви', assistant: 'UPars AI' }

interface MessageRowProps {
  role: ChatRole
  time?: string
  children: React.ReactNode
}

function MessageRow({ role, time, children }: MessageRowProps) {
  return (
    <article
      aria-label={ROLE_LABELS[role]}
      className="grid gap-x-4 gap-y-1 border-b px-3 py-3 sm:grid-cols-[110px_minmax(0,1fr)]"
    >
      <header className="flex items-baseline gap-2 sm:flex-col sm:gap-0.5">
        <span
          className={cn(
            'text-label font-semibold uppercase tracking-[0.06em]',
            role === 'assistant' ? 'text-primary' : 'text-muted-foreground',
          )}
        >
          {ROLE_LABELS[role]}
        </span>
        {time && <time className="font-mono text-meta text-tertiary">{time}</time>}
      </header>
      <div className="min-w-0">{children}</div>
    </article>
  )
}

function Message({ message }: { message: ChatMessage }) {
  const actions = (message.actions ?? []).filter((action) => isInternalPath(action.to))
  return (
    <MessageRow role={message.role} time={formatTime(message.created_at)}>
      {message.role === 'user' ? (
        <p className="whitespace-pre-line text-ui-lg">{message.content}</p>
      ) : (
        <MessageContent content={message.content} />
      )}
      {actions.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {actions.map((action) => (
            <Button key={action.to + action.label} asChild variant="secondary" size="terminal">
              <Link to={action.to}>{action.label}</Link>
            </Button>
          ))}
        </div>
      )}
    </MessageRow>
  )
}

interface ChatWindowProps {
  messages: ChatMessage[]
  pendingText: string | null
  isSending: boolean
  error: string | null
  onRetry: () => void
  isLoading: boolean
}

export function ChatWindow({
  messages,
  pendingText,
  isSending,
  error,
  onRetry,
  isLoading,
}: ChatWindowProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = scrollRef.current
    if (element) element.scrollTop = element.scrollHeight
  }, [messages.length, pendingText, isSending, error])

  if (isLoading) {
    return (
      <div className="flex flex-1 flex-col gap-3 p-3">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-24 w-full" />
      </div>
    )
  }

  const empty = messages.length === 0 && pendingText === null

  return (
    <div
      ref={scrollRef}
      role="log"
      aria-label="Повідомлення"
      aria-live="polite"
      className="min-h-[320px] flex-1 overflow-y-auto"
    >
      {empty && (
        <div className="flex h-full flex-col items-center justify-center gap-2 px-6 py-12 text-center">
          <p className="text-ui-lg font-semibold">Запитайте UPars AI</p>
          <p className="max-w-[440px] text-ui text-muted-foreground">
            Асистент відповідає українською на основі живих цін, спредів і рейтингів продавців: де
            вигідніше купити, яка біржа дешевша за комісіями, чи можна довіряти продавцю.
          </p>
        </div>
      )}

      {messages.map((message) => (
        <Message key={message.id} message={message} />
      ))}

      {pendingText !== null && (
        <MessageRow role="user">
          <p className="whitespace-pre-line text-ui-lg">{pendingText}</p>
        </MessageRow>
      )}

      {isSending && (
        <MessageRow role="assistant">
          <p className="flex items-center gap-1 text-ui text-muted-foreground">
            Аналізую ринок
            <span className="inline-flex gap-0.5" aria-hidden>
              {[0, 1, 2].map((dot) => (
                <span
                  key={dot}
                  className="size-1 animate-pulse rounded-full bg-primary"
                  style={{ animationDelay: `${dot * 150}ms` }}
                />
              ))}
            </span>
          </p>
        </MessageRow>
      )}

      {error && (
        <MessageRow role="assistant">
          <div className="flex flex-wrap items-center gap-3">
            <p role="alert" className="text-ui text-destructive">
              {error}
            </p>
            <Button variant="secondary" size="terminal" onClick={onRetry}>
              Спробувати ще
            </Button>
          </div>
        </MessageRow>
      )}
    </div>
  )
}
