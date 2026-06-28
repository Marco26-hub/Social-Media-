import { NextResponse } from 'next/server'
import { executeProspectScraper } from '@/lib/agents/prospect-scraper-agent'
import { requireAuth, requireClienteId } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'

export async function POST(request: Request) {
  try {
    await requireAuth()
    // Il cliente viene dal cookie/sessione, MAI dal body (no IDOR).
    const clienteId = await requireClienteId()

    const body = await request.json().catch(() => ({})) as { parameters?: unknown }
    const parameters = body.parameters
    if (!parameters || typeof parameters !== 'object') {
      return NextResponse.json({ error: 'parameters richiesti' }, { status: 400 })
    }

    // Esegue lo scraper (Neon via lib/db). NB: dati attualmente simulati.
    const result = await executeProspectScraper(clienteId, parameters as Parameters<typeof executeProspectScraper>[1])
    return NextResponse.json(result)
  } catch (e) {
    return apiError(e)
  }
}
