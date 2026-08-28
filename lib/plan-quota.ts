// Ripartizione della quota mensile del pacchetto sulle settimane del piano.
//
// Estratto da app/api/generate/plan/route.ts per poterlo testare: la regola
// "fase 1 + fase 2 = esattamente il totale mensile, senza buchi ne doppioni" e
// il punto in cui il piano puo sbagliare in modo silenzioso e costoso (contenuti
// generati in eccesso costano credito AI e vanno cancellati a mano).

export const SETTIMANE_DEL_MESE = [0, 1, 2, 3] as const

/**
 * Quota del blocco `indice` quando `totale` va diviso in `blocchi` parti il piu
 * uniformemente possibile. La somma su tutti gli indici e sempre esattamente
 * `totale`: l'arrotondamento non crea ne perde contenuti.
 */
export function quotaBlocco(totale: number, blocchi: number, indice: number): number {
  if (blocchi <= 0) return 0
  const t = Math.max(0, Math.round(totale))
  return Math.floor(((indice + 1) * t) / blocchi) - Math.floor((indice * t) / blocchi)
}

/**
 * Le settimane (indice 0-3) coperte dalla fase richiesta.
 * Fase 1 = settimane 1-2, fase 2 = settimane 3-4, nessuna fase = tutto il mese.
 *
 * La quota di ogni settimana resta calcolata sulle QUATTRO settimane anche
 * quando se ne genera solo meta: e cio che rende `fase 1 + fase 2 = mese intero`.
 */
export function settimaneDellaFase(faseNum: 1 | 2 | null): number[] {
  if (faseNum === 1) return [0, 1]
  if (faseNum === 2) return [2, 3]
  return [...SETTIMANE_DEL_MESE]
}

/**
 * Quanti contenuti produce una fase, dato il totale mensile del pacchetto.
 * Utile per mostrarlo nella UI e per i test.
 */
export function contenutiDellaFase(totaleMensile: number, faseNum: 1 | 2 | null): number {
  return settimaneDellaFase(faseNum)
    .reduce((somma, settimana) => somma + quotaBlocco(totaleMensile, SETTIMANE_DEL_MESE.length, settimana), 0)
}
