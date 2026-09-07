import type { Metadata } from 'next'
import { Building2, Car, Droplets, HeartPulse, Plug, Scissors, Smile, Sparkles, Stethoscope, UtensilsCrossed, Wrench, type LucideIcon } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import type { Settore } from '@/lib/settori'
import { SITE_URL } from '@/lib/site-config'

// Le landing di settore riusano l'impaginazione delle pagine servizio: stessa
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

export function percorsoSettore(settore: Settore): string {
  return `/settori/${settore.slug}`
}

export function metadataSettore(settore: Settore): Metadata {
  const url = `${SITE_URL}${percorsoSettore(settore)}`
  return {
    title: settore.titoloSeo,
    description: settore.descrizioneSeo,
    keywords: [settore.nome.toLowerCase(), settore.servizio.toLowerCase()],
    alternates: { canonical: url },
    openGraph: { title: settore.titoloSeo, description: settore.descrizioneSeo, url, type: 'website' },
    twitter: { card: 'summary_large_image', title: settore.titoloSeo, description: settore.descrizioneSeo },
  }
}

export default function SettorePage({ settore }: { settore: Settore }) {
  const config: MarketingDetailConfig = {
    path: percorsoSettore(settore),
    breadcrumbParent: { label: 'Settori', href: '/settori' },
    eyebrow: settore.eyebrow,
    title: settore.h1,
    lead: settore.lead,
    serviceName: settore.servizio,
    serviceType: settore.tipoServizio,
    promise: settore.promessa,
    priceNote: settore.notaPrezzi,
    primaryCtaLabel: 'Richiedi una call',
    primaryCtaHref: '/consulenza',
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
