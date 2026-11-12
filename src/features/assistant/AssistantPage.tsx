import { useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { ChatWindow } from '@/features/assistant/components/ChatWindow'
import { ConversationList } from '@/features/assistant/components/ConversationList'
import { MessageInput } from '@/features/assistant/components/MessageInput'
import { MarketContext, QuickPrompts } from '@/features/assistant/components/SidePanels'
import { useConversation, useConversations, useSendMessage } from '@/features/assistant/hooks'
import { fillPrompt, type PromptTemplate } from '@/features/assistant/lib'
import type { ChatRequest } from '@/shared/api/assistant-types'
import { toApiError } from '@/shared/api/client'
import { useNow } from '@/shared/hooks/useNow'
import { Panel, PanelHeader } from '@/shared/ui/panel'
import { Tag } from '@/shared/ui/tag'
import { useFiltersStore } from '@/store/useFiltersStore'

const CLOCK_MS = 10_000

export function AssistantPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const activeId = searchParams.get('c')
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const now = useNow(CLOCK_MS)

  const conversationsQuery = useConversations()
  const conversationQuery = useConversation(activeId)
  const send = useSendMessage()
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const conversations = conversationsQuery.data?.items ?? []
  const conversation = conversationQuery.data
  const title =
    conversation?.title ??
    conversations.find((item) => item.id === activeId)?.title ??
    'Нова розмова'

  const request = send.variables
  const forThisChat = request !== undefined && (request.conversation_id ?? null) === activeId
  const pendingText = forThisChat && (send.isPending || send.isError) ? request.message : null

  function select(id: string | null) {
    send.reset()
    setSearchParams(id ? { c: id } : {}, { replace: false })
  }

  function submit(chatRequest: ChatRequest) {
    send.mutate(chatRequest, {
      onSuccess: (response) => {
        if (response.conversation_id !== (chatRequest.conversation_id ?? null)) {
          setSearchParams({ c: response.conversation_id }, { replace: true })
        }
      },
    })
  }

  function sendText(text: string) {
    const message = text.trim()
    if (!message || send.isPending) return
    setDraft('')
    submit({ conversation_id: activeId, message, asset, fiat })
  }

  function applyPrompt(prompt: PromptTemplate) {
    const text = fillPrompt(prompt.text, asset, fiat)
    if (prompt.send) {
      sendText(text)
      return
    }
    setDraft(text)
    requestAnimationFrame(() => {
      const input = inputRef.current
      if (!input) return
      input.focus()
      input.setSelectionRange(text.length, text.length)
    })
  }

  const conversationMissing = activeId !== null && conversationQuery.isError

  return (
    <>
      <h1 className="sr-only">AI-асистент</h1>
      <div className="grid gap-2 p-2 xl:h-[calc(100dvh-64px)] xl:grid-cols-[280px_minmax(0,1fr)_340px]">
        <ConversationList
          items={conversations}
          activeId={activeId}
          onSelect={select}
          now={now}
          isLoading={conversationsQuery.isPending}
          failed={conversationsQuery.isError}
          className="max-h-[360px] xl:max-h-none"
        />

        <Panel className="flex min-h-0 flex-col" aria-label="Чат">
          <PanelHeader
            title={title}
            meta="відповіді українською"
            actions={<Tag tone="success">Live-дані</Tag>}
          />
          {conversationMissing ? (
            <p className="flex-1 px-3 py-12 text-center text-ui text-muted-foreground">
              Розмову не знайдено. Почніть нову або оберіть іншу зі списку.
            </p>
          ) : (
            <ChatWindow
              messages={activeId ? (conversation?.messages ?? []) : []}
              pendingText={pendingText}
              isSending={forThisChat && send.isPending}
              error={forThisChat && send.isError ? toApiError(send.error).message : null}
              onRetry={() => request && submit(request)}
              isLoading={activeId !== null && conversationQuery.isPending}
            />
          )}
          <MessageInput
            ref={inputRef}
            value={draft}
            onChange={setDraft}
            onSend={sendText}
            onPrompt={applyPrompt}
            disabled={send.isPending}
          />
        </Panel>

        <div className="flex min-w-0 flex-col gap-2">
          <MarketContext now={now} />
          <QuickPrompts onPrompt={applyPrompt} disabled={send.isPending} />
        </div>
      </div>
    </>
  )
}
