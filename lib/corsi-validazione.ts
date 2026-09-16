// Controllo dei dati che l'amministrazione scrive sui corsi.
//
// Senza, ogni errore di battitura arrivava al database e tornava come un 500
// generico. Peggio: il modulo «Nuovo corso» manda la descrizione vuota, il
// livello dati la trasformava in null, e la colonna e obbligatoria — creare un
// corso dall'amministrazione non e mai riuscito. Qui si decide, colonna per
// colonna, cosa diventa un campo vuoto e cosa va rifiutato con un messaggio.
//
// Senza database, per poterlo provare: e la regola che decide cosa entra nel
// catalogo pubblico.

export class DatoNonValido extends Error {
  // Il nome sopravvive al passaggio fra moduli, instanceof no sempre: e su
  // questo che lib/api-error.ts lo riconosce.
  name = 'DatoNonValido'
}

/** Campi obbligatori: vuoti non hanno senso e vanno rifiutati. */
const OBBLIGATORI = new Set(['slug', 'titolo', 'tipo', 'modalita', 'livello', 'inizio_il'])

/** Campi obbligatori nel database che accettano il testo vuoto come valore. */
const VUOTO_AMMESSO = new Set(['descrizione'])

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const LIVELLI = new Set(['base', 'intermedio', 'avanzato'])
const MODALITA = new Set(['registrato', 'live'])
const TIPI_LEZIONE = new Set(['video', 'testo'])

function interoPositivo(valore: unknown, campo: string, ammettiZero = false): number | null {
  if (valore === null || valore === '') return null
  const n = Number(valore)
  if (!Number.isInteger(n) || n < 0 || (!ammettiZero && n === 0)) {
    throw new DatoNonValido(`${campo}: serve un numero intero maggiore di zero.`)
  }
  return n
}

/**
 * Valore da scrivere per una colonna. Lancia DatoNonValido con un messaggio
 * leggibile quando il dato non puo andare nel database.
 */
export function valoreColonna(colonna: string, valore: unknown): unknown {
  if (typeof valore === 'string') valore = valore.trim()

  if (valore === '' || valore === null || valore === undefined) {
    if (OBBLIGATORI.has(colonna)) throw new DatoNonValido(`Il campo «${colonna}» non può essere vuoto.`)
    return VUOTO_AMMESSO.has(colonna) ? '' : null
  }

  switch (colonna) {
    case 'slug':
      if (typeof valore !== 'string' || !SLUG.test(valore) || valore.length > 100) {
        throw new DatoNonValido('Lo slug può contenere solo lettere minuscole, numeri e trattini, senza spazi.')
      }
      return valore
    case 'prezzo_cents': {
      const n = interoPositivo(valore, 'Prezzo')
      if (n !== null && n > 10_000_000) throw new DatoNonValido('Prezzo: oltre 100.000 € è quasi certamente un errore di battitura.')
      return n
    }
    case 'posti_totali':
      return interoPositivo(valore, 'Posti totali')
    case 'durata_min':
      return interoPositivo(valore, 'Durata in minuti')
    case 'ordine':
      return interoPositivo(valore, 'Ordine', true)
    case 'livello':
      if (!LIVELLI.has(String(valore))) throw new DatoNonValido('Livello non valido.')
      return valore
    case 'modalita':
      if (!MODALITA.has(String(valore))) throw new DatoNonValido('Modalità non valida.')
      return valore
    case 'tipo':
      if (!TIPI_LEZIONE.has(String(valore))) throw new DatoNonValido('Tipo di lezione non valido.')
      return valore
    case 'inizio_il':
    case 'disponibile_dal':
      if (Number.isNaN(new Date(String(valore)).getTime())) throw new DatoNonValido('Data non valida.')
      return valore
    case 'link_accesso':
    case 'video_url':
    case 'immagine_url':
      // Solo indirizzi https: un javascript: qui finirebbe in un link cliccato
      // da chi ha pagato.
      if (!/^https:\/\/[^\s]+$/i.test(String(valore))) throw new DatoNonValido('L’indirizzo deve iniziare con https://.')
      return valore
    case 'pubblicato':
    case 'in_evidenza':
    case 'anteprima_gratuita':
      return valore === true || valore === 'true'
    default:
      return valore
  }
}

/** Un id di riga valido, prima di mandarlo al database. */
export function idValido(valore: unknown): valore is string {
  return typeof valore === 'string' && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(valore)
}
