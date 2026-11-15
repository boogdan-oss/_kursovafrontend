import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'

interface LogoProps {
  size?: 'md' | 'lg'
  className?: string
}

function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden>
      <rect width="32" height="32" rx="9" className="fill-primary" />
      <path
        d="M10 10v7a6 6 0 0 0 12 0V9.5M18.5 13 22 9.5l3.5 3.5"
        fill="none"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="stroke-primary-foreground"
      />
    </svg>
  )
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <Link to="/" className={cn('flex shrink-0 items-center gap-2.5', className)}>
      <LogoMark className={size === 'lg' ? 'size-8' : 'size-7'} />
      <span className={cn('tracking-tight', size === 'lg' ? 'text-h2' : 'text-h3')}>
        <span className="text-primary">UP</span>ars
      </span>
    </Link>
  )
}
