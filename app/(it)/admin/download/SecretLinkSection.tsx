'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { Check, Copy, KeyRound, Loader2, RefreshCw } from 'lucide-react'

type Props = {
  code: string | null
  // Genera un codice nuovo; restituisce il messaggio d'errore oppure null se è andata bene.
  onGenerate: () => Promise<string | null>
}

export default function SecretLinkSection({ code, onGenerate }: Props) {
  const titleId = useId()
  const linkId = useId()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (copiedTimer.current) clearTimeout(copiedTimer.current) }, [])

  // L'origine si legge solo qui, a elenco già caricato: il primo render non la usa.
  const link = code ? `${window.location.origin}/download/${code}` : null

  async function copy() {
    if (!link) return
    setError(null)
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      if (copiedTimer.current) clearTimeout(copiedTimer.current)
      copiedTimer.current = setTimeout(() => setCopied(false), 2500)
    } catch {
      // Contesto non sicuro o permesso negato: il campo resta selezionabile a mano.
      setError('Copia non riuscita: seleziona il link e copialo a mano.')
    }
  }

  async function generate() {
    if (busy) return
    if (code && !window.confirm('Il link attuale smetterà di funzionare per tutti. Continuare?')) return
    setBusy(true)
    setError(null)
    setCopied(false)
    const failure = await onGenerate()
    if (failure) setError(failure)
    setBusy(false)
  }

  return (
    <section className="card p-5" aria-labelledby={titleId}>
      <div className="flex items-center gap-2 mb-3">
        <KeyRound className="w-4 h-4 text-brand-600" aria-hidden="true" />
        <h2 id={titleId} className="font-bold text-gray-900">Link segreto</h2>
      </div>

      {link ? (
        <>
          <label htmlFor={linkId} className="label">Indirizzo da condividere</label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              id={linkId}
              className="input font-mono"
              value={link}
              readOnly
              onFocus={event => event.currentTarget.select()}
            />
            <div className="flex gap-2 shrink-0">
              <button type="button" onClick={copy} className="btn-secondary" disabled={busy}>
                {copied ? <Check className="w-4 h-4 text-brand-600" aria-hidden="true" /> : <Copy className="w-4 h-4" aria-hidden="true" />}
                Copia
              </button>
              <button
                type="button"
                onClick={generate}
                disabled={busy}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <RefreshCw className="w-4 h-4" aria-hidden="true" />}
                Genera nuovo link
              </button>
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Chi ha questo indirizzo vede le schede visibili. Con un nuovo link, quello attuale smette di funzionare.
          </p>
        </>
      ) : (
        <>
          <p className="text-sm text-gray-600 mb-3">Non c&rsquo;è ancora un link: generalo per rendere visibile la pagina.</p>
          <button
            type="button"
            onClick={generate}
            disabled={busy}
            className="btn-primary"
          >
            {busy && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
            Genera il link
          </button>
        </>
      )}

      {/* Annuncio per chi usa lo screen reader: la conferma non ha altro modo di arrivare. */}
      <p role="status" className={copied ? 'text-sm text-brand-700 mt-2' : undefined}>{copied ? 'Copiato' : ''}</p>
      {error && <p role="alert" className="text-sm text-red-600 mt-1">{error}</p>}
    </section>
  )
}
