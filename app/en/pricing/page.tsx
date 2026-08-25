import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'Pricing: Social, Blog, Web and B2B Lead Research | SWA'
const description = 'Transparent starting prices for managed social media, Blog SEO + GEO, websites and the B2B Lead Research Pilot.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/pricing`,
    languages: { 'it-IT': `${SITE_URL}/pacchetti`, en: `${SITE_URL}/en/pricing`, 'x-default': `${SITE_URL}/pacchetti` },
  },
}

const offers = [
  { name: 'Presence', price: '€390 / month', result: 'Consistent presence across 2 social channels.', features: ['16 monthly content pieces', '4 Reels, Stories or Shorts', 'Strategy, review and publishing'], href: '/register?piano=presenza', cta: 'Start Presence' },
  { name: 'Growth', price: '€790 / month', result: 'A wider system across 3 social channels.', features: ['24 monthly content pieces', '6 Reels, Stories or Shorts', '1 SEO + GEO article', 'Management of 1 ad campaign; media budget excluded'], href: '/register?piano=crescita', cta: 'Start Growth' },
  { name: 'Blog SEO + GEO', price: '€29.90 / month', result: 'Continuous organic editorial production.', features: ['12 articles per month', 'Metadata, FAQs and structured content', 'Human review', 'Connected-blog publishing or CMS-ready delivery'], href: '/acquista?servizio=blog-seo', cta: 'Activate Blog' },
  { name: 'Web & Commerce', price: 'From €19.90 / month', result: 'A website that supports conversion.', features: ['Landing page, corporate site or e-commerce', 'Responsive UX and SEO foundations', 'Analytics and integrations', 'The website becomes yours after 12 months'], href: '/acquista?servizio=web-commerce', cta: 'Request Web scope' },
  { name: 'B2B Lead Research Pilot', price: '€149 one-off', result: 'A verified list for commercial evaluation.', features: ['Ideal-company profile', 'Up to 30 companies researched', 'Public sources and priorities', 'No automated outreach or guaranteed sales'], href: '/acquista?servizio=lead-pilot', cta: 'Activate the Pilot' },
]

export default function EnglishPricingPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>Transparent commercial scope</p><h1>Start with one measurable service.</h1><p className={styles.heroLead}>All prices exclude VAT. External platform, advertising, domain and third-party costs remain separate unless explicitly included.</p></div>
        <aside className={styles.heroPanel}><strong>Before activation.</strong><ol><li>We confirm the intended result and service scope.</li><li>You see deliverables, exclusions and review points.</li><li>Checkout uses the live SWA payment flow.</li><li>Custom integrations are quoted separately.</li></ol></aside>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Offers</p><h2>Social plans and standalone services.</h2><p>Blog, Web and B2B Lead Research can be activated independently or combined with a social plan.</p></div>
        <div className={styles.priceGrid}>{offers.map(offer => <article className={styles.priceCard} key={offer.name}><h2>{offer.name}</h2><p>{offer.result}</p><p className={styles.price}>{offer.price}</p><ul>{offer.features.map(feature => <li key={feature}>{feature}</li>)}</ul><Link className={styles.primary} href={offer.href}>{offer.cta} <ArrowRight size={15} /></Link><p className={styles.note}>VAT excluded. Scope and eligibility confirmed before delivery.</p></article>)}</div>
      </section>
    </main>
  )
}
