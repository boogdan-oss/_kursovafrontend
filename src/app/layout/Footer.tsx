import { useHealth } from '@/features/dashboard/hooks'
import { formatTime } from '@/shared/lib/format'
import { cn } from '@/shared/lib/utils'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/shared/ui/tooltip'

function ApiStatus() {
  const { data, isError } = useHealth()
  const online = !isError && data !== undefined

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className="flex cursor-default items-center gap-1.5">
          <span className={cn('size-2 rounded-full', online ? 'bg-success' : 'bg-destructive')} />
          {online ? 'API онлайн' : 'API недоступний'}
        </span>
      </TooltipTrigger>
      <TooltipContent>
        {online ? `Перевірено о ${formatTime(data.time)}` : 'Бекенд не відповідає на /health'}
      </TooltipContent>
    </Tooltip>
  )
}

export function Footer() {
  return (
    <footer className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t bg-card px-4 py-[18px] text-small text-muted-foreground md:px-8">
      <span>© {new Date().getFullYear()} CryptoParser · аналітика, не фінансова порада</span>
      <div className="flex items-center gap-6 sm:ml-auto">
        <ApiStatus />
        <a href="/docs" target="_blank" rel="noreferrer" className="hover:text-foreground">
          Документація API
        </a>
      </div>
    </footer>
  )
}
