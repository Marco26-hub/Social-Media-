// Stato del diritto di recesso su un ordine di corso.
//
// Una regola sola, usata in due posti: l'amministrazione, che deve sapere quando
// un incasso non puo piu tornare indietro, e la schermata di consenso alla
// consegna, che non deve chiedere a nessuno di rinunciare a un diritto che ha
// gia perso.
//
// Il termine e di quattordici giorni dalla conclusione del contratto, che per
// noi e il pagamento (art. 52 Codice del consumo, sia per i servizi sia per il
// contenuto digitale). Prima di quel termine il diritto si estingue quando
// l'esecuzione inizia con la richiesta espressa del consumatore e la sua
// dichiarazione di esserne informato (art. 59, lett. a e o).
//
// Imprese e professionisti non hanno questo diritto: il Codice del consumo non
// si applica a loro.

export const GIORNI_RECESSO = 14

export type StatoRecesso =
  | { tipo: 'non_previsto' }
  | { tipo: 'non_pagato' }
  | { tipo: 'rinunciato'; il: Date }
  | { tipo: 'aperto'; fino: Date }
  | { tipo: 'scaduto'; il: Date }

export function fineRecesso(pagatoIl: Date): Date {
  return new Date(pagatoIl.getTime() + GIORNI_RECESSO * 24 * 60 * 60 * 1000)
}

export function statoRecesso(ordine: {
  customerType: string
  pagatoIl: Date | null
  /** Quando il consumatore ha chiesto l'esecuzione e dichiarato di perdere il diritto. */
  rinunciaIl: Date | null
  ora?: Date
}): StatoRecesso {
  if (ordine.customerType !== 'consumatore') return { tipo: 'non_previsto' }
  if (!ordine.pagatoIl) return { tipo: 'non_pagato' }

  const fine = fineRecesso(ordine.pagatoIl)
  const ora = ordine.ora ?? new Date()

  // Una rinuncia raccolta dopo la scadenza non ha estinto niente: il diritto
  // era gia finito da solo. Conta la data che arriva prima.
  if (ordine.rinunciaIl && ordine.rinunciaIl < fine) return { tipo: 'rinunciato', il: ordine.rinunciaIl }
  if (ora >= fine) return { tipo: 'scaduto', il: fine }
  return { tipo: 'aperto', fino: fine }
}
