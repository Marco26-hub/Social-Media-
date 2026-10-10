'use client'

import { useEffect, useId, useState } from 'react'
import { ArrowDown, ArrowUp, Eye, EyeOff, ExternalLink, Loader2, Trash2 } from 'lucide-react'
import { describeItem, validateItemText } from '@/lib/download-area'
import type { DownloadItem } from '@/lib/download-area-db'

type Action = 'save' | 'toggle' | 'up' | 'down' | 'delete'

// Ogni azione restituisce il messaggio d'errore da mostrare nella scheda, oppure
// null se è andata a buon fine (o se l'errore è già stato mostrato a livello pagina).
type Props = {
  item: DownloadItem
  index: number
  total: number
  // Un'altra operazione sull'elenco è in corso: nessuna azione parte finché non finisce.
  busy: boolean
  onSave: (id: string, text: { title: string; description: string | null }) => Promise<string | null>
  onToggle: (item: DownloadItem) => Promise<string | null>
  onMove: (id: string, direction: 'up' | 'down') => Promise<string | null>
  onDelete: (id: string) => Promise<string | null>
}

const SMALL_BUTTON = 'py-1.5 px-3 text-xs disabled:opacity-50 disabled:cursor-not-allowed'

export default function ItemCard({ item, index, total, busy, onSave, onToggle, onMove, onDelete }: Props) {
  const ids = useId()
  const [title, setTitle] = useState(item.title)
  const [description, setDescription] = useState(item.description ?? '')
  const [working, setWorking] = useState<Action | null>(null)
  const [error, setError] = useState<string | null>(null)
  const { meta, href } = describeItem(item)

  // Dopo un salvataggio il server restituisce il testo normalizzato (spazi tolti):
  // le bozze si riallineano solo quando cambia il valore salvato, mai a ogni render,
  // così una modifica in corso non viene persa se cambia un'altra scheda.
  useEffect(() => {
    setTitle(item.title)
    setDescription(item.description ?? '')
  }, [item.title, item.description])

  const dirty = title !== item.title || description !== (item.description ?? '')

  async function run(action: Action, task: () => Promise<string | null>) {
    if (busy) return
    setWorking(action)
    setError(null)
    setError(await task())
    setWorking(null)
  }

  function save() {
    const text = validateItemText({ title, description })
    if (!text.ok) {
      setError(text.error)
      return
    }
    void run('save', () => onSave(item.id, text))
  }

  function remove() {
    if (!window.confirm('Eliminare la scheda? Se è un file verrà cancellato.')) return
    void run('delete', () => onDelete(item.id))
  }

  function spinnerOr(action: Action, icon: React.ReactNode) {
    return working === action ? <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" /> : icon
  }

  return (
    <li className="card p-4">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-500 mb-3">
        <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-600 font-medium uppercase text-[10px]">
          {item.kind === 'file' ? 'File' : 'Link'}
        </span>
        {meta && <span>{meta}</span>}
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 font-medium text-brand-700 hover:text-brand-800 hover:underline"
        >
          Anteprima
          <ExternalLink className="w-3 h-3" aria-hidden="true" />
        </a>
      </div>

      <div className="space-y-3">
        <div>
          <label htmlFor={`${ids}-title`} className="label">Titolo</label>
          <input
            id={`${ids}-title`}
            className="input"
            value={title}
            onChange={event => setTitle(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor={`${ids}-description`} className="label">Descrizione</label>
          <textarea
            id={`${ids}-description`}
            className="input"
            rows={2}
            value={description}
            onChange={event => setDescription(event.target.value)}
          />
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 mt-3">
        <button type="button" onClick={save} disabled={busy || !dirty} className={`btn-primary ${SMALL_BUTTON}`}>
          {working === 'save' && <Loader2 className="w-3.5 h-3.5 animate-spin" aria-hidden="true" />}
          Salva
        </button>
        <button
          type="button"
          role="switch"
          aria-checked={item.visible}
          onClick={() => void run('toggle', () => onToggle(item))}
          disabled={busy}
          className={`inline-flex items-center gap-1.5 rounded-lg border font-medium transition-colors ${SMALL_BUTTON} ${
            item.visible
              ? 'bg-brand-50 text-brand-700 border-brand-100 hover:bg-brand-100'
              : 'bg-gray-100 text-gray-600 border-gray-200 hover:bg-gray-200'
          }`}
        >
          {spinnerOr('toggle', item.visible ? <Eye className="w-3.5 h-3.5" aria-hidden="true" /> : <EyeOff className="w-3.5 h-3.5" aria-hidden="true" />)}
          {item.visible ? 'Visibile' : 'Nascosto'}
        </button>
        <div className="flex gap-2 sm:ml-auto">
          <button
            type="button"
            onClick={() => void run('up', () => onMove(item.id, 'up'))}
            disabled={busy || index === 0}
            className={`btn-secondary ${SMALL_BUTTON}`}
          >
            {spinnerOr('up', <ArrowUp className="w-3.5 h-3.5" aria-hidden="true" />)}
            Su
          </button>
          <button
            type="button"
            onClick={() => void run('down', () => onMove(item.id, 'down'))}
            disabled={busy || index === total - 1}
            className={`btn-secondary ${SMALL_BUTTON}`}
          >
            {spinnerOr('down', <ArrowDown className="w-3.5 h-3.5" aria-hidden="true" />)}
            Giù
          </button>
          <button type="button" onClick={remove} disabled={busy} className={`btn-danger ${SMALL_BUTTON}`}>
            {spinnerOr('delete', <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />)}
            Elimina
          </button>
        </div>
      </div>

      {error && <p role="alert" className="text-sm text-red-600 mt-2">{error}</p>}
    </li>
  )
}
