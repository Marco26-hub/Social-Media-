import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'

export async function POST(request: Request) {
  try {
    await requireAuth()
    void request
    return NextResponse.json(
      { error: 'Endpoint disattivato: il sistema live accetta solo analisi di siti reali con fonte verificabile.' },
      { status: 410 },
    )
  } catch (e) {
    return apiError(e)
  }
}
