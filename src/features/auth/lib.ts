export function safeNext(path: string | null | undefined) {
  if (!path || !path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return '/'
  return path
}
