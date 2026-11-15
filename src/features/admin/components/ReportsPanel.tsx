import { REPORT_FILTERS, REPORT_STATUS, reasonLabel } from '@/features/admin/lib'
import type { ReportState, ReportView } from '@/shared/api/community-types'
import { formatRelativeTime } from '@/shared/lib/format'
import { Segmented } from '@/shared/ui/segmented'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tag } from '@/shared/ui/tag'

interface ReportsPanelProps {
  reports: ReportView[]
  filter: ReportState | 'all'
  onFilterChange: (filter: ReportState | 'all') => void
  selectedId: number | null
  onSelect: (report: ReportView) => void
  now: number
  isLoading: boolean
  failed: boolean
}

export function ReportsPanel({
  reports,
  filter,
  onFilterChange,
  selectedId,
  onSelect,
  now,
  isLoading,
  failed,
}: ReportsPanelProps) {
  return (
    <>
      <div className="flex items-center gap-2 border-b px-3 py-2">
        <Segmented
          size="sm"
          label="Статус скарг"
          value={filter}
          onValueChange={onFilterChange}
          options={REPORT_FILTERS}
        />
      </div>
      <Table className="min-w-[760px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">ID</TableHead>
            <TableHead className="w-[100px]">Тип</TableHead>
            <TableHead>Контент</TableHead>
            <TableHead className="w-[150px]">Автор</TableHead>
            <TableHead className="w-[170px]">Причина</TableHead>
            <TableHead className="w-[110px]">Статус</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading
            ? Array.from({ length: 4 }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : reports.map((report) => {
                const selected = report.id === selectedId
                const status = REPORT_STATUS[report.status]
                return (
                  <TableRow
                    key={report.id}
                    tabIndex={0}
                    aria-selected={selected}
                    data-state={selected ? 'selected' : undefined}
                    className="cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring"
                    onClick={() => onSelect(report)}
                    onKeyDown={(event) => {
                      if (event.key !== 'Enter' && event.key !== ' ') return
                      event.preventDefault()
                      onSelect(report)
                    }}
                  >
                    <TableCell className="font-mono text-ui text-muted-foreground">
                      #{report.id}
                    </TableCell>
                    <TableCell>
                      <Tag>{report.target === 'post' ? 'Пост' : 'Комент.'}</Tag>
                    </TableCell>
                    <TableCell className="max-w-0">
                      <span className="block truncate text-ui-lg">{report.target_text}</span>
                      <span className="text-meta text-tertiary">
                        {formatRelativeTime(report.created_at, now)} · від @
                        {report.reporter.username}
                      </span>
                    </TableCell>
                    <TableCell className="truncate font-mono text-ui">
                      @{report.target_author.username}
                    </TableCell>
                    <TableCell className="text-ui">{reasonLabel(report.reason)}</TableCell>
                    <TableCell>
                      <Tag tone={status.tone}>{status.label}</Tag>
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>
      {!isLoading && reports.length === 0 && (
        <p className="border-t px-4 py-10 text-center text-ui text-muted-foreground">
          {failed ? 'Не вдалося завантажити скарги' : 'Скарг у цьому статусі немає.'}
        </p>
      )}
    </>
  )
}
