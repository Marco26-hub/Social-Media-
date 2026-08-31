import path from 'path'
import { NextResponse } from 'next/server'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { apiError } from '@/lib/api-error'
import { isStorageConfigured, listFromStorage, publicUrlForKey } from '@/lib/storage'
import type { MediaTag } from '@/lib/media-requirements'
import { bytesToMb, storageQuotaMb } from '@/lib/storage-quota'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Media gia caricati per un cliente, ricostruiti dallo storage.
//
// La pagina Piano teneva l'elenco solo nello stato React: bastava cambiare
// schermata per perderlo, e per generare la fase successiva si ricaricava
// l'intera cartella — centinaia di MB duplicati a ogni giro, con nomi nuovi
// perche safeFilename aggiunge un token casuale.
//
// I metadati non sono persi: sono codificati nel nome dei file caricati da
// cartella campagna (vedi folderUploadName in app/dashboard/piano/page.tsx):
//   w{settimana}-{social}-{contenuto}-{sequenza}-{token}.{ext}
// Nota: safeFilename normalizza gli underscore in trattini, quindi
// `reel_01` diventa `reel-01`.

const NOME_CARTELLA = /^(?:(c[0-9a-f]{8})-)?w(\d+)-(instagram|facebook)-([a-z]+)-(\d+)-([0-9]+|xx)-[0-9a-f]{20}$/

const ESTENSIONI: Record<string, 'image' | 'video' | 'audio'> = {
  '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.webp': 'image', '.gif': 'image', '.avif': 'image',
  '.mp4': 'video',
  '.mp3': 'audio', '.wav': 'audio', '.m4a': 'audio', '.ogg': 'audio',
}

const TAG_VALIDI = new Set(['carosello', 'reel', 'story', 'post'])

export async function GET(request: Request) {
  try {
    await requireAuth()
    const { searchParams } = new URL(request.url)
    const clienteId = String(searchParams.get('cliente_id') || '')
    if (!clienteId) return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    await requireClienteAccess(clienteId)

    if (!isStorageConfigured()) {
      return NextResponse.json({ ok: true, assets: [], storage: false, totale: 0, totale_bytes: 0, mb_totali: 0, limite_mb: null })
    }

    const oggetti = await listFromStorage(`uploads/${clienteId}/`)
    const totaleBytes = oggetti.reduce((total, object) => total + (object.size || 0), 0)

    // La barra della capienza somma TUTTI gli oggetti sotto il prefisso, l'elenco
    // qui sotto solo quelli con un'estensione riconosciuta. Senza dichiararlo,
    // un .mov o un .heic occupa spazio senza comparire da nessuna parte e la
    // pagina sembra sbagliare i conti.
    const nonRiconosciuti = oggetti.filter(o => !ESTENSIONI[path.extname(o.key).toLowerCase()])
    const bytesNonRiconosciuti = nonRiconosciuti.reduce((total, object) => total + (object.size || 0), 0)

    const assets = oggetti.map(o => {
      const filename = o.key.split('/').pop() || ''
      const ext = path.extname(filename).toLowerCase()
      const kind = ESTENSIONI[ext]
      if (!kind) return null

      const base = path.basename(filename, ext)
      const m = base.match(NOME_CARTELLA)
      const tagGrezzo = m?.[4]
      const tag: MediaTag = tagGrezzo && TAG_VALIDI.has(tagGrezzo) ? tagGrezzo as MediaTag : 'auto'

      return {
        url: publicUrlForKey(o.key) || `/api/assets/file/${encodeURIComponent(clienteId)}/${encodeURIComponent(filename)}`,
        name: filename,
        kind,
        tag,
        campaignKey: m?.[1] || undefined,
        size: o.size,
        updatedAt: o.updatedAt,
        // Presenti solo per i file arrivati da una cartella campagna.
        week: m ? Number(m[2]) : null,
        platform: m ? m[3] : null,
        contentKey: m ? `${m[4]}_${m[5]}` : null,
        sequence: m ? (m[6] === 'xx' ? null : Number(m[6])) : null,
      }
    }).filter(Boolean)

    // Piu recenti per primi: e quasi sempre l'ultimo caricamento a interessare.
    assets.sort((a, b) => String(b!.updatedAt).localeCompare(String(a!.updatedAt)))

    return NextResponse.json({
      ok: true,
      storage: true,
      totale: assets.length,
      totale_bytes: totaleBytes,
      mb_totali: bytesToMb(totaleBytes),
      limite_mb: storageQuotaMb(),
      // Occupazione non attribuibile a un media dell'elenco.
      altri_file: nonRiconosciuti.length,
      mb_altri: bytesToMb(bytesNonRiconosciuti),
      esempi_altri: nonRiconosciuti.slice(0, 5).map(o => o.key.split('/').pop() || o.key),
      assets,
    })
  } catch (e) {
    return apiError(e)
  }
}
