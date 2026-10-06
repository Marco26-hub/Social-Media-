// Lo stato locale PUBBLICATO indica anche un invio accettato: la vista deve
// usare la conferma remota, senza dedurre la pubblicazione dall'orario passato.
export function calendarDisplayStatus(row: { status?: unknown; blotato_status?: unknown }): string {
  const remote = String(row.blotato_status || '').toLowerCase()
  if (remote === 'scheduled' || remote === 'in-progress') return 'IN_CODA'
  if (remote === 'published') return 'PUBBLICATO'
  if (remote === 'failed') return 'ERRORE'
  return String(row.status || '')
}

export function remoteCalendarTime(value: unknown, timezone: string): { day: string; time: string; iso: string } | null {
  if (typeof value !== 'string' || !/T.*(?:Z|[+-]\d{2}:\d{2})$/.test(value)) return null
  const date = new Date(value)
  if (!Number.isFinite(date.getTime())) return null
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(date)
  const get = (type: string) => parts.find(part => part.type === type)?.value
  return { day: `${get('year')}-${get('month')}-${get('day')}`, time: `${get('hour')}:${get('minute')}`, iso: date.toISOString() }
}
