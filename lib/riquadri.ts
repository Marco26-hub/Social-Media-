// Chi occupa l'angolo in basso a destra.
//
// Il banner cookie, il popup della segretaria e ODINO stanno tutti li'. Il
// popup gia' aspettava il banner — «due riquadri sovrapposti in basso sono uno
// di troppo» — ma ODINO e' arrivato dopo e si sovrapponeva al popup. Invece di
// far indovinare a ognuno chi c'e', l'angolo ha un solo padrone alla volta e lo
// dichiara qui.

export const EVENTO_RIQUADRO = 'swa-riquadro-angolo'

/** Chi sta occupando l'angolo, o null se e' libero. */
export type Occupante = 'segretaria' | null

let occupante: Occupante = null

export function occupaAngolo(chi: Exclude<Occupante, null>): void {
  occupante = chi
  window.dispatchEvent(new CustomEvent(EVENTO_RIQUADRO))
}

export function liberaAngolo(chi: Exclude<Occupante, null>): void {
  if (occupante === chi) occupante = null
  window.dispatchEvent(new CustomEvent(EVENTO_RIQUADRO))
}

export function angoloLibero(): boolean {
  return occupante === null
}
