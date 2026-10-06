import { toYmd, zonedToUtcIso } from './publish/blotato-map'

export type RecoveryRow = {
  status?: unknown
  data_pubblicazione?: unknown
  ora_pubblicazione?: unknown
  blotato_post_id?: unknown
  blotato_post_url?: unknown
  blotato_status?: unknown
  blotato_scheduled_at?: unknown
  publish_lock_id?: unknown
  errore_tecnico?: unknown
  remote_reference_reset?: unknown
}

export function isLocalPreflightFailure(row: RecoveryRow): boolean {
  return !row.blotato_post_id && !row.blotato_post_url && !row.blotato_scheduled_at
    && !row.publish_lock_id && !row.remote_reference_reset
    && String(row.blotato_status || '').toLowerCase() === 'failed'
    && String(row.errore_tecnico || '').startsWith('Pre-flight Blotato: Data/ora nel passato')
}

// Un orario trascorso NON prova un fallimento. Il log protegge anche gli ID
// remoti cancellati dal vecchio requeue, che potrebbero essere già pubblicati.
export function recoveryBlockReason(row: RecoveryRow, timezone: string, now = Date.now()): string | null {
  if (row.status !== 'APPROVATO') return 'Recuperabile solo un contenuto approvato e mai inviato.'
  if (row.remote_reference_reset) return 'Storico di invio Blotato presente: verificare la pubblicazione, non reinviare.'
  if (row.blotato_post_id || row.blotato_post_url || row.blotato_scheduled_at || row.publish_lock_id) {
    return 'Contenuto già inviato o in lavorazione: usa Verifica Blotato, senza azzerare riferimenti.'
  }
  const remote = String(row.blotato_status || '').toLowerCase()
  if (remote && !isLocalPreflightFailure(row)) return 'Stato remoto presente: recupero automatico non consentito.'
  try {
    const schedule = new Date(zonedToUtcIso(row.data_pubblicazione, row.ora_pubblicazione, timezone)).getTime()
    if (!Number.isFinite(schedule)) return 'Data originale non valida.'
    if (schedule > now) return 'Contenuto futuro: non deve essere rimesso in coda.'
  } catch {
    return 'Data originale non valida.'
  }
  return null
}

export function validRecoveryTarget(day: unknown, time: unknown, timezone: string, now = Date.now()): boolean {
  if (typeof day !== 'string' || typeof time !== 'string') return false
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day) || !/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) return false
  const parsed = new Date(`${day}T00:00:00Z`)
  if (!Number.isFinite(parsed.getTime()) || toYmd(parsed) !== day) return false
  try {
    return new Date(zonedToUtcIso(day, time, timezone)).getTime() > now
  } catch {
    return false
  }
}
