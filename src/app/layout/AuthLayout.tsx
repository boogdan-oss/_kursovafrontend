import { Link, Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-[22px] bg-background px-4 py-10">
      <Link to="/" className="flex items-center gap-2.5" aria-label="UPars — на головну">
        <span aria-hidden className="size-[22px] rounded-sm bg-primary" />
        <span className="text-[20px] font-bold leading-[18px] tracking-[0.015em]">UPars</span>
        <span className="border-l border-border-strong pl-2 text-meta font-medium uppercase tracking-[0.08em] text-muted-foreground">
          P2P terminal
        </span>
      </Link>
      <Outlet />
    </div>
  )
}
