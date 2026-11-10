import axios, { AxiosError } from 'axios'

export const API_URL = import.meta.env.VITE_API_URL ?? ''

const TIMEOUT_MS = 15_000

export type ApiErrorCode =
  | 'network'
  | 'timeout'
  | 'canceled'
  | 'unauthorized'
  | 'forbidden'
  | 'not_found'
  | 'validation'
  | 'rate_limit'
  | 'server'
  | 'unknown'

interface ApiErrorOptions {
  status?: number
  code?: ApiErrorCode
  fields?: Record<string, string>
  cause?: unknown
}

export class ApiError extends Error {
  readonly status: number
  readonly code: ApiErrorCode
  readonly fields: Record<string, string>

  constructor(message: string, options: ApiErrorOptions = {}) {
    super(message, { cause: options.cause })
    this.name = 'ApiError'
    this.status = options.status ?? 0
    this.code = options.code ?? 'unknown'
    this.fields = options.fields ?? {}
  }

  get isClientError() {
    return this.status >= 400 && this.status < 500
  }
}

const STATUS_CODES: Record<number, ApiErrorCode> = {
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not_found',
  422: 'validation',
  429: 'rate_limit',
}

const DEFAULT_MESSAGES: Record<ApiErrorCode, string> = {
  network: 'Немає зв’язку із сервером. Перевірте інтернет і спробуйте ще раз.',
  timeout: 'Сервер не відповів вчасно. Спробуйте ще раз.',
  canceled: 'Запит скасовано.',
  unauthorized: 'Потрібно увійти в акаунт.',
  forbidden: 'Недостатньо прав для цієї дії.',
  not_found: 'Дані не знайдено.',
  validation: 'Перевірте введені дані.',
  rate_limit: 'Забагато запитів. Зачекайте кілька секунд.',
  server: 'Помилка на сервері. Спробуйте пізніше.',
  unknown: 'Щось пішло не так. Спробуйте ще раз.',
}

interface ValidationItem {
  loc?: (string | number)[]
  msg?: string
}

function readDetail(body: unknown): { message?: string; fields: Record<string, string> } {
  const fields: Record<string, string> = {}
  if (typeof body !== 'object' || body === null || !('detail' in body)) return { fields }

  const { detail } = body as { detail: unknown }
  if (typeof detail === 'string') return { message: detail, fields }
  if (!Array.isArray(detail)) return { fields }

  for (const item of detail as ValidationItem[]) {
    if (!item?.msg) continue
    const loc = item.loc ?? []
    const path = loc.length > 1 ? loc.slice(1).join('.') : String(loc[0] ?? '')
    fields[path] = item.msg
  }
  const messages = Object.entries(fields).map(([path, msg]) => (path ? `${path}: ${msg}` : msg))
  return { message: messages.join('; ') || undefined, fields }
}

export function toApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error

  if (axios.isCancel(error)) {
    return new ApiError(DEFAULT_MESSAGES.canceled, { code: 'canceled', cause: error })
  }

  if (axios.isAxiosError(error)) {
    const { response } = error
    if (!response) {
      const timedOut = error.code === AxiosError.ECONNABORTED || error.code === AxiosError.ETIMEDOUT
      const code: ApiErrorCode = timedOut ? 'timeout' : 'network'
      return new ApiError(DEFAULT_MESSAGES[code], { code, cause: error })
    }

    const { status } = response
    const code: ApiErrorCode = STATUS_CODES[status] ?? (status >= 500 ? 'server' : 'unknown')
    const { message, fields } = readDetail(response.data)
    const text = status >= 500 ? DEFAULT_MESSAGES.server : (message ?? DEFAULT_MESSAGES[code])
    return new ApiError(text, { status, code, fields, cause: error })
  }

  const message = error instanceof Error && error.message ? error.message : DEFAULT_MESSAGES.unknown
  return new ApiError(message, { cause: error })
}

export const apiClient = axios.create({
  baseURL: `${API_URL}/api/v1`,
  timeout: TIMEOUT_MS,
  headers: { Accept: 'application/json' },
})

apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => Promise.reject(toApiError(error)),
)

export const api = apiClient
