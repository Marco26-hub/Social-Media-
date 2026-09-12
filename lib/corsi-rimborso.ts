// Quando un rimborso chiude l'accesso al corso, e quando no.
//
// Sta in un file suo, senza database, per una ragione sola: e la decisione che
// toglie a una persona qualcosa che ha comprato, e va potuta provare senza
// montare un Postgres. Il resto del percorso (trovare l'acquisto dal
// payment_intent, scrivere lo stato) vive in lib/corsi-db.ts.

/**
 * True se il rimborso copre l'intero importo pagato.
 *
 * Un rimborso parziale NON chiude l'accesso: puo essere uno sconto concesso
 * dopo o la restituzione di una quota concordata, e togliere le lezioni a chi
 * ha pagato quasi tutto sarebbe una punizione per un gesto commerciale. Va
 * segnalato e deciso a mano.
 *
 * Il confronto e >= e non ===: Stripe puo restituire piu di quanto risulti a
 * noi quando un rimborso viene emesso in piu tranche o quando l'importo
 * dell'ordine e stato corretto dopo il pagamento. Meno del dovuto resta
 * parziale, di piu resta totale.
 */
export function rimborsoChiudeAccesso(rimborsatoCents: number, pagatoCents: number): boolean {
  if (!Number.isFinite(rimborsatoCents) || !Number.isFinite(pagatoCents)) return false
  // Un importo pagato a zero o negativo non e un acquisto valido: in quel caso
  // non si chiude niente in automatico e la cosa va guardata da una persona.
  if (pagatoCents <= 0) return false
  return rimborsatoCents >= pagatoCents
}
