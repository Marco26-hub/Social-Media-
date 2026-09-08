// Formato unico degli importi in euro.
//
// Il sito stampava lo stesso numero in tre grafie: «1790 €», «1.790 €» e
// «€1790». La causa non era una svista ma `toLocaleString('it-IT')`, che su un
// Node senza ICU completo restituisce «1790» invece di «1.790»: il separatore
// spariva a seconda di dove girava il codice. Qui il separatore e' calcolato,
// non chiesto al runtime, quindi la grafia e' la stessa ovunque e sempre.

/** «1.790», «19,90», «590». Punto per le migliaia, virgola per i decimali. */
export function numeroItaliano(valore: number): string {
  const negativo = valore < 0
  const assoluto = Math.abs(valore)
  const intero = Math.trunc(assoluto)
  const decimali = Math.round((assoluto - intero) * 100)
  const gruppi = String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, '.')
  const coda = decimali > 0 ? `,${String(decimali).padStart(2, '0')}` : ''
  return `${negativo ? '-' : ''}${gruppi}${coda}`
}

/** «1.790 €»: simbolo dopo il numero, come vuole l'italiano. */
export function euro(valore: number): string {
  return `${numeroItaliano(valore)} €`
}

/** «€1,790.00» non serve: in inglese basta il simbolo davanti e il punto. */
export function euroInglese(valore: number): string {
  const intero = Math.trunc(Math.abs(valore))
  const decimali = Math.round((Math.abs(valore) - intero) * 100)
  const gruppi = String(intero).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
  return `€${gruppi}${decimali > 0 ? `.${String(decimali).padStart(2, '0')}` : ''}`
}

/**
 * Porta un prezzo gia formattato alla convenzione italiana: «€490» diventa
 * «490 €», «490 €» resta com'e'. Le sorgenti tengono il simbolo davanti perche'
 * la stessa stringa alimenta anche le pagine inglesi; il difetto non era la
 * scelta ma il risultato — le due forme dello stesso prezzo finivano affiancate
 * dentro la stessa scheda.
 */
export function convenzioneIt(prezzo: string): string {
  return prezzo.replace(/€\s?([\d.,]+)/g, '$1 €')
}
