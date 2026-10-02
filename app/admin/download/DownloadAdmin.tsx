'use client'

import { upload } from '@vercel/blob/client'
import type { PutBlobResult } from '@vercel/blob'
import Image from 'next/image'
import { ExternalLink, FileUp, Loader2, PencilLine, RefreshCw, Trash2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { DownloadItem } from '@/lib/downloads-shared'
import { createDownloadPathname } from '@/lib/downloads-shared'
import styles from './admin-download.module.css'

type Props = { storageReady: boolean }
type Draft = Pick<DownloadItem, 'title' | 'description' | 'isPublished'>

function displaySize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  const units = ['KB', 'MB', 'GB']
  const unit = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)) - 1, units.length - 1)
  return `${(bytes / 1024 ** (unit + 1)).toLocaleString('it-IT', { maximumFractionDigits: 1 })} ${units[unit]}`
}

async function getError(response: Response, fallback: string) {
  try {
    const body = await response.json() as { error?: string }
    return body.error || fallback
  } catch {
    return fallback
  }
}

export default function DownloadAdmin({ storageReady }: Props) {
  const [items, setItems] = useState<DownloadItem[]>([])
  const [drafts, setDrafts] = useState<Record<string, Draft>>({})
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const uploadInput = useRef<HTMLInputElement>(null)
  const [newTitle, setNewTitle] = useState('')
  const [newDescription, setNewDescription] = useState('')

  async function refresh() {
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/admin/downloads', { cache: 'no-store' })
      if (!response.ok) throw new Error(await getError(response, 'Impossibile caricare i materiali'))
      const data = await response.json() as { items: DownloadItem[] }
      setItems(data.items)
      setDrafts(Object.fromEntries(data.items.map(item => [item.id, {
        title: item.title,
        description: item.description,
        isPublished: item.isPublished,
      }])))
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Impossibile caricare i materiali')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void refresh() }, [])

  function clearFeedback() {
    setMessage('')
    setError('')
  }

  async function send(action: 'POST' | 'PATCH' | 'DELETE', body: Record<string, unknown>) {
    const response = await fetch('/api/admin/downloads', {
      method: action,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    })
    if (!response.ok) throw new Error(await getError(response, 'Operazione non riuscita'))
    return response.json() as Promise<{ item?: DownloadItem; ok?: boolean }>
  }

  async function uploadFile(file: File): Promise<PutBlobResult> {
    return upload(createDownloadPathname(file.name), file, {
      access: 'public',
      handleUploadUrl: '/api/admin/downloads/upload',
      multipart: true,
    })
  }

  async function addMaterial(event: React.FormEvent) {
    event.preventDefault()
    const file = uploadInput.current?.files?.[0]
    if (!file) { setError('Scegli prima un file da caricare'); return }
    if (!newTitle.trim()) { setError('Inserisci un titolo'); return }

    clearFeedback()
    setBusy('add')
    try {
      const blob = await uploadFile(file)
      await send('POST', {
        title: newTitle,
        description: newDescription,
        originalName: file.name,
        size: file.size,
        blob,
      })
      setNewTitle('')
      setNewDescription('')
      if (uploadInput.current) uploadInput.current.value = ''
      setMessage('Materiale caricato e pubblicato.')
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Caricamento non riuscito')
    } finally {
      setBusy(null)
    }
  }

  function updateDraft(id: string, changes: Partial<Draft>) {
    setDrafts(current => ({ ...current, [id]: { ...current[id], ...changes } }))
  }

  async function saveMaterial(id: string) {
    const draft = drafts[id]
    if (!draft?.title.trim()) { setError('Il titolo non può essere vuoto'); return }
    clearFeedback()
    setBusy(`save-${id}`)
    try {
      await send('PATCH', { id, action: 'metadata', ...draft })
      setMessage('Modifiche salvate.')
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Salvataggio non riuscito')
    } finally {
      setBusy(null)
    }
  }

  async function replaceMaterial(id: string, file: File | undefined) {
    if (!file) return
    clearFeedback()
    setBusy(`replace-${id}`)
    try {
      const blob = await uploadFile(file)
      await send('PATCH', { id, action: 'replace', originalName: file.name, size: file.size, blob })
      setMessage('File sostituito correttamente.')
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Sostituzione non riuscita')
    } finally {
      setBusy(null)
    }
  }

  async function deleteMaterial(item: DownloadItem) {
    if (!window.confirm(`Eliminare definitivamente “${item.title}”?`)) return
    clearFeedback()
    setBusy(`delete-${item.id}`)
    try {
      await send('DELETE', { id: item.id })
      setMessage('Materiale eliminato.')
      await refresh()
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Eliminazione non riuscita')
    } finally {
      setBusy(null)
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div>
            <Image className={styles.logo} src="/brand/swa-logo-official.png" alt="Social Automation" width={118} height={55} priority />
            <p className={styles.eyebrow}>Area amministratore</p>
            <h1>Gestisci i download</h1>
            <p>Carica e aggiorna i materiali disponibili nella pagina pubblica SWA.</p>
          </div>
          <a className={styles.publicLink} href="/download" target="_blank" rel="noreferrer"><ExternalLink size={16} aria-hidden="true" /> Apri pagina pubblica</a>
        </header>

        {!storageReady && (
          <div className={styles.notice}>
            Lo storage non è ancora collegato. In Vercel crea un Blob Store pubblico e collegalo a questo progetto: verranno aggiunte le variabili <code>BLOB_READ_WRITE_TOKEN</code> (e le variabili Blob gestite da Vercel). Poi ridistribuisci l’app.
          </div>
        )}

        <section className={styles.panel} aria-labelledby="add-material-title">
          <h2 id="add-material-title">Carica un nuovo materiale</h2>
          <form onSubmit={addMaterial}>
            <div className={styles.fields}>
              <div className={styles.field}>
                <label htmlFor="new-download-title">Titolo</label>
                <input id="new-download-title" value={newTitle} onChange={event => setNewTitle(event.target.value)} placeholder="Es. Guida Social Media" required />
              </div>
              <div className={styles.field}>
                <label htmlFor="new-download-file">File</label>
                <input id="new-download-file" ref={uploadInput} type="file" required />
              </div>
              <div className={`${styles.field} ${styles.wide}`}>
                <label htmlFor="new-download-description">Descrizione facoltativa</label>
                <textarea id="new-download-description" value={newDescription} onChange={event => setNewDescription(event.target.value)} placeholder="Spiega in una riga cosa contiene il file." />
              </div>
            </div>
            <div className={styles.actions}>
              <button className={styles.primary} disabled={!storageReady || busy === 'add'} type="submit">
                {busy === 'add' ? <Loader2 size={16} className="animate-spin" /> : <FileUp size={16} />} {busy === 'add' ? 'Caricamento...' : 'Carica e pubblica'}
              </button>
              {message && <span className={styles.message} role="status">{message}</span>}
              {error && <span className={styles.error} role="alert">{error}</span>}
            </div>
          </form>
        </section>

        <section className={styles.panel} aria-labelledby="materials-title">
          <div className={styles.listHeader}>
            <h2 id="materials-title">Materiali caricati</h2>
            <button className={styles.secondary} type="button" onClick={() => void refresh()} disabled={loading}><RefreshCw size={15} className={loading ? 'animate-spin' : ''} /> Aggiorna</button>
          </div>
          {loading ? <p className={styles.empty}>Caricamento materiali...</p> : items.length === 0 ? <p className={styles.empty}>Non hai ancora caricato materiali.</p> : items.map(item => {
            const draft = drafts[item.id] || { title: item.title, description: item.description, isPublished: item.isPublished }
            return (
              <article className={styles.material} key={item.id}>
                <div>
                  <div className={styles.materialTitle}>
                    <h3>{item.title}</h3>
                    {!item.isPublished && <span className={styles.hidden}>nascosto</span>}
                  </div>
                  <p className={styles.materialMeta}>{item.originalName} · {displaySize(item.size)}</p>
                  <div className={styles.editGrid}>
                    <div className={styles.field}>
                      <label htmlFor={`title-${item.id}`}>Titolo</label>
                      <input id={`title-${item.id}`} value={draft.title} onChange={event => updateDraft(item.id, { title: event.target.value })} />
                    </div>
                    <div className={styles.field}>
                      <label htmlFor={`description-${item.id}`}>Descrizione</label>
                      <input id={`description-${item.id}`} value={draft.description} onChange={event => updateDraft(item.id, { description: event.target.value })} />
                    </div>
                  </div>
                  <label className={styles.toggle}><input type="checkbox" checked={draft.isPublished} onChange={event => updateDraft(item.id, { isPublished: event.target.checked })} /> Visibile nella pagina pubblica</label>
                  <div className={styles.replace}>
                    <span>Sostituisci file:</span>
                    <input type="file" onChange={event => void replaceMaterial(item.id, event.target.files?.[0])} disabled={!storageReady || busy === `replace-${item.id}`} />
                    {busy === `replace-${item.id}` && <Loader2 size={15} className="animate-spin" />}
                  </div>
                </div>
                <div className={styles.materialActions}>
                  <button className={styles.secondary} type="button" onClick={() => void saveMaterial(item.id)} disabled={busy === `save-${item.id}`}>
                    {busy === `save-${item.id}` ? <Loader2 size={15} className="animate-spin" /> : <PencilLine size={15} />} Salva
                  </button>
                  <button className={styles.danger} type="button" onClick={() => void deleteMaterial(item)} disabled={busy === `delete-${item.id}`}>
                    {busy === `delete-${item.id}` ? <Loader2 size={15} className="animate-spin" /> : <Trash2 size={15} />} Elimina
                  </button>
                </div>
              </article>
            )
          })}
        </section>
      </div>
    </main>
  )
}
