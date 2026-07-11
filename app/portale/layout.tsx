import Link from 'next/link'
import styles from './portale.module.css'
import PortaleLogout from './PortaleLogout'

// Area CLIENTE — separata dalla dashboard operatore/admin. Look premium
// (cream/forest/gold, Fraunces) coerente con la landing. Nessuna sidebar di
// gestione: il cliente vede solo risultati, piano e pagamenti.
export default function PortaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.shell}>
      <header className={styles.topbar}>
        <div className={styles.topInner}>
          <Link href="/portale" className={styles.brand}>
            <span className={styles.brandMark}>SA</span>
            <span className={styles.brandName}>
              <b>Social Automation</b>
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
