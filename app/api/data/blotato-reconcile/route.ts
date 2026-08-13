import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { getBlotatoKey } from '@/lib/blotato-key'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'

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
  const published = active.filter(row => row.status === 'PUBBLICATO' || row.blotato_status === 'published')
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

    // Il pacchetto piu grande contiene 24 contenuti: il batch resta sotto il
    // limite ufficiale Blotato di 60 lookup/minuto.
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
        const status = String(remote.status || '').toLowerCase()
        if (!REMOTE_STATUSES.has(status)) throw new Error(`stato Blotato non riconosciuto: ${status || 'vuoto'}`)
        const publicUrl = String(remote.publicUrl || remote.public_url || '').trim() || null
        const errorMessage = String(remote.errorMessage || remote.error || '').trim().slice(0, 500)

        if (status === 'published') {
          await q(
            `UPDATE calendario SET status = 'PUBBLICATO', blotato_status = 'published',
               blotato_post_url = COALESCE($1, blotato_post_url), errore_tecnico = NULL,
               publish_lock_id = NULL, blotato_sync_at = now(), updated_at = now()
             WHERE id = $2 AND cliente_id = $3`,
            [publicUrl, row.id, cid],
          )
        } else if (status === 'failed') {
          await q(
            `UPDATE calendario SET status = 'ERRORE', blotato_status = 'failed',
               errore_tecnico = $1, publish_lock_id = NULL,
               blotato_sync_at = now(), updated_at = now()
             WHERE id = $2 AND cliente_id = $3`,
            [`Blotato: ${errorMessage || 'pubblicazione fallita'}`, row.id, cid],
          )
        } else {
          await q(
            `UPDATE calendario SET status = 'IN_PUBBLICAZIONE', blotato_status = $1,
               errore_tecnico = NULL, blotato_sync_at = now(), updated_at = now()
             WHERE id = $2 AND cliente_id = $3`,
            [status, row.id, cid],
          )
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
