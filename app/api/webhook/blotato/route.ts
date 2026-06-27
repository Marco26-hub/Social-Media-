// Webhook per ricevere callback da Blotato su stato pubblicazione
// Blotato chiama questo endpoint quando un post viene pubblicato/fallisce

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { q } from '@/lib/db'
import { isDemo } from '@/lib/demo'

const VALID_BLOTATO_STATUSES = new Set(['published', 'failed', 'scheduled'])

function safeEqualString(a: string, b: string) {
  const aBuffer = Buffer.from(a)
  const bBuffer = Buffer.from(b)
  return aBuffer.length === bBuffer.length && crypto.timingSafeEqual(aBuffer, bBuffer)
}

function hasValidWebhookSignature(request: Request, rawBody: string) {
  const secret = process.env.BLOTATO_WEBHOOK_SECRET?.trim()
  // SICUREZZA: senza secret accetta SOLO in demo esplicito, mai in produzione
  // reale. Il vecchio `NODE_ENV !== 'production'` lasciava il webhook aperto.
  if (!secret) return isDemo()

  const authHeader = request.headers.get('authorization') || ''
  if (safeEqualString(authHeader, `Bearer ${secret}`)) return true

  const signature =
    request.headers.get('x-blotato-signature') ||
    request.headers.get('x-webhook-signature') ||
    request.headers.get('x-hub-signature-256')

  if (!signature) return false

  const expected = crypto.createHmac('sha256', secret).update(rawBody).digest('hex')
  const normalized = signature.startsWith('sha256=') ? signature.slice('sha256='.length) : signature
  return safeEqualString(normalized, expected)
}

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    if (!hasValidWebhookSignature(request, rawBody)) {
      return NextResponse.json({ error: 'firma webhook non valida' }, { status: 401 })
    }

    let body: Record<string, unknown>
    try {
      body = JSON.parse(rawBody) as Record<string, unknown>
    } catch {
      return NextResponse.json({ error: 'payload JSON non valido' }, { status: 400 })
    }

    const { id: blotato_post_id, status, platform, post_url, error, scheduled_at } = body as Record<string, unknown>

    if (!blotato_post_id) {
      return NextResponse.json({ error: 'id richiesto' }, { status: 400 })
    }
    if (typeof status !== 'string' || !VALID_BLOTATO_STATUSES.has(status)) {
      return NextResponse.json({ error: 'status non valido' }, { status: 400 })
    }

    // Trova il contenuto nel calendario tramite blotato_post_id
    let rows = await q('SELECT id FROM calendario WHERE blotato_post_id = $1 LIMIT 1', [blotato_post_id])

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
        rows = fallback
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
    // Non esporre messaggi DB/stack al chiamante non autenticato.
    console.error('[Blotato webhook]', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
