// Chi occupa l'angolo in basso a destra.
//
// Il banner cookie, il popup della segretaria, ODINO e i pulsanti «torna su» e
// «indietro» stanno tutti li'. Il popup gia' aspettava il banner — «due riquadri
// sovrapposti in basso sono uno di troppo» — ma ODINO e' arrivato dopo e si
// sovrapponeva prima al popup e poi ai due pulsanti di navigazione, che
// finivano sotto il pannello. Invece di far indovinare a ognuno chi c'e',
// l'angolo ha un solo padrone alla volta e lo dichiara qui.

export const EVENTO_RIQUADRO = 'swa-riquadro-angolo'

/** Chi sta occupando l'angolo con un pannello, o null se e' libero. */
export type Occupante = 'segretaria' | 'odino' | null

let occupante: Occupante = null
// La mascotte di ODINO chiusa non e' un pannello: non blocca l'angolo, ma
// occupa comunque i suoi 116 pixel. Chi sta li' sotto deve saperlo per salire
// sopra invece di finirci dietro.
let mascotte = false

function annuncia(): void {
  window.dispatchEvent(new CustomEvent(EVENTO_RIQUADRO))
}

export function occupaAngolo(chi: Exclude<Occupante, null>): void {
  occupante = chi
  annuncia()
}

export function liberaAngolo(chi: Exclude<Occupante, null>): void {
  if (occupante === chi) occupante = null
  annuncia()
}

export function angoloLibero(): boolean {
  return occupante === null
}

/** Chi occupa l'angolo adesso: serve a chi deve spostarsi, non solo a nascondersi. */
export function chiOccupa(): Occupante {
  return occupante
}

export function mostraMascotte(presente: boolean): void {
  if (mascotte === presente) return
  mascotte = presente
  annuncia()
}

export function mascotteVisibile(): boolean {
  return mascotte
}
