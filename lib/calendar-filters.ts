import { calendarDisplayStatus } from './calendar-display'

type Row = { status?: unknown; blotato_status?: unknown; blotato_post_id?: unknown; errore_tecnico?: unknown;
  media_type?: unknown; formato?: unknown; obiettivo?: unknown; template_style?: unknown; creative_brief?: unknown; quality_level?: unknown }
export function isCalendarError(row: Row) {
  return ['ERRORE', 'ERRORE_MANUALE'].includes(String(row.status || '')) || row.blotato_status === 'failed' || Boolean(row.errore_tecnico)
}
export function matchesCalendarFilter(row: Row, filter: string) {
  if (filter === 'tutti') return true
  if (filter === 'NON_INVIATI') return !row.blotato_post_id && !['PUBBLICATO', 'ERRORE', 'NON_APPROVATO', 'ARCHIVIATO'].includes(String(row.status || ''))
  if (filter === 'ERRORI') return isCalendarError(row)
  if (filter === 'VIDEO') return row.media_type === 'video' || ['reel','video','short','story'].includes(String(row.formato))
  if (filter === 'PREMIUM') return row.obiettivo === 'trending' || Boolean(row.template_style || row.creative_brief) || row.quality_level === 'high'
  if (filter === 'PUBBLICATO') return row.blotato_status === 'published' || (row.status === 'PUBBLICATO' && !row.blotato_post_id)
  return calendarDisplayStatus(row) === filter
}
