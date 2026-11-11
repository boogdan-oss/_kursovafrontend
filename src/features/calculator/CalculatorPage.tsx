import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { CalculatorForm } from '@/features/calculator/components/CalculatorForm'
import { CalculatorResult } from '@/features/calculator/components/CalculatorResult'
import {
  buildRequest,
  DEFAULT_MIN_RR,
  MODE_LABELS,
  MODES,
  type CalculatorForm as FormState,
  type Mode,
} from '@/features/calculator/lib'
import { toApiError } from '@/shared/api/client'
import { fetchDealQuote, type DealRequest } from '@/shared/api/queries/calculator'
import { queryKeys } from '@/shared/api/queryKeys'
import { Card } from '@/shared/ui/card'
import { PageHeader } from '@/shared/ui/page-header'
import { Skeleton } from '@/shared/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/shared/ui/tabs'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

interface Submission {
  request: DealRequest
  form: FormState
  attempt: number
}

function exchangeParam(value: string | null) {
  return value && (EXCHANGES as readonly string[]).includes(value) ? value : null
}

function positive(value: string | null) {
  const number = Number(value)
  return value !== null && Number.isFinite(number) && number > 0 ? number : null
}

function initialForm(params: URLSearchParams): FormState {
  const filters = useFiltersStore.getState()
  const buyExchange = exchangeParam(params.get('buy_exchange'))
  const sellExchange = exchangeParam(params.get('sell_exchange'))
  const fromRoute = buyExchange !== null && sellExchange !== null
  const mode = params.get('mode') as Mode | null
  return {
    mode: mode && MODES.includes(mode) ? mode : 'market',
    asset: params.get('asset')?.toUpperCase() || filters.asset,
    fiat: params.get('fiat')?.toUpperCase() || filters.fiat,
    buyExchange: buyExchange ?? (fromRoute ? null : 'bybit'),
    sellExchange: sellExchange ?? (fromRoute ? null : 'binance'),
    investment: positive(params.get('investment')) ?? filters.amount,
    buyPrice: null,
    sellPrice: null,
    payment: null,
    extraFees: null,
    adverseMove: null,
    minRr: DEFAULT_MIN_RR,
  }
}

function initialSubmission(form: FormState, params: URLSearchParams): Submission | null {
  if (!params.has('buy_exchange')) return null
  const { request } = buildRequest(form)
  return request ? { request, form, attempt: 0 } : null
}

export function CalculatorPage() {
  const [searchParams] = useSearchParams()
  const [form, setForm] = useState(() => initialForm(searchParams))
  const [submission, setSubmission] = useState(() => initialSubmission(form, searchParams))
  const [formError, setFormError] = useState<string | null>(null)

  const quote = useQuery({
    queryKey: [...queryKeys.calculator.quote(submission?.request ?? {}), submission?.attempt],
    queryFn: ({ signal }) => fetchDealQuote(submission!.request, signal),
    enabled: submission !== null,
    retry: false,
    staleTime: 0,
    gcTime: 0,
    meta: { silent: true },
  })

  function change(patch: Partial<FormState>) {
    setForm((current) => ({ ...current, ...patch }))
    setFormError(null)
  }

  function submit() {
    const { request, error } = buildRequest(form)
    if (!request) {
      setFormError(error)
      return
    }
    setFormError(null)
    setSubmission((current) => ({ request, form, attempt: (current?.attempt ?? 0) + 1 }))
  }

  const isCalculating = submission !== null && quote.isFetching
  const shown = submission?.form

  return (
    <>
      <PageHeader
        title="Калькулятор угоди"
        description="Прибуток, комісії, slippage та співвідношення ризик / прибуток для вашої суми"
        actions={
          <Tabs value={form.mode} onValueChange={(value) => change({ mode: value as Mode })}>
            <TabsList>
              {MODES.map((mode) => (
                <TabsTrigger key={mode} value={mode}>
                  {MODE_LABELS[mode]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        }
      />

      <div className="flex flex-col items-start gap-4 xl:flex-row">
        <CalculatorForm
          form={form}
          onChange={change}
          onSubmit={submit}
          error={formError}
          isCalculating={isCalculating}
          className="w-full xl:w-[460px] xl:shrink-0"
        />

        {quote.data && shown ? (
          <CalculatorResult
            result={quote.data}
            asset={shown.asset}
            fiat={shown.fiat}
            minRr={form.minRr}
            extraFees={shown.extraFees ?? 0}
            marketPrices={shown.mode === 'market'}
          />
        ) : (
          <Card className="flex min-h-[220px] w-full min-w-0 flex-1 flex-col items-center justify-center gap-2 border-dashed p-8 text-center">
            {isCalculating ? (
              <Skeleton className="h-24 w-full" />
            ) : quote.isError ? (
              <>
                <p className="text-body font-semibold">Не вдалося порахувати угоду</p>
                <p className="max-w-[480px] text-caption text-muted-foreground">
                  {toApiError(quote.error).message}
                </p>
              </>
            ) : (
              <>
                <p className="text-body font-semibold">Результат з'явиться тут</p>
                <p className="max-w-[480px] text-caption text-muted-foreground">
                  Задайте параметри угоди й натисніть «Розрахувати». У «Симуляторі угоди» ціни
                  беруться з поточних оголошень бірж, у «Калькуляторі» ви вводите їх самі.
                </p>
              </>
            )}
          </Card>
        )}
      </div>
    </>
  )
}
