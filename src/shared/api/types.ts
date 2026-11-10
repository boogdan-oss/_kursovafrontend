import type { components, operations } from '@/shared/api/schema'

export type Schema<Name extends keyof components['schemas']> = components['schemas'][Name]

export type QueryParams<Id extends keyof operations> = operations[Id]['parameters'] extends {
  query?: infer Query
}
  ? NonNullable<Query>
  : never

export type DecimalString = string

export type HealthResponse = Schema<'HealthResponse'>
export type PingResponse = Schema<'PingResponse'>
export type MarketsResponse = Schema<'MarketsResponse'>
export type MarketItem = Schema<'MarketItem'>
export type SnapshotResponse = Schema<'SnapshotResponse'>
export type MarketSnapshot = Schema<'MarketSnapshot'>
export type HistoryResponse = Schema<'HistoryResponse'>
export type HistoryItem = Schema<'HistoryItem'>
export type OffersResponse = Schema<'OffersResponse'>
export type Offer = Schema<'Offer'>
export type Merchant = Schema<'Merchant'>
export type Freshness = Schema<'Freshness'>
export type OpportunitiesResponse = Schema<'OpportunitiesResponse'>
export type OpportunityItem = Schema<'OpportunityItem'>
export type OpportunityHistoryResponse = Schema<'OpportunityHistoryResponse'>
export type OpportunityHistoryItem = Schema<'OpportunityHistoryItem'>
export type OpportunityStep = Schema<'Step'>
export type CalculatorRequest = Schema<'CalculatorRequest'>
export type CalculatorResponse = Schema<'CalculatorResponse'>
export type Deal = Schema<'Deal'>
export type CollectorStatusResponse = Schema<'CollectorStatusResponse'>

export type MarketsParams = QueryParams<'list_markets_api_v1_markets_get'>
export type SnapshotParams = QueryParams<'market_snapshot_api_v1_market_snapshot_get'>
export type HistoryParams = QueryParams<'market_history_api_v1_market_history_get'>
export type OffersParams = QueryParams<'list_offers_api_v1_offers_get'>
export type OpportunitiesParams = QueryParams<'list_opportunities_api_v1_opportunities_get'>
export type OpportunitiesHistoryParams =
  QueryParams<'opportunities_history_api_v1_opportunities_history_get'>
