import { NextResponse } from 'next/server'
import { getPublicBaseUrl } from '@/lib/base-url'
import { dbReady, q, q1 } from '@/lib/db'
import { standaloneServiceBySlug } from '@/lib/standalone-services'
import { ensureStandaloneServiceOrdersSchema } from '@/lib/standalone-service-schema'
import { createStandaloneServiceCheckoutSession, stripeConfigured } from '@/lib/stripe'
import { sendMetaConversionEvent } from '@/lib/meta-conversions-api'
import { verifyTurnstile } from '@/lib/turnstile'

export const dynamic = 'force-dynamic'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function clean(value: unknown, max = 200): string {
  return typeof value === 'string' ? value.trim().slice(0, max) : ''
}

function publicStatus(status: string): 'pending' | 'confirmed' | 'attention' {
  if (['paid', 'active', 'trialing'].includes(status)) return 'confirmed'
  if (['past_due', 'unpaid', 'canceled', 'checkout_failed'].includes(status)) return 'attention'
  return 'pending'
}

export async function GET(request: Request) {
  if (!dbReady()) return NextResponse.json({ error: 'Servizio ordini non disponibile' }, { status: 503 })
  await ensureStandaloneServiceOrdersSchema()
  const sessionId = new URL(request.url).searchParams.get('session_id')?.trim()
  if (!sessionId) return NextResponse.json({ error: 'Sessione richiesta' }, { status: 400 })

  const order = await q1(
    `SELECT service_name, status
       FROM standalone_service_orders
      WHERE stripe_session_id = $1
      LIMIT 1`,
    [sessionId],
  )
  if (!order) return NextResponse.json({ error: 'Ordine non trovato' }, { status: 404 })

  return NextResponse.json({
    service_name: String(order.service_name),
    status: publicStatus(String(order.status)),
  })
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>
    const service = standaloneServiceBySlug(clean(body.service_slug, 60))
    const nome = clean(body.nome, 120)
    const azienda = clean(body.azienda, 160)
    const email = clean(body.email, 254).toLowerCase()
    const telefono = clean(body.telefono, 60)
    const customerType = clean(body.customer_type, 40)
    const termsAccepted = body.terms_accepted === true
    const earlyPerformanceRequested = body.early_performance_requested === true
    const withdrawalLossAcknowledged = body.withdrawal_loss_acknowledged === true
    const honeypot = clean(body.website, 200)
    const elapsedMs = Number(body.elapsed_ms || 0)
    const turnstileToken = clean(body.turnstile_token, 2048)

    if (honeypot || !Number.isFinite(elapsedMs) || elapsedMs < 1500) {
      return NextResponse.json({ error: 'Richiesta non valida' }, { status: 400 })
    }
    if (!service) return NextResponse.json({ error: 'Servizio non valido' }, { status: 400 })
    if (!nome) return NextResponse.json({ error: 'Nome richiesto' }, { status: 400 })
    if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Email non valida' }, { status: 400 })
    if (!['consumatore', 'impresa_professionista'].includes(customerType)) {
      return NextResponse.json({ error: 'Indica il tipo di cliente' }, { status: 400 })
    }
    if (customerType === 'impresa_professionista' && !azienda) {
      return NextResponse.json({ error: 'Azienda richiesta' }, { status: 400 })
    }
    if (!termsAccepted) return NextResponse.json({ error: 'Devi accettare Termini e Condizioni' }, { status: 400 })
    if (customerType === 'consumatore' && (!earlyPerformanceRequested || !withdrawalLossAcknowledged)) {
      return NextResponse.json({ error: 'Per iniziare subito devi confermare le condizioni sul recesso' }, { status: 400 })
    }

    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return NextResponse.json({ error: 'Verifica anti-bot fallita. Riprova.' }, { status: 400 })
    }
    if (!dbReady() || !stripeConfigured()) {
      return NextResponse.json({ error: 'Pagamento temporaneamente non disponibile. Riprova tra poco.' }, { status: 503 })
    }
    await ensureStandaloneServiceOrdersSchema()

    const inserted = await q1(
      `INSERT INTO standalone_service_orders (
         service_slug, service_name, billing_mode, amount_cents, nome, azienda,
         email, telefono, customer_type, terms_accepted_at,
         early_performance_requested, withdrawal_loss_acknowledged
       ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now(),$10,$11)
       RETURNING id`,
      [service.slug, service.name, service.billingMode, service.amountCents, nome, azienda || null,
        email, telefono || null, customerType,
        customerType === 'consumatore' && earlyPerformanceRequested,
        customerType === 'consumatore' && withdrawalLossAcknowledged],
    )
    const orderId = String(inserted?.id || '')
    if (!orderId) throw new Error('Ordine non creato')

    const baseUrl = getPublicBaseUrl(request).replace(/\/$/, '')
    try {
      const session = await createStandaloneServiceCheckoutSession({
        orderId,
        serviceSlug: service.slug,
        serviceName: service.name,
        amountCents: service.amountCents,
        billingMode: service.billingMode,
        customerEmail: email,
        successUrl: `${baseUrl}/acquista/successo?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${baseUrl}/acquista?servizio=${encodeURIComponent(service.slug)}&annullato=1`,
      })
      if (!session.url) throw new Error('Stripe non ha restituito il link di pagamento')
      await q(
        `UPDATE standalone_service_orders
            SET stripe_session_id = $2, status = 'checkout_open', updated_at = now()
          WHERE id = $1`,
        [orderId, session.id],
      )
      await sendMetaConversionEvent({
        eventName: 'InitiateCheckout',
        request,
        eventId: `service-checkout-${orderId}`,
        eventSourceUrl: `${baseUrl}/acquista?servizio=${encodeURIComponent(service.slug)}`,
        email,
        phone: telefono,
        value: service.amountCents / 100,
        currency: 'EUR',
        customData: {
          content_name: service.name,
          content_category: 'standalone_service',
          content_ids: [service.slug],
        },
      })
      return NextResponse.json({ ok: true, checkout_url: session.url })
    } catch (error) {
      await q(
        `UPDATE standalone_service_orders
            SET status = 'checkout_failed', metadata = metadata || $2::jsonb, updated_at = now()
          WHERE id = $1`,
        [orderId, JSON.stringify({ checkout_error: error instanceof Error ? error.message.slice(0, 300) : 'unknown' })],
      )
      throw error
    }
  } catch (error) {
    console.error('[standalone checkout]', error)
    return NextResponse.json(
      { error: error instanceof Error && /column|relation/.test(error.message) ? 'Servizio in aggiornamento. Riprova tra poco.' : 'Non e stato possibile avviare il pagamento.' },
      { status: 500 },
    )
  }
}
