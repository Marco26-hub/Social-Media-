import type { Status } from '@/lib/types'

const config: Record<string, { bg: string; text: string; label: string }> = {
  BOZZA:            { bg: 'bg-gray-100',   text: 'text-gray-600',  label: 'Bozza' },
  IDEA:             { bg: 'bg-purple-100', text: 'text-purple-700',label: 'Idea' },
  DA_APPROVARE:     { bg: 'bg-yellow-100', text: 'text-yellow-800',label: 'Da approvare' },
  APPROVATO:        { bg: 'bg-blue-100',   text: 'text-blue-800',  label: 'Approvato' },
  PUBBLICATO:       { bg: 'bg-green-100',  text: 'text-green-800', label: 'Pubblicato' },
  ERRORE:           { bg: 'bg-red-100',    text: 'text-red-800',   label: 'Errore' },
  ERRORE_MANUALE:   { bg: 'bg-red-200',    text: 'text-red-900',   label: 'Errore manuale' },
  DRY_RUN_OK:       { bg: 'bg-teal-100',   text: 'text-teal-800',  label: 'Dry run ok' },
  ARCHIVIATO:       { bg: 'bg-gray-200',   text: 'text-gray-500',  label: 'Archiviato' },
  NON_APPROVATO:    { bg: 'bg-rose-100',   text: 'text-rose-700',  label: 'Non approvato' },
}

// `status` passa a PUBBLICATO nel momento in cui il contenuto viene inviato a
// Blotato, non quando il post esce davvero: finche `blotato_status` resta
// 'scheduled' o 'in-progress' il contenuto e solo in coda. Mostrare "Pubblicato"
// in quella finestra faceva sembrare contraddittorio l'avviso "programmato ma
// l'orario e passato", che legge invece lo stato remoto.
const QUEUED_REMOTE_STATUSES = new Set(['scheduled', 'in-progress'])

export default function StatusBadge({ status, blotatoStatus }: { status: Status | string; blotatoStatus?: string | null }) {
  const inCoda = status === 'PUBBLICATO' && QUEUED_REMOTE_STATUSES.has(String(blotatoStatus || '').toLowerCase())
  const c = inCoda
    ? { bg: 'bg-blue-100', text: 'text-blue-800', label: 'In coda' }
    : config[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.bg} ${c.text}`}>
      {c.label}
    </span>
  )
}
