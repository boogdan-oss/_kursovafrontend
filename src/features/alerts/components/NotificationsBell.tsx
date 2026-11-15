import { Bell } from 'lucide-react'
import { Link } from 'react-router-dom'

import { useLiveAlerts, useNotifications } from '@/features/alerts/hooks'
import { plural } from '@/shared/lib/format'
import { Button } from '@/shared/ui/button'
import { useAuthStore } from '@/store/useAuthStore'

const UNREAD_FORMS = ['непрочитане', 'непрочитані', 'непрочитаних'] as const
const UNREAD_CAP = 99

export function NotificationsBell() {
  const signedIn = useAuthStore((state) => state.session !== null)
  const notifications = useNotifications({ enabled: signedIn })
  useLiveAlerts()

  const unread = signedIn ? (notifications.data?.unread ?? 0) : 0
  const label = unread > 0 ? `Сповіщення: ${unread} ${plural(unread, UNREAD_FORMS)}` : 'Сповіщення'

  return (
    <Button asChild variant="outline" size="icon" className="relative [&_svg]:size-[18px]">
      <Link to="/alerts" aria-label={label} title={label}>
        <Bell />
        {unread > 0 && (
          <span
            aria-hidden
            className="absolute -right-1.5 -top-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-meta font-semibold tabular-nums text-primary-foreground ring-2 ring-card"
          >
            {unread > UNREAD_CAP ? `${UNREAD_CAP}+` : unread}
          </span>
        )}
      </Link>
    </Button>
  )
}
