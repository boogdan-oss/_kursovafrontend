import { exchangeMarketUrl } from '@/shared/lib/exchange-links'
import { canBan, canModerate, isStaff, ROLE_LABELS } from '@/shared/lib/roles'

describe('ролі', () => {
  const user = { id: 1, role: 'user' as const }
  const admin = { id: 2, role: 'admin' as const }
  const otherAdmin = { id: 3, role: 'admin' as const }
  const owner = { id: 4, role: 'owner' as const }

  it('адмін і власник — персонал, назви ролей українською', () => {
    expect(isStaff('user')).toBe(false)
    expect(isStaff('admin')).toBe(true)
    expect(isStaff('owner')).toBe(true)
    expect(ROLE_LABELS.owner).toBe('Власник')
  })

  it('модерувати можна контент нижчої ролі або свій', () => {
    expect(canModerate(admin, user)).toBe(true)
    expect(canModerate(admin, admin)).toBe(true)
    expect(canModerate(admin, otherAdmin)).toBe(false)
    expect(canModerate(admin, owner)).toBe(false)
    expect(canModerate(owner, otherAdmin)).toBe(true)
    expect(canModerate(user, user)).toBe(false)
    expect(canModerate(null, user)).toBe(false)
  })

  it('блокувати можна лише нижчу роль і не себе', () => {
    expect(canBan(admin, user)).toBe(true)
    expect(canBan(admin, otherAdmin)).toBe(false)
    expect(canBan(owner, admin)).toBe(true)
    expect(canBan(owner, owner)).toBe(false)
    expect(canBan(user, user)).toBe(false)
  })
})

describe('посилання на P2P-сторінки бірж', () => {
  it('для всіх 6 бірж з потрібною стороною, активом і фіатом', () => {
    expect(exchangeMarketUrl('binance', 'BUY', 'USDT', 'UAH')).toBe(
      'https://p2p.binance.com/trade/all-payments/USDT?fiat=UAH',
    )
    expect(exchangeMarketUrl('bybit', 'SELL', 'usdt', 'uah')).toBe(
      'https://www.bybit.com/fiat/trade/otc/?actionType=0&token=USDT&fiat=UAH',
    )
    expect(exchangeMarketUrl('okx', 'BUY', 'USDT', 'UAH')).toBe(
      'https://www.okx.com/p2p-markets/uah/buy-usdt',
    )
    expect(exchangeMarketUrl('bitget', 'SELL', 'USDT', 'EUR')).toBe(
      'https://www.bitget.com/p2p-trade/sell/USDT?fiatName=EUR',
    )
    expect(exchangeMarketUrl('mexc', 'BUY', 'USDT', 'UAH')).toBe(
      'https://www.mexc.com/buy-crypto/p2p/buy/USDT/UAH',
    )
    expect(exchangeMarketUrl('htx', 'SELL', 'USDT', 'KZT')).toBe(
      'https://www.htx.com/en-us/fiat-crypto/trade/sell-usdt-kzt',
    )
    expect(exchangeMarketUrl('unknown', 'BUY', 'USDT', 'UAH')).toBeNull()
  })
})
