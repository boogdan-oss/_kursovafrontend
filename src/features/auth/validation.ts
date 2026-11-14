export type RegisterField = 'username' | 'email' | 'password'

export interface RegisterValues {
  username: string
  email: string
  password: string
  confirm: string
}

const USERNAME = /^[A-Za-z0-9_.]{3,32}$/
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
export const MIN_PASSWORD = 8
export const MAX_PASSWORD = 128

export function validateRegistration(values: RegisterValues) {
  const errors: Partial<Record<RegisterField | 'confirm', string>> = {}
  if (!values.username) errors.username = 'Вкажіть нікнейм'
  else if (!USERNAME.test(values.username)) {
    errors.username = '3–32 символи: латинські літери, цифри, «_» або «.»'
  }
  if (!EMAIL.test(values.email.trim())) errors.email = 'Вкажіть коректний email'
  if (values.password.length < MIN_PASSWORD) {
    errors.password = `Мінімум ${MIN_PASSWORD} символів`
  } else if (values.password.length > MAX_PASSWORD) {
    errors.password = `Максимум ${MAX_PASSWORD} символів`
  }
  if (values.confirm !== values.password) errors.confirm = 'Паролі не збігаються'
  return errors
}

export function passwordScore(password: string) {
  if (!password) return 0
  let score = password.length >= MIN_PASSWORD ? 1 : 0
  if (password.length >= 12) score++
  if (/[a-zа-яії]/.test(password) && /[A-ZА-ЯІЇ]/.test(password) && /\d/.test(password)) score++
  if (/[^A-Za-zА-Яа-яІіЇїЄєҐґ0-9]/.test(password)) score++
  return score
}

export interface PasswordChangeValues {
  current: string
  next: string
  confirm: string
}

export function validatePasswordChange(values: PasswordChangeValues) {
  const errors: Partial<Record<keyof PasswordChangeValues, string>> = {}
  if (!values.current) errors.current = 'Вкажіть поточний пароль'
  if (values.next.length < MIN_PASSWORD) errors.next = `Мінімум ${MIN_PASSWORD} символів`
  else if (values.next.length > MAX_PASSWORD) errors.next = `Максимум ${MAX_PASSWORD} символів`
  else if (values.next === values.current) errors.next = 'Новий пароль збігається з поточним'
  if (values.confirm !== values.next) errors.confirm = 'Паролі не збігаються'
  return errors
}

export function parseAmount(text: string, allowZero = false): string | null | undefined {
  const normalized = text.split(' ').join('').replace(',', '.')
  if (!normalized) return null
  const value = Number(normalized)
  if (!Number.isFinite(value) || value < 0 || (!allowZero && value === 0)) return undefined
  return normalized
}
