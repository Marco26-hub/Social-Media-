import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, CalendarClock, Clapperboard, ClipboardCheck, FileSearch, Globe2, Newspaper, PhoneCall, Scale, Share2, Target, Workflow } from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/styles/english.module.css'

const title = 'Digital Services for SMEs | Social Web Automation'
const description = 'Managed social media, SEO and GEO, blog content, websites, B2B lead research and an AI phone assistant, coordinated by one team with published prices.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/services`,
    languages: { 'it-IT': `${SITE_URL}/servizi`, en: `${SITE_URL}/en/services`, 'x-default': `${SITE_URL}/servizi` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/services`, locale: 'en_US' , images: ['/og.png'], type: 'website',},
  twitter: { title, description },
}

const services = [
  { id: 'social', icon: Share2, title: 'Managed social media', text: 'Monthly strategy, channel-specific content, media planning, approval and publishing. Presence covers 2 channels and 16 pieces; Growth covers 2 channels and 24 pieces.' },
  { id: 'seo', icon: FileSearch, title: 'SEO + GEO strategy', text: 'Audit, intent mapping, information architecture, technical priorities, entities and structured data. This defines what to improve; it is not the monthly article-production plan.' },
  { id: 'blog', icon: Newspaper, title: 'Blog SEO + GEO', text: 'The ongoing execution layer: 12 articles each month, editorial planning, on-page metadata, FAQs, human review and publishing or CMS-ready delivery.' },
  { id: 'web', icon: Globe2, title: 'Websites and e-commerce', text: 'Landing pages, corporate websites and online stores built for clear offers, mobile use, analytics, SEO foundations and measurable conversion paths.' },
  { id: 'leads', icon: Target, title: 'B2B lead research', text: 'We define the ideal company profile, research up to 30 matching organisations and provide sources, exclusions and priorities. No automated outreach and no guaranteed meetings or sales.' },
  { id: 'video', icon: Clapperboard, title: 'Video shot on site', text: 'We come and film where you work, with a photographer, lights and proper lenses. Four monthly plans, from 5 to 20 vertical videos a month, spread across the weeks rather than delivered in one batch. From €590 per month; travel inside the agreed area is included.' },
  { id: 'phone', icon: PhoneCall, title: 'AI phone assistant', text: 'A number that answers while your hands are busy. It gives the services, prices and opening hours you approved, reads the calendar and books a slot; anything outside the rules is passed to you. From €199 per month, 600 minutes included — about five hours of phone.' },
  { id: 'agenda', icon: CalendarClock, title: 'Diary and client recall', text: 'Each day the system reads the diary and the history, finds who has not come back and drafts the message. Nothing leaves without your yes. From €390 per month, 1000 messages included. No guarantee on how many people return.' },
  { id: 'jobs', icon: ClipboardCheck, title: 'Job reports and field work', text: 'For work done away from the office: checklists built on your real services, photos, hours, the client signature on the phone and a PDF before the team leaves. Paired with a website that turns requests into jobs. Quoted after review.' },
  { id: 'systems', icon: Workflow, title: 'Systems automation', text: 'The management system, CRM, forms and archive stop asking for the same data three times. We connect what already works through the available interfaces and build from scratch only where no standard exists. Quoted after mapping the flows.' },
  { id: 'compliance', icon: Scale, title: 'AI Act, GDPR and compliance', text: 'Operational assessment, policies and documented responsibilities for companies using AI and personal data. Legal representation and certifications are not included unless agreed separately.' },
]

export default function EnglishServicesPage() {
  // Queste pagine avevano solo il grafo del layout: nessun WebPage, nessuna
  // lingua dichiarata, nessuna briciola. Per un motore erano senza contesto.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${SITE_URL}/en/services#webpage`,
        url: `${SITE_URL}/en/services`,
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
          { '@type': 'ListItem', position: 2, name: 'Services', item: `${SITE_URL}/en/services` },
        ],
      },
    ],
  }

  return (
    <main id="main-content" className={styles.main}>
      {/* Sette pagine inglesi non avevano ne il link di salto ne un
          bersaglio su <main>: chi naviga da tastiera doveva attraversare
          tutto il menu a ogni pagina. La classe esisteva gia, mancava
          solo di essere usata. */}
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>Eleven distinct capabilities</p><h1>One service map, with clear boundaries.</h1><p className={styles.heroLead}>Use social and Blog to build awareness, SEO + GEO to improve discovery, Web to convert, B2B research to find opportunities and compliance to operate responsibly.</p><div className={styles.actions}><Link className={styles.primary} href="/en/pricing">Compare offers <ArrowRight size={16} aria-hidden="true" /></Link><Link className={styles.secondary} href="/servizi">Italian details</Link></div></div>
        <aside className={styles.heroPanel}><strong>What remains deliberately separate.</strong><ol><li>SEO + GEO means search work plus clearer pages for AI answer tools.</li><li>Blog SEO + GEO produces 12 monthly articles.</li><li>B2B research supplies verified companies, not guaranteed sales.</li><li>Included work is confirmed before activation.</li></ol></aside>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Service catalogue</p><h2>Choose the operational result you need now.</h2></div>
        <div className={styles.grid}>{services.map(service => { const Icon = service.icon; return <article id={service.id} className={styles.service} key={service.id}><Icon size={25} aria-hidden="true" /><h3>{service.title}</h3><p>{service.text}</p><Link href="/en/pricing">Scope and pricing <ArrowRight size={15} aria-hidden="true" /></Link></article> })}</div>
      </section>
      <section className={styles.closing}><div><p className={styles.eyebrow}>Not sure where to start?</p><h2>Identify the current constraint first.</h2><p>A short assessment can separate visibility, conversion and commercial research problems before work begins.</p></div><Link className={styles.primary} href="/en/pricing">View packages <ArrowRight size={16} aria-hidden="true" /></Link></section>
    </main>
  )
}
