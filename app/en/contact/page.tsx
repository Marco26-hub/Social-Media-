import type { Metadata } from 'next'
import { ArrowRight, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import { EN_COMPANY, EN_WHATSAPP_URL } from '@/lib/english-content'
import { SITE_URL } from '@/lib/site-config'
import styles from '../english.module.css'

const title = 'Contact Social Web Automation | SWA'
const description = 'Contact Social Web Automation in Cermenate, Italy by WhatsApp, phone, email or PEC. Remote work across Italy and in-person work around Como, Milan, Monza and Varese.'

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: `${SITE_URL}/en/contact`,
    languages: { 'it-IT': `${SITE_URL}/contatti`, en: `${SITE_URL}/en/contact`, 'x-default': `${SITE_URL}/contatti` },
  },
  openGraph: { title, description, url: `${SITE_URL}/en/contact`, type: 'website', locale: 'en_US' },
  twitter: { card: 'summary_large_image', title, description },
}

export default function EnglishContactPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'ContactPage', '@id': `${SITE_URL}/en/contact#webpage`, url: `${SITE_URL}/en/contact`, name: title, description, inLanguage: 'en-US', about: { '@id': `${SITE_URL}/#organization` } },
      { '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/en` }, { '@type': 'ListItem', position: 2, name: 'Contact', item: `${SITE_URL}/en/contact` }] },
    ],
  }

  const contactCards = [
    { icon: MessageCircle, label: 'WhatsApp', title: EN_COMPANY.phone, href: EN_WHATSAPP_URL, external: true, text: 'The fastest channel for a first conversation. Send what you do and what you want to solve.' },
    { icon: Phone, label: 'Phone', title: EN_COMPANY.phone, href: `tel:${EN_COMPANY.phone.replace(/\s/g, '')}`, text: 'Same number. If we are with a client, leave a message and we will call back.' },
    { icon: Mail, label: 'Email', title: EN_COMPANY.email, href: `mailto:${EN_COMPANY.email}`, text: 'Best for proposals, materials and questions that require attachments.' },
    { icon: Mail, label: 'PEC', title: EN_COMPANY.pec, href: `mailto:${EN_COMPANY.pec}`, text: 'Certified email for formal communications, contracts and legal notices.' },
  ]

  return (
    <main className={styles.main}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <section className={styles.hero}><div><p className={styles.eyebrow}>Contact</p><h1>A person answers, not a call centre.</h1><p className={styles.heroLead}>{EN_COMPANY.name} is based in {EN_COMPANY.location}. The fastest way to begin is to describe how work happens today; we will identify which area is worth touching first.</p><div className={styles.actions}><a className={styles.primary} href={EN_WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Write on WhatsApp <ArrowRight size={16} /></a><a className={styles.secondary} href={`mailto:${EN_COMPANY.email}`}>Send an email</a></div></div><aside className={styles.heroPanel}><strong>Company details.</strong><ol><li>{EN_COMPANY.name}</li><li>{EN_COMPANY.address}</li><li>{EN_COMPANY.vat}</li><li>Formal notices: {EN_COMPANY.pec}</li></ol></aside></section>
      <section className={styles.section}><div className={styles.sectionHeading}><p className={styles.eyebrow}>How to reach us</p><h2>Four channels, no mandatory form.</h2><p>Choose the channel that fits the request. Use PEC for formal communications.</p></div><div className={styles.grid}>{contactCards.map(card => { const Icon = card.icon; return <article className={styles.service} key={card.label}><Icon size={24} /><h3><a href={card.href} target={card.external ? '_blank' : undefined} rel={card.external ? 'noopener noreferrer' : undefined}>{card.title}</a></h3><p><strong>{card.label}</strong></p><p>{card.text}</p></article> })}</div></section>
      <section className={styles.band}><div className={styles.sectionHeading}><p className={styles.eyebrow}>Where we work</p><h2>In person around Brianza, remotely across Italy.</h2><p>On-site filming and visits depend on distance. Content, websites, phone assistant and systems work remotely.</p></div><div className={styles.journey}>{EN_COMPANY.serviceAreas.map((area, index) => <article key={area}><span><MapPin size={14} /> {String(index + 1).padStart(2, '0')}</span><h3>{area}</h3></article>)}</div></section>
    </main>
  )
}
