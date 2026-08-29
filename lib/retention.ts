import { q } from '@/lib/db'
import { getTableColumns } from '@/lib/db-schema'

// Retention dei contenuti pubblicati.
//
// Un contenuto pubblicato non serve piu a database: il post vive sul social e la
// copia sta in locale. Dopo un periodo di grazia la riga viene eliminata e i suoi
// media vengono rimossi dallo storage — che e la parte che pesa davvero (i media
// sono ordini di grandezza piu grandi del testo).
//
// Prima di eliminare salviamo un'impronta in `contenuti_storico`: solo i campi che
// il novelty gate confronta. Senza, la generazione perderebbe la memoria creativa
// e ricomincerebbe a proporre hook gia pubblicati (vedi la query dello storico in
// app/api/generate/plan/route.ts).

export const RETENTION_GIORNI_DEFAULT = 30

// Campi confrontati da lib/editorial-variation.ts (HISTORY_FIELDS).
const CAMPI_IMPRONTA = [
  'hook',
  'tema',
  'angle',
  'primary_message',
  'idea_visual',
  'template_style',
  'production_notes',
  'formato',
  'canale',
  'data_pubblicazione',
] as const

export type EsitoRetention = {
  contenutiEliminati: number
  impronteArchiviate: number
  mediaCandidati: string[]
  clienteId: string | null
  giorni: number
}

/**
 * Elimina i contenuti PUBBLICATI piu vecchi di `giorni`, dopo averne archiviata
 * l'impronta. Restituisce anche gli URL dei media che erano collegati: la
 * rimozione dallo storage e un passo separato e volutamente esplicito, perche un
 * media puo essere condiviso da piu contenuti.
 *
 * `clienteId` null = tutti i clienti. `dryRun` calcola senza cancellare nulla.
 */
export async function eliminaPubblicatiScaduti(opts: {
  clienteId?: string | null
  giorni?: number
  dryRun?: boolean
}): Promise<EsitoRetention> {
  const giorni = Math.max(1, Math.round(opts.giorni ?? RETENTION_GIORNI_DEFAULT))
  const clienteId = opts.clienteId ?? null
  const dryRun = opts.dryRun !== false && opts.dryRun === true

  const colonne = await getTableColumns('calendario')
  const haColonna = (nome: string) => colonne.has(nome)

  // Un contenuto e "pubblicato" se lo dice il nostro status oppure la
  // riconciliazione con Blotato. La data di riferimento e quella di
  // pubblicazione, non quella di creazione.
  const condizioni = [`cliente_id IS NOT NULL`]
  const params: unknown[] = []
  if (clienteId) {
    params.push(clienteId)
    condizioni.push(`cliente_id = $${params.length}`)
  }
  const statoPubblicato = haColonna('blotato_status')
    ? `(status = 'PUBBLICATO' OR blotato_status = 'published')`
    : `status = 'PUBBLICATO'`
  condizioni.push(statoPubblicato)
  condizioni.push(`data_pubblicazione < (current_date - ${giorni})`)

  const where = condizioni.join(' AND ')
  const righe = await q(`SELECT * FROM calendario WHERE ${where}`, params) as Record<string, unknown>[]
  if (!righe.length) {
    return { contenutiEliminati: 0, impronteArchiviate: 0, mediaCandidati: [], clienteId, giorni }
  }

  const ids = righe.map(r => String(r.id))
  const mediaCandidati = [...new Set(
    righe.flatMap(r => Array.from({ length: 10 }, (_, i) => r[`link_media_${i + 1}`])
      .concat([r.blotato_visual_media_url, r.blotato_audio_visual_media_url, r.reel_audio_url])
      .filter((v): v is string => typeof v === 'string' && v.trim().length > 0)),
  )]

  if (dryRun) {
    return { contenutiEliminati: righe.length, impronteArchiviate: 0, mediaCandidati, clienteId, giorni }
  }

  // 1) Impronta: senza questa, la memoria creativa muore con la riga.
  let improntaOk = 0
  const colonneStorico = await getTableColumns('contenuti_storico')
  if (colonneStorico.size) {
    const campi = CAMPI_IMPRONTA.filter(c => colonne.has(c) && colonneStorico.has(c))
    const intestazione = ['cliente_id', 'id_contenuto', ...campi, 'post_url', 'blotato_post_id']
      .filter(c => colonneStorico.has(c))
    for (const riga of righe) {
      const valori = intestazione.map(c => {
        if (c === 'post_url') return riga.blotato_public_url ?? riga.post_url ?? null
        return riga[c] ?? null
      })
      const placeholders = intestazione.map((_, i) => `$${i + 1}`).join(', ')
      const inserite = await q(
        `INSERT INTO contenuti_storico (${intestazione.join(', ')}) VALUES (${placeholders})
         ON CONFLICT (cliente_id, id_contenuto) WHERE id_contenuto IS NOT NULL DO NOTHING
         RETURNING id`,
        valori,
      )
      improntaOk += inserite.length
    }
  }

  // 2) Token di approvazione collegati, come fa la cancellazione manuale.
  const contenutoIds = righe.map(r => r.id_contenuto).filter(Boolean) as string[]
  if (contenutoIds.length) {
    const ph = contenutoIds.map((_, i) => `$${i + 1}`).join(', ')
    await q(`DELETE FROM approval_tokens WHERE contenuto_id IN (${ph})`, contenutoIds)
  }

  // 3) La riga.
  const phIds = ids.map((_, i) => `$${i + 1}`).join(', ')
  const eliminate = await q(`DELETE FROM calendario WHERE id IN (${phIds}) RETURNING id`, ids)

  return {
    contenutiEliminati: eliminate.length,
    impronteArchiviate: improntaOk,
    mediaCandidati,
    clienteId,
    giorni,
  }
}

/**
 * Fra i media candidati, quelli che NESSUN contenuto rimasto referenzia piu.
 * Va chiamata DOPO l'eliminazione: un media puo essere condiviso, e cancellarlo
 * mentre un altro contenuto lo usa lascerebbe un post senza immagine.
 */
export async function mediaRimastiOrfani(candidati: string[]): Promise<string[]> {
  if (!candidati.length) return []
  const colonne = await getTableColumns('calendario')
  const colonneMedia = [
    ...Array.from({ length: 10 }, (_, i) => `link_media_${i + 1}`),
    'blotato_visual_media_url',
    'blotato_audio_visual_media_url',
    'reel_audio_url',
  ].filter(c => colonne.has(c))
  if (!colonneMedia.length) return candidati

  const ph = candidati.map((_, i) => `$${i + 1}`).join(', ')
  const ancoraUsati = await q(
    `SELECT DISTINCT u.url FROM calendario c
       CROSS JOIN LATERAL (VALUES ${colonneMedia.map(col => `(c.${col})`).join(', ')}) AS u(url)
      WHERE u.url IN (${ph})`,
    candidati,
  ) as { url: string }[]

  const usati = new Set(ancoraUsati.map(r => r.url))
  return candidati.filter(url => !usati.has(url))
}
