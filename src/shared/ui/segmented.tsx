import * as TabsPrimitive from '@radix-ui/react-tabs'

import { cn } from '@/shared/lib/utils'

interface SegmentedOption<Value extends string> {
  value: Value
  label: string
}

interface SegmentedProps<Value extends string> {
  value: Value
  onValueChange: (value: Value) => void
  options: SegmentedOption<Value>[]
  size?: 'md' | 'sm'
  label?: string
  className?: string
}

export function Segmented<Value extends string>({
  value,
  onValueChange,
  options,
  size = 'md',
  label,
  className,
}: SegmentedProps<Value>) {
  return (
    <TabsPrimitive.Root value={value} onValueChange={(next) => onValueChange(next as Value)}>
      <TabsPrimitive.List
        aria-label={label}
        className={cn(
          'inline-flex flex-wrap items-stretch rounded-sm border border-border-strong',
          className,
        )}
      >
        {options.map((option) => (
          <TabsPrimitive.Trigger
            key={option.value}
            value={option.value}
            className={cn(
              'relative whitespace-nowrap border-r border-border-strong px-2 text-meta text-muted-foreground transition-colors last:border-r-0 hover:text-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-ring',
              size === 'md' ? 'h-[26px] px-3.5' : 'h-5',
              'data-[state=active]:bg-primary/15 data-[state=active]:font-semibold data-[state=active]:text-foreground',
              'after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-primary after:opacity-0 data-[state=active]:after:opacity-100',
            )}
          >
            {option.label}
          </TabsPrimitive.Trigger>
        ))}
      </TabsPrimitive.List>
    </TabsPrimitive.Root>
  )
}
