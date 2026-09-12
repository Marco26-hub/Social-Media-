import { euro } from '@/lib/euro'
// Listino della parte legale: la consulenza individuale.
//
// Il prezzo dei corsi NON sta piu qui. I corsi sono righe della tabella `corsi`,
// con prezzi diversi fra loro, modificabili dall'amministrazione senza un
// rilascio: una costante in questo file sarebbe una seconda cifra destinata a
// divergere da quella che Stripe addebita davvero — cioe esattamente il
// problema che questo file e nato per chiudere.
//
// Erano due cifre scritte a mano. La consulenza viveva come 15000 centesimi
// nella route di pagamento e come «150 €» in due pagine; il corso come «2.000 €»
// in una pagina sola e in nessuna sorgente. E' esattamente la configurazione che
// ha gia prodotto un addebito diverso dal prezzo mostrato: display e importo
// devono nascere dallo stesso numero, o prima o poi divergono.
//
// Le consulenze sono erogate dallo Studio Legale BCS: qui sta il prezzo al
// pubblico, non il rapporto con lo studio.

export const CONSULENZA_LEGALE = {
  /** Centesimi: e' questo che arriva a Stripe. */
  importoCents: 15000,
  durataMinuti: 30,
} as const

/** «150 €»: dal formattatore condiviso, non dal locale del runtime. */
export function euroPubblico(cents: number): string {
  return euro(cents / 100)
}

export const CONSULENZA_PREZZO = euroPubblico(CONSULENZA_LEGALE.importoCents)
