import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { corsiPronti, listOrdiniCorsiAdmin } from '@/lib/corsi-db'
import { dbReady } from '@/lib/db'
import { stripeConfigured, stripeSecretLivemode } from '@/lib/stripe'

export const dynamic = 'force-dynamic'

// Ordini dei corsi per il tab Pagamenti, accanto a pacchetti e servizi.
// Stessa forma della route dei servizi: dice anche se Stripe e configurato e in
// che modalita, perche i link al pannello Stripe cambiano fra test e live.
export async function GET() {
  try {
    await requireAdmin()
    if (!dbReady()) {
      return NextResponse.json({ ordini: [], stripe_configured: false, stripe_mode: 'not_configured' })
    }
    // Le letture dei corsi senza tabelle rispondono «nessun ordine», che qui
    // sarebbe falso: si dice che manca la migrazione.
    if (!(await corsiPronti())) {
      return NextResponse.json({ ordini: [], needs_migration: true })
    }
    const livemode = stripeSecretLivemode()
    return NextResponse.json({
      ordini: await listOrdiniCorsiAdmin(),
      stripe_configured: stripeConfigured(),
      stripe_mode: livemode === true ? 'live' : livemode === false ? 'test' : 'unknown',
    })
  } catch (e) {
    // Migrazione 052 non ancora applicata: il tab Pagamenti deve continuare a
    // funzionare per pacchetti e servizi, non rompersi per un blocco nuovo.
    const code = (e as { code?: string })?.code || ''
    if (code === '42P01' || code === '42703') {
      return NextResponse.json({ ordini: [], needs_migration: true })
    }
    return apiError(e)
  }
}
