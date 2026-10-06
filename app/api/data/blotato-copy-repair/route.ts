import { NextResponse } from 'next/server'
import { requireAdmin, requireClienteId } from '@/lib/auth-utils'
import { q } from '@/lib/db'
import { getBlotatoKey } from '@/lib/blotato-key'
import { repairQueuedText, uniquePublishCopy } from '@/lib/publish-copy'
import { getPinnedSubaccountId } from '@/lib/blotato-accounts'

export const dynamic = 'force-dynamic'
const base = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'
type Row = Record<string, unknown>

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const cid = await requireClienteId()
    const body = await request.json() as { ids?: string[]; dry_run?: boolean }
    if (!Array.isArray(body.ids) || !body.ids.length || body.ids.length > 10) {
      return NextResponse.json({ error: 'Seleziona da 1 a 10 contenuti precisi.' }, { status: 400 })
    }
    const rows = await q(`SELECT * FROM calendario WHERE cliente_id = $1 AND id = ANY($2::uuid[])`, [cid, body.ids]) as Row[]
    if (rows.length !== new Set(body.ids).size) throw new Error('Selezione non valida per questo cliente')
    if (rows.some(row => row.blotato_status !== 'scheduled' || !row.blotato_post_id || !row.platform_account_id)) {
      throw new Error('Correggibili solo invii programmati identificati; pubblicati e bozze restano protetti.')
    }
    const key = await getBlotatoKey(cid)
    if (!key) throw new Error('API key Blotato assente')
    const headers = { 'blotato-api-key': key, Accept: 'application/json' }
    const schedules: Row[] = []
    let cursor = ''
    for (let page = 0; page < 10; page++) {
      const params = new URLSearchParams({ limit: '50', ...(cursor ? { cursor } : {}) })
      const response = await fetch(`${base}/v2/schedules?${params}`, { headers, cache: 'no-store' })
      if (!response.ok) throw new Error(`Lista coda Blotato: ${response.status}`)
      const result = await response.json() as { items?: Row[]; cursor?: string }
      schedules.push(...(result.items || []))
      cursor = result.cursor || ''
      if (!cursor) break
    }
    if (cursor) throw new Error('Coda oltre limite di verifica: nessuna modifica applicata.')
    const plans = await Promise.all(rows.map(async row => {
      const hook = String(row.hook || '').trim()
      const pageId = row.canale === 'facebook' ? await getPinnedSubaccountId(cid, 'facebook') : null
      if (row.canale === 'facebook' && !pageId) throw new Error('Pagina Facebook non identificata: correzione bloccata.')
      const media = new Set(Array.from({ length: 10 }, (_, i) => row[`link_media_${i + 1}`]).concat([row.blotato_visual_media_url, row.blotato_audio_visual_media_url]).filter(Boolean).map(String))
      const matches = schedules.filter(schedule => {
        const draft = schedule.draft as Row | undefined
        const content = draft?.content as Row | undefined
        if (!draft || !content) return false
        return hook && String(draft?.accountId || '') === String(row.platform_account_id)
          && content?.platform === row.canale && String(content.text || '').startsWith(hook)
          && (!pageId || String((draft?.target as Row)?.pageId || '') === pageId)
          && Array.isArray(content.mediaUrls) && content.mediaUrls.some(url => media.has(String(url)))
      })
      if (matches.length !== 1) throw new Error(`${row.id_contenuto}: associazione coda non univoca (${matches.length}); nessun reinvio.`)
      const schedule = matches[0]
      const draft = schedule.draft as Row
      const content = draft.content as Row
      const before = String(content.text || '')
      const after = repairQueuedText(before, hook, String(row.cta || ''))
      return { row, schedule, draft, content, before, after }
    }))
    const results = []
    for (const plan of plans) {
      let applied = false
      if (body.dry_run === false && plan.before !== plan.after) {
        // Rileggere subito prima della modifica: un post già uscito non si tocca.
        const response = await fetch(`${base}/v2/schedules/${encodeURIComponent(String(plan.schedule.id))}`, { headers, cache: 'no-store' })
        if (!response.ok) throw new Error(`${plan.row.id_contenuto}: post non più in coda (${response.status})`)
        const current = await response.json() as { schedule?: Row }
        if (JSON.stringify(current.schedule?.draft) !== JSON.stringify(plan.draft)
          || current.schedule?.scheduledAt !== plan.schedule.scheduledAt) throw new Error('Il testo o l’orario remoto è cambiato: ripetere la simulazione.')
        const update = await fetch(`${base}/v2/schedules/${encodeURIComponent(String(plan.schedule.id))}`, {
          method: 'PATCH', headers: { ...headers, 'Content-Type': 'application/json' },
          body: JSON.stringify({ patch: { draft: { ...plan.draft, content: { ...plan.content, text: plan.after } } } }),
        })
        if (!update.ok) throw new Error(`Correzione Blotato ${update.status}; non è stato creato un nuovo post.`)
        const verify = await fetch(`${base}/v2/schedules/${encodeURIComponent(String(plan.schedule.id))}`, { headers, cache: 'no-store' })
        const saved = verify.ok ? await verify.json() as { schedule?: Row } : null
        const savedDraft = saved?.schedule?.draft as Row | undefined
        if (!savedDraft || (savedDraft.content as Row)?.text !== plan.after || saved?.schedule?.scheduledAt !== plan.schedule.scheduledAt) throw new Error('Aggiornamento remoto da verificare: non ripetere l’invio.')
        applied = true
      }
      if (body.dry_run === false) {
        const copy = uniquePublishCopy(String(plan.row.hook || ''), String(plan.row.caption || ''), String(plan.row.cta || ''))
        await q(`UPDATE calendario SET caption = $1, cta = $2, updated_at = now()
          WHERE id = $3 AND cliente_id = $4 AND blotato_post_id = $5 AND blotato_status = 'scheduled'`,
        [copy.caption, copy.cta, plan.row.id, cid, plan.row.blotato_post_id])
      }
      results.push({ id: plan.row.id, id_contenuto: plan.row.id_contenuto, before: plan.before, after: plan.after, changed: plan.before !== plan.after, applied })
    }
    return NextResponse.json({ ok: true, dry_run: body.dry_run !== false, results })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 400 })
  }
}
