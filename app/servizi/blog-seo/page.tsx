import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { SITE_URL } from '@/lib/site-config'

const title = 'Blog SEO e GEO: 12 articoli al mese | SWA'
const description = 'Servizio Blog SEO + GEO: 12 articoli mensili pianificati, revisionati e pubblicati sul blog collegato, con FAQ, metadati e dati strutturati.'

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: `${SITE_URL}${BLOG_SERVICE.path}` },
  openGraph: { title, description, url: `${SITE_URL}${BLOG_SERVICE.path}` },
  twitter: { title, description },
}

const config = {
  path: BLOG_SERVICE.path,
  eyebrow: 'Piano editoriale organico',
  title: 'Dodici articoli al mese per trasformare competenze in visibilità organica.',
  lead: 'Pianifichiamo e produciamo contenuti SEO + GEO collegati ai servizi reali dell’azienda. Ogni articolo viene strutturato per persone, Google e sistemi di risposta AI, poi controllato prima della pubblicazione.',
  serviceName: BLOG_SERVICE.name,
  serviceType: 'Produzione e pubblicazione di articoli blog SEO e GEO',
  promise: 'Un blog costante, utile e collegato alle domande che i clienti cercano davvero.',
  startingPrice: BLOG_SERVICE.price,
  priceNote: `IVA esclusa. ${BLOG_SERVICE.trialDays} giorni per valutare il servizio.`,
  offerHighlight: `${BLOG_SERVICE.articlesPerMonth} articoli al mese`,
  primaryCtaLabel: 'Attiva Blog SEO + GEO',
  primaryCtaHref: '/acquista?servizio=blog-seo',
  icon: Newspaper,
  signals: ['Piano di 12 articoli mensili', 'Revisione prima della pubblicazione', 'SEO, GEO e dati strutturati inclusi'],
  outcomes: [
    { title: 'Continuita', text: 'Un calendario editoriale regolare, senza mesi vuoti.' },
    { title: 'Copertura', text: 'Più domande e intenti utili presidiati sul sito.' },
    { title: 'Autorevolezza', text: 'Servizi e competenze spiegati con struttura e fonti chiare.' },
  ],
  deliverablesTitle: 'Dalla ricerca dell’argomento alla pagina pronta per essere trovata.',
  deliverablesIntro: 'Il servizio coordina pianificazione, produzione e pubblicazione. Nessun testo viene messo online senza controllo umano.',
  deliverables: [
    { title: 'Piano editoriale mensile', text: 'Selezioniamo 12 temi partendo da offerta, pubblico, stagionalita e intenzioni di ricerca pertinenti.' },
    { title: 'Articoli completi', text: 'Titolo, introduzione, sezioni H2, risposte dirette, CTA e collegamenti interni coerenti.' },
    { title: 'SEO on-page', text: 'Meta title, meta description, slug, keyword target e struttura leggibile dai motori di ricerca.' },
    { title: 'GEO e FAQ', text: 'Blocchi citabili, entità esplicite, FAQ visibili e dati strutturati corretti, senza garanzie di citazione.' },
    { title: 'Revisione umana', text: 'Controlliamo accuratezza, tono del brand, claim e leggibilita prima della pubblicazione.' },
    { title: 'Pubblicazione o consegna', text: 'Pubblicazione automatica sul blog collegato a SWA; per CMS esterni definiamo integrazione o consegna HTML.' },
  ],
  process: [
    { number: '01', title: 'Raccolta', text: 'Servizi, pubblico, fonti, tono e priorita commerciali.' },
    { number: '02', title: 'Piano', text: 'Dodici temi ordinati per intento e collegamenti interni.' },
    { number: '03', title: 'Produzione', text: 'Articoli, metadati, FAQ, immagini e dati strutturati.' },
    { number: '04', title: 'Controllo', text: 'Revisione, approvazione e pubblicazione sul canale concordato.' },
  ],
  faq: [
    { q: 'Gli articoli vengono pubblicati automaticamente sul mio sito?', a: 'Sul blog collegato alla piattaforma SWA si. Per WordPress, Shopify o altri CMS verifichiamo prima l’integrazione disponibile; in alternativa consegniamo HTML e metadati pronti per la pubblicazione.' },
    { q: 'Sono davvero inclusi 12 articoli ogni mese?', a: 'Sì. Il piano prevede 12 articoli mensili, distribuiti secondo il calendario editoriale concordato e sottoposti a controllo prima della pubblicazione.' },
    { q: 'Potete garantire traffico o prima posizione?', a: 'No. La frequenza e la qualità migliorano copertura e possibilità di posizionamento, ma ranking, traffico e citazioni dipendono anche da concorrenza, autorevolezza e stato tecnico del sito.' },
    { q: 'Cosa succede nei 14 giorni iniziali?', a: 'Configuriamo il perimetro e avviamo il primo ciclo editoriale, così puoi verificare processo e qualità prima di proseguire con continuità.' },
  ],
  related: [
    { href: '/servizi/seo-geo', label: 'SEO + GEO' },
    { href: '/servizi/siti-e-commerce', label: 'Siti ed e-commerce' },
    { href: '/blog', label: 'SWA Journal' },
  ],
} satisfies MarketingDetailConfig

export default function BlogSeoPage() {
  return <MarketingDetailPage config={config} />
}
