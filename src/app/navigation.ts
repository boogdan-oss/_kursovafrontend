export interface NavItem {
  to: string
  label: string
}

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Головна' },
  { to: '/offers', label: 'Ринок' },
  { to: '/arbitrage', label: 'Арбітраж' },
  { to: '/calculator', label: 'Калькулятор' },
  { to: '/forecast', label: 'AI-прогнози' },
  { to: '/assistant', label: 'AI-асистент' },
  { to: '/community', label: 'Спільнота' },
]
