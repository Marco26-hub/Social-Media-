// Webhook per ricevere callback da Blotato su stato pubblicazione
// Blotato chiama questo endpoint quando un post viene pubblicato/fallisce

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { isDemo } from '@/lib/demo'
import { applyBlotatoCallback } from '@/lib/blotato-webhook'
import { CalendarScheduleError } from '@/lib/calendar-slot'

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

    return NextResponse.json(await applyBlotatoCallback(body))
  } catch (e) {
    if (e instanceof CalendarScheduleError) return NextResponse.json({ error: e.message }, { status: e.status })
    // Non esporre messaggi DB/stack al chiamante non autenticato.
    console.error('[Blotato webhook]', e)
    return NextResponse.json({ error: 'Errore interno' }, { status: 500 })
  }
}
