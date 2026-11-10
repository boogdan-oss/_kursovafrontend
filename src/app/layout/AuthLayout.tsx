import { Check, Info } from 'lucide-react'
import { Outlet } from 'react-router-dom'

import { Logo } from '@/app/layout/Logo'

const FEATURES = [
  'Сканер P2P-оголошень з фільтрами за банком, сумою й рейтингом',
  'Арбітраж між біржами та ланцюжки з чистим прибутком',
  'AI-прогноз ціни, оцінка ризику продавця та чат-асистент',
]

export function AuthLayout() {
  return (
    <div className="flex min-h-screen">
      <aside className="hidden w-[620px] shrink-0 flex-col gap-8 border-r bg-card p-16 xl:flex">
        <Logo size="lg" />
        <div className="flex flex-col gap-4">
          <p className="text-display">Найвигідніші P2P-угоди з USDT — в одному місці</p>
          <p className="text-body text-muted-foreground">
            Збираємо оголошення з Binance, Bybit та OKX, рахуємо спреди з усіма комісіями та
            пояснюємо ринок за допомогою AI.
          </p>
        </div>
        <ul className="flex flex-col gap-3">
          {FEATURES.map((feature) => (
            <li key={feature} className="flex items-center gap-3 text-caption">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                <Check className="size-3.5" strokeWidth={3} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <p className="mt-auto flex items-center gap-2 text-small text-muted-foreground">
          <Info className="size-3.5 shrink-0" />
          Аналітика, не фінансова порада. CryptoParser ніколи не виконує угод від вашого імені.
        </p>
      </aside>
      <main className="flex flex-1 flex-col items-center justify-center gap-8 p-4">
        <Logo className="xl:hidden" />
        <Outlet />
      </main>
    </div>
  )
}
