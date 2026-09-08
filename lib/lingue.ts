import { SETTORI_EN } from '@/lib/settori.en'
import { SERVIZI_EN } from '@/lib/servizi.en'
import { SWA_BLOG_ARTICLES_EN } from '@/lib/swa-blog-content.en'

// Corrispondenze fra pagine italiane e inglesi.
//
// Il pulsante EN portava sempre alla home inglese, anche quando la traduzione
// della pagina che stai leggendo esiste: chi legge /pacchetti e clicca EN
// finiva su /en invece che su /en/pricing, e doveva ricominciare a navigare.
// La mappa stava dentro app/sitemap.ts, dove serviva solo agli hreflang.

const SERVIZI_IT = [
  '/servizi/gestione-social-media',
  '/servizi/segretaria-telefonica-ai',
  '/servizi/agenda-clienti-whatsapp',
  '/servizi/siti-e-commerce',
  '/servizi/video-produzione',
  '/servizi/blog-seo',
  '/servizi/seo-geo',
  '/servizi/ricerca-clienti-b2b',
  '/servizi/gestione-lavorazioni',
  '/servizi/automazione-gestionali',
] as const

// Le due pagine con impianto proprio: non passano da SERVIZI_EN perche' usano
// una landing loro, ma la gemella ce l'hanno. Stanno in una costante perche'
// vanno tolte anche dal ripiego sulla panoramica qui sotto: senza, quella
// riga le riscriverebbe subito dopo e la coppia sparirebbe.
const ALTRE_LANDING: Record<string, string> = {
  '/servizi/segretaria-telefonica-ai': '/en/services/ai-phone-assistant',
  '/servizi/agenda-clienti-whatsapp': '/en/services/client-diary-whatsapp',
}

export const COPPIE_LINGUA: Record<string, string> = {
  '/': '/en',
  '/servizi': '/en/services',
  '/metodo': '/en/method',
  '/pacchetti': '/en/pricing',
  '/chi-siamo': '/en/about',
  '/faq': '/en/faq',
  '/contatti': '/en/contact',
  '/settori': '/en/settori',
  ...Object.fromEntries(SETTORI_EN.map(s => [`/settori/${s.slug}`, `/en/settori/${s.slug}`])),
  // Le schede di servizio tradotte hanno la loro gemella, una per una: la
  // corrispondenza la dichiara il servizio stesso, non un elenco a parte.
  ...Object.fromEntries(SERVIZI_EN.map(s => [s.slugIt, `/en/services/${s.slug}`])),
  ...ALTRE_LANDING,
  // Quelle non ancora tradotte finiscono sulla panoramica: il lettore trova
  // comunque il servizio che stava leggendo, in inglese. Per gli hreflang non
  // basta — vedi TRADUZIONI qui sotto — ma per chi legge e' meglio della home.
  ...Object.fromEntries(
    SERVIZI_IT
      .filter(p => !SERVIZI_EN.some(s => s.slugIt === p) && !(p in ALTRE_LANDING))
      .map(percorso => [percorso, '/en/services']),
  ),
  '/consulenza': '/en/services',
  // Il Journal e i suoi articoli: lo slug inglese e' diverso da quello italiano
  // (/en/blog/ai-act-obligations-small-business, non il titolo in italiano),
  // quindi il legame lo tiene `slugIt` invece della coincidenza del percorso.
  // Le pagine legali tradotte. Sono traduzioni di cortesia: ognuna dichiara in
  // cima che in caso di divergenza prevale l'italiano, perche' l'atto che
  // vincola resta quello redatto nella lingua in cui l'azienda opera.
  '/privacy': '/en/privacy',
  '/cookie-policy': '/en/cookie-policy',
  '/termini': '/en/terms',
  '/trasparenza-ai': '/en/ai-transparency',
  '/recesso': '/en/withdrawal',
  '/sicurezza': '/en/security',
  '/accessibilita': '/en/accessibility',
  '/autore/marco-dibenedetto': '/en/author/marco-dibenedetto',
  '/blog': '/en/blog',
  ...Object.fromEntries(SWA_BLOG_ARTICLES_EN.map(a => [`/blog/${a.slugIt}`, `/en/blog/${a.slug}`])),
}

/**
 * Le traduzioni vere, una a una. Sono un'altra cosa dal cambio lingua.
 *
 * hreflang vuole coppie reciproche: se A dichiara B come versione inglese, B
 * deve dichiarare A come versione italiana. Undici pagine italiane puntavano
 * tutte a /en/services, che di italiane ne puo' dichiarare una sola — e infatti
 * dichiara /servizi. Le altre dieci erano annunci che nessuno ricambiava, e
 * davanti a un gruppo non reciproco Google scarta il gruppo intero: l'inglese
 * non veniva consolidato, ed era l'unica cosa che nel sito non tornava.
 *
 * Per il lettore mandare /servizi/seo-geo su /en/services resta giusto: trova
 * il servizio che stava leggendo, tradotto. Per un motore e' un'altra
 * affermazione — «questa pagina e' quella pagina» — e non e' vera.
 *
 * Delle doppie sopravvive la prima, come nella mappa inversa qui sotto:
 * l'ordine di COPPIE_LINGUA mette l'indice prima dei dettagli, quindi la
 * coppia che resta e' /servizi ↔ /en/services, che e' quella vera. Le altre
 * dieci escono da se', senza un elenco da tenere aggiornato a mano.
 */
export const TRADUZIONI: Record<string, string> = (() => {
  const visti = new Set<string>()
  const out: Record<string, string> = {}
  for (const [it, en] of Object.entries(COPPIE_LINGUA)) {
    if (visti.has(en)) continue
    visti.add(en)
    out[it] = en
  }
  return out
})()

// L'inverso si costruisce dalla prima corrispondenza, non dall'ultima: undici
// pagine italiane puntano a /en/services, e senza questo il ritorno in italiano
// finiva sull'ultima della lista invece che sull'indice dei servizi.
const INVERSE: Record<string, string> = {}
for (const [it, en] of Object.entries(COPPIE_LINGUA)) {
  if (!(en in INVERSE)) INVERSE[en] = it
}

/**
 * Dove porta il cambio lingua da un percorso. Se la traduzione non esiste si
 * torna alla radice dell'altra lingua: meglio la home che una pagina assente.
 */
export function altraLingua(percorso: string, verso: 'it' | 'en'): string {
  const pulito = percorso.replace(/[?#].*$/, '').replace(/\/+$/, '') || '/'
  return verso === 'en' ? (COPPIE_LINGUA[pulito] ?? '/en') : (INVERSE[pulito] ?? '/')
}
