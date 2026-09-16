// CSV per chi lo apre in Excel in italiano.
//
// Tre scelte, tutte per lo stesso destinatario — il commercialista con Excel:
//   - separatore punto e virgola: con la virgola decimale italiana, Excel apre i
//     file separati da virgola tutti in una colonna;
//   - BOM UTF-8 in testa: senza, Excel legge gli accenti come caratteri a caso;
//   - importi con la virgola, senza simbolo, cosi restano numeri sommabili.

const CELLA_PERICOLOSA = /^[=+\-@\t\r]/

/**
 * Una cella. Il testo che inizia con = + - @ viene preceduto da un apostrofo:
 * altrimenti Excel lo esegue come formula, e un nome cliente scritto ad arte
 * diventa un comando sul computer di chi apre il file.
 */
export function cellaCsv(valore: unknown): string {
  if (valore === null || valore === undefined) return ''
  let testo = String(valore)
  if (CELLA_PERICOLOSA.test(testo)) testo = `'${testo}`
  if (/[";\n\r]/.test(testo)) testo = `"${testo.replace(/"/g, '""')}"`
  return testo
}

export function rigaCsv(celle: unknown[]): string {
  return celle.map(cellaCsv).join(';')
}

export function documentoCsv(intestazione: string[], righe: unknown[][]): string {
  return '﻿' + [rigaCsv(intestazione), ...righe.map(rigaCsv)].join('\r\n') + '\r\n'
}

/** 200000 -> «2000,00»: numero sommabile in Excel, senza simbolo di valuta. */
export function importoCsv(centesimi: number): string {
  return (centesimi / 100).toFixed(2).replace('.', ',')
}

/** Data in formato gg/mm/aaaa, nel fuso italiano. */
export function dataCsv(iso: string | null): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('it-IT', {
    day: '2-digit', month: '2-digit', year: 'numeric', timeZone: 'Europe/Rome',
  }).format(new Date(iso))
}

/**
 * Il giorno di calendario a Roma, come «2026-09-01». Serve a confrontare date
 * con i filtri del periodo senza fissare un fuso a mano: +02:00 d'estate e
 * +01:00 d'inverno, e un fuso scritto fisso sposta i pagamenti di mezzanotte
 * nel mese sbagliato.
 */
export function giornoRoma(iso: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'Europe/Rome',
  }).format(new Date(iso))
}
