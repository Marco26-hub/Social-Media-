import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { getBlotatoKey } from '@/lib/blotato-key'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { remoteCalendarTime } from '@/lib/calendar-display'
import { matchesPublishedProof } from '@/lib/blotato-published-match'

export const dynamic = 'force-dynamic'

const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'
const REMOTE_STATUSES = new Set(['published', 'failed', 'scheduled', 'in-progress'])

type CalendarRow = Record<string, unknown>

function currentMonth(timezone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: timezone,
    year: 'numeric',
    month: '2-digit',
  }).format(new Date())
}

function monthRange(month: string): { start: string; end: string } {
  const match = month.match(/^(\d{4})-(\d{2})$/)
  if (!match) throw new Error('Mese non valido: usa YYYY-MM')
  const year = Number(match[1])
  const monthIndex = Number(match[2]) - 1
  if (monthIndex < 0 || monthIndex > 11) throw new Error('Mese non valido')
  const next = new Date(Date.UTC(year, monthIndex + 1, 1))
  return {
    start: `${match[1]}-${match[2]}-01`,
    end: `${next.getUTCFullYear()}-${String(next.getUTCMonth() + 1).padStart(2, '0')}-01`,
  }
}

function packageSummary(rows: CalendarRow[], included: number) {
  const active = rows.filter(row => !['NON_APPROVATO', 'ARCHIVIATO'].includes(String(row.status || '')))
  // Confermato da Blotato, oppure marcato pubblicato senza essere mai passato da
  // Blotato (pubblicazione manuale). Lo status locale diventa PUBBLICATO gia alla
  // programmazione, quindi da solo gonfierebbe il totale con i post ancora in coda.
  const published = active.filter(row => row.blotato_status === 'published'
    || (row.status === 'PUBBLICATO' && !row.blotato_post_id))
  const queued = active.filter(row => ['scheduled', 'in-progress'].includes(String(row.blotato_status || '')))
  const failed = active.filter(row => row.status === 'ERRORE' || row.blotato_status === 'failed')
  const notSent = active.filter(row => !row.blotato_post_id && !['PUBBLICATO', 'ERRORE'].includes(String(row.status || '')))
  return {
    included,
    planned: active.length,
    published: published.length,
    queued: queued.length,
    failed: failed.length,
    not_sent: notSent.length,
    missing_to_create: Math.max(0, included - active.length),
    missing_to_publish: Math.max(0, included - published.length),
    extra_planned: Math.max(0, active.length - included),
  }
}

export async function POST(request: Request) {
  try {
    const cid = await requireClienteId()
    const body = await request.json().catch(() => ({})) as { month?: string }

    if (isDemo() || !dbReady()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        month: body.month || currentMonth('Europe/Rome'),
        reconciled: 0,
        remote_errors: [],
        summary: { included: 24, planned: 18, published: 8, queued: 4, failed: 2, not_sent: 4, missing_to_create: 6, missing_to_publish: 16, extra_planned: 0 },
      })
    }

    const clientRows = await q('SELECT contenuti_mese, timezone FROM clienti WHERE id = $1 LIMIT 1', [cid]) as CalendarRow[]
    if (!clientRows.length) return NextResponse.json({ error: 'Cliente non trovato' }, { status: 404 })
    const timezone = String(clientRows[0].timezone || 'Europe/Rome')
    const month = body.month && /^\d{4}-\d{2}$/.test(body.month) ? body.month : currentMonth(timezone)
    const { start, end } = monthRange(month)
    const included = Math.max(0, Number(clientRows[0].contenuti_mese) || 0)

    const rows = await q(
      `SELECT * FROM calendario
       WHERE cliente_id = $1
         AND data_pubblicazione >= $2::date
         AND data_pubblicazione < $3::date
         AND canale <> 'blog'
       ORDER BY data_pubblicazione, ora_pubblicazione`,
      [cid, start, end],
    ) as CalendarRow[]

    const remoteRows = rows.filter(row => Boolean(row.blotato_post_id))
    const key = remoteRows.length ? await getBlotatoKey(cid) : null
    if (remoteRows.length && !key) {
      return NextResponse.json({ error: 'API key Blotato non configurata: impossibile verificare cosa e stato pubblicato davvero.' }, { status: 400 })
    }

    let reconciled = 0
    const remoteErrors: Array<{ id_contenuto: string; error: string }> = []

    // Al massimo 5 prove alternative (ricerca + dettaglio) oltre 50 lookup:
    // non superare il limite di 60 richieste/minuto del provider.
    let proofLookups = 0
    await Promise.all(remoteRows.slice(0, 50).map(async row => {
      const submissionId = String(row.blotato_post_id)
      try {
        const response = await fetch(`${BLOTATO_API_BASE}/v2/posts/${encodeURIComponent(submissionId)}`, {
          headers: { Authorization: `Bearer ${key}`, 'blotato-api-key': String(key), Accept: 'application/json' },
          cache: 'no-store',
        })
        if (!response.ok) {
          const detail = await response.text().catch(() => '')
          throw new Error(`Blotato ${response.status}: ${detail.slice(0, 160)}`)
        }
        const remote = await response.json() as Record<string, unknown>
        let status = String(remote.status || '').toLowerCase()
        if (!REMOTE_STATUSES.has(status)) throw new Error(`stato Blotato non riconosciuto: ${status || 'vuoto'}`)
        let publicUrl = String(remote.publicUrl || remote.public_url || '').trim() || null
        let confirmedPublishedTime: ReturnType<typeof remoteCalendarTime> = null
        const errorMessage = String(remote.errorMessage || remote.error || '').trim().slice(0, 500)

        // Una submission vecchia non può riportare in coda un post la cui
        // pubblicazione è già stata verificata. Non perdere la prova terminale.
        if (row.blotato_status === 'published' && status !== 'published') {
          throw new Error(`Submission remota ${status}, pubblicazione già confermata: stato e data conservati`)
        }

        // La data restituita da Blotato è la fonte di verità per un invio già
        // programmato. Non reinviare, azzerare ID o inferire "pubblicato" dal tempo.
        const scheduled = status === 'scheduled' ? remoteCalendarTime(remote.scheduledTime, timezone) : null
        if (status === 'scheduled' && !scheduled) throw new Error('Blotato scheduled senza scheduledTime valida: riallineamento rifiutato')

        // Dopo una rischedulazione la submission può restare ferma, mentre il
        // calendario remoto mostra già il post pubblicato. Non marcarlo per
        // supposizione: cercare e verificare il payload originale, oppure
        // conservare lo stato e segnalare che la conferma manca.
        // Instagram ha un account univoco; Facebook può condividere lo stesso
        // account tra più pagine: senza prova della pagina non usare il fallback.
        if (['scheduled', 'in-progress'].includes(status) && row.canale === 'instagram' && row.hook && row.platform_account_id && proofLookups < 5) {
          proofLookups++
          const params = new URLSearchParams({ query: String(row.hook), platform: String(row.canale), limit: '20' })
          const foundResponse = await fetch(`${BLOTATO_API_BASE}/v2/published-posts?${params}`, {
            headers: { 'blotato-api-key': String(key), Accept: 'application/json' }, cache: 'no-store',
          })
          if (!foundResponse.ok) throw new Error(`Ricerca pubblicazione Blotato ${foundResponse.status}: nessuna modifica dello stato`)
          const found = await foundResponse.json() as { items?: CalendarRow[]; count?: number }
          // Non scegliere il primo di più risultati e non cercare per sola somiglianza.
          const candidates = (found.items || []).filter(item => String(item.createdAt || '') >= start && String(item.createdAt || '') < end
            && item.platform === row.canale && String(item.content || '').replace(/\s+/g, ' ').trim().startsWith(String(row.hook).replace(/\s+/g, ' ').trim()))
          if (Number(found.count) <= 20 && candidates.length === 1) {
            const proofResponse = await fetch(`${BLOTATO_API_BASE}/v2/published-posts/${encodeURIComponent(String(candidates[0].id))}`, {
              headers: { 'blotato-api-key': String(key), Accept: 'application/json' }, cache: 'no-store',
            })
            if (!proofResponse.ok) throw new Error(`Prova pubblicazione Blotato ${proofResponse.status}`)
            const proof = await proofResponse.json() as { publishedPost?: CalendarRow }
            if (proof.publishedPost && matchesPublishedProof(row, proof.publishedPost, start, end)) {
              confirmedPublishedTime = remoteCalendarTime(proof.publishedPost.createdAt, timezone)
              if (confirmedPublishedTime) {
                status = 'published'
                publicUrl = String(proof.publishedPost.postUrl || '').trim() || null
              }
            }
          }
        }

        if (status === 'published') {
          await q(
            `UPDATE calendario SET status = 'PUBBLICATO', blotato_status = 'published',
               blotato_post_url = COALESCE($1, blotato_post_url), errore_tecnico = NULL,
               publish_lock_id = NULL, blotato_sync_at = now(), updated_at = now()
             WHERE id = $2 AND cliente_id = $3 AND blotato_post_id = $4`,
            [publicUrl, row.id, cid, submissionId],
          )
          if (confirmedPublishedTime) {
            await q(`UPDATE calendario SET data_pubblicazione = $1::date, ora_pubblicazione = $2::time,
              blotato_scheduled_at = $3, updated_at = now() WHERE id = $4 AND cliente_id = $5 AND blotato_post_id = $6`,
            [confirmedPublishedTime.day, confirmedPublishedTime.time, confirmedPublishedTime.iso, row.id, cid, submissionId])
          }
        } else if (status === 'failed') {
          await q(
            `UPDATE calendario SET status = 'ERRORE', blotato_status = 'failed',
               errore_tecnico = $1, publish_lock_id = NULL,
               blotato_sync_at = now(), updated_at = now()
             WHERE id = $2 AND cliente_id = $3 AND blotato_post_id = $4`,
            [`Blotato: ${errorMessage || 'pubblicazione fallita'}`, row.id, cid, submissionId],
          )
        } else {
          await q(
            `UPDATE calendario SET status = 'PUBBLICATO', blotato_status = $1,
               errore_tecnico = NULL, blotato_sync_at = now(), updated_at = now()
             WHERE id = $2 AND cliente_id = $3 AND blotato_post_id = $4`,
            [status, row.id, cid, submissionId],
          )
          if (scheduled) {
            await q(`UPDATE calendario SET data_pubblicazione = $1::date, ora_pubblicazione = $2::time,
              blotato_scheduled_at = $3, updated_at = now()
              WHERE id = $4 AND cliente_id = $5 AND blotato_post_id = $6 AND blotato_status = 'scheduled'`,
            [scheduled.day, scheduled.time, scheduled.iso, row.id, cid, submissionId])
          }
        }
        reconciled++
      } catch (error) {
        remoteErrors.push({
          id_contenuto: String(row.id_contenuto || row.id || submissionId),
          error: (error as Error).message.slice(0, 220),
        })
      }
    }))

    const refreshed = await q(
      `SELECT * FROM calendario
       WHERE cliente_id = $1
         AND data_pubblicazione >= $2::date
         AND data_pubblicazione < $3::date
         AND canale <> 'blog'`,
      [cid, start, end],
    ) as CalendarRow[]

    return NextResponse.json({
      ok: remoteErrors.length === 0,
      month,
      reconciled,
      checked: Math.min(remoteRows.length, 50),
      unchecked: Math.max(0, remoteRows.length - 50),
      remote_errors: remoteErrors,
      summary: packageSummary(refreshed, included),
    })
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message || 'Riconciliazione Blotato fallita' }, { status: 500 })
  }
}
