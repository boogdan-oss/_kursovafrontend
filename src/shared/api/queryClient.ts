import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'

import { toApiError } from '@/shared/api/client'

export const DEFAULT_STALE_TIME_MS = 30_000
const MAX_RETRIES = 1

function showError(error: unknown) {
  const apiError = toApiError(error)
  if (apiError.code === 'canceled') return
  toast.error(apiError.message, { id: apiError.message })
}

export function createQueryClient() {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.state.data !== undefined && !query.meta?.silent) showError(error)
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _context, mutation) => {
        if (!mutation.options.onError && !mutation.meta?.silent) showError(error)
      },
    }),
    defaultOptions: {
      queries: {
        staleTime: DEFAULT_STALE_TIME_MS,
        refetchOnWindowFocus: false,
        retry: (failureCount, error) =>
          failureCount < MAX_RETRIES && !toApiError(error).isClientError,
      },
    },
  })
}

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { silent?: boolean }
    mutationMeta: { silent?: boolean }
  }
}
