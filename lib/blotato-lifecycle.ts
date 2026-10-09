import { calendarDisplayStatus, remoteCalendarTime } from './calendar-display'

export type BlotatoRow = Record<string, unknown>
export type BlotatoUpdate = {
  status: 'published' | 'failed' | 'scheduled' | 'in-progress'
  url: string | null
  error: string | null
  time: ReturnType<typeof remoteCalendarTime>
}

export function parseBlotatoUpdate(remote: BlotatoRow, timezone: string): BlotatoUpdate {
  const status = String(remote.status || '').toLowerCase()
  if (!['published', 'failed', 'scheduled', 'in-progress'].includes(status)) throw new Error('Stato remoto Blotato non riconosciuto')
  const time = status === 'scheduled' ? remoteCalendarTime(remote.scheduledTime, timezone) : null
  if (status === 'scheduled' && !time) throw new Error('Blotato scheduled senza data valida: nessuna modifica')
  return {
    status: status as BlotatoUpdate['status'], time,
    url: typeof remote.publicUrl === 'string' && /^https:\/\//.test(remote.publicUrl) ? remote.publicUrl : null,
    error: status === 'failed' ? String(remote.errorMessage || remote.error || 'Pubblicazione fallita').slice(0, 500) : null,
  }
}

export function publicationSummary(rows: Array<{ status?: unknown; blotato_status?: unknown; blotato_post_id?: unknown }>, included: number) {
  const active = rows.filter(row => !['NON_APPROVATO', 'ARCHIVIATO'].includes(String(row.status || '')))
  const published = active.filter(row => row.blotato_status === 'published' || (row.status === 'PUBBLICATO' && !row.blotato_post_id))
  return {
    included, planned: active.length, published: published.length,
    queued: active.filter(row => calendarDisplayStatus(row) === 'IN_CODA').length,
    failed: active.filter(row => calendarDisplayStatus(row) === 'ERRORE').length,
    not_sent: active.filter(row => !row.blotato_post_id && !['PUBBLICATO', 'ERRORE'].includes(String(row.status || ''))).length,
    missing_to_create: Math.max(0, included - active.length), missing_to_publish: Math.max(0, included - published.length),
    extra_planned: Math.max(0, active.length - included),
  }
}

export function reconciliationRange(month: string, timezone: string) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Mese non valido: usa YYYY-MM')
  const [year, num] = month.split('-').map(Number)
  const next = new Date(Date.UTC(year, num, 1))
  const start = `${month}-01`
  const end = next.toISOString().slice(0, 10)
  // Limiti nel fuso del cliente, non a mezzanotte UTC (perde i post tra le
  // 00:00 e le 02:00 al cambio mese italiano).
  return { start, end, timezone }
}
