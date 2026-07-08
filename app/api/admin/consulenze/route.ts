import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

function isMissingSchema(error: unknown): boolean {
  const code = (error as { code?: string })?.code || ''
  if (code === '42P01') return true
  const message = error instanceof Error ? error.message : String(error || '')
  return /consulenze/i.test(message) && /does not exist/i.test(message)
}

const DEMO = {
  needs_migration: false,
  consulenze: [
    { id: 'demo-1', nome: 'Mario Rossi', email: 'mario@studio.it', telefono: '+39 340 111 2222', messaggio: 'Adeguamento AI Act', tipo: 'legale-ai', importo_cents: 15000, status: 'paid', paid_at: '2026-07-07T10:12:00Z', created_at: '2026-07-07T09:40:00Z' },
    { id: 'demo-2', nome: 'Laura Bianchi', email: 'laura@azienda.it', telefono: null, messaggio: 'Privacy dati clienti', tipo: 'legale-ai', importo_cents: 15000, status: 'pending', paid_at: null, created_at: '2026-07-08T08:05:00Z' },
  ],
  totals: { paid: 1, pending: 1, incasso_cents: 15000 },
}

// Lista consulenze (admin). Ordine: più recenti prima.
export async function GET() {
  try {
    await requireAdmin()
    if (isDemo() || !dbReady()) return NextResponse.json(DEMO)

    try {
      const rows = await q(
        `SELECT id, nome, email, telefono, messaggio, tipo, importo_cents, currency,
                status, stripe_session_id, stripe_payment_intent_id, paid_at, created_at
         FROM consulenze
         ORDER BY created_at DESC
         LIMIT 500`,
      )
      const list = rows as Array<Record<string, unknown>>
      const paid = list.filter(r => r.status === 'paid')
      const pending = list.filter(r => r.status === 'pending')
      const incasso = paid.reduce((s, r) => s + Number(r.importo_cents || 0), 0)
      return NextResponse.json({
        needs_migration: false,
        consulenze: list,
        totals: { paid: paid.length, pending: pending.length, incasso_cents: incasso },
      })
    } catch (e) {
      if (isMissingSchema(e)) {
        return NextResponse.json({ needs_migration: true, consulenze: [], totals: { paid: 0, pending: 0, incasso_cents: 0 } })
      }
      throw e
    }
  } catch (e) {
    return apiError(e)
  }
}
