import type { Conversation } from '@/shared/api/assistant-types'

const DAY_MS = 86_400_000
const WEEK_DAYS = 7

export interface ConversationGroup {
  label: string
  items: Conversation[]
}

export function groupConversations(items: Conversation[], now: number): ConversationGroup[] {
  const today = new Date(now)
  today.setHours(0, 0, 0, 0)
  const start = today.getTime()
  const bounds = [
    { label: 'Сьогодні', from: start },
    { label: 'Вчора', from: start - DAY_MS },
    { label: 'Цей тиждень', from: start - (WEEK_DAYS - 1) * DAY_MS },
    { label: 'Раніше', from: -Infinity },
  ]
  const groups = bounds.map(({ label }) => ({ label, items: [] as Conversation[] }))
  const sorted = [...items].sort((a, b) => b.updated_at.localeCompare(a.updated_at))
  for (const item of sorted) {
    const time = new Date(item.updated_at).getTime()
    groups[bounds.findIndex((bound) => time >= bound.from)].items.push(item)
  }
  return groups.filter((group) => group.items.length > 0)
}

export type Block =
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[] }
  | { type: 'table'; header: string[]; rows: string[][] }

const TABLE_DIVIDER = /^\|?\s*:?-{2,}:?\s*(\|\s*:?-{2,}:?\s*)*\|?$/

function cells(line: string) {
  return line
    .trim()
    .replace(/^\||\|$/g, '')
    .split('|')
    .map((cell) => cell.trim())
}

export function parseBlocks(content: string): Block[] {
  const blocks: Block[] = []
  for (const chunk of content.replace(/\r\n/g, '\n').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').filter((line) => line.trim())
    if (!lines.length) continue
    if (lines.length >= 2 && lines[0].includes('|') && TABLE_DIVIDER.test(lines[1].trim())) {
      blocks.push({ type: 'table', header: cells(lines[0]), rows: lines.slice(2).map(cells) })
    } else if (lines.every((line) => /^\s*[-*]\s+/.test(line))) {
      blocks.push({ type: 'list', items: lines.map((line) => line.replace(/^\s*[-*]\s+/, '')) })
    } else {
      blocks.push({ type: 'paragraph', text: lines.join('\n') })
    }
  }
  return blocks
}

export type Segment = { type: 'text' | 'bold' | 'number'; text: string }

const INLINE = /(\*\*[^*]+\*\*)/g
const NUMBER = /((?<![\p{L}\d+−-])[+−-]?\d+(?:\s\d{3})*(?:[.,]\d+)?%?)/gu

export function parseInline(text: string): Segment[] {
  const segments: Segment[] = []
  for (const part of text.split(INLINE)) {
    if (!part) continue
    if (part.startsWith('**') && part.endsWith('**')) {
      segments.push({ type: 'bold', text: part.slice(2, -2) })
      continue
    }
    for (const piece of part.split(NUMBER)) {
      if (!piece) continue
      segments.push({ type: /^[+−-]?\d/.test(piece) ? 'number' : 'text', text: piece })
    }
  }
  return segments
}

export function isNumeric(cell: string) {
  return /^[+−-]?\d[\d\s.,]*%?$/.test(cell)
}

export function isInternalPath(path: string) {
  return path.startsWith('/') && !path.startsWith('//')
}

export interface PromptTemplate {
  label: string
  text: string
  send: boolean
}

export const SUGGESTIONS: PromptTemplate[] = [
  { label: 'Порівняй комісії бірж', text: 'Порівняй комісії бірж для {pair}', send: true },
  { label: 'Оціни ризик продавця', text: 'Оціни ризик продавця ', send: false },
  { label: 'Щоденний огляд', text: 'Зроби щоденний огляд ринку {pair}', send: true },
]

export const QUICK_PROMPTS: PromptTemplate[] = [
  { label: 'Найкращі ціни продажу', text: 'Де зараз найкраще продати {asset}?', send: true },
  { label: 'Топ-5 арбітражу', text: 'Покажи топ-5 арбітражних можливостей {pair}', send: true },
  { label: 'Ризик продавця за ніком', text: 'Оціни ризик продавця ', send: false },
  { label: 'Огляд ринку за день', text: 'Зроби огляд ринку {pair} за день', send: true },
  { label: 'Порівняти банки', text: 'Який банк вигідніший для угод з {asset}?', send: true },
]

export function fillPrompt(text: string, asset: string, fiat: string) {
  return text.replaceAll('{pair}', `${asset}/${fiat}`).replaceAll('{asset}', asset)
}
