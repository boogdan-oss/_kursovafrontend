import { Link } from 'react-router-dom'

import { formatNet, opportunityRoute, pairLabel } from '@/features/community/lib'
import { bestSnapshot } from '@/features/offers/lib'
import type { AttachedOpportunity, PairRef } from '@/shared/api/community-types'
import { useMarketSnapshot } from '@/shared/api/queries/market'
import { formatFiat } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { exchangeName } from '@/shared/ui/exchange-label'
import { Tag } from '@/shared/ui/tag'
import { EXCHANGES, useFiltersStore } from '@/store/useFiltersStore'

const FRAME =
  'flex min-h-11 items-center gap-3 rounded-sm border border-l-2 border-border-strong border-l-primary bg-background/60 px-3 py-2 transition-colors hover:bg-accent/50 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export function OpportunityAttachment({
  opportunity,
  className,
}: {
  opportunity: AttachedOpportunity
  className?: string
}) {
  const setPair = useFiltersStore((state) => state.setPair)
  const net = Number(opportunity.net_spread_pct)

  return (
    <Link
      to="/arbitrage"
      onClick={() => setPair(opportunity.asset, opportunity.fiat)}
      className={cn(FRAME, className)}
    >
      <Tag tone="accent" className="shrink-0">
        Торгова можливість
      </Tag>
      <span className="min-w-0 flex-1 truncate font-mono text-ui-lg">
        {opportunityRoute(opportunity)}
      </span>
      <span
        className={cn(
          'shrink-0 font-mono text-ui-lg font-semibold',
          net >= 0 ? 'text-success' : 'text-destructive',
        )}
      >
        {formatNet(opportunity.net_spread_pct)}
      </span>
    </Link>
  )
}

export function PairAttachment({ pair, className }: { pair: PairRef; className?: string }) {
  const setPair = useFiltersStore((state) => state.setPair)
  const snapshotQuery = useMarketSnapshot({ asset: pair.asset, fiat: pair.fiat })
  const best = bestSnapshot(snapshotQuery.data?.items ?? [], EXCHANGES, null, 'BUY')

  return (
    <Link
      to="/offers"
      onClick={() => setPair(pair.asset, pair.fiat)}
      className={cn(FRAME, className)}
    >
      <span
        aria-hidden
        className="flex size-7 shrink-0 items-center justify-center rounded-sm border border-border-strong bg-elevated text-meta font-semibold"
      >
        {pair.asset.slice(0, 1)}
      </span>
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="text-ui-lg font-semibold">{pairLabel(pair)}</span>
        <span className="text-meta text-muted-foreground">
          {best ? `${exchangeName(best.exchange)} · P2P · найкраща купівля` : 'P2P'}
        </span>
      </span>
      {best?.buy_price && (
        <span className="shrink-0 font-mono text-ui-lg font-semibold">
          {formatFiat(best.buy_price, pair.fiat)}
        </span>
      )}
    </Link>
  )
}
