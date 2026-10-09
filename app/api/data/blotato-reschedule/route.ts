import { NextResponse } from 'next/server'
import { requireAdmin, requireClienteId } from '@/lib/auth-utils'
import { changeCalendarTime, type TimeEdit } from '@/lib/blotato-reschedule'
import { CalendarScheduleError } from '@/lib/calendar-slot'
import { apiError } from '@/lib/api-error'

export const dynamic = 'force-dynamic'
export const maxDuration = 90

export async function POST(request: Request) {
  try {
    await requireAdmin()
    const cid = await requireClienteId()
    const body = await request.json() as TimeEdit & { id?: string }
    if (!body.id) return NextResponse.json({ error: 'Post richiesto.' }, { status: 400 })
    const result = await changeCalendarTime(cid, body.id, body)
    return NextResponse.json(result, { status: result.ok ? 200 : 502, headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    if (error instanceof CalendarScheduleError) return NextResponse.json({ error: error.message }, { status: error.status })
    return apiError(error)
  }
}
