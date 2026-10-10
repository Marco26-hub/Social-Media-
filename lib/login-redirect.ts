// Logica pura della destinazione dopo il login (nessun import di Next/React).

// Il pannello /admin ha una CSP propria (next.config.mjs: connect-src aggiunge
// https://vercel.com/api/blob/ per l'upload dei file). La CSP però la fissa il
// caricamento completo del documento: con router.push dalla pagina di login si
// resta nel documento di /login, con la sua CSP, e l'upload verso Blob viene
// bloccato. Per /admin serve quindi un caricamento completo della pagina.
export function needsFullPageLoad(destination: string): boolean {
  // Confronto esatto o con un separatore: /administrator non è /admin.
  return /^\/admin(?:[/?#]|$)/.test(destination)
}
