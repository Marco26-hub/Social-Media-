'use client'

import { useState } from 'react'
import styles from './download.module.css'

type CopyState = 'idle' | 'copied' | 'manual'

// «Copia il link» dell'avviso per iPhone: chi è nel browser di Instagram o Facebook
// incolla l'indirizzo in Safari. L'url arriva già pulito (senza query né hash).
export default function CopyLinkButton({ url }: { url: string }) {
  const [state, setState] = useState<CopyState>('idle')

  async function copy() {
    try {
      // Se navigator.clipboard manca (browser vecchio, contesto non sicuro) anche la
      // chiamata lancia: finisce nel catch come il permesso negato.
      await navigator.clipboard.writeText(url)
      setState('copied')
    } catch {
      // Ripiego: il link compare in un campo da selezionare a mano. Mai un alert.
      setState('manual')
    }
  }

  const message =
    state === 'copied' ? 'Link copiato: incollalo in Safari.' : state === 'manual' ? 'Tieni premuto sul link per copiarlo.' : ''

  return (
    <div className={styles.copy}>
      <button type="button" className={styles.noticeButton} onClick={copy}>
        Copia il link
      </button>
      {state === 'manual' ? (
        <input
          className={styles.copyInput}
          value={url}
          readOnly
          aria-label="Link della pagina"
          onFocus={event => event.currentTarget.select()}
        />
      ) : null}
      {/* Sempre montato, anche vuoto: lo screen reader annuncia solo le regioni che c'erano già. */}
      <p role="status" className={styles.copyStatus}>{message}</p>
    </div>
  )
}
