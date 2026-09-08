import { SETTORI_EN } from '@/lib/settori.en'
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
  // Le pagine di dettaglio dei servizi non hanno una gemella inglese una per
  // una: in inglese i servizi stanno tutti su /en/services, che li descrive
  // tutti. Mandarle li' e' diverso dal ripiegare sulla home — il lettore trova
  // comunque il servizio che stava leggendo, tradotto.
  ...Object.fromEntries(SERVIZI_IT.map(percorso => [percorso, '/en/services'])),
  '/consulenza': '/en/services',
  // Il Journal e i suoi articoli: lo slug inglese e' diverso da quello italiano
  // (/en/blog/ai-act-obligations-small-business, non il titolo in italiano),
  // quindi il legame lo tiene `slugIt` invece della coincidenza del percorso.
  '/autore/marco-dibenedetto': '/en/author/marco-dibenedetto',
  '/blog': '/en/blog',
  ...Object.fromEntries(SWA_BLOG_ARTICLES_EN.map(a => [`/blog/${a.slugIt}`, `/en/blog/${a.slug}`])),
}

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
