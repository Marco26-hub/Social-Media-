// Percorsi dell'area download segreta (/download/<codice>) per chi misura il traffico.
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
