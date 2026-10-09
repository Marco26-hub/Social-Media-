import { NextResponse } from 'next/server'
import { requireClienteId } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { isDemo } from '@/lib/demo'
import { reconcileClienteBlotato } from '@/lib/blotato-reconcile'
import { publicationSummary } from '@/lib/blotato-lifecycle'
import { demoContenuti } from '@/lib/demo-data'
import { CalendarScheduleError } from '@/lib/calendar-slot'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

export async function POST(request: Request) {
  try {
    const cid = await requireClienteId()
    const body = await request.json().catch(() => ({})) as { month?: unknown }
    if (body.month !== undefined && (typeof body.month !== 'string' || !/^\d{4}-(0[1-9]|1[0-2])$/.test(body.month))) {
      return NextResponse.json({ error: 'Mese non valido: usa YYYY-MM' }, { status: 400 })
    }
    if (isDemo()) return NextResponse.json({ ok: true, demo: true, month: body.month || new Date().toISOString().slice(0, 7),
      reconciled: 0, checked: 0, unchecked: 0, remote_errors: [], summary: publicationSummary(demoContenuti, 24) })
    return NextResponse.json(await reconcileClienteBlotato(cid, body.month as string | undefined), { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof CalendarScheduleError) return NextResponse.json({ error: error.message }, { status: error.status })
    return apiError(error)
  }
}
