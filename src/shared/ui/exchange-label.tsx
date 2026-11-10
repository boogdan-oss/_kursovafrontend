import { cn } from '@/shared/lib/utils'

const EXCHANGES: Record<string, { name: string; mark: string; className: string }> = {
  binance: { name: 'Binance', mark: 'B', className: 'bg-[#3A3222] text-[#F0B90B]' },
  bybit: { name: 'Bybit', mark: 'BY', className: 'bg-[#3A2C1E] text-[#F7A600]' },
  okx: { name: 'OKX', mark: 'OK', className: 'bg-muted text-foreground' },
}

interface ExchangeLabelProps {
  exchange: string
  className?: string
}

export function ExchangeLabel({ exchange, className }: ExchangeLabelProps) {
  const known = EXCHANGES[exchange.toLowerCase()]
  const name = known?.name ?? exchange.charAt(0).toUpperCase() + exchange.slice(1)
  const mark = known?.mark ?? exchange.slice(0, 2).toUpperCase()

  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <span
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-full text-small font-semibold',
          known?.className ?? 'bg-muted text-foreground',
        )}
        aria-hidden
      >
        {mark}
      </span>
      <span className="text-caption font-semibold">{name}</span>
    </span>
  )
}
