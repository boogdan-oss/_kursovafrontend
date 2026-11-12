import type { ForecastParams } from '@/shared/api/forecast-types'
import type {
  CalculatorRequest,
  HistoryParams,
  MarketsParams,
  OffersParams,
  OpportunitiesHistoryParams,
  OpportunitiesParams,
  SnapshotParams,
} from '@/shared/api/types'

export const queryKeys = {
  health: ['health'] as const,
  collectorStatus: ['collector-status'] as const,

  markets: {
    all: ['markets'] as const,
    list: (params: MarketsParams = {}) => [...queryKeys.markets.all, 'list', params] as const,
    snapshot: (params: SnapshotParams) => [...queryKeys.markets.all, 'snapshot', params] as const,
    history: (params: HistoryParams) => [...queryKeys.markets.all, 'history', params] as const,
  },

  offers: {
    all: ['offers'] as const,
    list: (params: OffersParams) => [...queryKeys.offers.all, 'list', params] as const,
  },

  opportunities: {
    all: ['opportunities'] as const,
    list: (params: OpportunitiesParams = {}) =>
      [...queryKeys.opportunities.all, 'list', params] as const,
    history: (params: OpportunitiesHistoryParams = {}) =>
      [...queryKeys.opportunities.all, 'history', params] as const,
  },

  calculator: {
    all: ['calculator'] as const,
    quote: (request: Partial<CalculatorRequest>) =>
      [...queryKeys.calculator.all, 'quote', request] as const,
  },

  forecast: {
    all: ['forecast'] as const,
    detail: (params: ForecastParams) => [...queryKeys.forecast.all, 'detail', params] as const,
    models: () => [...queryKeys.forecast.all, 'models'] as const,
  },

  alerts: {
    all: ['alerts'] as const,
    rules: () => [...queryKeys.alerts.all, 'rules'] as const,
    notifications: () => [...queryKeys.alerts.all, 'notifications'] as const,
  },

  watchlist: ['watchlist'] as const,

  assistant: {
    all: ['assistant'] as const,
    conversations: () => [...queryKeys.assistant.all, 'conversations'] as const,
  },

  auth: {
    all: ['auth'] as const,
    me: () => [...queryKeys.auth.all, 'me'] as const,
  },

  community: {
    all: ['community'] as const,
    posts: () => [...queryKeys.community.all, 'posts'] as const,
  },
}
