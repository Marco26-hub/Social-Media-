import type { Metadata } from 'next'
import { Building2, Car, Droplets, HeartPulse, Plug, Scissors, Smile, Sparkles, Stethoscope, UtensilsCrossed, Wrench, type LucideIcon } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { prezzoMinimoSettore, type Settore } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { SITE_URL } from '@/lib/site-config'

// Le landing di settore riusano l’impaginazione delle pagine servizio: stessa
// struttura, stessi dati strutturati, stessa resa in tema notte. Cambia solo
// da dove si entra — la categoria invece del prodotto — e quello vive in
// lib/settori.ts.

const ICONE: Record<string, LucideIcon> = {
  autosaloni: Car,
  parrucchieri: Scissors,
  'agenzie-immobiliari': Building2,
  'imprese-di-pulizia': Droplets,
  'centri-estetici': Sparkles,
  'cliniche-estetiche': Stethoscope,
  'studi-dentistici': Smile,
  'fisioterapia-osteopatia': HeartPulse,
  'officine-e-servizi-locali': Wrench,
  'ristoranti-e-bar': UtensilsCrossed,
  'elettricisti-e-idraulici': Plug,
}

export type SettoreLocale = 'it' | 'en'

export function percorsoSettore(settore: Settore, locale: SettoreLocale = 'it'): string {
  return locale === 'en' ? `/en/settori/${settore.slug}` : `/settori/${settore.slug}`
}

export function metadataSettore(settore: Settore, locale: SettoreLocale = 'it'): Metadata {
  const path = percorsoSettore(settore, locale)
  const url = `${SITE_URL}${path}`
  const haTraduzione = SETTORI_EN.some(s => s.slug === settore.slug)
  const italiano = `/settori/${settore.slug}`
  const inglese = `/en/settori/${settore.slug}`
  return {
    title: settore.titoloSeo,
    description: settore.descrizioneSeo,
    keywords: [settore.nome.toLowerCase(), settore.servizio.toLowerCase()],
    alternates: {
      canonical: url,
      // Reciproco: prima il ramo italiano restituiva undefined, quindi la
      // pagina EN dichiarava la IT e la IT non dichiarava la EN. Senza
      // reciprocita' il gruppo linguistico non viene consolidato. Si emette
      // solo quando la traduzione esiste davvero.
      languages: haTraduzione
        ? { 'it-IT': `${SITE_URL}${italiano}`, en: `${SITE_URL}${inglese}`, 'x-default': `${SITE_URL}${italiano}` }
        : undefined,
    },
    openGraph: { title: settore.titoloSeo, description: settore.descrizioneSeo, url, type: 'website', locale: locale === 'en' ? 'en_US' : 'it_IT' , images: ['/og.png']},
    twitter: { card: 'summary_large_image', title: settore.titoloSeo, description: settore.descrizioneSeo },
  }
}

export default function SettorePage({ settore, locale = 'it' }: { settore: Settore; locale?: SettoreLocale }) {
  const isEnglish = locale === 'en'
  const config: MarketingDetailConfig = {
    path: percorsoSettore(settore, locale),
    locale: isEnglish ? 'en' : 'it',
    breadcrumbParent: isEnglish ? { label: 'Sectors', href: '/en/settori' } : { label: 'Settori', href: '/settori' },
    eyebrow: settore.eyebrow,
    title: settore.h1,
    lead: settore.lead,
    serviceName: settore.servizio,
    entityName: settore.nome,
    serviceType: settore.tipoServizio,
    promise: settore.promessa,
    priceNote: settore.notaPrezzi,
    startingPrice: prezzoMinimoSettore(settore),
    primaryCtaLabel: isEnglish ? 'Book a call' : 'Richiedi una call',
    // /consulenza e' la consulenza legale a pagamento su AI Act e GDPR: chi
    // arriva da una pagina di settore cerca il proprio mestiere, non un
    // avvocato. La richiesta di call va sul canale diretto, con il settore
    // gia' scritto nel messaggio.
    primaryCtaHref: `https://wa.me/393477196603?text=${encodeURIComponent(isEnglish ? `Hello, I work in ${settore.nome.toLowerCase()} and I would like to book a call.` : `Ciao! Lavoro nel settore ${settore.nome.toLowerCase()} e vorrei una call.`)}`,
    icon: ICONE[settore.slug] ?? Building2,
    signals: settore.segnali,
    outcomes: settore.risultati,
    deliverablesTitle: settore.cosaTitolo,
    deliverablesIntro: settore.cosaIntro,
    deliverables: settore.cosaFacciamo,
    process: settore.ciclo,
    faq: settore.faq,
    related: settore.correlati,
  }

  return <MarketingDetailPage config={config} />
}
