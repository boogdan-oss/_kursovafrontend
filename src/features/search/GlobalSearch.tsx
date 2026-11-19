import { Search } from 'lucide-react'
import { type KeyboardEvent, type RefObject, useEffect, useId, useRef, useState } from 'react'

import { SearchResults } from '@/features/search/components/SearchResults'
import { useGlobalSearch, useSearchSelect } from '@/features/search/hooks'
import { optionId, type SearchItem } from '@/features/search/lib'
import { cn } from '@/shared/lib/utils'
import { Button } from '@/shared/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/shared/ui/dialog'

const PLACEHOLDER = 'Пара, біржа або @користувач'

interface SearchBoxProps {
  variant: 'popover' | 'dialog'
  inputRef?: RefObject<HTMLInputElement>
  onDone?: () => void
}

function SearchBox({ variant, inputRef, onDone }: SearchBoxProps) {
  const listId = useId()
  const ownRef = useRef<HTMLInputElement>(null)
  const input = inputRef ?? ownRef
  const [query, setQuery] = useState('')
  const [focused, setFocused] = useState(false)
  const [active, setActive] = useState(0)
  const open = variant === 'dialog' || focused
  const search = useGlobalSearch(query, open)
  const select = useSearchSelect()
  const current = Math.min(active, search.items.length - 1)

  function close() {
    setQuery('')
    setActive(0)
    input.current?.blur()
    onDone?.()
  }

  function choose(item: SearchItem) {
    select(item)
    close()
  }

  function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    const count = search.items.length
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      if (count === 0) return
      const step = event.key === 'ArrowDown' ? 1 : -1
      setActive((Math.max(current, 0) + step + count) % count)
    } else if (event.key === 'Enter') {
      const item = search.items[current]
      if (!item) return
      event.preventDefault()
      choose(item)
    } else if (event.key === 'Escape') {
      event.preventDefault()
      event.stopPropagation()
      if (query) {
        setQuery('')
        setActive(0)
      } else close()
    }
  }

  const results = (
    <SearchResults
      listId={listId}
      items={search.items}
      active={current}
      current={search.current}
      query={query}
      loading={search.loading}
      failed={search.failed}
      onActive={setActive}
      onSelect={choose}
    />
  )
  const expanded = open

  return (
    <div className={cn('relative', variant === 'popover' && 'w-[250px]')}>
      <label
        className={cn(
          'flex items-center gap-2 bg-background px-3',
          variant === 'popover'
            ? 'h-9 rounded-lg border focus-within:ring-1 focus-within:ring-ring'
            : 'h-12 border-b',
        )}
      >
        <Search className="size-4 shrink-0 text-muted-foreground" />
        <input
          ref={input}
          type="search"
          role="combobox"
          autoComplete="off"
          autoFocus={variant === 'dialog'}
          placeholder={PLACEHOLDER}
          aria-label="Пошук пари, біржі або користувача"
          aria-expanded={expanded}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            expanded && current >= 0 && search.items.length > 0
              ? optionId(listId, current)
              : undefined
          }
          value={query}
          onChange={(event) => {
            setQuery(event.target.value)
            setActive(0)
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={onKeyDown}
          className="min-w-0 flex-1 bg-transparent text-caption outline-none placeholder:text-muted-foreground"
        />
        {variant === 'popover' && (
          <kbd className="rounded-[4px] border px-1.5 py-px font-sans text-small text-muted-foreground">
            /
          </kbd>
        )}
      </label>
      {expanded &&
        (variant === 'popover' ? (
          <div className="absolute right-0 top-full z-50 mt-1.5 w-[420px] rounded-lg border bg-card shadow-[0_16px_40px_rgba(0,0,0,0.35)]">
            {results}
          </div>
        ) : (
          results
        ))}
    </div>
  )
}

export function GlobalSearch() {
  const inlineRef = useRef<HTMLInputElement>(null)
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    function onKeyDown(event: globalThis.KeyboardEvent) {
      const target = event.target as HTMLElement
      if (event.key !== '/' || target.closest('input, textarea, select, [contenteditable]')) return
      event.preventDefault()
      const input = inlineRef.current
      if (input && input.getClientRects().length > 0) input.focus()
      else setDialogOpen(true)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  return (
    <>
      <div className="hidden min-[1400px]:block">
        <SearchBox variant="popover" inputRef={inlineRef} />
      </div>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Пошук"
        className="min-[1400px]:hidden"
        onClick={() => setDialogOpen(true)}
      >
        <Search />
      </Button>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="top-16 max-w-[520px] translate-y-0 gap-0 overflow-hidden p-0 data-[state=closed]:slide-out-to-top-0 data-[state=open]:slide-in-from-top-0 [&>button:last-child]:hidden">
          <DialogTitle className="sr-only">Пошук</DialogTitle>
          <DialogDescription className="sr-only">
            Пара, біржа або користувач спільноти
          </DialogDescription>
          <SearchBox variant="dialog" onDone={() => setDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </>
  )
}
