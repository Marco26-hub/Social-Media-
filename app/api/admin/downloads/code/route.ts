import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { generateAccessCode } from '@/lib/download-area'
import { rotateCode } from '@/lib/download-area-db'
import { requireDownloadAdmin } from '@/lib/download-area-guard'

export const dynamic = 'force-dynamic'

// Genera e salva un codice nuovo: il vecchio link smette di funzionare subito.
// Vale anche per il primo codice, perché la migrazione non ne inserisce nessuno.
export async function POST() {
  try {
    await requireDownloadAdmin()
    const code = generateAccessCode()
    await rotateCode(code)
    return NextResponse.json({ code })
  } catch (e) {
    return apiError(e)
  }
}
