import { zonedToUtcIso } from './publish/blotato-map'
import { remoteCalendarTime } from './calendar-display'

type Row = Record<string, unknown>
export function editableSchedule(row: Row): boolean {
  if (row.status === 'ARCHIVIATO' || ['published', 'in-progress'].includes(String(row.blotato_status))) return false
  return row.status !== 'PUBBLICATO' || row.blotato_status === 'scheduled'
}

export function validatedScheduleTime(day: string, time: string, timezone: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('Data o ora non valide')
  const iso = zonedToUtcIso(day, time, timezone)
  const roundtrip = remoteCalendarTime(iso, timezone)
  if (roundtrip?.day !== day || roundtrip?.time !== time) throw new Error('Data o ora non esistenti nel fuso del cliente')
  return iso
}

export function matchesSchedule(row: Row, schedule: Row, pageId: string | null): boolean {
  const draft = schedule.draft as Row | undefined
  const content = draft?.content as Row | undefined
  const hook = String(row.hook || '').trim()
  if (!hook || !row.platform_account_id || !draft || !content) return false
  const media = new Set([...Array.from({ length: 10 }, (_, i) => row[`link_media_${i + 1}`]), row.blotato_visual_media_url, row.blotato_audio_visual_media_url].filter(Boolean).map(String))
  return String(draft.accountId) === String(row.platform_account_id)
    && content.platform === row.canale && String(content.text || '').startsWith(hook)
    && (!pageId || String((draft.target as Row)?.pageId || '') === pageId)
    && Array.isArray(content.mediaUrls) && content.mediaUrls.some(url => media.has(String(url)))
}
