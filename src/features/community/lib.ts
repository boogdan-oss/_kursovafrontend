import type {
  AttachedOpportunity,
  FeedItem,
  ProfileTab,
  ReportReason,
} from '@/shared/api/community-types'
import { formatNumber, formatPercent } from '@/shared/lib/format'
import { exchangeName } from '@/shared/ui/exchange-label'

export type FeedTab = 'new' | 'popular' | 'mine'

export const FEED_TABS: { value: FeedTab; label: string }[] = [
  { value: 'new', label: 'Нові' },
  { value: 'popular', label: 'Популярні' },
  { value: 'mine', label: 'Мої публікації' },
]

export const SORT_LABELS: Record<FeedTab, string> = {
  new: 'за часом ↓',
  popular: 'за реакціями за 7 днів ↓',
  mine: 'за часом ↓',
}

export const PROFILE_TABS: { value: ProfileTab; label: string }[] = [
  { value: 'posts', label: 'Публікації' },
  { value: 'reposts', label: 'Репости' },
  { value: 'likes', label: 'Вподобані' },
]

export const POST_MAX = 2000
export const COMMENT_MAX = 1000
export const REPORT_DETAILS_MAX = 1000
export const BAN_REASON_MAX = 500

export const REPORT_REASONS: { value: ReportReason; label: string }[] = [
  { value: 'scam', label: 'Шахрайство, фішингові посилання' },
  { value: 'spam', label: 'Спам або реклама' },
  { value: 'abuse', label: 'Образи' },
  { value: 'misinformation', label: 'Дезінформація' },
  { value: 'other', label: 'Інше' },
]

export const BAN_TERMS: { value: string; label: string; days: number | null }[] = [
  { value: '1', label: '1 день', days: 1 },
  { value: '7', label: '7 днів', days: 7 },
  { value: '30', label: '30 днів', days: 30 },
  { value: 'forever', label: 'Назавжди', days: null },
]

export const COMMUNITY_RULES = [
  'Без реклами та реферальних посилань',
  'Поважайте інших учасників',
  'Не публікуйте особисті та платіжні дані',
  'Порушення — через «•••» → «Поскаржитися»',
]

export function feedItemKey(item: FeedItem) {
  return `${item.post.id}:${item.reposted_by?.id ?? 'post'}`
}

export function pairLabel(pair: { asset: string; fiat: string }) {
  return `${pair.asset}/${pair.fiat}`
}

export function opportunityRoute(opportunity: AttachedOpportunity) {
  const price = (value: string) => formatNumber(value, { minDigits: 2 })
  return `Купити на ${exchangeName(opportunity.buy_exchange)} за ${price(opportunity.buy_price)} → продати на ${exchangeName(opportunity.sell_exchange)} за ${price(opportunity.sell_price)}`
}

export function formatNet(value: string | null | undefined) {
  return formatPercent(value, { signed: true })
}
