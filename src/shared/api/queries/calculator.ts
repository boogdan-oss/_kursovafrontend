import { apiClient } from '@/shared/api/client'
import { endpoints } from '@/shared/api/endpoints'
import type { CalculatorRequest, CalculatorResponse } from '@/shared/api/types'

type Defaulted = 'extra_fees' | 'adverse_move_pct'

export type DealRequest = Omit<CalculatorRequest, Defaulted> &
  Partial<Pick<CalculatorRequest, Defaulted>>

export async function fetchDealQuote(request: DealRequest, signal?: AbortSignal) {
  const { data } = await apiClient.post<CalculatorResponse>(endpoints.calculator, request, {
    signal,
  })
  return data
}
