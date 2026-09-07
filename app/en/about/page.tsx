import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Building2, CheckCircle2, ShieldCheck, Workflow } from 'lucide-react'
import { EN_ABOUT_FAQ, EN_COMPANY, EN_PRICE_LABELS, EN_WHATSAPP_URL } from '@/lib/english-content'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'About Social Web Automation | SWA'
const description = 'Social Web Automation is the business of Marco Dibenedetto in Cermenate, Italy: managed digital work for SMEs with human approval and clear prices.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/about`,
    languages: { 'it-IT': `${SITE_URL}/chi-siamo`, en: `${SITE_URL}/en/about`, 'x-default': `${SITE_URL}/chi-siamo` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/about`, locale: 'en_US' },
  twitter: { title, description },
}

export default function EnglishAboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'AboutPage', '@id': `${SITE_URL}/en/about#webpage`, url: `${SITE_URL}/en/about`, name: title, description, inLanguage: 'en-US', about: { '@id': `${SITE_URL}/#organization` } },
      { '@type': 'Organization', '@id': `${SITE_URL}/#organization`, name: EN_COMPANY.name, url: SITE_URL, email: EN_COMPANY.email, telephone: EN_COMPANY.phone },
      { '@type': 'FAQPage', '@id': `${SITE_URL}/en/about#faq`, mainEntity: EN_ABOUT_FAQ.map(item => ({ '@type': 'Question', name: item.q, acceptedAnswer: { '@type': 'Answer', text: item.a } })) },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` }, { '@type': 'ListItem', position: 2, name: 'About', item: `${SITE_URL}/en/about` }] },
    ],
  }

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}>
        <div><p className={styles.eyebrow}>About SWA</p><h1>One accountable provider for work that usually needs several suppliers.</h1><p className={styles.heroLead}>Social Web Automation is based in {EN_COMPANY.location}. We coordinate content, websites, search and AI discoverability, B2B research and operational workflows so decisions stay connected.</p><div className={styles.actions}><Link className={styles.primary} href="/en/services">Explore services <ArrowRight size={16} /></Link><a className={styles.secondary} href={`mailto:${EN_COMPANY.email}`}>Email us</a></div></div>
        <aside className={styles.identityPanel} aria-label="Company details"><span className={styles.identityLogo}><Image src="/brand/swa-logo-official.png" alt="SWA Social Web Automation logo" width={210} height={96} priority /></span><dl><div><dt>Business</dt><dd>{EN_COMPANY.name}</dd></div><div><dt>Founder</dt><dd>{EN_COMPANY.founder}</dd></div><div><dt>Location</dt><dd>{EN_COMPANY.location}</dd></div><div><dt>VAT</dt><dd>{EN_COMPANY.vat}</dd></div></dl></aside>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>How we work</p><h2>AI supports the process. People remain responsible.</h2><p>Automation helps with analysis and production, but objectives, brand tone, review and publication approval remain human decisions.</p></div>
        <div className={styles.proofGrid}><article className={styles.proof}><Workflow size={24} /><h3>One work flow</h3><p>Assessment, plan, production, approval and publishing are connected instead of handled as isolated tasks.</p></article><article className={styles.proof}><ShieldCheck size={24} /><h3>Approval first</h3><p>Client approval is required before content reaches a channel or a deliverable is finalised.</p></article><article className={styles.proof}><Building2 size={24} /><h3>Clear inclusions</h3><p>Included work, revisions, exclusions and third-party costs are stated before activation.</p></article><article className={styles.proof}><CheckCircle2 size={24} /><h3>Public prices</h3><p>Entry points: {EN_PRICE_LABELS.web} for a website, {EN_PRICE_LABELS.blog} for the blog and {EN_PRICE_LABELS.presence} for managed social. VAT excluded.</p></article></div>
      </section>

      <section className={styles.section}>
        <div className={styles.sectionHeading}><p className={styles.eyebrow}>FAQ</p><h2>Before we start.</h2></div>
        <div className={styles.grid}>
          {EN_ABOUT_FAQ.map(item => <article className={styles.service} key={item.q}><h3>{item.q}</h3><p>{item.a}</p></article>)}
        </div>
      </section>

      <section className={styles.closing}><div><p className={styles.eyebrow}>Evaluate the fit</p><h2>Tell us where work gets stuck today.</h2><p>We will point you to the smallest useful starting point before adding more moving parts.</p></div><a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Start a conversation <ArrowRight size={16} /></a></section>
    </main>
  )
}
