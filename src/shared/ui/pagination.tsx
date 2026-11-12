import { ChevronLeft, ChevronRight } from 'lucide-react'

import { cn } from '@/shared/lib/utils'

interface PaginationProps {
  page: number
  pageCount: number
  onPageChange: (page: number) => void
  className?: string
}

type PageItem = number | 'gap-start' | 'gap-end'

export function pageItems(page: number, pageCount: number): PageItem[] {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1)
  const from = Math.max(2, Math.min(page - 1, pageCount - 3))
  const to = Math.min(pageCount - 1, Math.max(page + 1, 4))
  const items: PageItem[] = [1]
  if (from > 2) items.push('gap-start')
  for (let current = from; current <= to; current++) items.push(current)
  if (to < pageCount - 1) items.push('gap-end')
  items.push(pageCount)
  return items
}

const itemClass =
  'flex h-6 min-w-[26px] items-center justify-center rounded-sm border border-border-strong bg-elevated px-1 font-mono text-ui font-semibold text-foreground transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'

export function Pagination({ page, pageCount, onPageChange, className }: PaginationProps) {
  if (pageCount <= 1) return null

  return (
    <nav className={cn('flex items-center gap-1', className)} aria-label="Сторінки">
      <button
        type="button"
        className={cn(itemClass, 'enabled:hover:bg-accent disabled:opacity-40')}
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
        aria-label="Попередня сторінка"
      >
        <ChevronLeft className="size-3.5" />
      </button>
      {pageItems(page, pageCount).map((item) =>
        typeof item === 'number' ? (
          <button
            key={item}
            type="button"
            aria-current={item === page ? 'page' : undefined}
            className={cn(
              itemClass,
              item === page ? 'border-primary text-primary' : 'hover:bg-accent',
            )}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ) : (
          <span
            key={item}
            className={cn(itemClass, 'border-transparent bg-transparent text-tertiary')}
            aria-hidden
          >
            …
          </span>
        ),
      )}
      <button
        type="button"
        className={cn(itemClass, 'enabled:hover:bg-accent disabled:opacity-40')}
        disabled={page >= pageCount}
        onClick={() => onPageChange(page + 1)}
        aria-label="Наступна сторінка"
      >
        <ChevronRight className="size-3.5" />
      </button>
    </nav>
  )
}
