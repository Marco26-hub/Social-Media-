import { SETTORI } from '@/lib/settori'

// Collegamenti fra le sezioni del sito.
//
// Le pagine di settore linkavano i servizi, ma non il contrario: le undici
// verticali e i sette articoli avevano un solo link in entrata a testa, quello
// del menu. Qui l'indice si costruisce invertendo i dati che esistono gia', cosi'
// un settore nuovo compare da solo sulle pagine servizio che lo riguardano.

export type Collegamento = { href: string; label: string }

/** Settori che dichiarano questo servizio fra i propri correlati. */
export function settoriPerServizio(percorsoServizio: string): Collegamento[] {
  return SETTORI
    .filter(s => s.correlati.some(c => c.href === percorsoServizio))
    .map(s => ({ href: `/settori/${s.slug}`, label: s.nome }))
}

/** L'articolo del Journal che approfondisce quel servizio, quando esiste. */
const ARTICOLI: Record<string, Collegamento> = {
  '/servizi/gestione-social-media': { href: '/blog/gestione-social-media-pmi-cosa-include-costi', label: 'Che cosa comprende la gestione social e quanto costa' },
  '/servizi/seo-geo': { href: '/blog/seo-geo-differenze-visibilita-motori-ai', label: 'SEO e GEO: che cosa cambia davvero' },
  '/servizi/blog-seo': { href: '/blog/piano-editoriale-social-esempio-pmi', label: 'Un piano editoriale che regge un mese intero' },
  '/servizi/segretaria-telefonica-ai': { href: '/blog/chiamate-perse-agenda-vuota-cosa-fare', label: 'Chiamate perse e agenda vuota: due problemi diversi' },
  '/servizi/agenda-clienti-whatsapp': { href: '/blog/chiamate-perse-agenda-vuota-cosa-fare', label: 'Chiamate perse e agenda vuota: due problemi diversi' },
  '/servizi/video-produzione': { href: '/blog/video-social-aziendali-come-farli-bene', label: 'Video aziendali: dove si perde davvero la qualita' },
  '/servizi/ricerca-clienti-b2b': { href: '/blog/ricerca-clienti-b2b-come-costruire-lista', label: 'Come si costruisce una lista B2B che vale' },
  '/consulenza': { href: '/blog/ai-act-obblighi-pmi-cosa-fare', label: 'AI Act: gli obblighi che riguardano una PMI' },
}

export function articoloPerServizio(percorsoServizio: string): Collegamento | undefined {
  return ARTICOLI[percorsoServizio]
}
