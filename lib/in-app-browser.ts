// Browser interno di Instagram e Facebook: come riconoscerlo e come uscirne.
// Modulo puro, senza nessun import: niente Next, niente DOM. Gira nel server
// component della pagina (che legge lo user-agent con headers()) e i suoi
// risultati passano come props a un'isola client, quindi deve restare
// serializzabile e senza dipendenze.

export type InAppBrowser = {
  app: 'instagram' | 'facebook' | null
  os: 'ios' | 'android' | 'other'
}

// Instagram si controlla per primo e senza badare alle maiuscole: se un user-agent
// avesse anche i marcatori di Facebook, deve valere Instagram. FBAN/FBAV (iOS) e
// FB_IAB (Android) coprono anche Messenger. Niente flag `g`: con `test()` terrebbe
// lo stato tra una chiamata e l'altra.
const INSTAGRAM = /Instagram/i
const FACEBOOK = /FBAN|FBAV|FB_IAB/
const IOS = /iPhone|iPad|iPod/
const ANDROID = /Android/

export function detectInAppBrowser(userAgent: string | null | undefined): InAppBrowser {
  // Il tipo ammette solo string, null e undefined, ma il valore arriva da un header.
  // Il controllo è esplicito perché `test()` converte in stringa anche un array o un
  // oggetto e troverebbe "Instagram" dove lo user-agent non è nemmeno una stringa.
  if (typeof userAgent !== 'string') return { app: null, os: 'other' }
  const app = INSTAGRAM.test(userAgent) ? 'instagram' : FACEBOOK.test(userAgent) ? 'facebook' : null
  const os = IOS.test(userAgent) ? 'ios' : ANDROID.test(userAgent) ? 'android' : 'other'
  return { app, os }
}

const HTTPS_PREFIX = 'https://'

// Indirizzo della pagina senza query né hash. Il codice segreto sta nel percorso e
// deve restare l'unica cosa che identifica la pagina: `fbclid` e simili, che Meta
// aggiunge ai link, non vanno copiati né rimessi in giro. Solo https assoluto, perché
// il risultato finisce in un href e in un link da incollare altrove.
export function cleanPageUrl(url: string): string | null {
  // `new URL(['https://x.it/a'])` converte l'array in stringa e lo accetta: serve il
  // controllo di tipo, il try/catch da solo non basta.
  if (typeof url !== 'string') return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  // `origin` è schema + host + porta (quella di default il parser la toglie): non
  // contiene mai le credenziali (utente:password@), che qui non devono uscire.
  return parsed.origin + parsed.pathname
}

// Link `intent://` che su Android apre la pagina in Chrome. Se Chrome non c'è o
// l'intent viene rifiutato, il browser interno segue `S.browser_fallback_url`: la
// stessa pagina in https, quindi non si arriva mai a un vicolo cieco.
export function buildChromeIntentUrl(pageUrl: string): string | null {
  const clean = cleanPageUrl(pageUrl)
  if (!clean) return null
  // Tolto lo schema restano host (con la porta, se c'è) e percorso, cioè la parte che
  // l'intent vuole. Partire dall'indirizzo pulito fa sì che intent e ripiego non
  // possano divergere. Il percorso non contiene mai un `#` (il parser lo sposta
  // nell'hash, che qui si scarta): `#Intent;` resta l'ultimo e Android non può
  // leggere extra dal percorso.
  const hostAndPath = clean.slice(HTTPS_PREFIX.length)
  return `intent://${hostAndPath}#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${encodeURIComponent(clean)};end`
}
