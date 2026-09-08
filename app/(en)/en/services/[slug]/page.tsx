import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import MarketingDetailPage, { type MarketingDetailConfig } from '@/components/MarketingDetailPage'
import { anteprimaOg } from '@/lib/anteprima'
import { SERVIZI_EN, servizioEn } from '@/lib/servizi.en'
import { SITE_URL } from '@/lib/site-config'

// Le schede di servizio inglesi.
//
// Una rotta sola invece di dieci file: il contenuto sta in lib/servizi.en.ts,
// dove sta accanto agli altri testi inglesi ed e' confrontabile con
// l'originale. Le pagine italiane restano una per cartella perche' sono nate
// cosi' e hanno ognuna le proprie eccezioni; queste no.

export function generateStaticParams() {
  return SERVIZI_EN.map(s => ({ slug: s.slug }))
}

export const dynamicParams = false

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const servizio = servizioEn(slug)
  if (!servizio) return {}
  const url = `${SITE_URL}/en/services/${slug}`
  return {
    title: servizio.title,
    description: servizio.description,
    alternates: {
      canonical: url,
      // La gemella italiana esiste, e adesso e' una sola: la coppia e'
      // reciproca e hreflang vale di nuovo qualcosa.
      languages: {
        'it-IT': `${SITE_URL}${servizio.slugIt}`,
        en: url,
        'x-default': `${SITE_URL}${servizio.slugIt}`,
      },
    },
    openGraph: {
      title: servizio.title,
      description: servizio.description,
      url,
      type: 'website',
      locale: 'en_US',
      images: anteprimaOg(`/en/services/${slug}`),
    },
    twitter: {
      card: 'summary_large_image',
      title: servizio.title,
      description: servizio.description,
      images: anteprimaOg(`/en/services/${slug}`),
    },
  }
}

export default async function ServizioEnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const servizio = servizioEn(slug)
  if (!servizio) notFound()

  const config: MarketingDetailConfig = {
    ...servizio.config,
    path: `/en/services/${slug}`,
    locale: 'en',
    breadcrumbParent: { label: 'Services', href: '/en/services' },
  }
  return <MarketingDetailPage config={config} />
}
