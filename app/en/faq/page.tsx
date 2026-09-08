import type { Metadata } from 'next'
import { ArrowRight } from 'lucide-react'
import { EN_FAQ_GROUPS, EN_WHATSAPP_URL } from '@/lib/english-content'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'FAQ: Social Media, SEO, GEO, Websites and AI | SWA'
const description = 'Clear answers on packages and prices, organic social media, approvals, SEO and GEO, websites, AI compliance and the terms of every Social Web Automation service.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/faq`,
    languages: { 'it-IT': `${SITE_URL}/faq`, en: `${SITE_URL}/en/faq`, 'x-default': `${SITE_URL}/faq` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/faq`, locale: 'en_US' },
  twitter: { title, description },
}

export default function EnglishFaqPage() {
  const allItems = EN_FAQ_GROUPS.flatMap(group => group.items)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'WebPage', url: `${SITE_URL}/en/faq`, name: title, description, inLanguage: 'en-US' },
      { '@type': 'FAQPage', mainEntity: allItems.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` }, { '@type': 'ListItem', position: 2, name: 'FAQ', item: `${SITE_URL}/en/faq` }] },
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
      <section className={styles.hero}><div><p className={styles.eyebrow}>Clear information</p><h1>Frequent questions, direct answers.</h1><p className={styles.heroLead}>Costs, included work, approvals, SEO, GEO, technology and legal consulting: practical answers before choosing a service.</p></div><aside className={styles.heroPanel}><strong>Before you start.</strong><ol><li>Check what is included.</li><li>Confirm what remains separate.</li><li>Understand approval points.</li><li>Ask about your specific case.</li></ol></aside></section>
      {EN_FAQ_GROUPS.map((group, index) => <section id={`faq-${index}`} className={`${styles.section} ${styles.faqLayout}`} key={group.title}><div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ {String(index + 1).padStart(2, '0')}</p><h2>{group.title}</h2></div><div className={styles.faqList}>{group.items.map(item => <details key={item.q}><summary>{item.q}<span>+</span></summary><p>{item.a}</p></details>)}</div></section>)}
      <section className={styles.closing}><div><p className={styles.eyebrow}>Still unsure?</p><h2>Talk through the concrete case.</h2><p>We can separate visibility, conversion and operational issues before work begins.</p></div><a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Ask on WhatsApp <ArrowRight size={16} aria-hidden="true" /></a></section>
    </main>
  )
}
