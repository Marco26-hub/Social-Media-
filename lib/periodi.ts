// Periodi contabili: il mese e il trimestre, quelli della liquidazione IVA.
//
// Il periodo viaggia come stringa nell'indirizzo — «2026-09» per un mese,
// «2026-T3» per un trimestre — e diventa un intervallo di giorni di calendario
// italiani, estremi inclusi. Tutto in testo AAAA-MM-GG e niente oggetti Date:
// cosi il confronto con giornoRoma() non passa mai da un fuso orario.

export type Intervallo = { da: string; a: string; etichetta: string }

const MESI = [
  'gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno',
  'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre',
]

function ultimoGiorno(anno: number, mese: number): number {
  // Il giorno 0 del mese dopo e l'ultimo di questo; in UTC, per non dipendere
  // dal fuso del server.
  return new Date(Date.UTC(anno, mese, 0)).getUTCDate()
}

const due = (n: number) => String(n).padStart(2, '0')

/** «2026-09» -> 1-30 settembre 2026; «2026-T3» -> 1 luglio-30 settembre 2026. */
export function intervalloPeriodo(periodo: string): Intervallo | null {
  const mese = /^(\d{4})-(\d{2})$/.exec(periodo)
  if (mese) {
    const anno = Number(mese[1])
    const m = Number(mese[2])
    if (m < 1 || m > 12) return null
    return {
      da: `${anno}-${due(m)}-01`,
      a: `${anno}-${due(m)}-${due(ultimoGiorno(anno, m))}`,
      etichetta: `${MESI[m - 1]} ${anno}`,
    }
  }

  const trimestre = /^(\d{4})-T([1-4])$/.exec(periodo)
  if (trimestre) {
    const anno = Number(trimestre[1])
    const t = Number(trimestre[2])
    const primo = (t - 1) * 3 + 1
    const ultimo = t * 3
    return {
      da: `${anno}-${due(primo)}-01`,
      a: `${anno}-${due(ultimo)}-${due(ultimoGiorno(anno, ultimo))}`,
      etichetta: `${t}° trimestre ${anno}`,
    }
  }

  return null
}

/**
 * I periodi da proporre nel menu, dal piu recente: gli ultimi mesi e gli ultimi
 * trimestri a partire da `oggi` (AAAA-MM-GG).
 */
export function periodiRecenti(oggi: string, quantiMesi = 12, quantiTrimestri = 4): { mesi: string[]; trimestri: string[] } {
  const [anno, mese] = oggi.split('-').map(Number)
  const mesi: string[] = []
  for (let i = 0; i < quantiMesi; i++) {
    const indice = (anno * 12 + (mese - 1)) - i
    mesi.push(`${Math.floor(indice / 12)}-${due((indice % 12) + 1)}`)
  }
  const trimestri: string[] = []
  const tCorrente = Math.floor((mese - 1) / 3)
  for (let i = 0; i < quantiTrimestri; i++) {
    const indice = anno * 4 + tCorrente - i
    trimestri.push(`${Math.floor(indice / 4)}-T${(indice % 4) + 1}`)
  }
  return { mesi, trimestri }
}
