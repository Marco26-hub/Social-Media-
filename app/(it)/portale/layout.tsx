import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getSession } from '@/lib/auth-utils'
import { contaCorsiUtente } from '@/lib/corsi-db'
import styles from './portale.module.css'
import PortaleLogout from './PortaleLogout'

export const metadata: Metadata = {
  title: 'Area cliente | Social Web Automation',
  robots: { index: false, follow: false, noarchive: true },
}

// Area CLIENTE — separata dalla dashboard operatore/admin. Look premium
// (cream/forest/gold, Fraunces) coerente con la landing. Nessuna sidebar di
// gestione: il cliente vede solo risultati, piano e pagamenti.
export default async function PortaleLayout({ children }: { children: React.ReactNode }) {
  // La voce «I tuoi corsi» compare solo a chi ne ha comprato almeno uno: un
  // cliente dei servizi social non deve trovarsi in area riservata una sezione
  // che per lui e sempre vuota.
  const session = await getSession()
  const conCorsi = session?.user?.id ? (await contaCorsiUtente(String(session.user.id))) > 0 : false

  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topInner}>
          <Link href="/portale" className={styles.brand}>
            <span className={styles.brandLogoShell}>
              <Image
                className={styles.brandLogo}
                src="/brand/swa-logo-official.png"
                alt="SWA"
                width={82}
                height={38}
                priority
              />
            </span>
            <span className={styles.brandName}>
              <b>Social Web Automation</b>
              <span>Area cliente</span>
            </span>
          </Link>
          <div className={styles.topActions}>
            {conCorsi && (
              <nav className={styles.nav} aria-label="Sezioni dell'area cliente">
                <Link href="/portale">Panoramica</Link>
                <Link href="/portale/corsi">I tuoi corsi</Link>
              </nav>
            )}
            <PortaleLogout />
          </div>
        </div>
      </header>
      <div className={styles.wrap}>{children}</div>
    </div>
  )
}
