/** Calendar dates, not instants: UTC arithmetic keeps offsets stable across DST. */
export function isCalendarDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T12:00:00Z`)
  return Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === value
}

export function campaignToday(timeZone = 'Europe/Rome', now = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone }).format(now)
}

export function validateCampaignStart(value: unknown, timeZone = 'Europe/Rome', now = new Date()): string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (!isCalendarDate(value)) throw new Error('Data di inizio pubblicazione non valida.')
  if (value < campaignToday(timeZone, now)) throw new Error('La data di inizio pubblicazione non può essere nel passato.')
  return value
}

export function moveCampaignDates<T extends { date: string }>(contents: T[], start: string): T[] {
  if (!isCalendarDate(start) || !contents.length || contents.some(item => !isCalendarDate(item.date))) {
    throw new Error('Date della campagna non valide.')
  }
  const first = contents.reduce((date, item) => item.date < date ? item.date : date, contents[0].date)
  const offset = new Date(`${start}T12:00:00Z`).getTime() - new Date(`${first}T12:00:00Z`).getTime()
  return contents.map(item => ({
    ...item,
    date: new Date(new Date(`${item.date}T12:00:00Z`).getTime() + offset).toISOString().slice(0, 10),
  }))
}
