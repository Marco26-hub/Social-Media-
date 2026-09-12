'use client'

import { useEffect, useState } from 'react'
import { Receipt } from 'lucide-react'

type Vendita = {
  id: string
  corso_titolo: string
  corso_slug: string
  studente_nome: string | null
  studente_email: string
  amount_cents: number
  currency: string
  status: string
  customer_type: string
  paid_at: string | null
  created_at: string
}

const euro = (cents: number, valuta = 'eur') =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: valuta.toUpperCase() }).format(cents / 100)

function quando(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

// Le etichette degli stati: quelli grezzi vengono dal database e non si mostrano
// cosi come sono a chi legge.
const STATI: Record<string, { testo: string; classe: string }> = {
  paid: { testo: 'Pagato', classe: 'bg-green-50 text-green-700' },
  checkout_pending: { testo: 'Non completato', classe: 'bg-gray-100 text-gray-500' },
  checkout_open: { testo: 'Pagamento aperto', classe: 'bg-blue-50 text-blue-700' },
  checkout_failed: { testo: 'Fallito', classe: 'bg-red-50 text-red-700' },
  refunded: { testo: 'Rimborsato', classe: 'bg-amber-50 text-amber-700' },
}

export default function VenditeTab() {
  const [vendite, setVendite] = useState<Vendita[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')
  const [inCorso, setInCorso] = useState<string | null>(null)

  async function carica() {
    try {
      const risposta = await fetch('/api/data/corsi/vendite')
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}))
        setErrore(dati.error || 'Impossibile caricare le vendite.')
      } else {
        setVendite(await risposta.json())
        setErrore('')
      }
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setCaricamento(false)
    }
  }

  useEffect(() => { carica() }, [])

  // Chiudere un accesso toglie a una persona qualcosa che ha pagato: si chiede
  // conferma, e la conferma dice cosa succede invece di chiedere «sei sicuro?».
  async function cambiaAccesso(vendita: Vendita, azione: 'chiudi' | 'riapri') {
    const messaggio = azione === 'chiudi'
      ? `Chiudere l’accesso di ${vendita.studente_email} a «${vendita.corso_titolo}»? Da quel momento non vedrà più le lezioni.`
      : `Riaprire l’accesso di ${vendita.studente_email} a «${vendita.corso_titolo}»?`
    if (!confirm(messaggio)) return

    setInCorso(vendita.id)
    try {
      const risposta = await fetch('/api/data/corsi/vendite', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: vendita.id, azione }),
      })
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}))
        setErrore(dati.error || 'Operazione non riuscita.')
        return
      }
      await carica()
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setInCorso(null)
    }
  }

  const pagate = vendite.filter(v => v.status === 'paid')
  const incasso = pagate.reduce((somma, v) => somma + v.amount_cents, 0)

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <Receipt className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Vendite corsi</h1>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        {pagate.length} {pagate.length === 1 ? 'acquisto pagato' : 'acquisti pagati'} · {euro(incasso)} incassati.
        Sono compresi i tentativi non andati a buon fine, che restano visibili per capire dove si perdono gli acquisti.
        Un rimborso totale chiude l’accesso da solo; uno parziale no, e va deciso qui.
      </p>

      {errore && <div className="card p-4 mb-4 text-sm text-red-700 bg-red-50 border-red-200">{errore}</div>}

      {caricamento ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Caricamento…</div>
      ) : vendite.length === 0 ? (
        <div className="card p-10 text-center">
          <Receipt className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nessuna vendita</p>
        </div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3">Corso</th>
                <th className="px-4 py-3">Studente</th>
                <th className="px-4 py-3">Tipo</th>
                <th className="px-4 py-3 text-right">Importo</th>
                <th className="px-4 py-3">Stato</th>
                <th className="px-4 py-3">Quando</th>
                <th className="px-4 py-3">Accesso</th>
              </tr>
            </thead>
            <tbody>
              {vendite.map(vendita => {
                const stato = STATI[vendita.status] ?? { testo: vendita.status, classe: 'bg-gray-100 text-gray-500' }
                return (
                  <tr key={vendita.id} className="border-b border-gray-50 last:border-0">
                    <td className="px-4 py-3 font-medium text-gray-900">{vendita.corso_titolo}</td>
                    <td className="px-4 py-3">
                      <span className="block text-gray-900">{vendita.studente_nome || '—'}</span>
                      <span className="block text-xs text-gray-500">{vendita.studente_email}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {vendita.customer_type === 'consumatore' ? 'Privato' : 'Impresa'}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      {euro(vendita.amount_cents, vendita.currency)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${stato.classe}`}>{stato.testo}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{quando(vendita.paid_at || vendita.created_at)}</td>
                    <td className="px-4 py-3">
                      {vendita.status === 'paid' && (
                        <button
                          className="text-xs font-semibold text-gray-500 hover:text-red-600 disabled:opacity-50"
                          onClick={() => cambiaAccesso(vendita, 'chiudi')}
                          disabled={inCorso === vendita.id}
                        >
                          Chiudi accesso
                        </button>
                      )}
                      {vendita.status === 'refunded' && (
                        <button
                          className="text-xs font-semibold text-gray-500 hover:text-brand-600 disabled:opacity-50"
                          onClick={() => cambiaAccesso(vendita, 'riapri')}
                          disabled={inCorso === vendita.id}
                        >
                          Riapri accesso
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
