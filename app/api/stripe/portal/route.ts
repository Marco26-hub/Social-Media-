import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { stripeConfigured, createStripePortalSession } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

// Apre lo Stripe Customer Portal per il CLIENTE attivo: da lì gestisce metodo di
// pagamento, fatture, insoluti e disdetta. L'abbonamento è ricorrente mensile
// (creato alla registrazione), quindi non serve un "paga ogni mese" manuale.
export async function POST(request: Request) {
  try {
    const cid = await requireClienteId() // verifica accesso al cliente attivo (no IDOR)

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ error: 'Il portale pagamenti non è disponibile in modalità demo.' }, { status: 400 })
    }
    if (!stripeConfigured()) {
      return NextResponse.json({ error: 'I pagamenti non sono ancora configurati. Riprova più tardi.' }, { status: 400 })
    }

    const rows = await q('SELECT stripe_customer_id FROM clienti WHERE id = $1 LIMIT 1', [cid])
    const customerId = typeof rows[0]?.stripe_customer_id === 'string' ? rows[0].stripe_customer_id : null
    if (!customerId) {
      return NextResponse.json(
        { error: 'Nessun abbonamento collegato. Completa prima la registrazione con pagamento.' },
        { status: 400 },
      )
    }

    const origin = new URL(request.url).origin
    const session = await createStripePortalSession({ stripeCustomerId: customerId, returnUrl: `${origin}/portale` })
    return NextResponse.json({ url: session.url })
  } catch (e) {
    return apiError(e)
  }
}
