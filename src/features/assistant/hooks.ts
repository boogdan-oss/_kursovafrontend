import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { fetchConversation, fetchConversations, sendMessage } from '@/features/assistant/api'
import type { ConversationDetail } from '@/shared/api/assistant-types'
import { queryKeys } from '@/shared/api/queryKeys'

export function useConversations() {
  return useQuery({
    queryKey: queryKeys.assistant.conversations(),
    queryFn: ({ signal }) => fetchConversations(signal),
  })
}

export function useConversation(id: string | null) {
  return useQuery({
    queryKey: queryKeys.assistant.conversation(id ?? ''),
    queryFn: ({ signal }) => fetchConversation(id!, signal),
    enabled: id !== null,
  })
}

export function useSendMessage() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: (response) => {
      queryClient.setQueryData<ConversationDetail>(
        queryKeys.assistant.conversation(response.conversation_id),
        (previous) => ({
          id: response.conversation_id,
          title: response.title,
          updated_at: response.message.created_at,
          messages: [...(previous?.messages ?? []), response.user_message, response.message],
        }),
      )
      void queryClient.invalidateQueries({ queryKey: queryKeys.assistant.conversations() })
    },
  })
}
