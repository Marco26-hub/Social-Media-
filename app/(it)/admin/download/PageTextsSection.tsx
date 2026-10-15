'use client'

import { useCallback, useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react'
import { ExternalLink, Loader2, PenLine, Save, TriangleAlert } from 'lucide-react'
import {
  hasMarkerPhrase,
  MARKER_PHRASE,
  PAGE_TEXT_LIMITS,
  type PageSettings,
  type PageTextKey,
  type PageTexts,
} from '@/lib/download-area'
import { SITE_URL } from '@/lib/site-config'
import { callApi } from './api'

const SETTINGS_URL = '/api/admin/downloads/settings'

type SettingsResponse = { settings: PageSettings; defaults: PageTexts; needs_migration: boolean }

// Cosa mostra la sezione: prima carica i testi, poi o il modulo o il motivo per cui non c'è.
type View =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'migration' }
  | { status: 'ready'; settings: PageSettings; defaults: PageTexts }

// I testi come stanno nei campi: null (= testo standard) diventa un campo vuoto.
type Fields = Record<PageTextKey, string>

const FIELDS: { key: PageTextKey; label: string; multiline: boolean }[] = [
  { key: 'eyebrow', label: 'Occhiello', multiline: false },
  { key: 'title', label: 'Titolo', multiline: false },
  { key: 'lead', label: 'Sottotitolo', multiline: true },
  { key: 'whatsappText', label: 'Messaggio WhatsApp', multiline: true },
]

function toFields(settings: PageSettings): Fields {
  return {
    eyebrow: settings.eyebrow ?? '',
    title: settings.title ?? '',
    lead: settings.lead ?? '',
    whatsappText: settings.whatsappText ?? '',
  }
}

type FormProps = {
  code: string | null
  // Testi salvati al caricamento: servono solo a riempire i campi la prima volta.
  initial: PageSettings
  // Testi standard che manda il server: sono gli stessi che usa la pagina pubblica, quindi
  // segnaposto e controllo della frase non possono divergere da ciò che vedono i visitatori.
  defaults: PageTexts
}

function TextsForm({ code, initial, defaults }: FormProps) {
  const ids = useId()
  const [fields, setFields] = useState<Fields>(() => toFields(initial))
  const [busy, setBusy] = useState(false)
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // La frase si cerca nel messaggio che la pagina userà davvero: con il campo vuoto è
  // quello standard, che la contiene, e l'avviso non serve.
  const effectiveMessage = fields.whatsappText.trim() ? fields.whatsappText : defaults.whatsappText
  const missingMarker = !hasMarkerPhrase(effectiveMessage)

  function edit(key: PageTextKey, value: string) {
    setFields(current => ({ ...current, [key]: value }))
    // Il "salvato" non vale più: i campi non sono più quelli salvati.
    setSaved(false)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setBusy(true)
    setSaved(false)
    setError(null)

    // Solo i quattro testi, mai `showUgc`: l'interruttore dell'app non è di questo
    // pannello e il server, se non lo riceve, lo lascia com'è.
    const res = await callApi<{ settings: PageSettings }>(SETTINGS_URL, {
      method: 'PUT',
      body: { eyebrow: fields.eyebrow, title: fields.title, lead: fields.lead, whatsappText: fields.whatsappText },
    })
    if (res.ok) {
      // Il server restituisce i testi puliti (spazi in eccesso tolti, vuoto = standard):
      // i campi si riallineano a quelli, così a video resta ciò che è stato salvato.
      setFields(toFields(res.data.settings))
      setSaved(true)
    } else {
      setError(res.error)
    }
    setBusy(false)
  }

  return (
    <form onSubmit={submit}>
      <p className="text-xs text-gray-500 mb-4">Se lasci un campo vuoto, la pagina usa il testo standard.</p>

      <div className="space-y-4">
        {FIELDS.map(({ key, label, multiline }) => {
          const fieldId = `${ids}-${key}`
          const countId = `${fieldId}-count`
          const warningId = `${fieldId}-warning`
          const value = fields[key]
          const limit = PAGE_TEXT_LIMITS[key]
          const warn = key === 'whatsappText' && missingMarker
          const shared = {
            id: fieldId,
            // Il segnaposto è il testo standard, cioè un'informazione: grigio più scuro del
            // predefinito, che sul bianco è troppo chiaro per leggerlo bene.
            className: 'input placeholder:text-gray-500',
            maxLength: limit,
            placeholder: defaults[key],
            value,
            disabled: busy,
            'aria-describedby': warn ? `${countId} ${warningId}` : countId,
            onChange: (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => edit(key, event.target.value),
          }
          return (
            <div key={key}>
              <label htmlFor={fieldId} className="label">{label}</label>
              {multiline ? <textarea {...shared} rows={3} /> : <input {...shared} />}
              <div className="mt-1 flex items-start justify-between gap-3">
                {warn && (
                  <p id={warningId} className="flex items-start gap-1.5 text-xs text-amber-800">
                    <TriangleAlert className="w-3.5 h-3.5 mt-px shrink-0" aria-hidden="true" />
                    {`Senza "${MARKER_PHRASE}" non riconosci le chat che arrivano dalla campagna`}
                  </p>
                )}
                {/* Il contatore è legato al campo con aria-describedby: lo screen reader lo legge
                    quando si entra nel campo, non a ogni tasto. "5/60" da solo si capisce male. */}
                <p id={countId} className="ml-auto shrink-0 text-xs text-gray-500 tabular-nums">
                  <span aria-hidden="true">{value.length}/{limit}</span>
                  <span className="sr-only">{value.length} caratteri su {limit}</span>
                </p>
              </div>
            </div>
          )
        })}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button type="submit" className="btn-primary" disabled={busy}>
          {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Save className="w-4 h-4" aria-hidden="true" />}
          Salva i testi
        </button>
        {/* Stesso indirizzo pubblico del link segreto (SITE_URL), per controllare il risultato. */}
        {code ? (
          <a href={`${SITE_URL}/download/${code}`} target="_blank" rel="noopener noreferrer" className="btn-secondary">
            <ExternalLink className="w-4 h-4" aria-hidden="true" />
            Apri la pagina
          </a>
        ) : (
          <p className="text-xs text-gray-500">Genera prima il link segreto per vedere la pagina.</p>
        )}
      </div>

      {/* Sempre nel DOM, come in SecretLinkSection: l'esito arriva allo screen reader solo
          se l'area esiste già quando il testo compare. */}
      <p role="status" className={saved ? 'mt-2 text-sm text-brand-700' : undefined}>{saved ? 'Testi salvati.' : ''}</p>
      {error && <p role="alert" className="mt-2 text-sm text-red-600">{error}</p>}
    </form>
  )
}

type Props = {
  // Codice del link segreto: serve solo a «Apri la pagina».
  code: string | null
}

export default function PageTextsSection({ code }: Props) {
  const titleId = useId()
  const [view, setView] = useState<View>({ status: 'loading' })

  // Primo caricamento (e "Riprova"). Il modulo parte da ciò che torna dal server.
  const load = useCallback(async () => {
    setView({ status: 'loading' })
    const res = await callApi<SettingsResponse>(SETTINGS_URL)
    if (!res.ok) setView({ status: 'error', message: res.error })
    else if (res.data.needs_migration) setView({ status: 'migration' })
    else setView({ status: 'ready', settings: res.data.settings, defaults: res.data.defaults })
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  return (
    <section className="card p-5" aria-labelledby={titleId}>
      <div className="flex items-center gap-2 mb-3">
        <PenLine className="w-4 h-4 text-brand-600" aria-hidden="true" />
        <h2 id={titleId} className="font-bold text-gray-900">Testi della pagina</h2>
      </div>

      {view.status === 'loading' && (
        <p role="status" className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
          Caricamento
        </p>
      )}
      {view.status === 'error' && (
        <div>
          <p role="alert" className="text-sm text-red-600">{view.message}</p>
          <button type="button" onClick={() => void load()} className="btn-secondary mt-3">Riprova</button>
        </div>
      )}
      {view.status === 'migration' && (
        <p role="alert" className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Per salvare i testi applica la migrazione 053 (npm run migrate) e ricarica.
        </p>
      )}
      {view.status === 'ready' && <TextsForm code={code} initial={view.settings} defaults={view.defaults} />}
    </section>
  )
}
