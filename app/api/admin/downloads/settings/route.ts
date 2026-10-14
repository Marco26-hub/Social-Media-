import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { DEFAULT_PAGE_TEXTS, validatePageSettings } from '@/lib/download-area'
import { EMPTY_PAGE_SETTINGS, getPageSettings, isMissingDownloadSchema, savePageSettings } from '@/lib/download-area-db'
import { requireDownloadAdmin } from '@/lib/download-area-guard'

export const dynamic = 'force-dynamic'

// Testi salvati più testi standard: il pannello mostra questi ultimi come segnaposto,
// così non ne tiene una copia che potrebbe divergere da quella della pagina pubblica.
export async function GET() {
  try {
    await requireDownloadAdmin()
    try {
      const settings = await getPageSettings()
      return NextResponse.json({ settings, defaults: DEFAULT_PAGE_TEXTS, needs_migration: false })
    } catch (e) {
      // Migrazione 053 non ancora applicata: il pannello mostra l'avviso invece di un 500.
      if (isMissingDownloadSchema(e)) {
        return NextResponse.json({ settings: EMPTY_PAGE_SETTINGS, defaults: DEFAULT_PAGE_TEXTS, needs_migration: true })
      }
      throw e
    }
  } catch (e) {
    return apiError(e)
  }
}

// Valida e salva i testi. Il corpo si legge solo dopo il guard: chi non è ammesso deve
// ricevere 403 e non un 400 che rivela com'è fatta la richiesta. Un JSON illeggibile è
// un errore di chi chiama (400 con il nostro messaggio), non un 500.
export async function PUT(request: Request) {
  try {
    await requireDownloadAdmin()

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Richiesta non valida.' }, { status: 400 })
    }

    const parsed = validatePageSettings(body)
    if (!parsed.ok) return NextResponse.json({ error: parsed.error }, { status: 400 })

    try {
      const settings = await savePageSettings(parsed.value)
      return NextResponse.json({ settings })
    } catch (e) {
      // Tabella mancante: non si finge un salvataggio riuscito, i testi non sono stati scritti.
      if (isMissingDownloadSchema(e)) {
        return NextResponse.json({ error: 'Applica la migrazione 053 (npm run migrate) per salvare i testi.' }, { status: 503 })
      }
      throw e
    }
  } catch (e) {
    return apiError(e)
  }
}
