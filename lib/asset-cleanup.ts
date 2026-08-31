import { q } from '@/lib/db'
import { getTableColumns } from '@/lib/db-schema'
import { deleteFromStorage, listFromStorage, publicUrlForKey } from '@/lib/storage'

// Pulizia dei media caricati e mai usati.
//
// Ogni ricaricamento della stessa cartella crea file NUOVI: safeFilename
// aggiunge un token casuale, quindi nulla viene sovrascritto. Sul cliente reale
// questo ha prodotto tre copie quasi identiche della stessa campagna, 689 file e
// oltre 1 GB su un piano che ne include 1.
//
// Cancellare via SQL non e possibile: Supabase lo vieta esplicitamente
// ("Direct deletion from storage tables is not allowed. Use the Storage API
// instead."). Serve quindi passare dall'API, che il server puo fare perche ha le
// credenziali; il dashboard resta l'alternativa manuale.

// Due file caricati a piu di mezz'ora di distanza appartengono a due
// caricamenti diversi. Serve a isolare l'ultimo, che va sempre tenuto.
const SEPARAZIONE_CARICAMENTI_MS = 30 * 60 * 1000

export type EsitoPulizia = {
  totali: number
  usati: number
  ultimoCaricamento: number
  orfani: number
  eliminati: number
  bytesLiberati: number
  dryRun: boolean
}

/**
 * Elimina i media del cliente che nessun contenuto referenzia. Normalmente
 * protegge anche l'ultimo caricamento; durante la sostituzione di una campagna
 * può invece proteggere esplicitamente i nuovi URL e ripulire tutti i vecchi.
 * `dryRun` (default) calcola senza cancellare.
 */
export async function pulisciMediaOrfani(opts: {
  clienteId: string
  dryRun?: boolean
  preservaUltimoCaricamento?: boolean
  proteggiUrl?: string[]
}): Promise<EsitoPulizia> {
  const dryRun = opts.dryRun !== false
  const preservaUltimoCaricamento = opts.preservaUltimoCaricamento !== false
  const oggetti = await listFromStorage(`uploads/${opts.clienteId}/`)
  if (!oggetti.length) {
    return { totali: 0, usati: 0, ultimoCaricamento: 0, orfani: 0, eliminati: 0, bytesLiberati: 0, dryRun }
  }

  // --- media ancora referenziati da un contenuto -------------------------------
  const colonne = await getTableColumns('calendario')
  const colonneMedia = [
    ...Array.from({ length: 10 }, (_, i) => `link_media_${i + 1}`),
    'reel_audio_url',
    'blotato_visual_media_url',
    'blotato_audio_visual_media_url',
  ].filter(c => colonne.has(c))

  const usati = new Set<string>((opts.proteggiUrl || []).map(url => String(url).trim()).filter(Boolean))
  if (colonneMedia.length) {
    const righe = await q(
      `SELECT ${colonneMedia.join(', ')} FROM calendario WHERE cliente_id = $1`,
      [opts.clienteId],
    ) as Record<string, unknown>[]
    for (const riga of righe) {
      for (const col of colonneMedia) {
        const url = riga[col]
        if (typeof url === 'string' && url.trim()) usati.add(url.trim())
      }
    }
  }

  const referenziato = (key: string) => {
    const filename = key.split('/').pop() || ''
    if (!filename) return false
    if (usati.has(publicUrlForKey(key) || '')) return true
    // Confronto anche sul solo nome file: l'URL salvato puo essere la forma
    // pubblica diretta oppure quella del proxy same-origin.
    for (const url of usati) if (url.includes(filename)) return true
    return false
  }

  // --- l'ultimo caricamento non si tocca mai ----------------------------------
  const ordinati = [...oggetti].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
  const chiaviUltimo = new Set<string>()
  let precedente = 0
  if (preservaUltimoCaricamento) {
    for (const o of ordinati) {
      const t = new Date(o.updatedAt).getTime()
      if (!Number.isFinite(t)) continue
      if (chiaviUltimo.size && precedente - t > SEPARAZIONE_CARICAMENTI_MS) break
      chiaviUltimo.add(o.key)
      precedente = t
    }
  }

  const orfani = oggetti.filter(o => !chiaviUltimo.has(o.key) && !referenziato(o.key))
  const bytes = orfani.reduce((somma, o) => somma + (o.size || 0), 0)

  const esito: EsitoPulizia = {
    totali: oggetti.length,
    usati: oggetti.filter(o => referenziato(o.key)).length,
    ultimoCaricamento: chiaviUltimo.size,
    orfani: orfani.length,
    eliminati: 0,
    bytesLiberati: bytes,
    dryRun,
  }
  if (dryRun) return esito

  for (const o of orfani) {
    if (await deleteFromStorage(o.key)) esito.eliminati++
  }
  return esito
}
