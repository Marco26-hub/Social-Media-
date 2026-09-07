import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check } from 'lucide-react'
import { EN_PRICE_LABELS } from '@/lib/english-content'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'Pricing: Social, Blog, Web and B2B Lead Research | SWA'
const description = 'Transparent starting prices for managed social media, Blog SEO + GEO, websites, the B2B Lead Research Pilot and the AI phone assistant. VAT excluded.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/pricing`,
    languages: { 'it-IT': `${SITE_URL}/pacchetti`, en: `${SITE_URL}/en/pricing`, 'x-default': `${SITE_URL}/pacchetti` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/pricing`, locale: 'en_US' },
  twitter: { title, description },
}

// Il prezzo numerico serve ai dati strutturati: l'etichetta e' testo per il
// lettore («€490 per month»), non un valore che un motore possa leggere.
const offers = [
  { name: 'Presence', audience: 'Professionals and small businesses', valore: '490', ricorrente: true, setup: 'Setup included', price: EN_PRICE_LABELS.presence, result: 'Consistent presence across 2 social channels.', features: ['16 monthly content pieces per channel · 32 published posts', '4 Reels, Stories or Shorts per channel', 'Strategy, review and publishing'], href: '/register?piano=presenza', cta: 'Start Presence' },
  { name: 'Growth', audience: 'SMEs focused on results', badge: 'Most chosen', evidenza: true, valore: '990', ricorrente: true, setup: 'Setup included', price: EN_PRICE_LABELS.growth, result: 'A wider system across 2 social channels.', features: ['24 monthly content pieces per channel · 48 published posts', '6 Reels, Stories or Shorts per channel', '1 SEO + GEO article and competitor analysis', 'Organic growth only; paid campaigns sit in the custom plan'], href: '/register?piano=crescita', cta: 'Start Growth' },
  { name: 'Blog SEO + GEO', audience: 'Organic content', accento: 'blog', valore: '29.90', ricorrente: true, setup: '14 days to evaluate the service', price: EN_PRICE_LABELS.blog, result: 'Continuous organic editorial production.', features: ['12 articles per month', 'Metadata, FAQs and structured content', 'Human review', 'Connected-blog publishing or CMS-ready delivery'], href: '/acquista?servizio=blog-seo', cta: 'Activate Blog' },
  { name: 'Basic Website', audience: 'Your own presence', accento: 'web', valore: '19.90', ricorrente: true, setup: 'Yours after 12 months of subscription', price: EN_PRICE_LABELS.web, result: 'A landing page or essential website that supports conversion.', features: ['Simple landing page or basic corporate site', 'E-commerce quoted separately', 'Responsive UX and SEO foundations', 'The website becomes yours after 12 months'], href: '/acquista?servizio=web-commerce', cta: 'Request website details' },
  { name: 'Video shot on site', audience: 'Businesses that publish weekly', accento: 'video', valore: String(VIDEO_PACCHETTI[0].prezzo), ricorrente: true, setup: 'Travel inside the agreed area included', price: EN_PRICE_LABELS.video, result: 'Filmed where you work, spread across the month.', features: [
    `${VIDEO_PACCHETTI[0].video} vertical videos a month in ${VIDEO_PACCHETTI[0].sessioni} filming session`,
    'Concept, script, shooting, editing, subtitles and graphics',
    'Videos are spread across the weeks, not delivered in one batch',
    `Four plans: ${VIDEO_PACCHETTI.map(v => `${v.nome} ${v.video} videos €${v.prezzo}`).join(' · ')}`,
  ], href: '/acquista?servizio=video-start', cta: 'Start with Start' },
  { name: 'B2B Lead Research Pilot', audience: 'One-off pilot', accento: 'lead', largo: true, valore: '149', ricorrente: false, setup: 'No subscription, no automated outreach', price: EN_PRICE_LABELS.leadPilot, result: 'A verified list for commercial evaluation.', features: ['Ideal-company profile', 'Up to 30 companies researched', 'Public sources and priorities', 'No automated outreach or guaranteed sales'], href: '/acquista?servizio=lead-pilot', cta: 'Activate the Pilot' },
]

export default function EnglishPricingPage() {
  // La pagina prezzi inglese non dichiarava un solo Offer: i prezzi
  // esistevano come testo e nessun motore poteva leggerli.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/en/pricing#webpage`,
        url: `${SITE_URL}/en/pricing`,
        name: title,
        description,
        inLanguage: 'en',
        isPartOf: { '@id': `${SITE_URL}/#website` },
        about: { '@id': `${SITE_URL}/#organization` },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` },
          { '@type': 'ListItem', position: 2, name: 'Pricing', item: `${SITE_URL}/en/pricing` },
        ],
      },
      {
        '@type': 'OfferCatalog',
        '@id': `${SITE_URL}/en/pricing#catalog`,
        name: 'Social Web Automation services and packages',
        itemListElement: offers.map(offer => ({
          '@type': 'Offer',
          name: offer.name,
          url: `${SITE_URL}${offer.href}`,
          price: offer.valore,
          priceCurrency: 'EUR',
          availability: 'https://schema.org/InStock',
          seller: { '@id': `${SITE_URL}/#organization` },
          priceSpecification: {
            '@type': 'UnitPriceSpecification',
            price: offer.valore,
            priceCurrency: 'EUR',
            valueAddedTaxIncluded: false,
            ...(offer.ricorrente ? { unitCode: 'MON', billingDuration: 1, billingIncrement: 1 } : {}),
          },
        })),
      },
    ],
  }

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>Transparent pricing</p><h1>Start with one measurable service.</h1><p className={styles.heroLead}>All prices exclude VAT. External platform, advertising, domain and third-party costs remain separate unless explicitly included.</p></div>
        <aside className={styles.heroPanel}><strong>Before activation.</strong><ol><li>We confirm the intended result and included work.</li><li>You see deliverables, exclusions and review points.</li><li>Checkout uses the live SWA payment flow.</li><li>Custom integrations are quoted separately.</li></ol></aside>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Offers</p><h2>Social plans and standalone services.</h2><p>Blog, Web and B2B Lead Research can be activated independently or combined with a social plan.</p></div>
        <div className={styles.priceGrid}>
          {offers.map(offer => (
            <article
              key={offer.name}
              className={[
                styles.priceCard,
                offer.evidenza ? styles.featured : '',
                offer.accento === 'blog' ? styles.blogCard : '',
                offer.accento === 'web' ? styles.webCard : '',
                offer.accento === 'video' ? styles.videoCard : '',
                offer.accento === 'lead' ? styles.leadCard : '',
              ].filter(Boolean).join(' ')}
            >
              <div className={styles.priceTop}>
                <div>
                  <span className={styles.audience}>{offer.audience}</span>
                  <h3>{offer.name}</h3>
                </div>
                {offer.badge && <b className={styles.badge}>{offer.badge}</b>}
              </div>
              <p className={styles.result}>{offer.result}</p>
              <p className={styles.price}>
                <span className={styles.priceLabel}>{offer.ricorrente ? 'Monthly fee' : 'One-off'}</span>
                {/* L'etichetta sopra dice gia' la cadenza: ripeterla nel prezzo
                    dava «Monthly fee — From €19.90 / month». */}
                {offer.price.replace(' / month', '').replace(' one-off', '')}
              </p>
              <p className={styles.setup}>{offer.setup}</p>
              <ul>{offer.features.map(feature => <li key={feature}><Check size={15} aria-hidden="true" /> {feature}</li>)}</ul>
              <Link className={styles.primary} href={offer.href}>{offer.cta} <ArrowRight size={15} aria-hidden="true" /></Link>
              <p className={styles.note}>VAT excluded. Scope and eligibility confirmed before delivery.</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  )
}
