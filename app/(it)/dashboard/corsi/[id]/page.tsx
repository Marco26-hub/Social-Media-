'use client'
export const dynamic = 'force-dynamic'

import { use, useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ArrowLeft, CalendarClock, Check, ChevronDown, ChevronRight, GripVertical,
  Plus, Save, Trash2,
} from 'lucide-react'

type Lezione = {
  id: string
  titolo: string
  ordine: number
  tipo: 'video' | 'testo'
  durata_min: number | null
  anteprima_gratuita: boolean
  video_url: string | null
  video_protetto: boolean
  contenuto: string | null
}

type Modulo = { id: string; titolo: string; ordine: number; lezioni: Lezione[] }

type Incontro = {
  id: string
  titolo: string
  ordine: number
  inizio_il: string
  durata_min: number
  registrazione_disponibile: boolean
  note: string | null
}

type Corso = {
  id: string
  slug: string
  titolo: string
  sottotitolo: string | null
  descrizione: string
  prezzo_cents: number
  livello: 'base' | 'intermedio' | 'avanzato'
  categoria: string | null
  pubblicato: boolean
  in_evidenza: boolean
  disponibile_dal: string | null
  modalita: 'registrato' | 'live'
  posti_totali: number | null
  link_accesso: string | null
  seo_title: string | null
  seo_description: string | null
  venduti: number
  moduli: Modulo[]
  incontri: Incontro[]
}

// Le date arrivano in ISO con fuso; <input type="datetime-local"> vuole
// «AAAA-MM-GGThh:mm» in ora locale. Senza questa conversione il campo resta
// vuoto e salvare cancellerebbe la data.
function perInput(iso: string | null): string {
  if (!iso) return ''
  const data = new Date(iso)
  const scostamento = data.getTimezoneOffset() * 60000
  return new Date(data.getTime() - scostamento).toISOString().slice(0, 16)
}

export default function EditorCorso({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const [corso, setCorso] = useState<Corso | null>(null)
  const [caricamento, setCaricamento] = useState(true)
  const [errore, setErrore] = useState('')
  const [salvato, setSalvato] = useState(false)
  const [salvataggio, setSalvataggio] = useState(false)
  const [aperti, setAperti] = useState<Record<string, boolean>>({})

  const carica = useCallback(async () => {
    setCaricamento(true)
    try {
      const risposta = await fetch(`/api/data/corsi/${id}`)
      if (!risposta.ok) {
        const dati = await risposta.json().catch(() => ({}))
        setErrore(dati.error || 'Corso non trovato.')
        setCorso(null)
      } else {
        setCorso(await risposta.json())
        setErrore('')
      }
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setCaricamento(false)
    }
  }, [id])

  useEffect(() => { carica() }, [carica])

  function modifica(campi: Partial<Corso>) {
    setCorso(precedente => (precedente ? { ...precedente, ...campi } : precedente))
    setSalvato(false)
  }

  async function salva() {
    if (!corso) return
    setSalvataggio(true)
    setErrore('')
    try {
      const risposta = await fetch(`/api/data/corsi/${corso.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          titolo: corso.titolo,
          slug: corso.slug,
          sottotitolo: corso.sottotitolo,
          descrizione: corso.descrizione,
          prezzo_cents: corso.prezzo_cents,
          livello: corso.livello,
          categoria: corso.categoria,
          pubblicato: corso.pubblicato,
          in_evidenza: corso.in_evidenza,
          disponibile_dal: corso.disponibile_dal,
          modalita: corso.modalita,
          posti_totali: corso.posti_totali,
          link_accesso: corso.link_accesso,
          seo_title: corso.seo_title,
          seo_description: corso.seo_description,
        }),
      })
      const dati = await risposta.json().catch(() => ({}))
      if (!risposta.ok) { setErrore(dati.error || 'Salvataggio non riuscito.'); return }
      setSalvato(true)
    } catch {
      setErrore('Errore di rete.')
    } finally {
      setSalvataggio(false)
    }
  }

  // Le operazioni su moduli, lezioni e incontri ricaricano il corso invece di
  // aggiornare lo stato a mano: sono poche e poco frequenti, e una ricarica
  // evita che la pagina mostri un ordine diverso da quello del database.
  async function chiama(percorso: string, metodo: string, corpo: Record<string, unknown>) {
    setErrore('')
    const risposta = await fetch(`/api/data/corsi/${percorso}`, {
      method: metodo,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(corpo),
    })
    if (!risposta.ok) {
      const dati = await risposta.json().catch(() => ({}))
      setErrore(dati.error || 'Operazione non riuscita.')
      return false
    }
    await carica()
    return true
  }

  if (caricamento) return <div className="card p-8 text-sm text-gray-400">Caricamento…</div>
  if (!corso) return <div className="card p-6 text-sm text-red-700 bg-red-50 border-red-200">{errore || 'Corso non trovato.'}</div>

  const live = corso.modalita === 'live'

  return (
    <div className="max-w-4xl">
      <Link href="/dashboard/corsi" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-brand-600 mb-4">
        <ArrowLeft className="w-4 h-4" /> Tutti i corsi
      </Link>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-gray-900 flex-1 min-w-0">{corso.titolo}</h1>
        {corso.venduti > 0 && (
          <span className="px-2.5 py-1 rounded-full bg-green-50 text-green-700 text-xs font-semibold">
            {corso.venduti} venduti
          </span>
        )}
        <Link className="btn-secondary" href={`/corsi/${corso.slug}`} target="_blank">Vedi la pagina</Link>
        <button className="btn-primary" onClick={salva} disabled={salvataggio}>
          {salvato ? <><Check className="w-4 h-4" /> Salvato</> : <><Save className="w-4 h-4" /> {salvataggio ? 'Salvataggio…' : 'Salva'}</>}
        </button>
      </div>

      {errore && <div className="card p-4 mb-4 text-sm text-red-700 bg-red-50 border-red-200">{errore}</div>}

      {corso.venduti > 0 && (
        <div className="card p-4 mb-4 text-sm text-amber-800 bg-amber-50 border-amber-200">
          Questo corso è già stato venduto. Prezzo, date e programma sono ciò che
          {' '}{corso.venduti === 1 ? 'una persona ha' : `${corso.venduti} persone hanno`} comprato:
          cambiarli non è una modifica interna, va comunicato.
        </div>
      )}

      {/* ── Anagrafica ─────────────────────────────────────────────────── */}
      <section className="card p-5 mb-5 grid gap-4 sm:grid-cols-2">
        <h2 className="sm:col-span-2 font-semibold text-gray-900">Scheda</h2>

        <label className="sm:col-span-2">
          <span className="label">Titolo</span>
          <input className="input" value={corso.titolo} onChange={e => modifica({ titolo: e.target.value })} />
        </label>

        <label>
          <span className="label">Slug</span>
          <input className="input" value={corso.slug} onChange={e => modifica({ slug: e.target.value })} />
          <small className="block mt-1 text-xs text-gray-400">
            Cambiarlo rompe i link già condivisi.
          </small>
        </label>

        <label>
          <span className="label">Prezzo IVA esclusa (€)</span>
          <input
            className="input"
            inputMode="decimal"
            value={(corso.prezzo_cents / 100).toString()}
            onChange={e => {
              const centesimi = Math.round(Number(e.target.value.replace(',', '.')) * 100)
              if (Number.isFinite(centesimi)) modifica({ prezzo_cents: centesimi })
            }}
          />
        </label>

        <label className="sm:col-span-2">
          <span className="label">Sottotitolo</span>
          <input className="input" value={corso.sottotitolo ?? ''} onChange={e => modifica({ sottotitolo: e.target.value })} />
        </label>

        <label className="sm:col-span-2">
          <span className="label">Descrizione</span>
          <textarea className="input min-h-32" value={corso.descrizione} onChange={e => modifica({ descrizione: e.target.value })} />
        </label>

        <label>
          <span className="label">Livello</span>
          <select className="input" value={corso.livello} onChange={e => modifica({ livello: e.target.value as Corso['livello'] })}>
            <option value="base">Base</option>
            <option value="intermedio">Intermedio</option>
            <option value="avanzato">Avanzato</option>
          </select>
        </label>

        <label>
          <span className="label">Categoria</span>
          <input className="input" value={corso.categoria ?? ''} onChange={e => modifica({ categoria: e.target.value })} placeholder="Adempimenti" />
        </label>

        <label>
          <span className="label">Modalità</span>
          <select className="input" value={corso.modalita} onChange={e => modifica({ modalita: e.target.value as Corso['modalita'] })}>
            <option value="registrato">Videocorso on demand</option>
            <option value="live">Aula in diretta</option>
          </select>
        </label>

        <label>
          <span className="label">Disponibile dal (lascia vuoto = subito)</span>
          <input
            className="input"
            type="datetime-local"
            value={perInput(corso.disponibile_dal)}
            onChange={e => modifica({ disponibile_dal: e.target.value ? new Date(e.target.value).toISOString() : null })}
          />
          <small className="block mt-1 text-xs text-gray-400">
            Una data futura mette il corso in prevendita: viene dichiarata al cliente ed è un impegno.
          </small>
        </label>

        {live && (
          <>
            <label>
              <span className="label">Posti totali</span>
              <input
                className="input"
                inputMode="numeric"
                value={corso.posti_totali ?? ''}
                onChange={e => modifica({ posti_totali: e.target.value ? Number(e.target.value) : null })}
                placeholder="12"
              />
            </label>
            <label>
              <span className="label">Link alla stanza (solo iscritti)</span>
              <input
                className="input"
                value={corso.link_accesso ?? ''}
                onChange={e => modifica({ link_accesso: e.target.value })}
                placeholder="https://us02web.zoom.us/j/…"
              />
              <small className="block mt-1 text-xs text-gray-400">
                Non compare mai sulla pagina pubblica: lo vede solo chi ha pagato.
              </small>
            </label>
          </>
        )}

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={corso.pubblicato} onChange={e => modifica({ pubblicato: e.target.checked })} />
          Pubblicato nel catalogo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={corso.in_evidenza} onChange={e => modifica({ in_evidenza: e.target.checked })} />
          In evidenza
        </label>

        <label className="sm:col-span-2">
          <span className="label">Titolo SEO</span>
          <input className="input" value={corso.seo_title ?? ''} onChange={e => modifica({ seo_title: e.target.value })} />
        </label>
        <label className="sm:col-span-2">
          <span className="label">Descrizione SEO</span>
          <textarea className="input" value={corso.seo_description ?? ''} onChange={e => modifica({ seo_description: e.target.value })} />
        </label>
      </section>

      {/* ── Incontri live ──────────────────────────────────────────────── */}
      {live && (
        <section className="card p-5 mb-5">
          <div className="flex items-center gap-3 mb-4">
            <CalendarClock className="w-5 h-5 text-brand-600" />
            <h2 className="font-semibold text-gray-900 flex-1">Incontri</h2>
            <button
              className="btn-secondary"
              onClick={() => {
                const fra7giorni = new Date(Date.now() + 7 * 86400000)
                fra7giorni.setMinutes(0, 0, 0)
                chiama('incontri', 'POST', {
                  corso_id: corso.id,
                  titolo: `Incontro ${corso.incontri.length + 1}`,
                  ordine: corso.incontri.length,
                  inizio_il: fra7giorni.toISOString(),
                  durata_min: 120,
                })
              }}
            >
              <Plus className="w-4 h-4" /> Aggiungi incontro
            </button>
          </div>

          {corso.incontri.length === 0 ? (
            <p className="text-sm text-gray-400">Nessun incontro. Le date vanno inserite prima di pubblicare: sono quello che il cliente compra.</p>
          ) : (
            <div className="space-y-3">
              {corso.incontri.map(incontro => (
                <div key={incontro.id} className="border border-gray-100 rounded-lg p-3 grid gap-3 sm:grid-cols-[1fr_auto_auto_auto] sm:items-end">
                  <label>
                    <span className="label">Titolo</span>
                    <input
                      className="input"
                      defaultValue={incontro.titolo}
                      onBlur={e => { if (e.target.value !== incontro.titolo) chiama('incontri', 'PATCH', { id: incontro.id, titolo: e.target.value }) }}
                    />
                  </label>
                  <label>
                    <span className="label">Data e ora</span>
                    <input
                      className="input"
                      type="datetime-local"
                      defaultValue={perInput(incontro.inizio_il)}
                      onBlur={e => { if (e.target.value) chiama('incontri', 'PATCH', { id: incontro.id, inizio_il: new Date(e.target.value).toISOString() }) }}
                    />
                  </label>
                  <label>
                    <span className="label">Minuti</span>
                    <input
                      className="input w-24"
                      inputMode="numeric"
                      defaultValue={incontro.durata_min}
                      onBlur={e => chiama('incontri', 'PATCH', { id: incontro.id, durata_min: Number(e.target.value) || 120 })}
                    />
                  </label>
                  <button
                    className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 justify-self-start"
                    onClick={() => { if (confirm('Eliminare questo incontro?')) chiama('incontri', 'DELETE', { id: incontro.id }) }}
                    aria-label="Elimina incontro"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* ── Programma ──────────────────────────────────────────────────── */}
      <section className="card p-5">
        <div className="flex items-center gap-3 mb-4">
          <GripVertical className="w-5 h-5 text-brand-600" />
          <h2 className="font-semibold text-gray-900 flex-1">
            {live ? 'Materiali e registrazioni' : 'Programma'}
          </h2>
          <button
            className="btn-secondary"
            onClick={() => chiama('moduli', 'POST', {
              corso_id: corso.id,
              titolo: `Modulo ${corso.moduli.length + 1}`,
              ordine: corso.moduli.length,
            })}
          >
            <Plus className="w-4 h-4" /> Aggiungi modulo
          </button>
        </div>

        {corso.moduli.length === 0 ? (
          <p className="text-sm text-gray-400">Nessun modulo.</p>
        ) : (
          <div className="space-y-3">
            {corso.moduli.map((modulo, indice) => {
              const aperto = aperti[modulo.id] ?? true
              return (
                <div key={modulo.id} className="border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-2 p-3">
                    <button
                      className="p-1 text-gray-400 hover:text-gray-700"
                      onClick={() => setAperti(stato => ({ ...stato, [modulo.id]: !aperto }))}
                      aria-label={aperto ? 'Chiudi modulo' : 'Apri modulo'}
                    >
                      {aperto ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <span className="text-xs font-semibold text-gray-400 w-6">{indice + 1}</span>
                    <input
                      className="input flex-1"
                      defaultValue={modulo.titolo}
                      onBlur={e => { if (e.target.value !== modulo.titolo) chiama('moduli', 'PATCH', { id: modulo.id, titolo: e.target.value }) }}
                    />
                    <button
                      className="btn-secondary"
                      onClick={() => chiama('lezioni', 'POST', {
                        modulo_id: modulo.id,
                        titolo: `Lezione ${modulo.lezioni.length + 1}`,
                        ordine: modulo.lezioni.length,
                        tipo: 'video',
                      })}
                    >
                      <Plus className="w-4 h-4" /> Lezione
                    </button>
                    <button
                      className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50"
                      onClick={() => {
                        if (confirm(`Eliminare «${modulo.titolo}» e le sue ${modulo.lezioni.length} lezioni?`)) {
                          chiama('moduli', 'DELETE', { id: modulo.id })
                        }
                      }}
                      aria-label="Elimina modulo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {aperto && (
                    <div className="border-t border-gray-100 p-3 space-y-3">
                      {modulo.lezioni.length === 0 && (
                        <p className="text-sm text-gray-400">Nessuna lezione in questo modulo.</p>
                      )}
                      {modulo.lezioni.map(lezione => (
                        <div key={lezione.id} className="grid gap-3 sm:grid-cols-[1fr_120px_110px_auto] sm:items-end bg-gray-50 rounded-lg p-3">
                          <label className="sm:col-span-4">
                            <span className="label">Titolo lezione</span>
                            <input
                              className="input"
                              defaultValue={lezione.titolo}
                              onBlur={e => { if (e.target.value !== lezione.titolo) chiama('lezioni', 'PATCH', { id: lezione.id, titolo: e.target.value }) }}
                            />
                          </label>
                          <label>
                            <span className="label">Tipo</span>
                            <select
                              className="input"
                              defaultValue={lezione.tipo}
                              onChange={e => chiama('lezioni', 'PATCH', { id: lezione.id, tipo: e.target.value })}
                            >
                              <option value="video">Video</option>
                              <option value="testo">Testo</option>
                            </select>
                          </label>
                          <label>
                            <span className="label">Minuti</span>
                            <input
                              className="input"
                              inputMode="numeric"
                              defaultValue={lezione.durata_min ?? ''}
                              onBlur={e => chiama('lezioni', 'PATCH', { id: lezione.id, durata_min: e.target.value ? Number(e.target.value) : null })}
                            />
                          </label>
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              defaultChecked={lezione.anteprima_gratuita}
                              onChange={e => chiama('lezioni', 'PATCH', { id: lezione.id, anteprima_gratuita: e.target.checked })}
                            />
                            Anteprima
                          </label>
                          <button
                            className="p-2 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 justify-self-start"
                            onClick={() => { if (confirm('Eliminare questa lezione?')) chiama('lezioni', 'DELETE', { id: lezione.id }) }}
                            aria-label="Elimina lezione"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <label className="sm:col-span-4">
                            <span className="label">Chiave del video sullo storage privato</span>
                            <input
                              className="input"
                              defaultValue={lezione.video_protetto ? '•••• (già impostata)' : ''}
                              placeholder="corsi/obblighi-ia/1-1.mp4"
                              onBlur={e => {
                                const valore = e.target.value.trim()
                                if (valore.startsWith('••')) return
                                chiama('lezioni', 'PATCH', { id: lezione.id, video_storage_key: valore || null })
                              }}
                            />
                            <small className="block mt-1 text-xs text-gray-400">
                              È la strada da usare: il file non ha un indirizzo pubblico e passa dal controllo dell&apos;acquisto.
                            </small>
                          </label>

                          <label className="sm:col-span-4">
                            <span className="label">Oppure embed esterno (pubblico)</span>
                            <input
                              className="input"
                              defaultValue={lezione.video_url ?? ''}
                              placeholder="https://www.youtube.com/embed/…"
                              onBlur={e => chiama('lezioni', 'PATCH', { id: lezione.id, video_url: e.target.value.trim() || null })}
                            />
                            <small className="block mt-1 text-xs text-gray-400">
                              Chiunque abbia il link lo guarda: solo per materiale promozionale.
                            </small>
                          </label>

                          <label className="sm:col-span-4">
                            <span className="label">Testo della lezione</span>
                            <textarea
                              className="input min-h-24"
                              defaultValue={lezione.contenuto ?? ''}
                              onBlur={e => chiama('lezioni', 'PATCH', { id: lezione.id, contenuto: e.target.value || null })}
                            />
                          </label>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
