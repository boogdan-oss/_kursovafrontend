import { Link } from 'react-router-dom'

import { cn } from '@/shared/lib/utils'

interface LogoProps {
  size?: 'md' | 'lg'
  className?: string
}

export function Logo({ size = 'md', className }: LogoProps) {
  return (
    <Link to="/" className={cn('flex shrink-0 items-center gap-2.5', className)}>
      <span
        className={cn('rounded-full bg-primary', size === 'lg' ? 'size-8' : 'size-7')}
        aria-hidden
      />
      <span className={size === 'lg' ? 'text-h2' : 'text-h3'}>CryptoParser</span>
    </Link>
  )
}
