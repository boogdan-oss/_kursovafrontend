import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useResolveReport } from '@/features/admin/hooks'
import { REPORT_STATUS, reasonLabel } from '@/features/admin/lib'
import { BanDialog } from '@/features/community/components/Dialogs'
import { UserAvatar } from '@/features/community/components/UserAvatar'
import { useCurrentUser } from '@/features/community/hooks'
import { toApiError } from '@/shared/api/client'
import type { ReportView, ResolveAction } from '@/shared/api/community-types'
import { formatDateTime, formatRelativeTime } from '@/shared/lib/format'
import { canBan, canModerate, ROLE_LABELS } from '@/shared/lib/roles'
import { Button } from '@/shared/ui/button'
import { Panel, PanelHeader, SectionLabel } from '@/shared/ui/panel'
import { Tag } from '@/shared/ui/tag'

const TARGET_STATUS: Record<string, string> = {
  visible: 'видимий',
  hidden: 'прихований',
  deleted: 'видалений',
}

interface ReportDetailsProps {
  report: ReportView | undefined
  now: number
}

export function ReportDetails({ report, now }: ReportDetailsProps) {
  const user = useCurrentUser()
  const resolve = useResolveReport()
  const [banning, setBanning] = useState(false)

  if (!report) {
    return (
      <Panel aria-label="Скарга">
        <PanelHeader title="Скарга" />
        <p className="px-4 py-8 text-center text-ui text-muted-foreground">
          Оберіть скаргу в таблиці, щоб переглянути контент і вирішити її.
        </p>
      </Panel>
    )
  }

  const author = report.target_author
  const status = REPORT_STATUS[report.status]
  const pending = report.status === 'pending'
  const mayModerate = canModerate(user, author)
  const mayBan = canBan(user, author)
  const what = report.target === 'post' ? 'публікацію' : 'коментар'

  function act(action: ResolveAction) {
    if (!report) return
    resolve.mutate({ id: report.id, action })
  }

  return (
    <Panel aria-label={`Скарга #${report.id}`} className="border-border-strong">
      <PanelHeader
        title={`Скарга #${report.id}`}
        meta={`${report.target === 'post' ? 'пост' : 'коментар'} · ${formatRelativeTime(report.created_at, now)}`}
        actions={<Tag tone={status.tone}>{status.label}</Tag>}
      />
      <div className="flex flex-col gap-3 p-4">
        <div className="flex items-center gap-3">
          <UserAvatar username={author.username} />
          <div className="flex min-w-0 flex-col">
            <Link
              to={`/community/u/${author.username}`}
              className="truncate font-mono text-ui-lg font-semibold hover:underline"
            >
              @{author.username}
            </Link>
            <span className="text-meta text-muted-foreground">
              {ROLE_LABELS[author.role]} · контент {TARGET_STATUS[report.target_status]}
            </span>
          </div>
        </div>
        <blockquote className="whitespace-pre-wrap break-words rounded-sm border bg-background/60 px-3 py-2.5 text-ui-lg">
          {report.target_text}
        </blockquote>
      </div>

      <SectionLabel className="border-t px-4 pb-1.5 pt-3">Причина</SectionLabel>
      <div className="flex flex-col gap-1 px-4 pb-3">
        <span className="text-ui-lg">{reasonLabel(report.reason)}</span>
        {report.details && <span className="text-ui text-muted-foreground">{report.details}</span>}
        <span className="text-meta text-tertiary">
          від @{report.reporter.username}
          {report.resolved_at && ` · рішення ${formatDateTime(report.resolved_at)}`}
        </span>
      </div>

      <SectionLabel className="border-t px-4 pb-1.5 pt-3">Дії модератора</SectionLabel>
      <div className="flex flex-col gap-2 px-4 pb-4">
        {pending ? (
          <>
            {mayModerate ? (
              <>
                <Button
                  variant="secondary"
                  size="terminal"
                  disabled={resolve.isPending}
                  onClick={() => act('hide')}
                >
                  Приховати {what}
                </Button>
                <Button
                  variant="outline"
                  size="terminal"
                  className="border-destructive text-destructive hover:bg-destructive/10"
                  disabled={resolve.isPending}
                  onClick={() => act('delete')}
                >
                  Видалити {what}
                </Button>
              </>
            ) : (
              <p className="text-meta text-tertiary">
                Контент {ROLE_LABELS[author.role].toLowerCase()}а модерує лише старший за роллю.
              </p>
            )}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="secondary"
                size="terminal"
                disabled={resolve.isPending}
                onClick={() => act('dismiss')}
              >
                Відхилити скаргу
              </Button>
              <Button
                variant="secondary"
                size="terminal"
                disabled={!mayBan}
                title={mayBan ? undefined : 'Блокувати можна лише користувачів нижчої ролі'}
                onClick={() => setBanning(true)}
              >
                Заблокувати автора
              </Button>
            </div>
          </>
        ) : (
          <p className="text-ui text-muted-foreground">
            Скаргу вже {report.status === 'resolved' ? 'вирішено' : 'відхилено'}. Прихований контент
            можна відновити на вкладці «Приховані».
          </p>
        )}
        {resolve.isError && (
          <p role="alert" className="text-ui text-destructive">
            {toApiError(resolve.error).message}
          </p>
        )}
        <p className="text-meta text-tertiary">
          Рішення стосується всіх відкритих скарг на цей{' '}
          {report.target === 'post' ? 'пост' : 'коментар'}.
        </p>
      </div>
      <BanDialog user={banning ? author : null} onClose={() => setBanning(false)} />
    </Panel>
  )
}
