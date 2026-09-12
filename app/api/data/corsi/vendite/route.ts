import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { requireAdmin } from '@/lib/auth-utils'
import { listVenditeCorsi } from '@/lib/corsi-db'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    await requireAdmin()
    return NextResponse.json(await listVenditeCorsi())
  } catch (e) {
    return apiError(e)
  }
}
