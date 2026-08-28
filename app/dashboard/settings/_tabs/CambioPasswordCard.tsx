'use client'

import { useState } from 'react'
import { Lock, RefreshCw, Check } from 'lucide-react'
import { readApiError } from '@/lib/ai-client'

// Cambio password dell'utente loggato. Prima di questa card non esisteva alcun
// modo di cambiare una password dall'applicazione: gli account creati dal seed
// (db/migrations/011_admin_user.sql) restavano sulla password del seed, che è
// scritta in chiaro nel commento di quel file.
const MIN_LEN = 8

export default function CambioPasswordCard() {
  const [attuale, setAttuale] = useState('')
  const [nuova, setNuova] = useState('')
  const [conferma, setConferma] = useState('')
  const [salvando, setSalvando] = useState(false)
  const [fatto, setFatto] = useState(false)
  const [errore, setErrore] = useState<string | null>(null)

  const troppoCorta = nuova.length > 0 && nuova.length < MIN_LEN
  const nonCoincidono = conferma.length > 0 && nuova !== conferma
  const inviabile = Boolean(attuale) && nuova.length >= MIN_LEN && nuova === conferma && !salvando

  async function salva() {
    setErrore(null)
    setFatto(false)
    if (!inviabile) return
    setSalvando(true)
    try {
      const res = await fetch('/api/account/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ current_password: attuale, new_password: nuova }),
      })
      if (!res.ok) throw new Error(await readApiError(res, 'Cambio password non riuscito'))
      setFatto(true)
      setAttuale('')
      setNuova('')
      setConferma('')
    } catch (e) {
      setErrore((e as Error).message)
    } finally {
      setSalvando(false)
    }
  }

  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-1">
        <Lock className="w-4 h-4 text-gray-500" />
        <p className="text-sm font-medium text-gray-900">Password del tuo account</p>
      </div>
      <p className="text-xs text-gray-400 mb-3">
        Cambia la password con cui accedi. Serve la password attuale come conferma. Minimo {MIN_LEN} caratteri.
      </p>

      <div className="space-y-2">
        <input
          type="password"
          value={attuale}
          onChange={e => setAttuale(e.target.value)}
          placeholder="Password attuale"
          className="input w-full text-sm"
          autoComplete="current-password"
        />
        <input
          type="password"
          value={nuova}
          onChange={e => setNuova(e.target.value)}
          placeholder="Nuova password"
          className="input w-full text-sm"
          autoComplete="new-password"
        />
        <input
          type="password"
          value={conferma}
          onChange={e => setConferma(e.target.value)}
          placeholder="Ripeti la nuova password"
          className="input w-full text-sm"
          autoComplete="new-password"
          onKeyDown={e => { if (e.key === 'Enter') salva() }}
        />
      </div>

      {troppoCorta && <p className="text-xs text-amber-600 mt-2">La nuova password deve avere almeno {MIN_LEN} caratteri.</p>}
      {nonCoincidono && <p className="text-xs text-amber-600 mt-2">Le due password non coincidono.</p>}
      {errore && <p className="text-xs text-red-600 mt-2">{errore}</p>}
      {fatto && (
        <p className="text-xs text-green-700 mt-2">
          Password aggiornata. Le sessioni gia aperte su altri dispositivi restano valide: se sospetti un accesso altrui, esci da quei dispositivi.
        </p>
      )}

      <button
        onClick={salva}
        disabled={!inviabile}
        className="btn-primary py-2 px-4 mt-3 justify-center whitespace-nowrap disabled:opacity-50"
      >
        {salvando ? <RefreshCw className="w-4 h-4 animate-spin" /> : fatto ? <><Check className="w-4 h-4" /> Aggiornata</> : 'Cambia password'}
      </button>
    </div>
  )
}
