import { anteprimaOg } from '@/lib/anteprima'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Check, ClipboardCheck, Gauge, Search, Workflow } from 'lucide-react'
import { EN_METHOD_FAQ, EN_METHOD_SERVICES, EN_METHOD_STEPS, EN_WHATSAPP_URL } from '@/lib/english-content'
import { metodoServizio } from '@/lib/metodo'
import { SITE_URL } from '@/lib/site-config'
import styles from '@/styles/english.module.css'

const title = 'The SWA Method: assessment, production, approval | SWA'
const description = 'A clear operating method for SMEs: assessment, shared direction, production, approval, publishing and monthly reporting, with human control at every step.'
const methodFaq = EN_METHOD_FAQ

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/method`,
    languages: { 'it-IT': `${SITE_URL}/metodo`, en: `${SITE_URL}/en/method`, 'x-default': `${SITE_URL}/metodo` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/method`, locale: 'en_US' , images: anteprimaOg('/en/method'), type: 'website',},
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg('/en/method') },
}

export default function EnglishMethodPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/en/method`, name: title, description, inLanguage: 'en-US', isPartOf: { '@id': `${SITE_URL}/#website` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` }, { '@type': 'ListItem', position: 2, name: 'Method', item: `${SITE_URL}/en/method` }] },
      { '@type': 'HowTo', '@id': `${SITE_URL}/en/method#howto`, name: 'The Social Web Automation method, phase by phase', description, inLanguage: 'en', step: EN_METHOD_STEPS.map((step, index) => ({ '@type': 'HowToStep', position: index + 1, name: step.title, text: step.text, url: `${SITE_URL}/en/method#phase-${step.n}` })) },
      { '@type': 'ItemList', '@id': `${SITE_URL}/en/method#service-methods`, name: 'The method applied to each Social Web Automation service', itemListOrder: 'https://schema.org/ItemListOrderAscending', numberOfItems: EN_METHOD_SERVICES.length, itemListElement: EN_METHOD_SERVICES.map((service, index) => ({ '@type': 'ListItem', position: index + 1, name: `How ${service.label} works, step by step`, url: `${SITE_URL}/en/services#${service.anchor}` })) },
      { '@type': 'FAQPage', mainEntity: methodFaq.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
    ],
  }

  const icons = [Search, Workflow, ClipboardCheck, Gauge]

  return (
    <main id="main-content" className={styles.main}>
      {/* Sette pagine inglesi non avevano ne il link di salto ne un
          bersaglio su <main>: chi naviga da tastiera doveva attraversare
          tutto il menu a ogni pagina. La classe esisteva gia, mancava
          solo di essere usata. */}
      <a className={styles.skipLink} href="#main-content">Skip to content</a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>SWA method</p>
          <h1>A clear method for turning goals into verifiable work.</h1>
          <p className={styles.heroLead}>Every cycle moves through assessment, direction, production and improvement. The same four phases apply to all ten services, from social content to the phone assistant: what gets produced changes, how it is decided, approved and measured does not.</p>
          <div className={styles.actions}>
            <a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Discuss your project <ArrowRight size={16} aria-hidden="true" /></a>
            <Link className={styles.secondary} href="#service-methods">The method, service by service</Link>
          </div>
        </div>
        <aside className={styles.heroPanel}><strong>What the method protects.</strong><ol><li>Included work is agreed before production.</li><li>Each channel has a practical role.</li><li>Approvals happen before publication.</li><li>Priorities improve from evidence.</li></ol></aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Four phases</p><h2>One flow, from assessment to reporting.</h2><p>Each phase has a defined outcome and prepares the next one, so strategy and execution do not drift apart.</p></div>
        <div className={styles.grid}>
          {EN_METHOD_STEPS.map((step, index) => {
            const Icon = icons[index]
            return <article id={`phase-${step.n}`} className={styles.service} key={step.n}><Icon size={24} aria-hidden="true" /><h3>{step.n}. {step.title}</h3><p>{step.text}</p><ul className={styles.checkList}>{step.items.map(item => <li key={item}><Check size={14} aria-hidden="true" />{item}</li>)}</ul></article>
          })}
        </div>
      </section>

      <section id="service-methods" className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>Service by service</p><h2>The same four phases, ten different jobs.</h2><p>An editorial plan and a link between two management systems are not built the same way, but they follow the same cycle. Each card shows what comes out at the end and the four steps that get there.</p></div>
        <div className={styles.grid}>
          {EN_METHOD_SERVICES.map(service => {
            const Icon = metodoServizio(service.slug).icon
            return (
              <article id={`method-${service.anchor}`} className={styles.service} key={service.slug}>
                <Icon size={24} aria-hidden="true" />
                <h3>{service.label}</h3>
                <p><strong>What you get:</strong> {service.delivery}</p>
                <ul className={styles.checkList}>{service.phases.map((phase, index) => <li key={phase}><b>{String(index + 1).padStart(2, '0')}</b>{phase}</li>)}</ul>
                <Link href={`/en/services#${service.anchor}`}>See {service.label} <ArrowRight size={15} aria-hidden="true" /></Link>
              </article>
            )
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

      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ</p><h2>Practical answers before production starts.</h2></div>
        <div className={styles.grid}>
          {methodFaq.map(item => <article className={styles.service} key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}
        </div>
      </section>

      <section className={styles.closing}><div><p className={styles.eyebrow}>First assessment</p><h2>Start from the real operating constraint.</h2><p>Channels, goals and available resources determine the most sustainable starting point.</p></div><a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Talk to us <ArrowRight size={16} aria-hidden="true" /></a></section>
    </main>
  )
}
