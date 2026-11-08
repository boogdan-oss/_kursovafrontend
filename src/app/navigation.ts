import {
  ArrowLeftRight,
  Bell,
  Bot,
  Calculator,
  LayoutDashboard,
  ScanSearch,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  icon: LucideIcon
}

// Пункти бічного меню; маршрути — у router.tsx
export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Дашборд', icon: LayoutDashboard },
  { to: '/offers', label: 'Market Scanner', icon: ScanSearch },
  { to: '/arbitrage', label: 'Арбітраж', icon: ArrowLeftRight },
  { to: '/calculator', label: 'Калькулятор', icon: Calculator },
  { to: '/forecast', label: 'Прогноз', icon: TrendingUp },
  { to: '/assistant', label: 'AI-асистент', icon: Bot },
  { to: '/alerts', label: 'Сповіщення', icon: Bell },
  { to: '/community', label: 'Спільнота', icon: Users },
]
