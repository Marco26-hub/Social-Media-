'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight, Facebook, Instagram, Undo2 } from 'lucide-react'
import { TITOLARE } from '@/lib/legal-config'
import styles from './public-footer.module.css'

const socialProfiles = [
  {
    name: 'Instagram',
    description: 'Idee, lavori e dietro le quinte della regia digitale.',
    url: process.env.NEXT_PUBLIC_INSTAGRAM_URL?.trim(),
    icon: Instagram,
    className: styles.instagram,
  },
  {
    name: 'Facebook',
    description: 'Guide pratiche, novita editoriali e contenuti per imprese e professionisti.',
    url: process.env.NEXT_PUBLIC_FACEBOOK_URL?.trim(),
    icon: Facebook,
    className: styles.facebook,
  },
]

export default function PublicFooter() {
  return (
    <footer className={styles.footer}>
      <section className={styles.socialSection} aria-labelledby="social-title">
        <div className={styles.socialIntro}>
          <span className={styles.eyebrow}>SWA SOCIAL DESK</span>
          <h2 id="social-title">Seguici sui social.</h2>
          <p>Strategia applicata, progetti reali e spunti utili per far crescere la presenza digitale.</p>
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
                  : <span className={styles.pending}>In attivazione</span>}
              </>
            )

            return url ? (
              <a
                key={name}
                className={`${styles.socialCard} ${className}`}
                href={url}
                target="_blank"
                rel="noreferrer"
                aria-label={`Segui Social Web Automation su ${name}`}
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
        <Link href="/" className={styles.brand} aria-label="Social Web Automation, home">
          <span><Image src="/brand/swa-logo-official.png" alt="SWA" width={74} height={34} /></span>
          Social Web Automation
        </Link>
        <nav aria-label="Link nel footer">
          <Link href="/servizi">Servizi</Link>
          <Link href="/metodo">Metodo</Link>
          <Link href="/pacchetti">Pacchetti</Link>
          <Link href="/blog">Journal</Link>
          <Link href="/chi-siamo">Azienda</Link>
          <Link href="/faq">FAQ</Link>
          <Link href="/privacy">Privacy</Link>
          <Link href="/termini">Termini</Link>
          <Link href="/recesso" className={styles.withdrawalLink}><Undo2 size={14} aria-hidden="true" /> Recedere dal contratto qui</Link>
        </nav>
        <p>{TITOLARE.ragioneSociale}<br />P.IVA {TITOLARE.partitaIva} · Cermenate (CO)</p>
      </div>
    </footer>
  )
}
