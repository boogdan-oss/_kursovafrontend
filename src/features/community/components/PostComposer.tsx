import { X } from 'lucide-react'
import { useState, type FormEvent, type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'

import { useOpportunityHistory } from '@/features/arbitrage/hooks'
import { UserAvatar } from '@/features/community/components/UserAvatar'
import { useCreatePost, useCurrentUser } from '@/features/community/hooks'
import { formatNet, pairLabel, POST_MAX } from '@/features/community/lib'
import { toApiError } from '@/shared/api/client'
import type { PairRef } from '@/shared/api/community-types'
import { usePairOptions } from '@/shared/api/queries/market'
import type { OpportunityHistoryItem } from '@/shared/api/types'
import { formatShortTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/shared/ui/dropdown-menu'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Panel } from '@/shared/ui/panel'
import { Textarea } from '@/shared/ui/textarea'
import { useFiltersStore } from '@/store/useFiltersStore'

const OPPORTUNITY_HOURS = 24
const OPPORTUNITY_OPTIONS = 8

const ATTACH =
  'inline-flex h-7 items-center gap-1.5 rounded-sm border border-border-strong bg-elevated px-3 text-ui font-semibold transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50'

interface ChosenOpportunity {
  id: number
  label: string
}

function Chip({ children, onRemove }: { children: ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex h-7 items-center gap-1.5 rounded-sm border border-primary/70 bg-primary/10 px-2.5 text-ui font-semibold">
      {children}
      <button
        type="button"
        aria-label="Відкріпити"
        onClick={onRemove}
        className="text-muted-foreground hover:text-foreground"
      >
        <X className="size-3.5" />
      </button>
    </span>
  )
}

function opportunityLabel(item: OpportunityHistoryItem) {
  return `${exchangeName(item.buy_exchange)} → ${exchangeName(item.sell_exchange)} · ${formatNet(item.net_spread_pct)}`
}

export function PostComposer() {
  const user = useCurrentUser()
  const { pathname } = useLocation()
  const asset = useFiltersStore((state) => state.asset)
  const fiat = useFiltersStore((state) => state.fiat)
  const create = useCreatePost()
  const [text, setText] = useState('')
  const [pair, setPair] = useState<PairRef | null>(null)
  const [opportunity, setOpportunity] = useState<ChosenOpportunity | null>(null)

  const { assets } = usePairOptions(asset, fiat)
  const pairs = [...new Set([`${asset}/${fiat}`, ...assets.map((code) => `${code}/${fiat}`)])]
  const target = pair ?? { asset, fiat }
  const history = useOpportunityHistory({
    asset: target.asset,
    fiat: target.fiat,
    hours: OPPORTUNITY_HOURS,
    limit: 50,
  })
  const recent = (history.data?.items ?? []).slice(0, OPPORTUNITY_OPTIONS)

  if (!user) {
    return (
      <Panel className="flex flex-wrap items-center justify-between gap-3 px-4 py-3.5">
        <p className="text-ui-lg text-muted-foreground">
          Увійдіть, щоб публікувати, вподобувати й коментувати.
        </p>
        <div className="flex gap-2">
          <Button asChild size="terminal">
            <Link to="/login" state={{ from: pathname }}>
              Увійти
            </Link>
          </Button>
          <Button asChild variant="secondary" size="terminal">
            <Link to="/register" state={{ from: pathname }}>
              Зареєструватися
            </Link>
          </Button>
        </div>
      </Panel>
    )
  }

  const length = text.trim().length
  const tooLong = text.length > POST_MAX

  function submit(event: FormEvent) {
    event.preventDefault()
    if (!length || tooLong) return
    create.mutate(
      { text: text.trim(), pair, opportunity_id: opportunity?.id ?? null },
      {
        onSuccess: () => {
          setText('')
          setPair(null)
          setOpportunity(null)
        },
      },
    )
  }

  return (
    <Panel>
      <form onSubmit={submit} className="flex flex-col gap-3 px-4 py-3.5">
        <div className="flex items-start gap-3">
          <UserAvatar username={user.username} accent />
          <Textarea
            aria-label="Текст публікації"
            placeholder="Поділіться думкою або торговою ідеєю…"
            rows={length > 0 ? 3 : 1}
            value={text}
            aria-invalid={tooLong || undefined}
            onChange={(event) => setText(event.target.value)}
            className="min-h-9 flex-1 py-2"
          />
          <Button
            type="submit"
            className="h-9 px-5 text-ui-lg"
            disabled={!length || tooLong || create.isPending}
          >
            {create.isPending ? 'Публікуємо…' : 'Опублікувати'}
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2 pl-12">
          <span className="text-ui text-muted-foreground">Прикріпити:</span>
          {pair ? (
            <Chip
              onRemove={() => {
                setPair(null)
                setOpportunity(null)
              }}
            >
              {pairLabel(pair)}
            </Chip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className={ATTACH}>+ Валютна пара</DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[180px]">
                <DropdownMenuLabel>Пара</DropdownMenuLabel>
                {pairs.map((value) => {
                  const [nextAsset, nextFiat] = value.split('/')
                  return (
                    <DropdownMenuItem
                      key={value}
                      onSelect={() => {
                        setPair({ asset: nextAsset, fiat: nextFiat })
                        setOpportunity(null)
                      }}
                    >
                      {value}
                    </DropdownMenuItem>
                  )
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          {opportunity ? (
            <Chip onRemove={() => setOpportunity(null)}>{opportunity.label}</Chip>
          ) : (
            <DropdownMenu>
              <DropdownMenuTrigger className={ATTACH}>+ Торгова можливість</DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="min-w-[280px]">
                <DropdownMenuLabel>
                  {pairLabel(target)} · за {OPPORTUNITY_HOURS} год
                </DropdownMenuLabel>
                {recent.length === 0 ? (
                  <p className="px-3 py-2 text-ui text-muted-foreground">
                    {history.isPending ? 'Завантаження…' : 'Можливостей за добу не знайдено'}
                  </p>
                ) : (
                  recent.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onSelect={() =>
                        setOpportunity({ id: item.id, label: opportunityLabel(item) })
                      }
                    >
                      <span className="flex-1">{opportunityLabel(item)}</span>
                      <span className="font-mono text-meta text-tertiary">
                        {formatShortTime(item.detected_at)}
                      </span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
          <span
            className={cn(
              'ml-auto font-mono text-meta',
              tooLong ? 'text-destructive' : 'text-tertiary',
            )}
          >
            {text.length > 0 && `${text.length} / ${POST_MAX}`}
          </span>
        </div>
        {create.isError && (
          <p role="alert" className="pl-12 text-ui text-destructive">
            {toApiError(create.error).message}
          </p>
        )}
      </form>
    </Panel>
  )
}
