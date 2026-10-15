// Percorsi dell'area download segreta (/download/<codice>): statistiche, banner cookie e Odino.
// Il codice sta nell'URL ed è l'unica "password" della pagina: non deve finire in
// statistiche o pixel di terzi. Puro, senza import: gira anche nel browser.

const DOWNLOAD_PREFIX = '/download/'

export function isDownloadPath(pathname: string | null | undefined): boolean {
  return typeof pathname === 'string' && pathname.startsWith(DOWNLOAD_PREFIX)
}

// Il percorso da mandare alle statistiche proprie: sull'area download c'è un
// segnaposto al posto del codice, ogni altro percorso resta com'è.
export function pathForTelemetry(pathname: string): string {
  return isDownloadPath(pathname) ? `${DOWNLOAD_PREFIX}[codice]` : pathname
}

// Banner cookie e Odino non si montano sull'area download: lì non parte nessuna misura
// che chieda consenso, quindi il banner non avrebbe niente da chiedere, e il primo
// schermo è dei regali. Sugli altri percorsi restano come prima.
export function siteOverlaysEnabled(pathname: string | null | undefined): boolean {
  return !isDownloadPath(pathname)
}
