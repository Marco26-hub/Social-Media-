import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ClipboardCheck, Gauge, Search, Workflow } from 'lucide-react'
import { EN_FAQ_GROUPS, EN_METHOD_STEPS, EN_WHATSAPP_URL } from '@/lib/english-content'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'The SWA Method: assessment, production, approval | SWA'
const description = 'A clear operating method for SMEs: assessment, shared direction, production, approval, publishing and improvement with human control.'
const methodFaq = EN_FAQ_GROUPS[0].items

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/method`,
    languages: { 'it-IT': `${SITE_URL}/metodo`, en: `${SITE_URL}/en/method`, 'x-default': `${SITE_URL}/metodo` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/method`, locale: 'en_US' },
  twitter: { title, description },
}

export default function EnglishMethodPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/en/method`, name: title, description, inLanguage: 'en-US', isPartOf: { '@id': `${SITE_URL}/#website` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` }, { '@type': 'ListItem', position: 2, name: 'Method', item: `${SITE_URL}/en/method` }] },
      { '@type': 'FAQPage', mainEntity: methodFaq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
    ],
  }

  const icons = [Search, Workflow, ClipboardCheck, Gauge]

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>SWA operating system</p>
          <h1>A clear method for turning goals into verifiable work.</h1>
          <p className={styles.heroLead}>Every cycle moves through assessment, direction, production and improvement. The process reduces scattered decisions and keeps human control over the work that reaches customers.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Discuss your project <ArrowRight size={16} /></a>
            <Link className={styles.secondary} href="/en/pricing">Compare packages</Link>
          </div>
        </div>
        <aside className={styles.heroPanel}><strong>What the method protects.</strong><ol><li>Scope is agreed before production.</li><li>Each channel has a measurable role.</li><li>Approvals happen before publication.</li><li>Priorities improve from evidence.</li></ol></aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Four phases</p><h2>One flow, from assessment to reporting.</h2><p>Each phase has a defined outcome and prepares the next one, so strategy and execution do not drift apart.</p></div>
        <div className={styles.grid}>
          {EN_METHOD_STEPS.map((step, index) => {
            const Icon = icons[index]
            return <article className={styles.service} key={step.n}><Icon size={24} /><h3>{step.n}. {step.title}</h3><p>{step.text}</p><ul className={styles.checkList}>{step.items.map(item => <li key={item}><Check size={14} />{item}</li>)}</ul></article>
          })}
        </div>
      </section>

      <section className={styles.band}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Clear responsibilities</p><h2>AI, specialists and client have distinct roles.</h2><p>Automation accelerates the work; it does not replace direction, verification or accountability.</p></div>
        <div className={styles.proofGrid}>
          <article className={styles.proof}><h3>Social Web Automation</h3><p>Coordinates strategy, production, publishing, quality control and reporting.</p></article>
          <article className={styles.proof}><h3>Client</h3><p>Shares accurate information, approves work and owns business decisions.</p></article>
          <article className={styles.proof}><h3>Artificial intelligence</h3><p>Supports analysis and production inside a supervised, transparent process.</p></article>
          <article className={styles.proof}><h3>Evidence</h3><p>Reporting highlights usable signals, limits and priorities for the next cycle.</p></article>
        </div>
      </section>

      <section className={styles.closing}><div><p className={styles.eyebrow}>First assessment</p><h2>Start from the real operating constraint.</h2><p>Channels, goals and available resources determine the most sustainable starting point.</p></div><a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Talk to us <ArrowRight size={16} /></a></section>
    </main>
  )
}
