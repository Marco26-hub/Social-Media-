import type { Metadata } from 'next'
import { Newspaper } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { SITE_URL } from '@/lib/site-config'
import { PREZZI } from '@/lib/prezzi-ingresso'

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
    { q: 'Quanti articoli sono compresi ogni mese?', a: `Il piano comprende ${BLOG_SERVICE.articlesPerMonth} articoli al mese a ${PREZZI.blog}, IVA esclusa, distribuiti su un calendario editoriale costruito sugli intenti di ricerca reali. Ogni articolo arriva completo di title, meta description, slug, FAQ visibili e dati strutturati: è pronto da pubblicare, non una bozza da sistemare.` },
    { q: 'Che differenza c’è rispetto alla consulenza SEO + GEO?', a: 'Sono due lavori diversi: SEO + GEO definisce audit, struttura, intenti e priorità, mentre Blog SEO + GEO produce con continuità i contenuti. La consulenza decide dove andare, il blog cammina. Si possono attivare separatamente, ma un piano editoriale costruito su una mappa degli intenti rende molto più della somma delle due cose.' },
    { q: 'Gli articoli vengono pubblicati sul mio sito?', a: 'Sì sul blog collegato alla nostra piattaforma, dove la pubblicazione è automatica dopo la tua approvazione. Per WordPress, Shopify o altri CMS verifichiamo prima l’integrazione: se non è affidabile consegniamo HTML e metadati pronti da incollare, invece di promettere un collegamento che poi si rompe a ogni aggiornamento.' },
    { q: 'Chi decide gli argomenti?', a: 'Li proponiamo noi partendo dalle domande che le persone fanno davvero nel tuo settore, e li approvi tu prima della scrittura. Nessun articolo parte da un titolo inventato a tavolino: la lista arriva ordinata per intento di ricerca, così vedi subito quali pezzi rispondono a chi sta comprando e quali a chi si sta informando.' },
    { q: 'Chi controlla i testi prima della pubblicazione?', a: 'Ogni articolo passa da una revisione umana prima di uscire, sempre. L’AI accelera ricerca e prima stesura, ma il controllo di accuratezza, tono e coerenza con quello che fai davvero resta a una persona. È il motivo per cui non pubblichiamo dodici pezzi identici a quelli di chiunque altro nel tuo settore.' },
    { q: 'Potete garantire traffico o posizionamento?', a: 'No, e non lo scriviamo da nessuna parte. Frequenza e qualità aumentano la copertura delle ricerche e le possibilità di essere citati, ma il ranking dipende da algoritmi di terzi e dai concorrenti. Garantiamo la produzione: 12 articoli al mese, con revisione umana e struttura verificabile.' },
    { q: 'Che cosa succede nei primi 14 giorni?', a: 'Hai 14 giorni per valutare il servizio: definiamo temi, piano editoriale e primo ciclo, così vedi il metodo e la qualità su pezzi veri prima di andare avanti. Non è una prova gratuita, è una finestra in cui puoi fermarti avendo già visto il lavoro.' },
    { q: 'Gli articoli restano miei?', a: 'Sì, i contenuti prodotti e pubblicati sono tuoi e restano tuoi anche se interrompi il servizio. Se il blog è ospitato sulla nostra piattaforma, li consegniamo in un formato riutilizzabile: non tratteniamo il lavoro pagato come garanzia sul rinnovo.' },
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
