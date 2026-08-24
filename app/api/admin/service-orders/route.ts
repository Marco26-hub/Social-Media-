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
      return NextResponse.json({ needs_migration: false, stripe_configured: stripeConfigured(), orders })
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
    if (!dbReady() || !stripeConfigured()) return NextResponse.json({ error: 'Stripe non disponibile' }, { status: 503 })
    await ensureStandaloneServiceOrdersSchema()
    const body = await request.json() as { order_id?: string }
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
