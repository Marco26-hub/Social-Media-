import { NextResponse } from 'next/server'

// Mappa gli errori noti (lanciati da auth-utils, parsing, ecc.) a status HTTP
// corretti invece del 500 generico. Nessun dettaglio sensibile esposto.
export function apiError(e: unknown): NextResponse {
  const msg = e instanceof Error ? e.message : 'Errore'

  if (/non autenticato/i.test(msg)) {
    return NextResponse.json({ error: 'Non autenticato' }, { status: 401 })
  }
  if (/accesso .*negato|riservat[ao] ad admin/i.test(msg)) {
    return NextResponse.json({ error: 'Accesso negato' }, { status: 403 })
  }
  if (/nessun cliente selezionato/i.test(msg)) {
    return NextResponse.json({ error: 'Nessun cliente selezionato' }, { status: 400 })
  }
  // Dati dell'amministrazione dei corsi rifiutati dal controllo: il messaggio
  // e scritto per chi compila il modulo e va mostrato cosi com'e.
  if (e instanceof Error && e.name === 'DatoNonValido') {
    return NextResponse.json({ error: msg }, { status: 400 })
  }
  // Un id che non e un uuid non indica nessuna riga.
  if (/invalid input syntax for type uuid/i.test(msg)) {
    return NextResponse.json({ error: 'Elemento non trovato' }, { status: 404 })
  }
  // Sezione corsi con la migrazione 052 non ancora applicata: e un servizio
  // non ancora disponibile, non un errore interno da nascondere.
  if (/Migrazione dei corsi non applicata/.test(msg)) {
    return NextResponse.json({ error: msg }, { status: 503 })
  }
  // Errori di parsing JSON del body
  if (/JSON|Unexpected token|Expected property/i.test(msg)) {
    return NextResponse.json({ error: 'Richiesta non valida (JSON malformato)' }, { status: 400 })
  }

  // Errori del bridge AI: sono GIÀ sanificati (niente segreti) e pensati per
  // l'utente ("modelli sovraccarichi", "nessun provider configurato", ecc.).
  // Vanno mostrati, non nascosti dietro il 500 generico. Status 502 = upstream.
  if (/Generazione AI fallita|Modelli AI|Nessun provider AI|Risposta AI vuota|rate.?limit/i.test(msg)) {
    return NextResponse.json({ error: msg }, { status: 502 })
  }

  // Fallback: NON esporre il messaggio grezzo al client (può contenere nomi
  // colonne/constraint/dettagli driver). Log dettagliato lato server, messaggio
  // generico al client.
  console.error('[apiError] errore non gestito:', msg.slice(0, 500))
  return NextResponse.json({ error: 'Errore interno del server' }, { status: 500 })
}
