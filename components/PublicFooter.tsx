'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Facebook, Instagram, Undo2 } from 'lucide-react'
import { TITOLARE } from '@/lib/legal-config'
import { RECESSO_FOOTER, VOCI_FOOTER, type LinguaFooter } from '@/lib/footer-voci'
import styles from './public-footer.module.css'

const TESTI: Record<LinguaFooter, {
  eyebrow: string
  titolo: string
  sommario: string
  navLabel: string
  sezioneLabel: string
  brandLabel: string
  seguici: (rete: string) => string
  inAttivazione: string
  instagram: string
  facebook: string
  legale: React.ReactNode
}> = {
  it: {
    eyebrow: 'SWA SOCIAL DESK',
    titolo: 'Seguici sui social.',
    sommario: 'Strategia applicata, progetti reali e spunti utili per far crescere la presenza digitale.',
    navLabel: 'Link nel footer',
    sezioneLabel: 'Profili social di Social Web Automation',
    brandLabel: 'Social Web Automation, home',
    seguici: rete => `Segui Social Web Automation su ${rete}`,
    inAttivazione: 'In attivazione',
    instagram: 'Idee, lavori e dietro le quinte della regia digitale.',
    facebook: 'Guide pratiche, novita editoriali e contenuti per imprese e professionisti.',
    legale: <>{TITOLARE.ragioneSociale}<br />P.IVA {TITOLARE.partitaIva} · Cermenate (CO)</>,
  },
  en: {
    eyebrow: 'SWA SOCIAL DESK',
    titolo: 'Follow us.',
    sommario: 'Applied strategy, real projects and useful ideas to grow a digital presence.',
    navLabel: 'Footer links',
    sezioneLabel: 'Social Web Automation social profiles',
    brandLabel: 'Social Web Automation, home',
    seguici: rete => `Follow Social Web Automation on ${rete}`,
    inAttivazione: 'Coming soon',
    instagram: 'Ideas, work and what happens behind the digital desk.',
    facebook: 'Practical guides, editorial news and content for businesses and professionals.',
    legale: <>{TITOLARE.ragioneSociale}<br />VAT IT{TITOLARE.partitaIva} · Cermenate (CO), Italy</>,
  },
}

export type { LinguaFooter }

export default function PublicFooter({ lingua = 'it' }: { lingua?: LinguaFooter }) {
  const t = TESTI[lingua]
  const socialProfiles = [
    {
      name: 'Instagram',
      description: t.instagram,
      url: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim() || 'https://www.instagram.com/socialwebautomation/',
      icon: Instagram,
      className: styles.instagram,
    },
    {
      name: 'Facebook',
      description: t.facebook,
      url: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim() || 'https://www.facebook.com/profile.php?id=61592835840985',
      icon: Facebook,
      className: styles.facebook,
    },
  ]

  return (
    <footer className={styles.footer}>
      {/* Il titolo di questa fascia era un h2, e comparendo nel footer di 37
          pagine finiva nella struttura dei titoli di tutto il sito come voce
          senza contenuto informativo. Resta identico a vista, ma non e' piu'
          un titolo di sezione. */}
      <section className={styles.socialSection} aria-label={t.sezioneLabel}>
        <div className={styles.socialIntro}>
          <span className={styles.eyebrow}>{t.eyebrow}</span>
          <p className={styles.socialTitolo}>{t.titolo}</p>
          <p>{t.sommario}</p>
        </div>

        <div className={styles.socialGrid}>
          {socialProfiles.map(({ name, description, url, icon: Icon, className }) => {
            const content = (
              <>
                <span className={styles.socialIcon} aria-hidden="true"><Icon size={23} strokeWidth={1.8} /></span>
                <span className={styles.socialCopy}>
                  <strong>{name}</strong>
                  <small>{description}</small>
                </span>
                {url
                  ? <ArrowUpRight className={styles.socialArrow} size={21} aria-hidden="true" />
                  : <span className={styles.pending}>{t.inAttivazione}</span>}
              </>
            )

            return url ? (
              <a
                key={name}
                className={`${styles.socialCard} ${className}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={t.seguici(name)}
              >
                {content}
              </a>
            ) : (
              <div key={name} className={`${styles.socialCard} ${className} ${styles.socialCardPending}`}>
                {content}
              </div>
            )
          })}
        </div>
      </section>

      <div className={styles.footerBottom}>
        <Link href={lingua === 'en' ? '/en' : '/'} className={styles.brand} aria-label={t.brandLabel}>
          <span><Image src="/brand/swa-logo-official.png" alt="SWA" width={74} height={34} /></span>
          Social Web Automation
        </Link>
        <nav aria-label={t.navLabel}>
          {VOCI_FOOTER[lingua].map(v => (
            <Link key={v.href} href={v.href} hrefLang={v.hrefLang} lang={v.lang}>{v.label}</Link>
          ))}
          <Link href={RECESSO_FOOTER[lingua].href} className={styles.withdrawalLink}><Undo2 size={14} aria-hidden="true" /> {RECESSO_FOOTER[lingua].label}</Link>
        </nav>
        <p>{t.legale}</p>
      </div>
    </footer>
  )
}
