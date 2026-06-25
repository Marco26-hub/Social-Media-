// Webhook per ricevere callback da Blotato su stato pubblicazione
// Blotato chiama questo endpoint quando un post viene pubblicato/fallisce

import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { id: blotato_post_id, status, platform, post_url, error, scheduled_at } = body as Record<string, unknown>

    if (!blotato_post_id) {
      return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    }

    const { q } = await import('@/lib/db')

    // Trova il contenuto nel calendario tramite blotato_post_id
    const rows = await q('SELECT id FROM calendario WHERE blotato_post_id = $1 LIMIT 1', [blotato_post_id])

    if (!rows.length) {
      // Cerca per scheduled_at come fallback
      const scheduledStr = scheduled_at ? String(scheduled_at).split('.')[0].replace('T', ' ') : ''
      if (scheduledStr) {
        const fallback = await q(
          'SELECT id FROM calendario WHERE blotato_scheduled_at::date = $1::date AND canale = $2 ORDER BY created_at DESC LIMIT 1',
          [scheduledStr, platform || ''],
        )
        if (!fallback.length) {
          return NextResponse.json({ error: 'Contenuto non trovato' }, { status: 404 })
        }
      } else {
        return NextResponse.json({ error: 'Contenuto non trovato' }, { status: 404 })
      }
    }

    const calendarioId = rows[0] ? (rows[0] as Record<string, string>).id : null
    if (!calendarioId) return NextResponse.json({ error: 'Non trovato' }, { status: 404 })

    const now = new Date().toISOString()

    if (status === 'published') {
      await q(
        `UPDATE calendario SET status = 'PUBBLICATO', blotato_status = 'published',
         blotato_post_url = $1, blotato_sync_at = $2, updated_at = $2
         WHERE id = $3`,
        [post_url || null, now, calendarioId],
      )
      await q(
        `INSERT INTO log_pubblicazioni (cliente_id, id_contenuto, canale, formato, status_precedente, status_finale, blotato_post_id, messaggio)
         SELECT cliente_id, id_contenuto, canale, formato, 'APPROVATO', 'PUBBLICATO', $1, 'Pubblicato via Blotato'
         FROM calendario WHERE id = $2`,
        [blotato_post_id, calendarioId],
      )
    } else if (status === 'failed') {
      await q(
        `UPDATE calendario SET status = 'ERRORE', blotato_status = 'failed',
         errore_tecnico = $1, blotato_sync_at = $2, updated_at = $2
         WHERE id = $3`,
        [error ? `Blotato: ${String(error).slice(0, 500)}` : 'Errore Blotato', now, calendarioId],
      )
    } else if (status === 'scheduled') {
      await q(
        `UPDATE calendario SET blotato_status = 'scheduled', blotato_sync_at = $2
         WHERE id = $1`,
        [calendarioId, now],
      )
    }

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[Blotato webhook]', e)
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
