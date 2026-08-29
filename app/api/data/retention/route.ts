import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady } from '@/lib/db'
import { isDemo } from '@/lib/demo'
import { requireAdmin } from '@/lib/auth-utils'
import { cronDenied } from '@/lib/cron-auth'
import { eliminaPubblicatiScaduti, mediaRimastiOrfani, RETENTION_GIORNI_DEFAULT } from '@/lib/retention'
import { deleteFromStorage, isStorageConfigured, storageKeyFromUrl } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
// Puo eliminare molte righe e altrettanti oggetti dallo storage.
export const maxDuration = 300

// Pulizia dei contenuti pubblicati e dei loro media.
//
// Accesso: admin autenticato, OPPURE bearer CRON_SECRET come gli altri job
// schedulati (lib/cron-auth.ts), cosi puo essere richiamata da uno scheduler
// esterno senza sessione.
//
// SICUREZZA DEL DATO: `dry_run` e il DEFAULT. Per cancellare davvero serve
// passare esplicitamente `dry_run: false`. Una pulizia che cancella per
// distrazione non e recuperabile.
export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({})) as {
      cliente_id?: string
      giorni?: number
      dry_run?: boolean
      elimina_media?: boolean
    }

    // Cron col segreto, altrimenti sessione admin.
    const conSegreto = request.headers.get('authorization')?.startsWith('Bearer ')
    if (conSegreto) {
      const negato = cronDenied(request)
      if (negato) return negato
    } else {
      await requireAdmin()
    }

    if (isDemo() || !dbReady()) {
      return NextResponse.json({ error: 'Pulizia non disponibile in modalità demo' }, { status: 503 })
    }

    const dryRun = body.dry_run !== false
    const giorni = Number.isFinite(Number(body.giorni)) ? Number(body.giorni) : RETENTION_GIORNI_DEFAULT
    if (giorni < 7) {
      return NextResponse.json(
        { error: 'Il periodo di grazia minimo è 7 giorni: sotto questa soglia si rischia di cancellare contenuti appena pubblicati.' },
        { status: 400 },
      )
    }

    const esito = await eliminaPubblicatiScaduti({
      clienteId: body.cliente_id || null,
      giorni,
      dryRun,
    })

    // I media si toccano solo dopo l'eliminazione delle righe e solo se nessun
    // altro contenuto li usa ancora.
    let mediaEliminati = 0
    let mediaOrfani: string[] = []
    if (!dryRun && body.elimina_media !== false && esito.mediaCandidati.length) {
      mediaOrfani = await mediaRimastiOrfani(esito.mediaCandidati)
      if (isStorageConfigured()) {
        for (const url of mediaOrfani) {
          const key = storageKeyFromUrl(url)
          if (!key) continue
          if (await deleteFromStorage(key)) mediaEliminati++
        }
      }
    }

    return NextResponse.json({
      ok: true,
      dry_run: dryRun,
      giorni,
      contenuti_eliminati: esito.contenutiEliminati,
      impronte_archiviate: esito.impronteArchiviate,
      media_collegati: esito.mediaCandidati.length,
      media_orfani: mediaOrfani.length,
      media_eliminati: mediaEliminati,
      ...(dryRun ? { nota: 'Simulazione: nessun dato è stato toccato. Ripeti con dry_run: false per eseguire.' } : {}),
    })
  } catch (e) {
    return apiError(e)
  }
}
