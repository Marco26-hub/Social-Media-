// Versione dei termini accettati al momento dell'acquisto.
//
// Non e una data qualsiasi: viene scritta su ogni ordine (`terms_version`) ed e
// l'unico modo, in caso di contestazione, di sapere QUALE testo quella persona
// ha accettato. I termini cambiano, gli ordini gia fatti no.
//
// Regola: se si tocca il contenuto di /termini in modo che cambi cio a cui il
// cliente si obbliga, questa costante va aggiornata nello stesso commit. Se non
// si aggiorna, tutti gli ordini nuovi dichiarano di aver accettato un testo che
// non esiste piu, e la tracciabilita si perde in silenzio.
//
// 2026-09-12: aggiunto il punto 4 sui corsi online e i casi del recesso per
// contenuto digitale, prevendita e aule in diretta.
// 2026-09-21: aggiunto il punto 5 sul servizio «AI a casa tua» — computer non
// venduto dal Titolare, prezzi una tantum, trasferta, limiti di garanzia sui
// modelli di terze parti, obblighi del cliente su privacy e AI Act, assistenza
// inclusa — e i tre casi di recesso relativi (consumatore, computer,
// manutenzione). Cambia cio a cui il cliente si obbliga, quindi la versione sale.
// Stesso giorno: dichiarato nel 5.3 che con un modello in cloud i dati escono dal
// computer, che la consegna avviene con il solo modello locale attivo e che il
// collegamento esterno si attiva solo su richiesta.
export const TERMINI_VERSIONE = '2026-09-21'

/** Come si legge in pagina: «in vigore dal 12 settembre 2026». */
export const TERMINI_DATA = new Date(`${TERMINI_VERSIONE}T00:00:00.000Z`)
