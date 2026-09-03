// Consenso cookie, letto allo stesso modo dal browser (document.cookie) e dal
// server (header Cookie): entrambi ricevono una stringa di cookie, quindi la
// regola di lettura è una sola invece di tre copie della stessa regex.
//
// Le uniche risposte valide sono 'essential' e 'marketing'. Qualunque altro
// valore vale come "non ha ancora risposto" e fa ricomparire il banner. È il
// caso di 'technical', scritto dal banner precedente: quello informava soltanto
// ("Ho capito") e non chiedeva niente sul marketing, quindi non è un consenso e
// non va trattato come tale — ma nemmeno come un rifiuto, altrimenti quelle
// persone non verrebbero più interpellate.

export const COOKIE_CONSENSO = 'cookie_consent'

/** Evento interno: avvisa chi ascolta che la scelta è appena cambiata. */
export const EVENTO_CONSENSO = 'swa-cookie-consent'

export type Consenso = 'essential' | 'marketing'

const RISPOSTE_VALIDE = new Set<string>(['essential', 'marketing'])

/** La risposta data, oppure null se non c'è o non è più una risposta valida. */
export function leggiConsenso(cookies: string | null | undefined): Consenso | null {
  if (!cookies) return null
  const trovato = cookies.match(new RegExp(`(?:^|;\\s*)${COOKIE_CONSENSO}=([^;]+)`))
  if (!trovato) return null
  let valore: string
  try {
    valore = decodeURIComponent(trovato[1])
  } catch {
    // Cookie malformato: si torna a chiedere invece di indovinare.
    return null
  }
  return RISPOSTE_VALIDE.has(valore) ? (valore as Consenso) : null
}

/** Vero solo con un sì esplicito al marketing. Nel dubbio, niente tracciamento. */
export function marketingConcesso(cookies: string | null | undefined): boolean {
  return leggiConsenso(cookies) === 'marketing'
}
