import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import styles from './portale.module.css'
import PortaleLogout from './PortaleLogout'

export const metadata: Metadata = {
  title: 'Area cliente | Social Web Automation',
  robots: { index: false, follow: false, noarchive: true },
}

// Area CLIENTE — separata dalla dashboard operatore/admin. Look premium
// (cream/forest/gold, Fraunces) coerente con la landing. Nessuna sidebar di
// gestione: il cliente vede solo risultati, piano e pagamenti.
export default function PortaleLayout({ children }: { children: React.ReactNode }) {
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
          <PortaleLogout />
        </div>
      </header>
      <div className={styles.wrap}>{children}</div>
    </div>
  )
}
