import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, FileSearch, Globe2, Newspaper, Scale, Share2, Target } from 'lucide-react'
import { SITE_URL } from '@/lib/site-config'
import styles from './english.module.css'

const title = 'Social, SEO, Websites and B2B Leads for SMEs | SWA'
const description = 'Social Web Automation integrates managed social media, SEO and GEO content, websites and e-commerce, B2B lead research and AI compliance.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en`,
    languages: { 'it-IT': SITE_URL, en: `${SITE_URL}/en`, 'x-default': SITE_URL },
  },
  openGraph: { title, description, url: `${SITE_URL}/en`, locale: 'en' },
  twitter: { title, description },
}

const services = [
  { icon: Share2, title: 'Managed social media', text: 'Strategy, content, approval and multichannel publishing under human control.', href: '/en/services#social' },
  { icon: FileSearch, title: 'SEO + GEO strategy', text: 'Audit, information architecture, structured data and priorities for search and AI systems.', href: '/en/services#seo' },
  { icon: Newspaper, title: 'Blog SEO + GEO', text: 'A continuous production service: 12 reviewed articles per month and publishing support.', href: '/en/services#blog' },
  { icon: Globe2, title: 'Websites and e-commerce', text: 'Conversion-focused websites connected to analytics, content and campaigns.', href: '/en/services#web' },
  { icon: Target, title: 'B2B lead research', text: 'A verified, prioritised list of target companies based on transparent public sources.', href: '/en/services#leads' },
  { icon: Scale, title: 'AI and data compliance', text: 'Operational guidance for AI Act, GDPR, policies and accountable AI use.', href: '/en/services#compliance' },
]

const journey = [
  ['01', 'Build awareness', 'Social media and continuous editorial content.'],
  ['02', 'Be discoverable', 'SEO, GEO and clear digital entities.'],
  ['03', 'Convert demand', 'Websites, landing pages and e-commerce.'],
  ['04', 'Find opportunities', 'Qualified B2B company research.'],
  ['05', 'Operate responsibly', 'AI Act, GDPR and governance.'],
]

export default function EnglishHomePage() {
  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>Managed digital operations for SMEs</p>
          <h1>Social, SEO, websites and B2B opportunities. One operating method.</h1>
          <p className={styles.heroLead}>We connect visibility, organic discovery, conversion and prospect research. AI speeds up production; human review protects accuracy, brand coherence and decisions.</p>
          <div className={styles.actions}>
            <Link className={styles.primary} href="/en/services">Explore services <ArrowRight size={16} /></Link>
            <Link className={styles.secondary} href="/en/pricing">View pricing</Link>
          </div>
        </div>
        <aside className={styles.heroPanel} aria-label="How the system works">
          <strong>A connected system, not isolated deliverables.</strong>
          <ol>
            <li>We define audience, offer, objectives and constraints.</li>
            <li>We assign each channel a measurable operational role.</li>
            <li>You review what matters before publication or delivery.</li>
            <li>We improve priorities using real evidence.</li>
          </ol>
        </aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}>
          <p className={styles.eyebrow}>Integrated services</p>
          <h2>Every service has a distinct job in the customer journey.</h2>
          <p>SEO strategy and ongoing Blog production are separate. Lead research supports commercial decisions; it does not promise appointments or sales.</p>
        </div>
        <div className={styles.grid}>
          {services.map(service => {
            const Icon = service.icon
            return <article className={styles.service} key={service.title}><Icon size={24} /><h3>{service.title}</h3><p>{service.text}</p><Link href={service.href}>Details <ArrowRight size={15} /></Link></article>
          })}
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Commercial logic</p><h2>From recognition to responsible growth.</h2></div>
        <div className={styles.journey}>{journey.map(([n, name, text]) => <article key={n}><span>{n}</span><h3>{name}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Evidence before claims</p><h2>See the process and scope before you buy.</h2></div>
        <div className={styles.proofGrid}>
          <article className={styles.proof}><h3>Public method</h3><p>Scope, approvals, responsibilities and limits are stated clearly.</p></article>
          <article className={styles.proof}><h3>Real portfolio</h3><p>Website projects can be inspected instead of being described through generic claims.</p></article>
          <article className={styles.proof}><h3>Editorial examples</h3><p>The public Journal shows content structure, tone and publishing quality.</p></article>
          <article className={styles.proof}><h3>Transparent pilots</h3><p>The B2B Pilot has a fixed scope, verifiable sources and no guaranteed outcomes.</p></article>
        </div>
      </section>

      <section className={styles.closing}>
        <div><p className={styles.eyebrow}>Choose the right starting point</p><h2>Start with the bottleneck, then connect the system.</h2><p>We can begin with one service and add the next only when it supports a real business need.</p></div>
        <Link className={styles.primary} href="/en/pricing">Compare offers <ArrowRight size={16} /></Link>
      </section>
    </main>
  )
}
