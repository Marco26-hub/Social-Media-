'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { AlertTriangle, GraduationCap, Plus, Radio, Trash2 } from 'lucide-react'

type Corso = {
  id: string
  slug: string
  titolo: string
  prezzo_cents: number
  pubblicato: boolean
  modalita: 'registrato' | 'live'
  posti_totali: number | null
  disponibile_dal: string | null
  in_prevendita: boolean
  moduli_totali: number
  lezioni_totali: number
  incontri_totali: number
  venduti: number
  incasso_cents: number
}

const euro = (cents: number) =>
  new Intl.NumberFormat('it-IT', { style: 'currency', currency: 'EUR' }).format(cents / 100)

export default function CatalogoTab() {
  const [corsi, setCorsi] = useState<Corso[]>([])
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')
  const [erroriRiga, setErroriRiga] = useState<Record<string, string>>({})
  const [nuovo, setNuovo] = useState(false)
  const [titolo, setTitolo] = useState('')
  const [slug, setSlug] = useState('')
  const [prezzo, setPrezzo] = useState('')
  const [modalita, setModalita] = useState<'registrato' | 'live'>('registrato')
  const [creazione, setCreazione] = useState(false)

  async function carica() {
    setCaricamento(true)
    setErrore('')
    try {
      const risposta = await fetch('/api/data/corsi')
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}))
        setErrore(dati.error || 'Impossibile caricare il catalogo.')
        setCorsi([])
      } else {
        setCorsi(await risposta.json())
      }
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setCaricamento(false)
    }
  }

  useEffect(() => { carica() }, [])

  // Lo slug finisce nell'indirizzo pubblico del corso e non si cambia piu senza
  // rompere i link gia condivisi: si propone dal titolo, ma resta modificabile.
  function slugDaTitolo(valore: string) {
    return valore
      .toLowerCase()
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 80)
  }

  async function crea(evento: React.FormEvent) {
    evento.preventDefault()
    const centesimi = Math.round(Number(prezzo.replace(',', '.')) * 100)
    if (!Number.isFinite(centesimi) || centesimi <= 0) {
      setErrore('Il prezzo deve essere un numero maggiore di zero.')
      return
    }
    setCreazione(true)
    setErrore('')
    try {
      const risposta = await fetch('/api/data/corsi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titolo,
          slug: slug || slugDaTitolo(titolo),
          prezzo_cents: centesimi,
          modalita,
          descrizione: '',
        }),
      })
      const dati = await risposta.json().catch(() => ({}))
      if (!risposta.ok) {
        setErrore(dati.error || 'Creazione non riuscita.')
        return
      }
      setNuovo(false)
      setTitolo(''); setSlug(''); setPrezzo(''); setModalita('registrato')
      await carica()
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setCreazione(false)
    }
  }

  async function cambiaPubblicazione(corso: Corso) {
    setErroriRiga(precedenti => { const resto = { ...precedenti }; delete resto[corso.id]; return resto })
    const risposta = await fetch(`/api/data/corsi/${corso.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pubblicato: !corso.pubblicato }),
    })
    if (!risposta.ok) {
      const dati = await risposta.json().catch(() => ({}))
      setErroriRiga(precedenti => ({ ...precedenti, [corso.id]: dati.error || 'Modifica non riuscita.' }))
      return
    }
    setCorsi(elenco => elenco.map(c => (c.id === corso.id ? { ...c, pubblicato: !c.pubblicato } : c)))
  }

  async function elimina(corso: Corso) {
    if (!confirm(`Eliminare «${corso.titolo}»? L'operazione non si annulla.`)) return
    const risposta = await fetch(`/api/data/corsi/${corso.id}`, { method: 'DELETE' })
    if (!risposta.ok) {
      const dati = await risposta.json().catch(() => ({}))
      // Un corso venduto non si elimina: il messaggio arriva dal server e spiega
      // che si archivia togliendolo dalla pubblicazione.
      setErroriRiga(precedenti => ({ ...precedenti, [corso.id]: dati.error || 'Eliminazione non riuscita.' }))
      return
    }
    setCorsi(elenco => elenco.filter(c => c.id !== corso.id))
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center gap-3 mb-1">
        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
          <GraduationCap className="w-5 h-5 text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Corsi</h1>
        {!caricamento && corsi.length > 0 && (
          <span className="ml-1 px-2.5 py-1 rounded-full bg-brand-600 text-white text-xs font-semibold">
            {corsi.length}
          </span>
        )}
        <button className="btn-primary ml-auto" onClick={() => setNuovo(v => !v)}>
          <Plus className="w-4 h-4" /> Nuovo corso
        </button>
      </div>
      <p className="text-sm text-gray-500 mb-6">
        Catalogo pubblico di <code>/corsi</code>. Un corso compare online solo quando è pubblicato.
      </p>

      {errore && <div className="card p-4 mb-4 text-sm text-red-700 bg-red-50 border-red-200">{errore}</div>}

      {nuovo && (
        <form className="card p-5 mb-5 grid gap-4 sm:grid-cols-2" onSubmit={crea}>
          <div className="sm:col-span-2">
            <span className="label">Titolo</span>
            <input
              className="input"
              value={titolo}
              onChange={e => { setTitolo(e.target.value); if (!slug) setSlug('') }}
              onBlur={() => { if (!slug) setSlug(slugDaTitolo(titolo)) }}
              required
              placeholder="Obblighi e responsabilità nell'uso dell'IA"
            />
          </div>
          <div>
            <span className="label">Slug (indirizzo pubblico)</span>
            <input className="input" value={slug} onChange={e => setSlug(e.target.value)} placeholder="obblighi-ia-professionisti" />
          </div>
          <div>
            <span className="label">Prezzo IVA esclusa (€)</span>
            <input className="input" value={prezzo} onChange={e => setPrezzo(e.target.value)} required inputMode="decimal" placeholder="390" />
          </div>
          <div>
            <span className="label">Modalità</span>
            <select className="input" value={modalita} onChange={e => setModalita(e.target.value as 'registrato' | 'live')}>
              <option value="registrato">Videocorso on demand</option>
              <option value="live">Aula in diretta</option>
            </select>
          </div>
          <div className="sm:col-span-2 flex gap-2">
            <button className="btn-primary" type="submit" disabled={creazione}>
              {creazione ? 'Creazione…' : 'Crea e continua'}
            </button>
            <button className="btn-secondary" type="button" onClick={() => setNuovo(false)}>Annulla</button>
          </div>
        </form>
      )}

      {caricamento ? (
        <div className="card p-8 text-center text-gray-400 text-sm">Caricamento…</div>
      ) : corsi.length === 0 ? (
        <div className="card p-10 text-center">
          <GraduationCap className="w-10 h-10 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500 font-medium">Nessun corso in catalogo</p>
          <p className="text-sm text-gray-400 mt-1">Creane uno: resta invisibile finché non lo pubblichi.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {corsi.map(corso => (
            <div key={corso.id} className="card p-4">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Link href={`/dashboard/corsi/${corso.id}`} className="font-semibold text-gray-900 hover:text-brand-600">
                      {corso.titolo}
                    </Link>
                    {corso.modalita === 'live' && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 text-xs font-semibold">
                        <Radio className="w-3 h-3" /> In diretta
                      </span>
                    )}
                    {corso.in_prevendita && (
                      <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs font-semibold">Prevendita</span>
                    )}
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${corso.pubblicato ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {corso.pubblicato ? 'Online' : 'Bozza'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    /corsi/{corso.slug} · {euro(corso.prezzo_cents)} ·{' '}
                    {corso.modalita === 'live'
                      ? `${corso.incontri_totali} incontri${corso.posti_totali ? ` · ${corso.posti_totali} posti` : ''}`
                      : `${corso.moduli_totali} moduli, ${corso.lezioni_totali} lezioni`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">{corso.venduti} venduti</p>
                  <p className="text-xs text-gray-500">{euro(corso.incasso_cents)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="btn-secondary" onClick={() => cambiaPubblicazione(corso)}>
                    {corso.pubblicato ? 'Togli dal catalogo' : 'Pubblica'}
                  </button>
                  <Link className="btn-secondary" href={`/dashboard/corsi/${corso.id}`}>Apri</Link>
                  <button
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                    onClick={() => elimina(corso)}
                    aria-label={`Elimina ${corso.titolo}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {erroriRiga[corso.id] && (
                <p className="mt-3 flex items-start gap-2 text-sm text-red-700">
                  <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {erroriRiga[corso.id]}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
