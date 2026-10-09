'use client'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import type { Contenuto } from '@/lib/types'
import { toYmd } from '@/lib/publish/blotato-map'
import { editableSchedule } from '@/lib/calendar-schedule-edit'

export default function PostScheduleEditor({ post, demo, onSaved }: { post: Contenuto; demo: boolean; onSaved: (day: string, time: string) => void }) {
  const [open, setOpen] = useState(false)
  const [day, setDay] = useState(toYmd(post.data_pubblicazione))
  const [time, setTime] = useState(String(post.ora_pubblicazione || '').slice(0, 5))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const remote = Boolean(post.blotato_post_id)
  const allowed = editableSchedule(post as unknown as Record<string, unknown>) && (!remote || post.blotato_status === 'scheduled')

  async function save() {
    setSaving(true); setError('')
    try {
      if (!day || !time) throw new Error('Imposta data e ora')
      if (!demo) {
        const response = await fetch(remote ? '/api/data/blotato-reschedule' : '/api/data/calendario', {
          method: remote ? 'POST' : 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: post.id, data_pubblicazione: day, ora_pubblicazione: time }),
        })
        const result = await response.json()
        if (!response.ok) throw new Error(result.error || 'Orario non salvato')
      }
      onSaved(day, time); setOpen(false)
    } catch (cause) { setError((cause as Error).message) }
    finally { setSaving(false) }
  }
  return <span className="relative inline-flex">
    <button type="button" disabled={!allowed} title={allowed ? 'Modifica data e ora di questo post' : 'Post pubblicato o in elaborazione: orario protetto'}
      className="rounded-full border border-gray-200 bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-brand-50 disabled:cursor-not-allowed"
      onClick={() => { setDay(toYmd(post.data_pubblicazione)); setTime(String(post.ora_pubblicazione || '').slice(0, 5)); setError(''); setOpen(!open) }}>
      {toYmd(post.data_pubblicazione)} · {String(post.ora_pubblicazione || '—').slice(0, 5)} {allowed && '✎'}
    </button>
    {open && createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div role="dialog" aria-modal="true" aria-label={`Modifica data e ora ${post.id_contenuto}`} className="block w-80 rounded-xl border bg-white p-4 shadow-xl">
      <span className="mb-2 block text-xs font-semibold">Data e ora · fuso del cliente</span>
      <label className="block text-xs">Data<input type="date" aria-label="Data del post" value={day} disabled={saving} onChange={event => setDay(event.target.value)} className="my-1 block w-full rounded border p-2" /></label>
      <label className="block text-xs">Ora<input type="time" aria-label="Ora del post" value={time} disabled={saving} onChange={event => setTime(event.target.value)} className="my-1 block w-full rounded border p-2" /></label>
      <span className="block text-xs text-gray-500">{remote ? 'Aggiorna lo stesso post in coda su Blotato. Nessun reinvio.' : 'Modifica solo questo post, senza pubblicarlo.'}</span>
      {error && <span role="alert" className="mt-2 block text-xs text-red-700">{error}</span>}
      <span className="mt-3 flex justify-end gap-2"><button type="button" disabled={saving} onClick={() => setOpen(false)} className="rounded border px-3 py-1 text-xs">Annulla</button><button type="button" disabled={saving} onClick={save} className="rounded bg-brand-600 px-3 py-1 text-xs text-white">{saving ? 'Salvo…' : 'Salva'}</button></span>
      </div>
    </div>, document.body)}
  </span>
}
