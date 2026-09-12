import { dbReady, q, q1 } from '@/lib/db'

// Accesso ai dati dei corsi online. Niente SQL nelle pagine: qui dentro e basta,
// come per il resto del progetto.
//
// Regola che vale per tutte le letture pubbliche: il contenuto di una lezione
// (video_url, contenuto) esce dal database SOLO se la lezione e un'anteprima
// gratuita o se chi legge ha comprato il corso. Il filtro sta nella query, non
// nel componente: cosi il payload della pagina non contiene i link ai video di
// un corso non pagato, che sarebbe come consegnarlo gratis a chi apre il
// sorgente della pagina.

export type Livello = 'base' | 'intermedio' | 'avanzato'
export type TipoLezione = 'video' | 'testo'

export type CorsoCatalogo = {
  id: string
  slug: string
  titolo: string
  sottotitolo: string | null
  descrizione: string
  immagine_url: string | null
  prezzo_cents: number
  currency: string
  /** Data da cui le lezioni saranno disponibili; null = gia disponibile. */
  disponibile_dal: string | null
  /** Vero se il corso si compra ora ma le lezioni arrivano piu avanti. */
  in_prevendita: boolean
  livello: Livello
  categoria: string | null
  lezioni_totali: number
  durata_totale_min: number
}

export type Lezione = {
  id: string
  titolo: string
  ordine: number
  tipo: TipoLezione
  durata_min: number | null
  anteprima_gratuita: boolean
  /** Embed esterno. Presente solo per le anteprime o per chi ha acquistato. */
  video_url: string | null
  /**
   * True se la lezione ha un video protetto sullo storage privato. La chiave del
   * file non viene mai mandata al browser: il player chiama
   * /api/corsi/video/<lezione> e l'accesso viene verificato li.
   */
  video_protetto: boolean
  /** Presente solo per le anteprime o per chi ha acquistato il corso. */
  contenuto: string | null
  completata?: boolean
}

export type Modulo = {
  id: string
  titolo: string
  ordine: number
  lezioni: Lezione[]
}

export type CorsoConProgramma = CorsoCatalogo & {
  pubblicato: boolean
  seo_title: string | null
  seo_description: string | null
  moduli: Modulo[]
}

const CAMPI_CATALOGO = `
  c.id, c.slug, c.titolo, c.sottotitolo, c.descrizione, c.immagine_url,
  c.prezzo_cents, c.currency, c.livello, c.categoria,
  c.disponibile_dal
`

const CONTEGGI_CATALOGO = `
  COALESCE(COUNT(l.id), 0)::int              AS lezioni_totali,
  COALESCE(SUM(l.durata_min), 0)::int        AS durata_totale_min
`

const JOIN_LEZIONI = `
  LEFT JOIN corso_moduli m  ON m.corso_id = c.id
  LEFT JOIN corso_lezioni l ON l.modulo_id = m.id
`

function rigaCatalogo(row: Record<string, unknown>): CorsoCatalogo {
  return {
    id: String(row.id),
    slug: String(row.slug),
    titolo: String(row.titolo),
    sottotitolo: row.sottotitolo ? String(row.sottotitolo) : null,
    descrizione: String(row.descrizione ?? ''),
    immagine_url: row.immagine_url ? String(row.immagine_url) : null,
    prezzo_cents: Number(row.prezzo_cents),
    currency: String(row.currency ?? 'eur'),
    disponibile_dal: row.disponibile_dal ? new Date(String(row.disponibile_dal)).toISOString() : null,
    in_prevendita: Boolean(row.disponibile_dal) && new Date(String(row.disponibile_dal)) > new Date(),
    livello: String(row.livello ?? 'base') as Livello,
    categoria: row.categoria ? String(row.categoria) : null,
    lezioni_totali: Number(row.lezioni_totali ?? 0),
    durata_totale_min: Number(row.durata_totale_min ?? 0),
  }
}

/** Catalogo pubblico. Senza database (build in CI, modalita demo) torna vuoto. */
export async function listCorsiPubblicati(filtri: {
  cerca?: string
  categoria?: string
  livello?: string
} = {}): Promise<CorsoCatalogo[]> {
  if (!dbReady()) return []

  const where: string[] = ['c.pubblicato = true']
  const params: unknown[] = []

  if (filtri.cerca) {
    params.push(`%${filtri.cerca}%`)
    where.push(`(c.titolo ILIKE $${params.length} OR c.sottotitolo ILIKE $${params.length})`)
  }
  if (filtri.categoria) {
    params.push(filtri.categoria)
    where.push(`c.categoria = $${params.length}`)
  }
  if (filtri.livello) {
    params.push(filtri.livello)
    where.push(`c.livello = $${params.length}`)
  }

  const rows = await q(
    `SELECT ${CAMPI_CATALOGO}, ${CONTEGGI_CATALOGO}
       FROM corsi c
       ${JOIN_LEZIONI}
      WHERE ${where.join(' AND ')}
      GROUP BY c.id
      ORDER BY c.in_evidenza DESC, c.ordine, c.created_at DESC`,
    params,
  )
  return rows.map(rigaCatalogo)
}

export async function listCategorieCorsi(): Promise<string[]> {
  if (!dbReady()) return []
  const rows = await q(
    `SELECT DISTINCT categoria
       FROM corsi
      WHERE pubblicato = true AND categoria IS NOT NULL AND categoria <> ''
      ORDER BY categoria`,
  )
  return rows.map(r => String(r.categoria))
}

/**
 * Programma del corso per la pagina pubblica. `sbloccato` a true restituisce
 * anche il contenuto delle lezioni non in anteprima: passalo solo dopo aver
 * verificato l'acquisto.
 */
async function caricaProgramma(corsoId: string, sbloccato: boolean, userId?: string): Promise<Modulo[]> {
  const params: unknown[] = [corsoId]
  let campoProgresso = 'false AS completata'
  if (userId) {
    params.push(userId)
    campoProgresso = `COALESCE(p.completata, false) AS completata`
  }

  const rows = await q(
    `SELECT m.id AS modulo_id, m.titolo AS modulo_titolo, m.ordine AS modulo_ordine,
            l.id, l.titolo, l.ordine, l.tipo, l.durata_min, l.anteprima_gratuita,
            CASE WHEN l.anteprima_gratuita OR ${sbloccato ? 'true' : 'false'}
                 THEN l.video_url END AS video_url,
            -- Solo un booleano: la chiave del file sullo storage non lascia mai
            -- il server, altrimenti basterebbe leggere il sorgente della pagina.
            (l.video_storage_key IS NOT NULL
             AND (l.anteprima_gratuita OR ${sbloccato ? 'true' : 'false'})) AS video_protetto,
            CASE WHEN l.anteprima_gratuita OR ${sbloccato ? 'true' : 'false'}
                 THEN l.contenuto END AS contenuto,
            ${campoProgresso}
       FROM corso_moduli m
       LEFT JOIN corso_lezioni l ON l.modulo_id = m.id
       ${userId ? 'LEFT JOIN corso_progressi p ON p.lezione_id = l.id AND p.user_id = $2' : ''}
      WHERE m.corso_id = $1
      ORDER BY m.ordine, m.id, l.ordine, l.id`,
    params,
  )

  const moduli: Modulo[] = []
  for (const row of rows) {
    const moduloId = String(row.modulo_id)
    let modulo = moduli.find(m => m.id === moduloId)
    if (!modulo) {
      modulo = {
        id: moduloId,
        titolo: String(row.modulo_titolo),
        ordine: Number(row.modulo_ordine ?? 0),
        lezioni: [],
      }
      moduli.push(modulo)
    }
    // LEFT JOIN: un modulo senza lezioni produce una riga con l.id nullo.
    if (!row.id) continue
    modulo.lezioni.push({
      id: String(row.id),
      titolo: String(row.titolo),
      ordine: Number(row.ordine ?? 0),
      tipo: String(row.tipo ?? 'video') as TipoLezione,
      durata_min: row.durata_min === null || row.durata_min === undefined ? null : Number(row.durata_min),
      anteprima_gratuita: Boolean(row.anteprima_gratuita),
      video_url: row.video_url ? String(row.video_url) : null,
      video_protetto: Boolean(row.video_protetto),
      contenuto: row.contenuto ? String(row.contenuto) : null,
      completata: Boolean(row.completata),
    })
  }
  return moduli
}

/** Pagina pubblica del corso: contenuti visibili solo per le anteprime. */
export async function getCorsoPubblicoBySlug(slug: string): Promise<CorsoConProgramma | null> {
  if (!dbReady()) return null

  const row = await q1(
    `SELECT ${CAMPI_CATALOGO}, c.pubblicato, c.seo_title, c.seo_description, ${CONTEGGI_CATALOGO}
       FROM corsi c
       ${JOIN_LEZIONI}
      WHERE c.slug = $1 AND c.pubblicato = true
      GROUP BY c.id
      LIMIT 1`,
    [slug],
  )
  if (!row) return null

  return {
    ...rigaCatalogo(row),
    pubblicato: Boolean(row.pubblicato),
    seo_title: row.seo_title ? String(row.seo_title) : null,
    seo_description: row.seo_description ? String(row.seo_description) : null,
    moduli: await caricaProgramma(String(row.id), false),
  }
}

/** True se l'utente ha un acquisto pagato per quel corso. */
export async function haAccessoAlCorso(userId: string, corsoId: string): Promise<boolean> {
  if (!dbReady()) return false
  const row = await q1(
    `SELECT 1 AS ok
       FROM corso_acquisti
      WHERE user_id = $1 AND corso_id = $2 AND status = 'paid'
      LIMIT 1`,
    [userId, corsoId],
  )
  return Boolean(row)
}

export type CorsoAcquistato = CorsoCatalogo & {
  lezioni_completate: number
  acquistato_il: string
}

/** I corsi comprati da uno studente, con l'avanzamento. */
export async function listCorsiUtente(userId: string): Promise<CorsoAcquistato[]> {
  if (!dbReady()) return []
  const rows = await q(
    `SELECT ${CAMPI_CATALOGO},
            COALESCE(COUNT(l.id), 0)::int       AS lezioni_totali,
            COALESCE(SUM(l.durata_min), 0)::int AS durata_totale_min,
            COALESCE(COUNT(p.lezione_id), 0)::int AS lezioni_completate,
            a.created_at AS acquistato_il
       FROM corso_acquisti a
       JOIN corsi c ON c.id = a.corso_id
       LEFT JOIN corso_moduli m  ON m.corso_id = c.id
       LEFT JOIN corso_lezioni l ON l.modulo_id = m.id
       LEFT JOIN corso_progressi p ON p.lezione_id = l.id AND p.user_id = a.user_id AND p.completata
      WHERE a.user_id = $1 AND a.status = 'paid'
      GROUP BY c.id, a.created_at
      ORDER BY a.created_at DESC`,
    [userId],
  )
  return rows.map(row => ({
    ...rigaCatalogo(row),
    lezioni_completate: Number(row.lezioni_completate ?? 0),
    acquistato_il: String(row.acquistato_il),
  }))
}

/**
 * Corso completo per uno studente che lo ha acquistato, progressi inclusi.
 * Torna null se il corso non esiste o se l'utente non lo ha comprato: il
 * controllo di accesso vive qui, non nella pagina.
 */
export async function getCorsoPerStudente(userId: string, slug: string): Promise<CorsoConProgramma | null> {
  if (!dbReady()) return null

  const row = await q1(
    `SELECT ${CAMPI_CATALOGO}, c.pubblicato, c.seo_title, c.seo_description, ${CONTEGGI_CATALOGO}
       FROM corsi c
       ${JOIN_LEZIONI}
      WHERE c.slug = $1
      GROUP BY c.id
      LIMIT 1`,
    [slug],
  )
  if (!row) return null

  const corsoId = String(row.id)
  if (!(await haAccessoAlCorso(userId, corsoId))) return null

  return {
    ...rigaCatalogo(row),
    pubblicato: Boolean(row.pubblicato),
    seo_title: row.seo_title ? String(row.seo_title) : null,
    seo_description: row.seo_description ? String(row.seo_description) : null,
    moduli: await caricaProgramma(corsoId, true, userId),
  }
}

/**
 * Chiave del file video di una lezione, restituita SOLO se chi chiede ha diritto
 * di vederlo: lezione in anteprima gratuita, oppure corso acquistato e pagato.
 * Null in ogni altro caso, senza distinguere fra "non esiste" e "non puoi":
 * chi sonda l'endpoint non deve capire quali lezioni esistono.
 */
export async function getChiaveVideoAutorizzata(
  lezioneId: string,
  userId: string | null,
): Promise<{ key: string; titolo: string } | null> {
  if (!dbReady()) return null

  const row = await q1(
    `SELECT l.video_storage_key, l.titolo, l.anteprima_gratuita, m.corso_id
       FROM corso_lezioni l
       JOIN corso_moduli m ON m.id = l.modulo_id
      WHERE l.id = $1
      LIMIT 1`,
    [lezioneId],
  )
  if (!row || !row.video_storage_key) return null

  const risultato = { key: String(row.video_storage_key), titolo: String(row.titolo) }
  if (Boolean(row.anteprima_gratuita)) return risultato
  if (!userId) return null

  return (await haAccessoAlCorso(userId, String(row.corso_id))) ? risultato : null
}

/** Segna o annulla il completamento di una lezione, solo se il corso e acquistato. */
export async function setProgresso(userId: string, lezioneId: string, completata: boolean): Promise<boolean> {
  if (!dbReady()) return false

  const consentita = await q1(
    `SELECT 1 AS ok
       FROM corso_lezioni l
       JOIN corso_moduli m   ON m.id = l.modulo_id
       JOIN corso_acquisti a ON a.corso_id = m.corso_id AND a.user_id = $1 AND a.status = 'paid'
      WHERE l.id = $2
      LIMIT 1`,
    [userId, lezioneId],
  )
  if (!consentita) return false

  if (completata) {
    await q(
      `INSERT INTO corso_progressi (user_id, lezione_id, completata, completed_at)
       VALUES ($1, $2, true, now())
       ON CONFLICT (user_id, lezione_id)
       DO UPDATE SET completata = true, completed_at = now()`,
      [userId, lezioneId],
    )
  } else {
    await q('DELETE FROM corso_progressi WHERE user_id = $1 AND lezione_id = $2', [userId, lezioneId])
  }
  return true
}

// ── Acquisti ────────────────────────────────────────────────────────────────

export type ConsensiAcquisto = {
  customerType: 'consumatore' | 'impresa_professionista'
  earlyPerformanceRequested: boolean
  withdrawalLossAcknowledged: boolean
  termsVersion?: string
}

/** Riga d'ordine creata prima di mandare l'utente su Stripe. */
export async function creaAcquistoPending(
  userId: string,
  corso: { id: string; prezzo_cents: number; currency: string },
  consensi: ConsensiAcquisto,
): Promise<string> {
  const row = await q1(
    `INSERT INTO corso_acquisti (
       user_id, corso_id, amount_cents, currency, status,
       customer_type, terms_accepted_at, terms_version,
       early_performance_requested, withdrawal_loss_acknowledged
     ) VALUES ($1, $2, $3, $4, 'checkout_pending', $5, now(), COALESCE($6, '2026-08-11'), $7, $8)
     RETURNING id`,
    [
      userId,
      corso.id,
      corso.prezzo_cents,
      corso.currency,
      consensi.customerType,
      consensi.termsVersion ?? null,
      consensi.customerType === 'consumatore' && consensi.earlyPerformanceRequested,
      consensi.customerType === 'consumatore' && consensi.withdrawalLossAcknowledged,
    ],
  )
  if (!row) throw new Error('Creazione ordine corso non riuscita')
  return String(row.id)
}

export async function collegaSessioneStripe(acquistoId: string, sessionId: string): Promise<void> {
  await q(
    `UPDATE corso_acquisti
        SET stripe_session_id = $2, status = 'checkout_open', updated_at = now()
      WHERE id = $1`,
    [acquistoId, sessionId],
  )
}

export async function segnaCheckoutFallito(acquistoId: string, motivo: string): Promise<void> {
  await q(
    `UPDATE corso_acquisti
        SET status = 'checkout_failed',
            metadata = metadata || jsonb_build_object('errore', $2::text),
            updated_at = now()
      WHERE id = $1`,
    [acquistoId, motivo.slice(0, 500)],
  )
}

/** Chiamata dal webhook Stripe quando il pagamento e confermato. */
export async function segnaAcquistoPagato(
  acquistoId: string,
  dati: { sessionId?: string; paymentIntentId?: string; amountCents?: number },
): Promise<{ userId: string; corsoId: string; titolo: string; slug: string } | null> {
  const row = await q1(
    `UPDATE corso_acquisti a
        SET status = 'paid',
            paid_at = COALESCE(a.paid_at, now()),
            stripe_session_id = COALESCE($2, a.stripe_session_id),
            stripe_payment_intent_id = COALESCE($3, a.stripe_payment_intent_id),
            amount_cents = COALESCE($4, a.amount_cents),
            updated_at = now()
       FROM corsi c
      WHERE a.id = $1 AND c.id = a.corso_id
      RETURNING a.user_id, a.corso_id, c.titolo, c.slug`,
    [acquistoId, dati.sessionId ?? null, dati.paymentIntentId ?? null, dati.amountCents ?? null],
  )
  if (!row) return null
  return {
    userId: String(row.user_id),
    corsoId: String(row.corso_id),
    titolo: String(row.titolo),
    slug: String(row.slug),
  }
}

/** Stato dell'ordine per la pagina di ritorno dal pagamento. */
export async function getStatoAcquistoBySession(sessionId: string): Promise<{ status: string; slug: string; titolo: string } | null> {
  if (!dbReady()) return null
  const row = await q1(
    `SELECT a.status, c.slug, c.titolo
       FROM corso_acquisti a
       JOIN corsi c ON c.id = a.corso_id
      WHERE a.stripe_session_id = $1
      LIMIT 1`,
    [sessionId],
  )
  if (!row) return null
  return { status: String(row.status), slug: String(row.slug), titolo: String(row.titolo) }
}
