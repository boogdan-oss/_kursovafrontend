const timeFormatter = new Intl.DateTimeFormat('uk-UA', {
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
})

export function formatTime(iso: string) {
  return timeFormatter.format(new Date(iso))
}
