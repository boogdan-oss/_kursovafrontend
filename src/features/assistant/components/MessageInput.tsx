import { forwardRef, type KeyboardEvent } from 'react'

import { SUGGESTIONS, type PromptTemplate } from '@/features/assistant/lib'
import { Button } from '@/shared/ui/button'

const MAX_LENGTH = 2000

interface MessageInputProps {
  value: string
  onChange: (value: string) => void
  onSend: (text: string) => void
  onPrompt: (prompt: PromptTemplate) => void
  disabled: boolean
}

export const MessageInput = forwardRef<HTMLTextAreaElement, MessageInputProps>(
  ({ value, onChange, onSend, onPrompt, disabled }, ref) => {
    const canSend = value.trim().length > 0 && !disabled

    function onKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
      if (event.key !== 'Enter' || event.shiftKey || event.nativeEvent.isComposing) return
      event.preventDefault()
      if (canSend) onSend(value)
    }

    return (
      <div className="flex flex-col gap-2 border-t px-3 py-2.5">
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTIONS.map((suggestion) => (
            <button
              key={suggestion.label}
              type="button"
              disabled={disabled}
              onClick={() => onPrompt(suggestion)}
              className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-border-strong px-2 text-ui text-muted-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring enabled:hover:text-foreground disabled:opacity-50"
            >
              <span aria-hidden className="size-2.5 border border-muted-foreground" />
              {suggestion.label}
            </button>
          ))}
        </div>

        <form
          className="flex items-stretch gap-1.5"
          onSubmit={(event) => {
            event.preventDefault()
            if (canSend) onSend(value)
          }}
        >
          <div className="relative min-w-0 flex-1">
            <textarea
              ref={ref}
              rows={1}
              value={value}
              maxLength={MAX_LENGTH}
              onChange={(event) => onChange(event.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Запитайте про ціни, спреди чи продавців…"
              aria-label="Повідомлення асистенту"
              className="block max-h-40 min-h-9 w-full resize-none rounded-sm border border-border-strong bg-elevated py-2 pl-3 pr-14 text-ui-lg leading-[18px] [field-sizing:content] placeholder:text-tertiary focus-visible:border-primary focus-visible:outline-none"
            />
            <kbd className="pointer-events-none absolute right-2 top-2.5 rounded-sm border border-border-strong px-1 text-label text-foreground">
              Enter
            </kbd>
          </div>
          <Button type="submit" className="h-9 px-4 text-ui" disabled={!canSend}>
            Надіслати
          </Button>
        </form>

        <p className="text-meta text-tertiary">
          AI може помилятися. Відповіді — аналітика, не фінансова порада.
        </p>
      </div>
    )
  },
)
MessageInput.displayName = 'MessageInput'
