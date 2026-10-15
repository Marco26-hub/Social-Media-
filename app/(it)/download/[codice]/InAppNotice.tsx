import { buildChromeIntentUrl, cleanPageUrl } from '@/lib/in-app-browser'
import CopyLinkButton from './CopyLinkButton'
import styles from './download.module.css'

const APP_NAMES = { instagram: 'Instagram', facebook: 'Facebook' } as const

type Props = {
  app: 'instagram' | 'facebook'
  os: 'ios' | 'android' | 'other'
  pageUrl: string
}

// Avviso per chi apre la pagina dentro Instagram o Facebook, dove i download a volte
// non partono. I testi non citano le voci di menu: cambiano con versione e lingua
// dell'app. Fuori da iPhone e Android non c'è niente di sicuro da consigliare, quindi
// l'avviso non compare.
export default function InAppNotice({ app, os, pageUrl }: Props) {
  const appName = APP_NAMES[app]

  if (os === 'android') {
    // Senza un indirizzo valido niente pulsante: mai un href vuoto.
    const intentUrl = buildChromeIntentUrl(pageUrl)
    return (
      <div className={styles.notice}>
        <p className={styles.noticeText}>
          Sei nel browser di {appName}. Per salvare i file sul telefono apri la pagina in Chrome.
        </p>
        {intentUrl ? <a className={styles.noticeButton} href={intentUrl}>Apri in Chrome</a> : null}
      </div>
    )
  }

  if (os === 'ios') {
    const cleanUrl = cleanPageUrl(pageUrl)
    return (
      <div className={styles.notice}>
        <p className={styles.noticeText}>
          Sei nel browser di {appName}. I PDF si aprono qui; se un file non si scarica, apri la pagina in Safari dal menu in alto.
        </p>
        {cleanUrl ? <CopyLinkButton url={cleanUrl} /> : null}
      </div>
    )
  }

  return null
}
