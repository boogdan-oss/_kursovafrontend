import { useState } from 'react'
import { Link } from 'react-router-dom'

import { useActiveBans, useSetUserRole, useUsers } from '@/features/admin/hooks'
import { USER_STATUS } from '@/features/admin/lib'
import { BanDialog, ConfirmDialog } from '@/features/community/components/Dialogs'
import { useCurrentUser, useUnbanUser } from '@/features/community/hooks'
import { toApiError } from '@/shared/api/client'
import type { AdminUser } from '@/shared/api/community-types'
import { formatDate, formatDateTime } from '@/shared/lib/format'
import { canBan, ROLE_LABELS, ROLE_TONES, type Role } from '@/shared/lib/roles'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { Segmented } from '@/shared/ui/segmented'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Skeleton } from '@/shared/ui/skeleton'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/shared/ui/table'
import { Tag } from '@/shared/ui/tag'

type RoleFilter = Role | 'all'

const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
  { value: 'all', label: 'Усі' },
  { value: 'user', label: 'Учасники' },
  { value: 'admin', label: 'Адміни' },
  { value: 'owner', label: 'Власник' },
]

function RoleCell({
  target,
  owner,
  me,
}: {
  target: AdminUser
  owner: boolean
  me: number | undefined
}) {
  const setRole = useSetUserRole()
  const editable = owner && target.role !== 'owner' && target.id !== me

  if (!editable) {
    return <Tag tone={ROLE_TONES[target.role]}>{ROLE_LABELS[target.role]}</Tag>
  }
  return (
    <div className="flex flex-col gap-1">
      <Select
        value={target.role}
        disabled={setRole.isPending}
        onValueChange={(role) => setRole.mutate({ id: target.id, role: role as 'user' | 'admin' })}
      >
        <SelectTrigger
          aria-label={`Роль @${target.username}`}
          className="h-7 w-[120px] rounded-sm border-border-strong bg-elevated px-2 text-ui"
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="user">{ROLE_LABELS.user}</SelectItem>
          <SelectItem value="admin">{ROLE_LABELS.admin}</SelectItem>
        </SelectContent>
      </Select>
      {setRole.isError && (
        <span className="text-meta text-destructive">{toApiError(setRole.error).message}</span>
      )}
    </div>
  )
}

export function UsersPanel() {
  const user = useCurrentUser()
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<RoleFilter>('all')
  const users = useUsers({ query: query.trim(), role: role === 'all' ? undefined : role })
  const bans = useActiveBans()
  const unban = useUnbanUser()
  const [banning, setBanning] = useState<AdminUser | null>(null)
  const [unbanning, setUnbanning] = useState<AdminUser | null>(null)
  const owner = user?.role === 'owner'
  const items = users.data?.items ?? []
  const banOf = (id: number) => bans.data?.items.find((ban) => ban.user.id === id)

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 border-b px-3 py-2">
        <Input
          type="search"
          aria-label="Пошук користувача"
          placeholder="Нікнейм, ім’я або email"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          className="h-7 w-[260px] rounded-sm border-border-strong bg-elevated px-2.5 text-ui"
        />
        <Segmented
          size="sm"
          label="Роль"
          value={role}
          onValueChange={setRole}
          options={ROLE_FILTERS}
        />
        {!owner && (
          <span className="ml-auto text-meta text-tertiary">Ролі змінює лише власник</span>
        )}
      </div>
      <Table className="min-w-[860px]">
        <TableHeader>
          <TableRow>
            <TableHead>Користувач</TableHead>
            <TableHead className="w-[140px]">Роль</TableHead>
            <TableHead className="w-[70px] text-right">Постів</TableHead>
            <TableHead className="w-[70px] text-right">Скарг</TableHead>
            <TableHead className="w-[190px]">Статус</TableHead>
            <TableHead className="w-[130px]" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.isPending
            ? Array.from({ length: 4 }, (_, index) => (
                <TableRow key={index} className="hover:bg-transparent">
                  <TableCell colSpan={6}>
                    <Skeleton className="h-6 w-full" />
                  </TableCell>
                </TableRow>
              ))
            : items.map((item) => {
                const status = USER_STATUS[item.status] ?? USER_STATUS.active
                const ban = banOf(item.id)
                const target = { id: item.id, role: item.role }
                return (
                  <TableRow key={item.id}>
                    <TableCell className="max-w-0">
                      <Link
                        to={`/community/u/${item.username}`}
                        className="block truncate font-mono text-ui-lg font-semibold hover:underline"
                      >
                        @{item.username}
                      </Link>
                      <span className="block truncate text-meta text-muted-foreground">
                        {item.display_name ? `${item.display_name} · ` : ''}
                        {item.email} · з {formatDate(item.created_at)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <RoleCell target={item} owner={owner} me={user?.id} />
                    </TableCell>
                    <TableCell className="text-right font-mono text-ui">{item.posts}</TableCell>
                    <TableCell
                      className={cn(
                        'text-right font-mono text-ui',
                        item.reports_against > 0 && 'text-destructive',
                      )}
                    >
                      {item.reports_against}
                    </TableCell>
                    <TableCell>
                      <Tag tone={status.tone}>{status.label}</Tag>
                      {ban && (
                        <span className="mt-1 block text-meta text-muted-foreground">
                          {ban.until ? `до ${formatDateTime(ban.until)}` : 'назавжди'}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {canBan(user, target) &&
                        (item.status === 'active' ? (
                          <Button
                            variant="ghost"
                            size="terminal-sm"
                            className="text-destructive hover:bg-destructive/10"
                            onClick={() => setBanning(item)}
                          >
                            Заблокувати
                          </Button>
                        ) : (
                          <Button
                            variant="secondary"
                            size="terminal-sm"
                            onClick={() => setUnbanning(item)}
                          >
                            Розблокувати
                          </Button>
                        ))}
                    </TableCell>
                  </TableRow>
                )
              })}
        </TableBody>
      </Table>
      {!users.isPending && items.length === 0 && (
        <p className="border-t px-4 py-10 text-center text-ui text-muted-foreground">
          {users.isError ? toApiError(users.error).message : 'Нікого не знайдено.'}
        </p>
      )}
      <BanDialog
        user={
          banning
            ? {
                id: banning.id,
                username: banning.username,
                is_admin: banning.role !== 'user',
                role: banning.role,
              }
            : null
        }
        onClose={() => setBanning(null)}
      />
      <ConfirmDialog
        open={unbanning !== null}
        onOpenChange={(open) => !open && setUnbanning(null)}
        title={`Розблокувати @${unbanning?.username ?? ''}?`}
        description="Користувач знову зможе входити, публікувати й коментувати."
        confirmLabel="Розблокувати"
        pending={unban.isPending}
        error={unban.isError ? toApiError(unban.error).message : null}
        onConfirm={() =>
          unbanning && unban.mutate(unbanning.id, { onSuccess: () => setUnbanning(null) })
        }
      />
    </>
  )
}
