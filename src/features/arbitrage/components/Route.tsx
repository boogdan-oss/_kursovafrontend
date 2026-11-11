import { ArrowRight } from 'lucide-react'

import { ExchangeLabel } from '@/shared/ui/exchange-label'

interface RouteProps {
  from: string
  to: string
  sub?: string
}

export function Route({ from, to, sub }: RouteProps) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <ExchangeLabel exchange={from} />
        <ArrowRight className="size-3.5 shrink-0 text-muted-foreground" aria-hidden />
        <ExchangeLabel exchange={to} />
      </div>
      {sub && <span className="text-small text-muted-foreground">{sub}</span>}
    </div>
  )
}
