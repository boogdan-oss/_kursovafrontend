import { REPORT_REASONS } from '@/features/community/lib'
import type { ReportReason, ReportState } from '@/shared/api/community-types'
import type { TagTone } from '@/shared/ui/tag'

export type AdminTab = 'reports' | 'hidden' | 'users'

export const REPORT_FILTERS: { value: ReportState | 'all'; label: string }[] = [
  { value: 'pending', label: 'Відкриті' },
  { value: 'resolved', label: 'Вирішені' },
  { value: 'rejected', label: 'Відхилені' },
  { value: 'all', label: 'Усі' },
]

export const REPORT_STATUS: Record<ReportState, { label: string; tone: TagTone }> = {
  pending: { label: 'Нова', tone: 'danger' },
  resolved: { label: 'Вирішено', tone: 'success' },
  rejected: { label: 'Відхилено', tone: 'neutral' },
}

export const USER_STATUS: Record<string, { label: string; tone: TagTone }> = {
  active: { label: 'Активний', tone: 'neutral' },
  suspended: { label: 'Тимчасово заблоковано', tone: 'warning' },
  banned: { label: 'Заблоковано', tone: 'danger' },
}

export function reasonLabel(reason: ReportReason) {
  return REPORT_REASONS.find((item) => item.value === reason)?.label ?? reason
}
