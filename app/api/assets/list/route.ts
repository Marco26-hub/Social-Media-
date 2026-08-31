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

const NOME_CARTELLA = /^w(\d+)-(instagram|facebook)-([a-z]+)-(\d+)-([0-9]+|xx)-[0-9a-f]{20}$/

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

    const assets = oggetti.map(o => {
      const filename = o.key.split('/').pop() || ''
      const ext = path.extname(filename).toLowerCase()
      const kind = ESTENSIONI[ext]
      if (!kind) return null

      const base = path.basename(filename, ext)
      const m = base.match(NOME_CARTELLA)
      const tagGrezzo = m?.[3]
      const tag: MediaTag = tagGrezzo && TAG_VALIDI.has(tagGrezzo) ? tagGrezzo as MediaTag : 'auto'

      return {
        url: publicUrlForKey(o.key) || `/api/assets/file/${encodeURIComponent(clienteId)}/${encodeURIComponent(filename)}`,
        name: filename,
        kind,
        tag,
        size: o.size,
        updatedAt: o.updatedAt,
        // Presenti solo per i file arrivati da una cartella campagna.
        week: m ? Number(m[1]) : null,
        platform: m ? m[2] : null,
        contentKey: m ? `${m[3]}_${m[4]}` : null,
        sequence: m ? (m[5] === 'xx' ? null : Number(m[5])) : null,
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
      assets,
    })
  } catch (e) {
    return apiError(e)
  }
}
