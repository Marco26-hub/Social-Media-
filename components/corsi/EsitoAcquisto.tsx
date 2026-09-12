'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import styles from './registrati-acquista.module.css'

// Esito del pagamento. Lo stato NON viene chiesto a Stripe ma alla nostra riga
// in `corso_acquisti`: la fonte di verita e il webhook, e chiedere a Stripe
// darebbe una risposta che il database non ha ancora recepito.
//
// Il webhook puo arrivare qualche secondo dopo il ritorno dal pagamento: si
// interroga a intervalli finche non risponde 'confirmed' o finche non scade il
// tempo. Scaduto il tempo NON si dice che il pagamento e fallito — sarebbe
// falso e allarmerebbe chi ha pagato davvero: si dice che la conferma sta
// arrivando e che avvisiamo per email.

const ATTESE_MS = [1500, 2000, 3000, 4000, 5000, 6000, 8000]

type Stato = 'attesa' | 'confermato' | 'lento' | 'problema'

export default function EsitoAcquisto({ slug, titolo }: { slug: string; titolo: string }) {
  const parametri = useSearchParams()
  const sessionId = parametri.get('session_id') || ''
  const [stato, setStato] = useState<Stato>(sessionId ? 'attesa' : 'lento')

  useEffect(() => {
    if (!sessionId) return
    let vivo = true
    let tentativo = 0

    async function controlla() {
      try {
        const risposta = await fetch(`/api/checkout/corso?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
        if (!vivo) return
        if (risposta.ok) {
          const dati = await risposta.json()
          if (dati.status === 'confirmed') { setStato('confermato'); return }
          if (dati.status === 'attention') { setStato('problema'); return }
        }
      } catch {
        // Rete ballerina: si riprova, senza dire niente all'utente.
      }
      if (!vivo) return
      if (tentativo >= ATTESE_MS.length) { setStato('lento'); return }
      const attesa = ATTESE_MS[tentativo]
      tentativo += 1
      setTimeout(controlla, attesa)
    }

    const avvio = setTimeout(controlla, 1200)
    return () => { vivo = false; clearTimeout(avvio) }
  }, [sessionId])

  if (stato === 'confermato') {
    return (
      <div className={styles.modulo}>
        <p className={styles.etichetta}>Pagamento confermato</p>
        <p className={styles.nota}>
          <strong>{titolo}</strong> è tuo. Il tuo account è attivo: accedi con l’email e la
          password che hai scelto e lo trovi nella tua area riservata. Ti abbiamo mandato
          anche una email di conferma.
        </p>
        <Link className={styles.principale} href={`/login?callbackUrl=${encodeURIComponent('/portale/corsi')}`}>
          Accedi alla tua area
        </Link>
      </div>
    )
  }

  if (stato === 'problema') {
    return (
      <div className={styles.modulo}>
        <p className={styles.etichetta}>Pagamento non completato</p>
        <p className={styles.errore} role="alert">
          Il pagamento non risulta andato a buon fine e non ti è stato addebitato nulla.
          Puoi riprovare, oppure scriverci e lo sistemiamo noi.
        </p>
        <Link className={styles.principale} href={`/corsi/${slug}`}>Torna al corso</Link>
        <p className={styles.nota}><Link href="/contatti">Scrivici</Link> se preferisci che ce ne occupiamo noi.</p>
      </div>
    )
  }

  if (stato === 'lento') {
    return (
      <div className={styles.modulo}>
        <p className={styles.etichetta}>Conferma in arrivo</p>
        <p className={styles.nota}>
          Il pagamento è stato inviato ma la conferma della banca sta impiegando più del
          solito. Non serve ripetere l’acquisto: appena arriva attiviamo l’account e ti
          avvisiamo per email. Se entro un’ora non ricevi nulla,{' '}
          <Link href="/contatti">scrivici</Link>.
        </p>
        <Link className={styles.principale} href="/corsi">Torna ai corsi</Link>
      </div>
    )
  }

  return (
    <div className={styles.modulo}>
      <p className={styles.etichetta}>Stiamo confermando il pagamento…</p>
      <p className={styles.nota}>
        Ci vuole qualche secondo. Non chiudere questa pagina e non ripetere l’acquisto.
      </p>
    </div>
  )
}
