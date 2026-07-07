import { NextResponse } from 'next/server'
import { dbReady, q, q1 } from '@/lib/db'
import { verifyStripeWebhookSignature } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

type StripeObject = Record<string, unknown>
type StripeEvent = {
  type?: string
  data?: { object?: StripeObject }
}

function str(value: unknown): string {
  return typeof value === 'string' ? value : ''
}

function bool(value: unknown): boolean {
  return value === true
}

function int(value: unknown): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

function ts(value: unknown): string | null {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return new Date(n * 1000).toISOString()
}

function metadata(obj: StripeObject): Record<string, unknown> {
  const meta = obj.metadata
  return meta && typeof meta === 'object' ? meta as Record<string, unknown> : {}
}

async function resolveClienteId(obj: StripeObject): Promise<string | null> {
  const meta = metadata(obj)
  const metaCliente = str(meta.cliente_id)
  if (metaCliente) return metaCliente

  const clientReferenceId = str(obj.client_reference_id)
  if (clientReferenceId) return clientReferenceId

  const customerId = str(obj.customer)
  if (customerId) {
    const row = await q1('SELECT id FROM clienti WHERE stripe_customer_id = $1 LIMIT 1', [customerId])
    if (row?.id) return String(row.id)
  }
  return null
}

async function requireStripeClienteId(obj: StripeObject, eventType: string): Promise<string> {
  const clienteId = await resolveClienteId(obj)
  if (!clienteId) {
    const objectId = str(obj.id) || str(obj.customer) || 'unknown'
    throw new Error(`Cliente non risolto per evento Stripe ${eventType} (${objectId})`)
  }
  return clienteId
}

async function handleCheckoutCompleted(obj: StripeObject) {
  const clienteId = await requireStripeClienteId(obj, 'checkout.session.completed')
  const customerId = str(obj.customer)
  const subscriptionId = str(obj.subscription)
  const rows = await q(
    `UPDATE clienti
     SET stripe_customer_id = COALESCE($1, stripe_customer_id),
         stripe_subscription_id = COALESCE($2, stripe_subscription_id),
         updated_at = now()
     WHERE id = $3
     RETURNING id`,
    [customerId || null, subscriptionId || null, clienteId],
  )
  if (!rows.length) throw new Error(`Cliente ${clienteId} non trovato per checkout Stripe`)
}

async function handleSubscription(obj: StripeObject) {
  const clienteId = await requireStripeClienteId(obj, 'customer.subscription')
  const subscriptionId = str(obj.id)
  const customerId = str(obj.customer)
  const meta = metadata(obj)
  const items = obj.items && typeof obj.items === 'object' ? obj.items as { data?: StripeObject[] } : null
  const firstItem = items?.data?.[0]
  const price = firstItem?.price && typeof firstItem.price === 'object' ? firstItem.price as StripeObject : null
  const priceId = str(price?.id)
  const latestInvoice = typeof obj.latest_invoice === 'string'
    ? obj.latest_invoice
    : str((obj.latest_invoice as StripeObject | undefined)?.id)

  await q(
    `INSERT INTO stripe_subscriptions (
       cliente_id, stripe_subscription_id, stripe_customer_id, status, price_id,
       pacchetto_slug, current_period_start, current_period_end, cancel_at_period_end,
       latest_invoice_id, metadata, updated_at
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11::jsonb,now())
     ON CONFLICT (stripe_subscription_id) DO UPDATE SET
       cliente_id = excluded.cliente_id,
       stripe_customer_id = excluded.stripe_customer_id,
       status = excluded.status,
       price_id = excluded.price_id,
       pacchetto_slug = excluded.pacchetto_slug,
       current_period_start = excluded.current_period_start,
       current_period_end = excluded.current_period_end,
       cancel_at_period_end = excluded.cancel_at_period_end,
       latest_invoice_id = excluded.latest_invoice_id,
       metadata = excluded.metadata,
       updated_at = now()`,
    [
      clienteId,
      subscriptionId,
      customerId || null,
      str(obj.status) || 'unknown',
      priceId || null,
      str(meta.pacchetto_slug) || null,
      ts(obj.current_period_start),
      ts(obj.current_period_end),
      bool(obj.cancel_at_period_end),
      latestInvoice || null,
      JSON.stringify(meta),
    ],
  )

  await q(
    `UPDATE clienti
     SET stripe_customer_id = COALESCE($1, stripe_customer_id),
         stripe_subscription_id = COALESCE($2, stripe_subscription_id),
         updated_at = now()
     WHERE id = $3`,
    [customerId || null, subscriptionId || null, clienteId],
  )
}

async function handleInvoice(obj: StripeObject) {
  const clienteId = await requireStripeClienteId(obj, 'invoice')
  const lines = obj.lines && typeof obj.lines === 'object' ? obj.lines as { data?: StripeObject[] } : null
  const period = lines?.data?.[0]?.period && typeof lines.data[0].period === 'object'
    ? lines.data[0].period as StripeObject
    : {}
  const paymentIntent = typeof obj.payment_intent === 'string'
    ? obj.payment_intent
    : str((obj.payment_intent as StripeObject | undefined)?.id)
  const subscriptionId = typeof obj.subscription === 'string'
    ? obj.subscription
    : str((obj.subscription as StripeObject | undefined)?.id)

  await q(
    `INSERT INTO pagamenti (
       cliente_id, stripe_invoice_id, stripe_payment_intent_id, stripe_customer_id,
       stripe_subscription_id, amount_due, amount_paid, currency, status,
       hosted_invoice_url, invoice_pdf, paid_at, due_at, period_start, period_end,
       raw, updated_at
     )
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16::jsonb,now())
     ON CONFLICT (stripe_invoice_id) DO UPDATE SET
       cliente_id = excluded.cliente_id,
       stripe_payment_intent_id = excluded.stripe_payment_intent_id,
       stripe_customer_id = excluded.stripe_customer_id,
       stripe_subscription_id = excluded.stripe_subscription_id,
       amount_due = excluded.amount_due,
       amount_paid = excluded.amount_paid,
       currency = excluded.currency,
       status = excluded.status,
       hosted_invoice_url = excluded.hosted_invoice_url,
       invoice_pdf = excluded.invoice_pdf,
       paid_at = excluded.paid_at,
       due_at = excluded.due_at,
       period_start = excluded.period_start,
       period_end = excluded.period_end,
       raw = excluded.raw,
       updated_at = now()`,
    [
      clienteId,
      str(obj.id) || null,
      paymentIntent || null,
      str(obj.customer) || null,
      subscriptionId || null,
      int(obj.amount_due),
      int(obj.amount_paid),
      str(obj.currency) || 'eur',
      str(obj.status) || 'unknown',
      str(obj.hosted_invoice_url) || null,
      str(obj.invoice_pdf) || null,
      ts(obj.status_transitions && typeof obj.status_transitions === 'object' ? (obj.status_transitions as StripeObject).paid_at : null),
      ts(obj.due_date),
      ts(period.start),
      ts(period.end),
      JSON.stringify(obj),
    ],
  )
}

export async function POST(request: Request) {
  if (!dbReady()) return NextResponse.json({ error: 'DB non disponibile' }, { status: 503 })

  const rawBody = await request.text()
  try {
    const ok = verifyStripeWebhookSignature(rawBody, request.headers.get('stripe-signature'))
    if (!ok) return NextResponse.json({ error: 'Firma Stripe non valida' }, { status: 400 })
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : 'Webhook Stripe non configurato' }, { status: 503 })
  }

  try {
    const event = JSON.parse(rawBody) as StripeEvent
    const obj = event.data?.object
    if (!obj) return NextResponse.json({ received: true, ignored: true })

    if (event.type === 'checkout.session.completed') await handleCheckoutCompleted(obj)
    else if (event.type === 'customer.subscription.created' || event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') await handleSubscription(obj)
    else if (event.type === 'invoice.payment_succeeded' || event.type === 'invoice.payment_failed' || event.type === 'invoice.finalized' || event.type === 'invoice.paid') await handleInvoice(obj)
    else return NextResponse.json({ received: true, ignored: true, event_type: event.type || 'unknown' })

    return NextResponse.json({ received: true })
  } catch (e) {
    console.error('[stripe webhook]', e)
    const message = e instanceof Error ? e.message : 'Webhook Stripe fallito'
    if (/Cliente non risolto|Cliente .* non trovato/.test(message)) {
      return NextResponse.json({ error: message }, { status: 422 })
    }
    return NextResponse.json({ error: 'Webhook Stripe fallito' }, { status: 500 })
  }
}
