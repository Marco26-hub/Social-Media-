import { CANALE_TO_BLOTATO } from './publish/blotato-map'
import { CalendarScheduleError } from './calendar-slot'

export type ScheduleRow = Record<string, unknown>
const clean = (v: unknown) => String(v || '').replace(/\s+/g, ' ').trim()

export function scheduleMatches(row: ScheduleRow, schedule: ScheduleRow, pageId?: string | null): boolean {
  const draft = schedule.draft as ScheduleRow | undefined
  const content = draft?.content as ScheduleRow | undefined
  const target = draft?.target as ScheduleRow | undefined
  const platform = CANALE_TO_BLOTATO[String(row.canale)]
  if (!row.platform_account_id || !draft || !content || !platform || !clean(row.hook)) return false
  if (String(draft.accountId || '') !== String(row.platform_account_id) || content.platform !== platform
    || !clean(content.text).startsWith(clean(row.hook))) return false
  if (['facebook', 'linkedin'].includes(platform) && (!pageId || String(target?.pageId || '') !== pageId)) return false
  const media = new Set([...Array.from({ length: 10 }, (_, i) => row[`link_media_${i + 1}`]),
    row.blotato_visual_media_url, row.blotato_audio_visual_media_url].filter(Boolean).map(String))
  return Array.isArray(content.mediaUrls) && content.mediaUrls.length > 0 && content.mediaUrls.every(url => media.has(String(url)))
}

export function remoteSlotCollision(schedules: ScheduleRow[], accountId: string, platform: string, pageId: string | null, iso: string, excludeId = '') {
  return schedules.some(schedule => {
    const draft = schedule.draft as ScheduleRow | undefined
    const content = draft?.content as ScheduleRow | undefined
    const target = draft?.target as ScheduleRow | undefined
    return String(schedule.id) !== excludeId && String(draft?.accountId || '') === accountId
      && content?.platform === platform && (!pageId || String(target?.pageId || '') === pageId)
      && Math.floor(Date.parse(String(schedule.scheduledAt || '')) / 60000) === Math.floor(Date.parse(iso) / 60000)
  })
}

export async function listBlotatoSchedules(key: string, fetcher: typeof fetch = fetch) {
  const base = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'
  const items: ScheduleRow[] = []
  const seen = new Set<string>()
  let cursor = ''
  for (let page = 0; page < 10; page++) {
    const params = new URLSearchParams({ limit: '50', ...(cursor ? { cursor } : {}) })
    const response = await fetcher(`${base}/v2/schedules?${params}`, { headers: { 'blotato-api-key': key }, cache: 'no-store', signal: AbortSignal.timeout(5000) })
    if (!response.ok) throw new CalendarScheduleError(`Impossibile verificare la coda Blotato (HTTP ${response.status}). Nessun invio.`, 502)
    const body = await response.json() as { items?: ScheduleRow[]; cursor?: string }
    if (!Array.isArray(body.items)) throw new CalendarScheduleError('Risposta coda Blotato incompleta: operazione bloccata.', 502)
    items.push(...body.items)
    cursor = body.cursor || ''
    if (!cursor) return items
    if (seen.has(cursor)) break
    seen.add(cursor)
  }
  throw new CalendarScheduleError('Coda oltre il limite di verifica o paginazione ripetuta: nessuna modifica.', 502)
}
