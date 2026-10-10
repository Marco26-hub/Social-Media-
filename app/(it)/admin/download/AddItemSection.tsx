'use client'

import { useId, useRef, useState, type FormEvent } from 'react'
import { Link2, Loader2, Upload as UploadIcon } from 'lucide-react'
import { upload } from '@vercel/blob/client'
import {
  ALLOWED_FILE_TYPES,
  buildBlobPathname,
  normalizeLinkUrl,
  validateFileMeta,
  validateItemText,
} from '@/lib/download-area'
import type { DownloadItem } from '@/lib/download-area-db'
import { callApi } from './api'

const UPLOAD_URL = '/api/admin/downloads/upload'
const ACCEPT = Object.keys(ALLOWED_FILE_TYPES).map(extension => `.${extension}`).join(',')
const UPLOADED_NOT_SAVED = 'Il file è stato caricato ma la scheda non è stata creata: riprova'
const UPLOADED_NOT_CHECKED = 'Il file è stato caricato ma non riesco a controllare l’elenco delle schede: riprova tra poco'

type UploadedBlob = Awaited<ReturnType<typeof upload>>

// upload() lancia errori generici in inglese (es. "Failed to retrieve the client
// token"): non dicono se manca la sessione o lo storage, quindi si traducono qui.
function uploadErrorMessage(error: unknown): string {
  if (error instanceof Error && /client token/i.test(error.message)) {
    return 'Caricamento non autorizzato: ricarica la pagina e verifica che lo storage dei file sia configurato.'
  }
  return 'Caricamento non riuscito: controlla la connessione e riprova.'
}

function stripExtension(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '')
}

type FormProps = {
  // Aggiorna l'elenco dopo la creazione di una scheda.
  onCreated: () => Promise<void>
  // Rilegge l'elenco dal server (e lo aggiorna a video): null se la lettura non riesce.
  onRefresh: () => Promise<DownloadItem[] | null>
}

type CreatedCheck = 'yes' | 'no' | 'unknown'

function FileForm({ onCreated, onRefresh }: FormProps) {
  const ids = useId()
  const fileInput = useRef<HTMLInputElement>(null)
  // Blob già caricato ma senza scheda: un "riprova" non deve ricaricare il file.
  // Va riusato solo dopo aver verificato che nessuna scheda lo usi già (vedi alreadyCreated).
  const uploaded = useRef<{ file: File; blob: UploadedBlob } | null>(null)
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [titleEdited, setTitleEdited] = useState(false)
  const [description, setDescription] = useState('')
  const [phase, setPhase] = useState<'idle' | 'upload' | 'save'>('idle')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const busy = phase !== 'idle'

  function onFileChange(files: FileList | null) {
    const next = files?.[0] ?? null
    setFile(next)
    setError(null)
    setDone(false)
    // Il titolo segue il nome del file finché non lo modifica a mano.
    if (!titleEdited) setTitle(next ? stripExtension(next.name) : '')
  }

  // Il server ha già una scheda su questo blob? Si legge l'elenco aggiornato.
  async function alreadyCreated(blob: UploadedBlob): Promise<CreatedCheck> {
    const items = await onRefresh()
    if (!items) return 'unknown'
    return items.some(item => item.blobPathname === blob.pathname) ? 'yes' : 'no'
  }

  // La scheda esiste: il modulo si svuota, pronto per il file successivo.
  function finishCreated() {
    uploaded.current = null
    setFile(null)
    setTitle('')
    setTitleEdited(false)
    setDescription('')
    setProgress(0)
    if (fileInput.current) fileInput.current.value = ''
    setDone(true)
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(null)
    setDone(false)

    // Tutta la validazione prima di toccare la rete (e a ogni tentativo, anche
    // quando il file è già stato caricato).
    if (!file) {
      setError('Seleziona un file da caricare.')
      return
    }
    const meta = validateFileMeta({ name: file.name, size: file.size, contentType: file.type })
    if (!meta.ok) {
      setError(meta.error)
      return
    }
    const text = validateItemText({ title, description })
    if (!text.ok) {
      setError(text.error)
      return
    }

    let blob = uploaded.current?.file === file ? uploaded.current.blob : null
    if (blob) {
      // Riprova con un blob già caricato: il tentativo precedente può essere andato a
      // buon fine anche se a noi è sembrato fallire. Due schede sullo stesso blob
      // sono pericolose (eliminandone una si cancella il file dell'altra), quindi
      // prima si controlla l'elenco e si crea la scheda solo se manca.
      setPhase('save')
      const created = await alreadyCreated(blob)
      if (created === 'yes') {
        finishCreated()
        setPhase('idle')
        return
      }
      if (created === 'unknown') {
        setError(UPLOADED_NOT_CHECKED)
        setPhase('idle')
        return
      }
    } else {
      setPhase('upload')
      setProgress(0)
      try {
        // Il token di upload ammette solo i MIME canonici: il tipo dichiarato dal
        // browser è spesso vuoto o diverso, quindi si passa sempre quello dell'estensione.
        blob = await upload(buildBlobPathname(file.name), file, {
          access: 'public',
          handleUploadUrl: UPLOAD_URL,
          multipart: true,
          contentType: meta.contentType,
          onUploadProgress: ({ percentage }) => setProgress(Math.round(percentage)),
        })
      } catch (e) {
        setError(uploadErrorMessage(e))
        setPhase('idle')
        return
      }
      uploaded.current = { file, blob }
    }

    setPhase('save')
    const res = await callApi<{ item: DownloadItem }>('/api/admin/downloads', {
      method: 'POST',
      body: {
        kind: 'file',
        title: text.title,
        description: text.description,
        blob: {
          url: blob.url,
          downloadUrl: blob.downloadUrl,
          pathname: blob.pathname,
          contentType: meta.contentType,
          size: file.size,
          fileName: file.name,
        },
      },
    })
    if (!res.ok) {
      if (res.status === 400) {
        // Titolo e descrizione sono già stati validati qui sopra con le stesse regole
        // del server, quindi un 400 riguarda il blob: il riprova deve ricaricarlo.
        uploaded.current = null
      } else if (!(res.status >= 400 && res.status < 500)) {
        // Rete caduta (0) o errore del server (5xx): la scheda potrebbe esistere già.
        // Si controlla subito, così non si invita a "riprovare" ciò che è già fatto.
        if ((await alreadyCreated(blob)) === 'yes') {
          finishCreated()
          setPhase('idle')
          return
        }
      }
      setError(`${UPLOADED_NOT_SAVED} (${res.error})`)
      setPhase('idle')
      return
    }

    finishCreated()
    await onCreated()
    setPhase('idle')
  }

  return (
    <form onSubmit={submit} className="space-y-3" aria-labelledby={`${ids}-heading`}>
      <h3 id={`${ids}-heading`} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <UploadIcon className="w-4 h-4 text-brand-600" aria-hidden="true" />
        File
      </h3>
      <div>
        <label htmlFor={`${ids}-file`} className="label">Scegli il file</label>
        <input
          ref={fileInput}
          id={`${ids}-file`}
          type="file"
          accept={ACCEPT}
          disabled={busy}
          onChange={event => onFileChange(event.target.files)}
          className="block w-full text-sm text-gray-700 file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-gray-100 file:text-sm file:font-medium file:text-gray-700 hover:file:bg-gray-200"
        />
      </div>
      <div>
        <label htmlFor={`${ids}-title`} className="label">Titolo</label>
        <input
          id={`${ids}-title`}
          className="input"
          value={title}
          disabled={busy}
          onChange={event => {
            setTitle(event.target.value)
            setTitleEdited(event.target.value !== '')
          }}
        />
      </div>
      <div>
        <label htmlFor={`${ids}-description`} className="label">Descrizione (facoltativa)</label>
        <textarea
          id={`${ids}-description`}
          className="input"
          rows={3}
          value={description}
          disabled={busy}
          onChange={event => setDescription(event.target.value)}
        />
      </div>

      {phase === 'upload' && (
        <div>
          <div
            role="progressbar"
            aria-label="Avanzamento del caricamento"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={progress}
            className="h-2 rounded-full bg-gray-100 overflow-hidden"
          >
            <div className="h-full bg-brand-600 transition-[width]" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">Caricamento in corso: {progress}%</p>
        </div>
      )}
      {phase === 'save' && <p role="status" className="text-xs text-gray-500">Salvataggio della scheda…</p>}

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <UploadIcon className="w-4 h-4" aria-hidden="true" />}
        Carica file
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {done && <p role="status" className="text-sm text-brand-700">Scheda aggiunta.</p>}
    </form>
  )
}

function LinkForm({ onCreated }: Pick<FormProps, 'onCreated'>) {
  const ids = useId()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [url, setUrl] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (busy) return
    setError(null)
    setDone(false)

    const text = validateItemText({ title, description })
    if (!text.ok) {
      setError(text.error)
      return
    }
    const normalized = normalizeLinkUrl(url)
    if (!normalized) {
      setError('Indirizzo non valido: usa un link https')
      return
    }

    setBusy(true)
    const res = await callApi<{ item: DownloadItem }>('/api/admin/downloads', {
      method: 'POST',
      body: { kind: 'link', title: text.title, description: text.description, url: normalized },
    })
    if (!res.ok) {
      setError(res.error)
      setBusy(false)
      return
    }

    setTitle('')
    setDescription('')
    setUrl('')
    setDone(true)
    await onCreated()
    setBusy(false)
  }

  return (
    <form onSubmit={submit} className="space-y-3" aria-labelledby={`${ids}-heading`}>
      <h3 id={`${ids}-heading`} className="flex items-center gap-2 text-sm font-semibold text-gray-900">
        <Link2 className="w-4 h-4 text-brand-600" aria-hidden="true" />
        Link
      </h3>
      <div>
        <label htmlFor={`${ids}-title`} className="label">Titolo</label>
        <input
          id={`${ids}-title`}
          className="input"
          value={title}
          disabled={busy}
          onChange={event => setTitle(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${ids}-description`} className="label">Descrizione (facoltativa)</label>
        <textarea
          id={`${ids}-description`}
          className="input"
          rows={3}
          value={description}
          disabled={busy}
          onChange={event => setDescription(event.target.value)}
        />
      </div>
      <div>
        <label htmlFor={`${ids}-url`} className="label">Indirizzo (URL)</label>
        <input
          id={`${ids}-url`}
          className="input"
          type="text"
          inputMode="url"
          autoComplete="off"
          placeholder="https://"
          value={url}
          disabled={busy}
          onChange={event => setUrl(event.target.value)}
        />
      </div>

      <button type="submit" className="btn-primary" disabled={busy}>
        {busy ? <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" /> : <Link2 className="w-4 h-4" aria-hidden="true" />}
        Aggiungi link
      </button>
      {error && <p role="alert" className="text-sm text-red-600">{error}</p>}
      {done && <p role="status" className="text-sm text-brand-700">Scheda aggiunta.</p>}
    </form>
  )
}

export default function AddItemSection({ onCreated, onRefresh }: FormProps) {
  const titleId = useId()
  return (
    <section className="card p-5" aria-labelledby={titleId}>
      <h2 id={titleId} className="font-bold text-gray-900 mb-4">Aggiungi</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <FileForm onCreated={onCreated} onRefresh={onRefresh} />
        <LinkForm onCreated={onCreated} />
      </div>
    </section>
  )
}
