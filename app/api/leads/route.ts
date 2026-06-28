import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { apiError } from '@/lib/api-error'

const DEMO_LEADS = [
  {
    id: 'demo-lead-1', first_name: 'Marco', last_name: 'Ferrari', email: 'marco@demo-store.it',
    phone: '+39 320 000000', company_name: 'Demo Store', title: 'Founder',
    engagement_score: 78, temperature: 'CALDO', source: 'LinkedIn', status: 'PENDING', notes: 'Lead demo',
  },
]

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const temperature = searchParams.get('temperature')

    if (isDemo() || !dbReady()) {
      const rows = temperature && temperature !== 'ALL'
        ? DEMO_LEADS.filter((l) => l.temperature === temperature)
        : DEMO_LEADS
      return NextResponse.json(rows)
    }

    const clienteId = await requireClienteId()
    const params: unknown[] = [clienteId]
    let sql = 'SELECT * FROM scraped_leads WHERE cliente_id = $1'
    if (temperature && temperature !== 'ALL') {
      params.push(temperature)
      sql += ` AND temperature = $${params.length}`
    }
    sql += ' ORDER BY engagement_score DESC NULLS LAST, created_at DESC'

    const rows = await q(sql, params)
    return NextResponse.json(rows)
  } catch (e) {
    return apiError(e)
  }
}

const VALID_STATUS = new Set(['PENDING', 'CONTACTED', 'WON', 'LOST'])

// Aggiorna lo stato follow-up di un lead (PENDING → CONTACTED → WON/LOST).
export async function PATCH(request: Request) {
  try {
    await requireAuth()
    const { id, status } = await request.json() as { id?: string; status?: string }
    if (!id || !status) return NextResponse.json({ error: 'id e status richiesti' }, { status: 400 })
    if (!VALID_STATUS.has(status)) return NextResponse.json({ error: 'status non valido' }, { status: 400 })

    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })

    const clienteId = await requireClienteId()
    // WHERE cliente_id impedisce di modificare lead di altri tenant (no IDOR).
    const rows = await q(
      'UPDATE scraped_leads SET status = $1, updated_at = now() WHERE id = $2 AND cliente_id = $3 RETURNING id',
      [status, id, clienteId],
    )
    if (!rows.length) return NextResponse.json({ error: 'Lead non trovato' }, { status: 404 })
    return NextResponse.json({ ok: true, status })
  } catch (e) {
    return apiError(e)
  }
}
