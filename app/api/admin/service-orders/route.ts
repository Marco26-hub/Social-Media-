import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { getPublicBaseUrl } from '@/lib/base-url'
import { dbReady, q, q1 } from '@/lib/db'
import { createStripePortalSession, stripeConfigured } from '@/lib/stripe'
import { ensureStandaloneServiceOrdersSchema } from '@/lib/standalone-service-schema'

export const dynamic = 'force-dynamic'

function missingSchema(error: unknown): boolean {
  return (error as { code?: string })?.code === '42P01'
}

export async function GET() {
  try {
    await requireAdmin()
    if (!dbReady()) return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    await ensureStandaloneServiceOrdersSchema()
    try {
      const orders = await q(
        `SELECT id, service_slug, service_name, billing_mode, amount_cents, currency,
                status, nome, azienda, email, telefono, stripe_customer_id,
                stripe_subscription_id, current_period_end, cancel_at_period_end,
                last_invoice_url, last_invoice_pdf, paid_at, created_at
           FROM standalone_service_orders
          ORDER BY created_at DESC
          LIMIT 500`,
      )
      // Gli incassi che aspettano la fattura fiscale. Sono una tabella a parte
      // perché su un abbonamento ogni rinnovo è un incasso nuovo: sull'ordine
      // resterebbe solo l'ultimo, e i mesi precedenti sparirebbero.
      const fatture = await q(
        `SELECT f.id, f.order_id, f.stripe_ref, f.kind, f.amount_cents, f.currency,
                f.paid_at, f.period_start, f.period_end, f.hosted_invoice_url, f.invoice_pdf,
                o.service_name, o.nome, o.azienda, o.email, o.customer_type
           FROM standalone_service_invoices f
           JOIN standalone_service_orders o ON o.id = f.order_id
          WHERE f.issued_at IS NULL
          ORDER BY f.paid_at ASC
          LIMIT 200`,
      )
      return NextResponse.json({ needs_migration: false, stripe_configured: stripeConfigured(), orders, fatture })
    } catch (error) {
      if (missingSchema(error)) return NextResponse.json({ needs_migration: true, stripe_configured: stripeConfigured(), orders: [] })
      throw error
    }
  } catch (error) {
    return apiError(error)
  }
}

export async function POST(request: Request) {
  try {
    await requireAdmin()
    if (!dbReady()) return NextResponse.json({ error: 'Database non disponibile' }, { status: 503 })
    await ensureStandaloneServiceOrdersSchema()
    const body = await request.json() as { order_id?: string; invoice_id?: string; issued?: boolean; note?: string }

    // Segnare una fattura come emessa non passa da Stripe: è un promemoria
    // interno, e deve funzionare anche quando le chiavi non ci sono.
    if (body.invoice_id) {
      const emessa = body.issued !== false
      const riga = await q1(
        `UPDATE standalone_service_invoices
            SET issued_at = CASE WHEN $2 THEN COALESCE(issued_at, now()) ELSE NULL END,
                issued_note = CASE WHEN $2 THEN $3 ELSE NULL END
          WHERE id = $1
          RETURNING id, issued_at`,
        [String(body.invoice_id), emessa, typeof body.note === 'string' ? body.note.trim().slice(0, 200) || null : null],
      )
      if (!riga) return NextResponse.json({ error: 'Incasso non trovato' }, { status: 404 })
      return NextResponse.json({ id: String(riga.id), issued_at: riga.issued_at })
    }

    if (!stripeConfigured()) return NextResponse.json({ error: 'Stripe non disponibile' }, { status: 503 })
    const order = await q1(
      'SELECT stripe_customer_id FROM standalone_service_orders WHERE id = $1 LIMIT 1',
      [String(body.order_id || '')],
    )
    const customerId = typeof order?.stripe_customer_id === 'string' ? order.stripe_customer_id : ''
    if (!customerId) return NextResponse.json({ error: 'Ordine senza cliente Stripe collegato' }, { status: 400 })
    const baseUrl = getPublicBaseUrl(request).replace(/\/$/, '')
    const session = await createStripePortalSession({ stripeCustomerId: customerId, returnUrl: `${baseUrl}/dashboard/clienti?tab=pagamenti` })
    return NextResponse.json({ url: session.url })
  } catch (error) {
    return apiError(error)
  }
}
