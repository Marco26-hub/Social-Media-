// ─────────────────────────────────────────────────────────────────────────
// SPOSTAMENTO DEL PIANO DI N GIORNI
//
// Serve quando la partenza slitta: la strategia era pronta per lunedi, parte
// giovedi, e le 48 pubblicazioni vanno tutte avanti di tre giorni mantenendo
// distanze, orari e sequenza. A mano significa aprire ogni contenuto.
//
// Due confini non negoziabili:
//  · un contenuto GIA INVIATO a Blotato non si tocca. La data vera vive sul
//    loro server: cambiarla solo qui creerebbe un calendario che mente, con il
//    post che esce quando dice Blotato e non quando dice la nostra riga.
//  · niente finisce nel passato. Uno spostamento all'indietro che scavalca
//    oggi viene rifiutato INTERO, non applicato a meta: mezzo piano spostato e
//    mezzo no e peggio del problema di partenza.
//
// Modulo PURO: nessun DB, nessuna rete. L'orario non si tocca mai — cambia il
// giorno, non la fascia oraria decisa per il canale.
// ─────────────────────────────────────────────────────────────────────────

// Riga del calendario letta cosi come arriva dal DB: campi opzionali perche
// `q()` restituisce Record<string, unknown> e uno schema indietro di una
// migrazione non deve far esplodere il calcolo.
export type ShiftRow = Record<string, unknown>

export type ShiftPlan = {
  // Contenuti da aggiornare, con la loro nuova data.
  spostabili: Array<{ id: string; id_contenuto: string; da: string; a: string }>
  // Esclusi perche gia in mano a Blotato: vanno detti, non nascosti.
  bloccatiBlotato: number
  // Esclusi perche gia pubblicati o archiviati.
  ignorati: number
  primaData: string
  nuovaPrimaData: string
  errore?: string
}

const STATI_FERMI = new Set(['PUBBLICATO', 'ARCHIVIATO'])

function testo(value: unknown): string {
  return typeof value === 'string' ? value.trim() : ''
}

function dataDi(row: ShiftRow): string {
  const raw = row.data_pubblicazione
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  const value = testo(raw)
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : ''
}

export function spostaData(iso: string, giorni: number): string {
  const base = Date.parse(`${iso}T00:00:00Z`)
  if (Number.isNaN(base)) return iso
  return new Date(base + giorni * 86400000).toISOString().slice(0, 10)
}

// `da`: sposta solo i contenuti a partire da questa data (inclusa). Default:
// oggi — il passato e storia, non si riscrive.
export function pianificaSpostamento(
  rows: ShiftRow[],
  giorni: number,
  oggi: string,
  da?: string,
): ShiftPlan {
  const soglia = da && /^\d{4}-\d{2}-\d{2}$/.test(da) ? da : oggi
  const vuoto: ShiftPlan = { spostabili: [], bloccatiBlotato: 0, ignorati: 0, primaData: '', nuovaPrimaData: '' }

  if (!Number.isInteger(giorni) || giorni === 0) {
    return { ...vuoto, errore: 'Indica di quanti giorni spostare il piano (numero intero, positivo o negativo).' }
  }
  if (Math.abs(giorni) > 180) {
    return { ...vuoto, errore: 'Spostamento massimo 180 giorni.' }
  }

  const candidati = rows.filter(row => {
    const data = dataDi(row)
    return Boolean(data) && data >= soglia
  })

  let bloccatiBlotato = 0
  let ignorati = 0
  const spostabili: ShiftPlan['spostabili'] = []

  for (const row of candidati) {
    if (STATI_FERMI.has(testo(row.status).toUpperCase())) { ignorati++; continue }
    if (testo(row.blotato_post_id)) { bloccatiBlotato++; continue }
    const da2 = dataDi(row)
    spostabili.push({
      id: String(row.id),
      id_contenuto: testo(row.id_contenuto),
      da: da2,
      a: spostaData(da2, giorni),
    })
  }

  if (!spostabili.length) {
    return { ...vuoto, bloccatiBlotato, ignorati, errore: 'Nessun contenuto da spostare: sono tutti pubblicati o gia inviati a Blotato.' }
  }

  const date = spostabili.map(s => s.a).sort()
  const primaData = spostabili.map(s => s.da).sort()[0]
  const nuovaPrimaData = date[0]

  // Un piano che parte ieri non e un piano: rifiuto l'intera operazione invece
  // di spostarne una parte.
  if (nuovaPrimaData < oggi) {
    return {
      ...vuoto,
      bloccatiBlotato,
      ignorati,
      primaData,
      nuovaPrimaData,
      errore: `Con -${Math.abs(giorni)} giorni il primo contenuto finirebbe il ${nuovaPrimaData}, prima di oggi (${oggi}). Riduci lo spostamento.`,
    }
  }

  return { spostabili, bloccatiBlotato, ignorati, primaData, nuovaPrimaData }
}
