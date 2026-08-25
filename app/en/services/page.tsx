import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileSearch, Globe2, Newspaper, Scale, Share2, Target } from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'Digital Services for SMEs | Social Web Automation'
const description = 'Managed social media, SEO and GEO strategy, 12-article Blog plans, websites, B2B lead research and AI compliance for SMEs.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/services`,
    languages: { 'it-IT': `${SITE_URL}/servizi`, en: `${SITE_URL}/en/services`, 'x-default': `${SITE_URL}/servizi` },
  },
}

const services = [
  { id: 'social', icon: Share2, title: 'Managed social media', text: 'Monthly strategy, channel-specific content, media planning, approval and publishing. Presence covers 2 channels and 16 pieces; Growth covers 3 channels and 24 pieces.' },
  { id: 'seo', icon: FileSearch, title: 'SEO + GEO strategy', text: 'Audit, intent mapping, information architecture, technical priorities, entities and structured data. This defines what to improve; it is not the monthly article-production plan.' },
  { id: 'blog', icon: Newspaper, title: 'Blog SEO + GEO', text: 'The ongoing execution layer: 12 articles each month, editorial planning, on-page metadata, FAQs, human review and publishing or CMS-ready delivery.' },
  { id: 'web', icon: Globe2, title: 'Websites and e-commerce', text: 'Landing pages, corporate websites and online stores built for clear offers, mobile use, analytics, SEO foundations and measurable conversion paths.' },
  { id: 'leads', icon: Target, title: 'B2B lead research', text: 'We define the ideal company profile, research up to 30 matching organisations and provide sources, exclusions and priorities. No automated outreach and no guaranteed meetings or sales.' },
  { id: 'compliance', icon: Scale, title: 'AI Act, GDPR and compliance', text: 'Operational assessment, policies and documented responsibilities for companies using AI and personal data. Legal representation and certifications are outside the stated scope.' },
]

export default function EnglishServicesPage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>Six distinct capabilities</p><h1>One service map, with clear boundaries.</h1><p className={styles.heroLead}>Use social and Blog to build awareness, SEO + GEO to improve discovery, Web to convert, B2B research to find opportunities and compliance to operate responsibly.</p><div className={styles.actions}><Link className={styles.primary} href="/en/pricing">Compare offers <ArrowRight size={16} /></Link><Link className={styles.secondary} href="/servizi">Italian details</Link></div></div>
        <aside className={styles.heroPanel}><strong>What remains deliberately separate.</strong><ol><li>SEO + GEO defines audit, architecture and priorities.</li><li>Blog SEO + GEO produces 12 monthly articles.</li><li>B2B research supplies verified companies, not guaranteed sales.</li><li>Every scope is confirmed before activation.</li></ol></aside>
      </section>
      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Service catalogue</p><h2>Choose the operational result you need now.</h2></div>
        <div className={styles.grid}>{services.map(service => { const Icon = service.icon; return <article id={service.id} className={styles.service} key={service.id}><Icon size={25} /><h3>{service.title}</h3><p>{service.text}</p><Link href="/en/pricing">Scope and pricing <ArrowRight size={15} /></Link></article> })}</div>
      </section>
      <section className={styles.closing}><div><p className={styles.eyebrow}>Not sure where to start?</p><h2>Identify the current constraint first.</h2><p>A short assessment can separate visibility, conversion and commercial research problems before work begins.</p></div><Link className={styles.primary} href="/en/pricing">View packages <ArrowRight size={16} /></Link></section>
    </main>
  )
}
