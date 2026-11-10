import {
  AxiosError,
  AxiosHeaders,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios'

import { ApiError, apiClient, toApiError } from '@/shared/api/client'

const config = { headers: new AxiosHeaders() } as InternalAxiosRequestConfig

function httpError(status: number, data: unknown) {
  const response = { status, data, statusText: '', headers: {}, config } as AxiosResponse
  return new AxiosError('Request failed', AxiosError.ERR_BAD_RESPONSE, config, null, response)
}

describe('toApiError', () => {
  it('бере текст із detail-рядка FastAPI', () => {
    const error = toApiError(httpError(404, { detail: 'Пару не знайдено' }))
    expect(error).toBeInstanceOf(ApiError)
    expect(error).toMatchObject({ status: 404, code: 'not_found', message: 'Пару не знайдено' })
    expect(error.isClientError).toBe(true)
  })

  it('розбирає помилки валідації 422 по полях', () => {
    const error = toApiError(
      httpError(422, {
        detail: [
          { loc: ['query', 'amount'], msg: 'Input should be greater than 0', type: 'greater_than' },
          { loc: ['body', 'deal', 'asset'], msg: 'Field required', type: 'missing' },
        ],
      }),
    )
    expect(error.code).toBe('validation')
    expect(error.fields).toEqual({
      amount: 'Input should be greater than 0',
      'deal.asset': 'Field required',
    })
    expect(error.message).toContain('amount: Input should be greater than 0')
  })

  it('не показує користувачу текст помилки 5xx', () => {
    const error = toApiError(httpError(500, { detail: 'psycopg.OperationalError: ...' }))
    expect(error).toMatchObject({ status: 500, code: 'server' })
    expect(error.message).toBe('Помилка на сервері. Спробуйте пізніше.')
    expect(error.isClientError).toBe(false)
  })

  it('відрізняє мережу від тайм-ауту', () => {
    expect(
      toApiError(new AxiosError('Network Error', AxiosError.ERR_NETWORK, config)),
    ).toMatchObject({ status: 0, code: 'network' })
    expect(toApiError(new AxiosError('timeout', AxiosError.ECONNABORTED, config))).toMatchObject({
      status: 0,
      code: 'timeout',
    })
  })

  it('не загортає ApiError вдруге і приймає довільні помилки', () => {
    const original = new ApiError('вже готова', { status: 403, code: 'forbidden' })
    expect(toApiError(original)).toBe(original)
    expect(toApiError(new Error('щось своє'))).toMatchObject({
      code: 'unknown',
      message: 'щось своє',
    })
  })
})

describe('apiClient', () => {
  it('ходить на /api/v1 і відхиляє запит уже з ApiError', async () => {
    expect(apiClient.defaults.baseURL).toBe('/api/v1')
    const adapter = () => Promise.reject(httpError(429, {}))
    await expect(apiClient.get('/offers', { adapter })).rejects.toMatchObject({
      name: 'ApiError',
      status: 429,
      code: 'rate_limit',
    })
  })
})
