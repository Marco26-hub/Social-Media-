'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle, ChevronDown, ChevronRight, Download, ExternalLink, GraduationCap,
  Loader2, Radio, RefreshCw,
} from 'lucide-react'
import { statoRecesso } from '@/lib/corsi-recesso'

// Ordini dei corsi, tracciati come i pacchetti e i servizi.
//
// Sta nel tab Pagamenti accanto agli altri due blocchi, perche e li che si
// guarda il denaro, e nel tab Vendite dei corsi, perche e li che si guardano i
// corsi. E lo stesso componente nei due posti: due viste diverse degli stessi
// ordini finirebbero per non dire la stessa cosa.
//
// Per ogni ordine: chi, cosa, quanto, in che stato; se l'account e attivo; fino
// a quando il cliente puo recedere; e lo storico dei passi, dall'apertura del
// pagamento all'ultima decisione presa a mano.

type Evento = { tipo: string; autore: string; dettaglio: Record<string, unknown>; created_at: string }

type Ordine = {
  id: string
  corso_titolo: string
  corso_slug: string
  corso_modalita: 'registrato' | 'live'
  corso_disponibile_dal: string | null
  studente_nome: string | null
  studente_email: string
  studente_azienda: string | null
  studente_telefono: string | null
  account_status: string
  customer_type: string
  amount_cents: number
  currency: string
  status: string
  created_at: string
  paid_at: string | null
  stripe_payment_intent_id: string | null
  rinuncia_recesso_il: string | null
  rimborsato_cents: number
  eventi: Evento[]
}

type Payload = { ordini: Ordine[]; stripe_mode?: string; needs_migration?: boolean }

const STATI: Record<string, { testo: string; classe: string }> = {
  paid: { testo: 'Pagato', classe: 'bg-green-100 text-green-700' },
  checkout_pending: { testo: 'Non completato', classe: 'bg-gray-100 text-gray-600' },
  checkout_open: { testo: 'Pagamento aperto', classe: 'bg-amber-100 text-amber-700' },
  checkout_failed: { testo: 'Pagamento fallito', classe: 'bg-red-100 text-red-700' },
  refunded: { testo: 'Rimborsato', classe: 'bg-gray-200 text-gray-700' },
}

const EVENTI: Record<string, string> = {
  ordine_creato: 'Ordine creato',
  checkout_aperto: 'Pagamento aperto su Stripe',
  checkout_fallito: 'Apertura del pagamento non riuscita',
  pagato: 'Pagamento ricevuto',
  account_attivato: 'Account attivato',
  consenso_consegna: 'Dichiarazioni sul recesso raccolte alla consegna',
  rimborso_parziale: 'Rimborso parziale — accesso lasciato aperto',
  rimborso_totale: 'Rimborso totale — accesso chiuso',
  accesso_chiuso_a_mano: 'Accesso chiuso a mano',
  accesso_riaperto_a_mano: 'Accesso riaperto a mano',
}

function soldi(cents: number, valuta = 'eur') {
  return new Intl.NumberFormat('it-IT', { style: 'currency', currency: valuta.toUpperCase() }).format(cents / 100)
}
function giorno(iso: string | null) {
  return iso ? new Date(iso).toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'
}
function momento(iso: string) {
  return new Date(iso).toLocaleString('it-IT', { day: '2-digit', month: 'short', year: '2-digit', hour: '2-digit', minute: '2-digit' })
}

/** Una riga sul recesso, detta in parole: e la scadenza che conta per l'incasso. */
function recesso(o: Ordine): { testo: string; classe: string } {
  const stato = statoRecesso({
    customerType: o.customer_type,
    pagatoIl: o.paid_at ? new Date(o.paid_at) : null,
    rinunciaIl: o.rinuncia_recesso_il ? new Date(o.rinuncia_recesso_il) : null,
  })
  switch (stato.tipo) {
    case 'non_previsto': return { testo: 'Recesso non previsto (impresa)', classe: 'text-gray-500' }
    case 'non_pagato': return { testo: '—', classe: 'text-gray-400' }
    case 'rinunciato': return { testo: `Rinunciato il ${giorno(stato.il.toISOString())}`, classe: 'text-gray-500' }
    case 'scaduto': return { testo: `Scaduto il ${giorno(stato.il.toISOString())}`, classe: 'text-gray-500' }
    case 'aperto': return { testo: `Può recedere fino al ${giorno(stato.fino.toISOString())}`, classe: 'text-amber-700 font-semibold' }
  }
}

export default function CorsiOrdiniAdmin({ gestioneAccesso = false }: { gestioneAccesso?: boolean }) {
  const [dati, setDati] = useState<Payload | null>(null)
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')
  const [aperti, setAperti] = useState<Record<string, boolean>>({})
  const [filtro, setFiltro] = useState<'tutti' | 'pagati' | 'recesso' | 'non_conclusi'>('tutti')
  const [inCorso, setInCorso] = useState('')
  const [da, setDa] = useState('')
  const [a, setA] = useState('')

  const carica = useCallback(async () => {
    setErrore('')
    try {
      const risposta = await fetch('/api/admin/corsi-ordini', { cache: 'no-store' })
      const corpo = await risposta.json().catch(() => ({}))
      if (!risposta.ok) { setErrore(corpo.error || 'Impossibile caricare gli ordini dei corsi.'); return }
      setDati(corpo)
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setCaricamento(false)
    }
  }, [])

  useEffect(() => { carica() }, [carica])

  const ordini = useMemo(() => {
    const tutti = dati?.ordini ?? []
    if (filtro === 'pagati') return tutti.filter(o => o.status === 'paid')
    if (filtro === 'non_conclusi') return tutti.filter(o => o.status.startsWith('checkout_'))
    if (filtro === 'recesso') return tutti.filter(o => o.status === 'paid' && recesso(o).classe.includes('amber'))
    return tutti
  }, [dati, filtro])

  const pagati = (dati?.ordini ?? []).filter(o => o.status === 'paid')
  const incasso = pagati.reduce((somma, o) => somma + o.amount_cents, 0)
  const inRecesso = pagati.filter(o => recesso(o).classe.includes('amber'))
  const incassoSicuro = incasso - inRecesso.reduce((somma, o) => somma + o.amount_cents, 0)

  // Il link al pannello Stripe cambia fra modalita test e live: senza il
  // prefisso giusto apre una pagina vuota.
  const stripeBase = dati?.stripe_mode === 'test'
    ? 'https://dashboard.stripe.com/test/payments/'
    : 'https://dashboard.stripe.com/payments/'

  async function cambiaAccesso(o: Ordine, azione: 'chiudi' | 'riapri') {
    const messaggio = azione === 'chiudi'
      ? `Chiudere l’accesso di ${o.studente_email} a «${o.corso_titolo}»? Da quel momento non vedrà più le lezioni.`
      : `Riaprire l’accesso di ${o.studente_email} a «${o.corso_titolo}»?`
    if (!confirm(messaggio)) return
    setInCorso(o.id)
    try {
      const risposta = await fetch('/api/data/corsi/vendite', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: o.id, azione }),
      })
      if (!risposta.ok) {
        const corpo = await risposta.json().catch(() => ({}))
        setErrore(corpo.error || 'Operazione non riuscita.')
        return
      }
      await carica()
    } finally {
      setInCorso('')
    }
  }

  const periodo = new URLSearchParams()
  if (da) periodo.set('da', da)
  if (a) periodo.set('a', a)

  return (
    <section className="card mb-6 overflow-hidden">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 p-4">
        <div>
          <h2 className="font-semibold text-gray-900">Corsi acquistati</h2>
          <p className="text-xs text-gray-500">
            {pagati.length} pagati · {soldi(incasso)} incassati
            {inRecesso.length > 0 && <> · <span className="text-amber-700">{soldi(incasso - incassoSicuro)} ancora in periodo di recesso</span></>}
          </p>
        </div>
        <button onClick={carica} className="btn-secondary text-xs"><RefreshCw className="h-3.5 w-3.5" /> Aggiorna</button>
      </header>

      <div className="flex flex-wrap items-end gap-3 border-b border-gray-100 p-4">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filtra gli ordini">
          {([
            ['tutti', 'Tutti'],
            ['pagati', 'Pagati'],
            ['recesso', `In recesso (${inRecesso.length})`],
            ['non_conclusi', 'Non conclusi'],
          ] as const).map(([chiave, etichetta]) => (
            <button
              key={chiave}
              onClick={() => setFiltro(chiave)}
              aria-pressed={filtro === chiave}
              className={`rounded-full px-3 py-1 text-xs font-semibold ${filtro === chiave ? 'bg-brand-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {etichetta}
            </button>
          ))}
        </div>

        {/* Export dei soli corsi, per chi gestisce i corsi. Per il commercialista
            c'e il registro incassi in cima al tab Pagamenti, con tutte le vendite. */}
        <div className="ml-auto flex flex-wrap items-end gap-2">
          <label className="text-xs text-gray-500">Dal<input type="date" value={da} onChange={e => setDa(e.target.value)} className="input mt-1 w-auto" /></label>
          <label className="text-xs text-gray-500">Al<input type="date" value={a} onChange={e => setA(e.target.value)} className="input mt-1 w-auto" /></label>
          <a href={`/api/admin/corsi-ordini/export?${periodo.toString()}`} className="btn-secondary text-xs">
            <Download className="h-3.5 w-3.5" /> Export solo corsi
          </a>
        </div>
      </div>

      {caricamento ? (
        <div className="p-9 text-center"><Loader2 className="mx-auto h-6 w-6 animate-spin text-gray-400" /></div>
      ) : errore ? (
        <div className="flex gap-2 p-5 text-sm text-red-700"><AlertTriangle className="h-5 w-5" />{errore}</div>
      ) : dati?.needs_migration ? (
        <div className="flex gap-2 p-5 text-sm text-amber-700"><AlertTriangle className="h-5 w-5" />Migrazione dei corsi (052) non applicata.</div>
      ) : !ordini.length ? (
        <div className="p-8 text-center text-sm text-gray-400">Nessun ordine in questa vista.</div>
      ) : (
        <div className="divide-y divide-gray-100">
          {ordini.map(o => {
            const stato = STATI[o.status] ?? { testo: o.status, classe: 'bg-gray-100 text-gray-600' }
            const r = recesso(o)
            const aperto = aperti[o.id] ?? false
            const inPrevendita = o.corso_disponibile_dal && new Date(o.corso_disponibile_dal) > new Date()
            return (
              <article key={o.id} className="p-4">
                <div className="grid gap-3 md:grid-cols-[1.3fr_.8fr_1fr_auto] md:items-center">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      {o.corso_modalita === 'live'
                        ? <Radio className="h-4 w-4 text-brand-600" />
                        : <GraduationCap className="h-4 w-4 text-brand-600" />}
                      <strong className="truncate text-sm text-gray-900">{o.corso_titolo}</strong>
                      <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stato.classe}`}>{stato.testo}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-500">
                      {o.studente_azienda || o.studente_nome || '—'} · <a href={`mailto:${o.studente_email}`} className="hover:underline">{o.studente_email}</a>
                      {o.studente_telefono && <> · {o.studente_telefono}</>}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {o.customer_type === 'consumatore' ? 'Privato' : 'Impresa o professionista'} ·{' '}
                      {o.account_status === 'active'
                        ? <span className="text-green-700">account attivo</span>
                        : <span className="text-amber-700">account non attivo</span>}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm font-bold text-gray-900">{soldi(o.amount_cents, o.currency)}</p>
                    <p className="text-xs text-gray-500">{o.paid_at ? `Pagato ${giorno(o.paid_at)}` : `Ordinato ${giorno(o.created_at)}`}</p>
                    {o.rimborsato_cents > 0 && <p className="text-xs text-gray-600">Rimborsati {soldi(o.rimborsato_cents, o.currency)}</p>}
                  </div>

                  <div className="text-xs">
                    <p className={r.classe}>{r.testo}</p>
                    {inPrevendita && <p className="mt-1 text-gray-500">Consegna prevista il {giorno(o.corso_disponibile_dal)}</p>}
                    {o.stripe_payment_intent_id && (
                      <a href={`${stripeBase}${o.stripe_payment_intent_id}`} target="_blank" rel="noreferrer" className="mt-1 inline-flex items-center gap-1 text-brand-600">
                        <ExternalLink className="h-3 w-3" /> Pagamento su Stripe
                      </a>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-2 md:justify-end">
                    {gestioneAccesso && o.status === 'paid' && (
                      <button onClick={() => cambiaAccesso(o, 'chiudi')} disabled={inCorso === o.id} className="btn-secondary text-xs disabled:opacity-50">Chiudi accesso</button>
                    )}
                    {gestioneAccesso && o.status === 'refunded' && (
                      <button onClick={() => cambiaAccesso(o, 'riapri')} disabled={inCorso === o.id} className="btn-secondary text-xs disabled:opacity-50">Riapri accesso</button>
                    )}
                    <button
                      onClick={() => setAperti(s => ({ ...s, [o.id]: !aperto }))}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-gray-900"
                      aria-expanded={aperto}
                    >
                      {aperto ? <ChevronDown className="h-3.5 w-3.5" /> : <ChevronRight className="h-3.5 w-3.5" />}
                      Storico ({o.eventi.length})
                    </button>
                  </div>
                </div>

                {aperto && (
                  <ol className="mt-3 space-y-1.5 border-l-2 border-gray-100 pl-4">
                    {o.eventi.length === 0 && <li className="text-xs text-gray-400">Nessun passo registrato.</li>}
                    {o.eventi.map((e, i) => (
                      <li key={i} className="text-xs">
                        <span className="font-semibold text-gray-700">{EVENTI[e.tipo] ?? e.tipo}</span>
                        <span className="text-gray-400"> · {momento(e.created_at)}</span>
                        {e.autore !== 'sistema' && <span className="text-gray-500"> · da {e.autore}</span>}
                      </li>
                    ))}
                  </ol>
                )}
              </article>
            )
          })}
        </div>
      )}
    </section>
  )
}
