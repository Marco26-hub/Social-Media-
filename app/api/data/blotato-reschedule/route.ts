import { NextResponse } from 'next/server'
import { requireAdmin, requireClienteId } from '@/lib/auth-utils'
import { q } from '@/lib/db'
import { getBlotatoKey } from '@/lib/blotato-key'
import { getPinnedSubaccountId } from '@/lib/blotato-accounts'
import { editableSchedule, matchesSchedule, validatedScheduleTime } from '@/lib/calendar-schedule-edit'

export const dynamic = 'force-dynamic'
const base = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'
type Row = Record<string, unknown>

export async function POST(request: Request) {
  let remoteChanged = false
  try {
    await requireAdmin()
    const cid = await requireClienteId()
    const body = await request.json() as { id?: string; data_pubblicazione?: string; ora_pubblicazione?: string }
    if (!body.id || !body.data_pubblicazione || !body.ora_pubblicazione) throw new Error('Post, data e ora richiesti')
    const rows = await q('SELECT * FROM calendario WHERE id = $1 AND cliente_id = $2', [body.id, cid]) as Row[]
    const row = rows[0]
    if (!row || !editableSchedule(row) || !row.blotato_post_id || row.blotato_status !== 'scheduled' || !row.platform_account_id) throw new Error('Modificabile solo un post ancora programmato: verifica Blotato prima di procedere.')
    const tz = await q('SELECT timezone FROM clienti WHERE id = $1', [cid])
    const scheduledTime = validatedScheduleTime(body.data_pubblicazione, body.ora_pubblicazione, String(tz[0]?.timezone || 'Europe/Rome'))
    if (Date.parse(scheduledTime) <= Date.now()) throw new Error('Scegli una data e un orario futuri')
    const key = await getBlotatoKey(cid)
    if (!key) throw new Error('API key Blotato assente')
    const headers = { 'blotato-api-key': key, Accept: 'application/json' }
    const pageId = row.canale === 'facebook' ? await getPinnedSubaccountId(cid, 'facebook') : null
    if (row.canale === 'facebook' && !pageId) throw new Error('Pagina Facebook non identificata')
    const schedules: Row[] = []
    let cursor = ''
    for (let page = 0; page < 10; page++) {
      const params = new URLSearchParams({ limit: '50', ...(cursor ? { cursor } : {}) })
      const response = await fetch(`${base}/v2/schedules?${params}`, { headers, cache: 'no-store' })
      if (!response.ok) throw new Error(`Lettura coda Blotato fallita (${response.status})`)
      const result = await response.json() as { items?: Row[]; cursor?: string }
      schedules.push(...(result.items || [])); cursor = result.cursor || ''
      if (!cursor) break
    }
    if (cursor) throw new Error('Coda troppo estesa: nessuna modifica applicata')
    const matches = schedules.filter(schedule => matchesSchedule(row, schedule, pageId))
    if (matches.length !== 1) throw new Error(`Post in coda non identificato in modo univoco (${matches.length}). Nessun reinvio: verifica Blotato.`)
    const schedule = matches[0]
    const url = `${base}/v2/schedules/${encodeURIComponent(String(schedule.id))}`
    const currentResponse = await fetch(url, { headers, cache: 'no-store' })
    if (!currentResponse.ok) throw new Error('Post non più in coda: nessuna modifica applicata')
    const current = (await currentResponse.json() as { schedule?: Row }).schedule
    if (!current || !matchesSchedule(row, current, pageId) || current.scheduledAt !== schedule.scheduledAt
      || JSON.stringify(current.draft) !== JSON.stringify(schedule.draft)) throw new Error('Programmazione remota cambiata: aggiorna e riprova')
    remoteChanged = true // Anche un timeout dopo l'invio richiede riconciliazione, mai un nuovo POST.
    const update = await fetch(url, { method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' }, body: JSON.stringify({ patch: { scheduledTime } }) })
    if (!update.ok) throw new Error(`Modifica Blotato rifiutata (${update.status}). Nessun nuovo post creato.`)
    const verification = await fetch(url, { headers, cache: 'no-store' })
    const saved = verification.ok ? (await verification.json() as { schedule?: Row }).schedule : null
    if (!saved || Date.parse(String(saved.scheduledAt)) !== Date.parse(scheduledTime)
      || JSON.stringify(saved.draft) !== JSON.stringify(current.draft)) throw new Error('Modifica remota non verificata')
    const updated = await q(`UPDATE calendario SET data_pubblicazione = $1, ora_pubblicazione = $2,
      blotato_scheduled_at = $3, updated_at = now()
      WHERE id = $4 AND cliente_id = $5 AND blotato_post_id = $6 AND blotato_status = 'scheduled'
      AND updated_at IS NOT DISTINCT FROM $7 RETURNING id`,
    [body.data_pubblicazione, body.ora_pubblicazione, scheduledTime, body.id, cid, row.blotato_post_id, row.updated_at])
    if (!updated.length) throw new Error('Scheda SWA cambiata durante il salvataggio')
    return NextResponse.json({ ok: true, scheduledTime })
  } catch (error) {
    return NextResponse.json({ error: `${(error as Error).message}${remoteChanged ? '. La modifica potrebbe essere già applicata su Blotato: premi Verifica Blotato per riallineare SWA, senza reinviare.' : ''}` }, { status: 409 })
  }
}
