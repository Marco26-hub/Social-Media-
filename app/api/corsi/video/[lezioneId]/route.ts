import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth-utils'
import { getChiaveVideoAutorizzata } from '@/lib/corsi-db'
import { isStorageConfigured, downloadFromStorage, downloadRangeFromStorage } from '@/lib/storage'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// Video delle lezioni: guardabili SOLO da dentro la piattaforma, da chi ha
// pagato il corso.
//
// Perche non si riusa /api/assets/file/[clienteId]/[filename]: quello e pubblico
// per scelta (Blotato e i link di anteprima devono funzionare senza login) e il
// suo commento dice esplicitamente di non aggiungerci autenticazione. Un corso
// da migliaia di euro ha bisogno del contrario.
//
// Cosa ferma davvero, e cosa no:
//   SI  - il file non ha nessun indirizzo pubblico: sta in un bucket privato e
//         passa solo da qui
//   SI  - l'indirizzo di questa pagina copiato e mandato a un amico non funziona:
//         senza il cookie di sessione di chi ha comprato, risponde 403
//   SI  - il tasto "scarica" del player e il menu col tasto destro (via gli
//         attributi impostati dal player, piu Content-Disposition: inline)
//   SI  - la cache: nessun intermediario puo conservarne una copia
//   NO  - la registrazione dello schermo. Nessuna tecnologia web la impedisce,
//         nemmeno il DRM dei grandi servizi di streaming. Il deterrente vero e
//         la filigrana col nome di chi guarda, applicata dal player: una copia
//         che gira porta scritto addosso chi l'ha fatta uscire.

function nega() {
  // Stessa risposta per "non esiste", "non hai pagato" e "non sei entrato":
  // chi sonda non deve poter dedurre quali lezioni esistono.
  return new NextResponse('Non disponibile', { status: 403 })
}

function intestazioni(contentType: string): Record<string, string> {
  return {
    'Content-Type': contentType || 'video/mp4',
    // Mai in cache: il permesso di vedere puo essere revocato (rimborso,
    // recesso) e una copia in cache sopravviverebbe alla revoca.
    'Cache-Control': 'private, no-store, max-age=0',
    'Content-Disposition': 'inline',
    'X-Content-Type-Options': 'nosniff',
    'Accept-Ranges': 'bytes',
  }
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ lezioneId: string }> },
) {
  const { lezioneId } = await params
  if (!/^[0-9a-fA-F-]{36}$/.test(lezioneId)) return nega()

  if (!isStorageConfigured()) {
    return new NextResponse('Archivio non configurato', { status: 503 })
  }

  const session = await getSession()
  const userId = session?.user?.id ? String(session.user.id) : null

  const video = await getChiaveVideoAutorizzata(lezioneId, userId)
  if (!video) return nega()

  // Range: serve al player per scorrere avanti e indietro senza riscaricare
  // tutto, ed e quello che il browser chiede da solo sui file video.
  const range = request.headers.get('range')
  if (range) {
    const parziale = await downloadRangeFromStorage(video.key, range)
    if (!parziale) return nega()
    return new NextResponse(parziale.status === 416 ? null : new Uint8Array(parziale.bytes), {
      status: parziale.status,
      headers: {
        ...intestazioni(parziale.contentType),
        ...(parziale.contentRange ? { 'Content-Range': parziale.contentRange } : {}),
      },
    })
  }

  const intero = await downloadFromStorage(video.key)
  if (!intero) return nega()

  return new NextResponse(new Uint8Array(intero.bytes), {
    status: 200,
    headers: intestazioni(intero.contentType),
  })
}
