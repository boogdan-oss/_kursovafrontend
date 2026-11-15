export type Role = 'user' | 'admin' | 'owner'

export const ROLE_RANK: Record<Role, number> = { user: 0, admin: 1, owner: 2 }

export const ROLE_LABELS: Record<Role, string> = {
  user: 'Учасник',
  admin: 'Адмін',
  owner: 'Власник',
}

export const ROLE_TONES = { user: 'accent', admin: 'warning', owner: 'success' } as const

interface Actor {
  id: number
  role: Role
}

export function isStaff(role: Role | null | undefined) {
  return role === 'admin' || role === 'owner'
}

export function outranks(actor: Actor, targetRole: Role) {
  return ROLE_RANK[actor.role] > ROLE_RANK[targetRole]
}

export function canModerate(actor: Actor | null, target: Actor) {
  if (!actor || !isStaff(actor.role)) return false
  return actor.id === target.id || outranks(actor, target.role)
}

export function canBan(actor: Actor | null, target: Actor) {
  if (!actor || !isStaff(actor.role)) return false
  return actor.id !== target.id && outranks(actor, target.role)
}
