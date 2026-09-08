'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { CheckCircle2, Clock3, CircleAlert } from 'lucide-react'
import styles from '../acquista.module.css'

type OrderState = { service_name?: string; status?: 'pending' | 'confirmed' | 'attention'; error?: string }

function Result() {
  const params = useSearchParams()
  const sessionId = params.get('session_id')
  const [order, setOrder] = useState<OrderState>({ status: 'pending' })

  useEffect(() => {
    if (!sessionId) { setOrder({ status: 'attention', error: 'Riferimento ordine mancante.' }); return }
    let active = true
    const load = async () => {
      try {
        const response = await fetch(`/api/checkout/service?session_id=${encodeURIComponent(sessionId)}`, { cache: 'no-store' })
        const data = await response.json() as OrderState
        if (active) setOrder(response.ok ? data : { status: 'attention', error: data.error || 'Ordine non trovato.' })
      } catch { if (active) setOrder({ status: 'attention', error: 'Verifica ordine non disponibile.' }) }
    }
    void load()
    const timer = window.setTimeout(load, 2500)
    return () => { active = false; window.clearTimeout(timer) }
  }, [sessionId])

  const confirmed = order.status === 'confirmed'
  const attention = order.status === 'attention'
  return (
    <main className={styles.shell}>
      <section className={styles.invalid}>
        {confirmed ? <CheckCircle2 size={36} color="#168553" /> : attention ? <CircleAlert size={36} color="#a83e2f" /> : <Clock3 size={36} color="#b47b11" />}
        <h1>{confirmed ? 'Pagamento confermato' : attention ? 'Ordine da verificare' : 'Pagamento ricevuto'}</h1>
        <p>{confirmed
          ? `Il servizio ${order.service_name || ''} e attivo. Riceverai una email con i prossimi passaggi.`
          : attention
            ? order.error || 'Il pagamento richiede una verifica. Non ripetere l’acquisto: contattaci indicando l’email usata su Stripe.'
            : 'Stripe ha rinviato correttamente al sito. Stiamo attendendo la conferma firmata del pagamento; questa pagina si aggiorna automaticamente.'}</p>
        <Link href="/">Torna alla home</Link>
      </section>
    </main>
  )
}

export default function CheckoutSuccessPage() {
  return <Suspense fallback={<main className={styles.shell}><p>Verifica pagamento...</p></main>}><Result /></Suspense>
}
