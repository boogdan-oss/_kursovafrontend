import {
  formatCrypto,
  formatDate,
  formatDuration,
  formatFiat,
  formatNumber,
  formatPercent,
  formatRelativeTime,
} from '@/shared/lib/format'

const NBSP = String.fromCharCode(160)
const NARROW_NBSP = String.fromCharCode(0x202f)
const MINUS = String.fromCharCode(0x2212)
const plain = (text: string) =>
  text.replaceAll(NBSP, ' ').replaceAll(NARROW_NBSP, ' ').replaceAll(MINUS, '-')

describe('format', () => {
  it('числа: роздільник тисяч і десяткова кома', () => {
    expect(plain(formatNumber(1840))).toBe('1 840')
    expect(plain(formatNumber('41.05'))).toBe('41,05')
    expect(plain(formatNumber('1234.5', { minDigits: 2 }))).toBe('1 234,50')
  })

  it('фіат: рядок Decimal з бекенду → сума з символом валюти', () => {
    expect(plain(formatFiat('41.05'))).toBe('41,05 ₴')
    expect(plain(formatFiat('20000'))).toBe('20 000,00 ₴')
    expect(plain(formatFiat('284.68', 'UAH', { signed: true }))).toBe('+284,68 ₴')
    expect(plain(formatFiat('0.93', 'EUR'))).toBe('0,93 €')
  })

  it('фіат: невідомий код не ламає форматування', () => {
    expect(plain(formatFiat('5', 'USDT'))).toBe('5,00 USDT')
  })

  it('крипто: код активу і до 8 знаків', () => {
    expect(plain(formatCrypto('487.21', 'usdt'))).toBe('487,21 USDT')
    expect(plain(formatCrypto('0.00012345', 'BTC'))).toBe('0,00012345 BTC')
  })

  it('відсоток: значення вже у відсотках, на 100 не множиться', () => {
    expect(plain(formatPercent('1.42'))).toBe('1,42%')
    expect(plain(formatPercent('1.42', { signed: true }))).toBe('+1,42%')
    expect(plain(formatPercent('-0.6', { signed: true }))).toBe('-0,60%')
    expect(plain(formatPercent(0, { signed: true }))).toBe('0,00%')
  })

  it('порожні й некоректні значення → тире', () => {
    expect(formatNumber(null)).toBe('—')
    expect(formatFiat(undefined)).toBe('—')
    expect(formatPercent('')).toBe('—')
    expect(formatCrypto('abc', 'USDT')).toBe('—')
    expect(formatDate('не дата')).toBe('—')
    expect(formatDuration(null)).toBe('—')
  })

  it('дата', () => {
    expect(formatDate(new Date(2026, 10, 10))).toBe('10.11.2026')
  })

  it('відносний час', () => {
    const now = '2026-11-10T12:00:00Z'
    expect(plain(formatRelativeTime('2026-11-10T11:59:48Z', now))).toBe('12 с тому')
    expect(plain(formatRelativeTime('2026-11-10T11:18:00Z', now))).toBe('42 хв тому')
    expect(plain(formatRelativeTime('2026-11-10T10:00:00Z', now))).toBe('2 год тому')
  })

  it('тривалість', () => {
    expect(formatDuration(45)).toBe('45 с')
    expect(formatDuration(2520)).toBe('42 хв')
    expect(formatDuration(4320)).toBe('1 год 12 хв')
  })
})
