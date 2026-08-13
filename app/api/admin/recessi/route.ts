import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { dbReady, q } from '@/lib/db'
import { isDemo } from '@/lib/demo'

const STATUSES = new Set(['ricevuta', 'in_verifica', 'elaborata', 'non_applicabile'])

function missingSchema(error: unknown): boolean {
  const code = (error as { code?: string })?.code || ''
  return code === '42P01' || (error instanceof Error && /recessi.*does not exist/i.test(error.message))
}

export async function GET() {
  try {
    await requireAdmin()
    if (isDemo() || !dbReady()) {
      return NextResponse.json({ needs_migration: false, recessi: [], totals: { aperte: 0, consumer: 0, email_fallite: 0 } })
    }

    try {
      const rows = await q(
        `SELECT id, reference_code, request_type, customer_type, contract_category,
                execution_status, full_name, email, contract_reference, contract_date,
                declaration_text, timeliness, status, receipt_status, receipt_sent_at,
                payload_hash, submitted_at, admin_note
         FROM recessi
         ORDER BY submitted_at DESC
         LIMIT 250`,
      )
      return NextResponse.json({
        needs_migration: false,
        recessi: rows,
        totals: {
          aperte: rows.filter(row => row.status === 'ricevuta' || row.status === 'in_verifica').length,
          consumer: rows.filter(row => row.request_type === 'recesso_consumatore').length,
          email_fallite: rows.filter(row => row.receipt_status === 'failed' || row.receipt_status === 'skipped').length,
        },
      })
    } catch (error) {
      if (missingSchema(error)) {
        return NextResponse.json({ needs_migration: true, recessi: [], totals: { aperte: 0, consumer: 0, email_fallite: 0 } })
      }
      throw error
    }
  } catch (error) {
    return apiError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    await requireAdmin()
    const body = await request.json() as { id?: string; status?: string; admin_note?: string }
    const id = String(body.id || '').trim()
    const status = String(body.status || '').trim()
    const adminNote = String(body.admin_note || '').trim().slice(0, 2000)
    if (!id) return NextResponse.json({ error: 'ID pratica richiesto.' }, { status: 400 })
    if (!STATUSES.has(status)) return NextResponse.json({ error: 'Stato pratica non valido.' }, { status: 400 })
    if (isDemo() || !dbReady()) return NextResponse.json({ ok: true, demo: true })

    const rows = await q(
      `UPDATE recessi
       SET status = $2, admin_note = NULLIF($3, ''), updated_at = now()
       WHERE id = $1
       RETURNING id, status`,
      [id, status, adminNote],
    )
    if (!rows.length) return NextResponse.json({ error: 'Pratica non trovata.' }, { status: 404 })
    return NextResponse.json({ ok: true, ...rows[0] })
  } catch (error) {
    return apiError(error)
  }
}
