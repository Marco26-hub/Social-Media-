import { dbReady, q, q1 } from '@/lib/db'
import { rimborsoChiudeAccesso } from '@/lib/corsi-rimborso'

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
export type Modalita = 'registrato' | 'live'

/**
 * Un incontro di un corso live. Le date sono pubbliche, e devono esserlo: chi
 * compra un corso live compra quelle date. Il link alla stanza virtuale invece
 * non e qui — vive solo nel corso dello studente che ha pagato.
 */
export type Incontro = {
  id: string
  titolo: string
  ordine: number
  inizio_il: string
  durata_min: number
  /** La registrazione dell'incontro esiste ed e guardabile (solo per iscritti). */
  registrazione_disponibile: boolean
  note: string | null
}

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
  /** 'live' = incontri in diretta a numero chiuso; 'registrato' = on demand. */
  modalita: Modalita
  /** Numero chiuso dei corsi live. Null per i corsi registrati. */
  posti_totali: number | null
  /** Incontri in diretta. Zero per i corsi registrati. */
  incontri_totali: number
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
  /** Vuoto per i corsi registrati. */
  incontri: Incontro[]
  /** Posti ancora acquistabili; null quando non c'e numero chiuso. */
  posti_liberi: number | null
  /**
   * Link alla stanza virtuale. Valorizzato SOLO da getCorsoPerStudente, cioe
   * dopo aver verificato il pagamento: sulla pagina pubblica resta null.
   */
  link_accesso: string | null
}

const CAMPI_CATALOGO = `
  c.id, c.slug, c.titolo, c.sottotitolo, c.descrizione, c.immagine_url,
  c.prezzo_cents, c.currency, c.livello, c.categoria,
  c.disponibile_dal, c.modalita, c.posti_totali
`

const CONTEGGI_CATALOGO = `
  COALESCE(COUNT(l.id), 0)::int              AS lezioni_totali,
  COALESCE(SUM(l.durata_min), 0)::int        AS durata_totale_min,
  -- Sottoquery e non un altro LEFT JOIN: unire anche gli incontri moltiplicherebbe
  -- le righe delle lezioni per il numero di incontri e gonfierebbe i conteggi.
  (SELECT COUNT(*)::int FROM corso_incontri ci WHERE ci.corso_id = c.id) AS incontri_totali
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
    modalita: String(row.modalita ?? 'registrato') as Modalita,
    posti_totali: row.posti_totali === null || row.posti_totali === undefined ? null : Number(row.posti_totali),
    incontri_totali: Number(row.incontri_totali ?? 0),
  }
}

/**
 * Incontri di un corso live, in ordine di data. Torna un elenco vuoto per i
 * corsi registrati, cosi chi chiama non deve chiedersi che modalita sia.
 */
async function caricaIncontri(corsoId: string): Promise<Incontro[]> {
  const rows = await q(
    `SELECT id, titolo, ordine, inizio_il, durata_min, note,
            (video_storage_key IS NOT NULL) AS registrazione_disponibile
       FROM corso_incontri
      WHERE corso_id = $1
      ORDER BY inizio_il, ordine`,
    [corsoId],
  )
  return rows.map(row => ({
    id: String(row.id),
    titolo: String(row.titolo),
    ordine: Number(row.ordine ?? 0),
    inizio_il: new Date(String(row.inizio_il)).toISOString(),
    durata_min: Number(row.durata_min ?? 0),
    registrazione_disponibile: Boolean(row.registrazione_disponibile),
    note: row.note ? String(row.note) : null,
  }))
}

/**
 * Posti ancora liberi in un corso a numero chiuso. Null quando non c'e limite.
 *
 * Occupano un posto gli acquisti pagati e i checkout aperti da meno di mezz'ora.
 * I secondi perche fra l'apertura di Stripe e il pagamento passano minuti in cui
 * il posto e di fatto impegnato; la mezz'ora perche un checkout abbandonato non
 * deve tenerlo occupato per sempre.
 *
 * Non e un lucchetto: due persone che pagano nello stesso istante possono
 * ancora prendere l'ultimo posto in due. Con dodici posti e un prodotto di
 * questo prezzo e un caso raro e si gestisce a mano, mentre un lock vero
 * costerebbe una tabella di prenotazioni e una scadenza da spazzare.
 */
export async function postiLiberi(corsoId: string, postiTotali: number | null): Promise<number | null> {
  if (postiTotali === null || !dbReady()) return null
  const row = await q1(
    `SELECT COUNT(*)::int AS occupati
       FROM corso_acquisti
      WHERE corso_id = $1
        AND (status = 'paid'
             OR (status = 'checkout_open' AND created_at > now() - interval '30 minutes'))`,
    [corsoId],
  )
  return Math.max(0, postiTotali - Number(row?.occupati ?? 0))
}

/** True se il corso ha un numero chiuso e non ci sono piu posti. */
export async function postiEsauriti(corso: { id: string; posti_totali: number | null }): Promise<boolean> {
  const liberi = await postiLiberi(corso.id, corso.posti_totali)
  return liberi !== null && liberi <= 0
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

  const base = rigaCatalogo(row)
  return {
    ...base,
    pubblicato: Boolean(row.pubblicato),
    seo_title: row.seo_title ? String(row.seo_title) : null,
    seo_description: row.seo_description ? String(row.seo_description) : null,
    moduli: await caricaProgramma(base.id, false),
    incontri: await caricaIncontri(base.id),
    posti_liberi: await postiLiberi(base.id, base.posti_totali),
    // Mai sulla pagina pubblica: il link alla stanza e il prodotto.
    link_accesso: null,
  }
}

/**
 * Chi sta guardando, per la filigrana del player. Non e un dettaglio estetico:
 * e il dato che rende tracciabile una copia uscita dalla piattaforma, quindi
 * deve venire dal database e non da qualcosa che il browser puo cambiare.
 */
export async function getSpettatore(userId: string): Promise<{ nome: string | null; email: string; azienda: string | null } | null> {
  if (!dbReady()) return null
  const row = await q1('SELECT nome, email, azienda FROM profiles WHERE id = $1 LIMIT 1', [userId])
  if (!row) return null
  return {
    nome: row.nome ? String(row.nome) : null,
    email: String(row.email ?? ''),
    azienda: row.azienda ? String(row.azienda) : null,
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

/** Quanti corsi ha comprato: serve alla navigazione dell'area cliente. */
export async function contaCorsiUtente(userId: string): Promise<number> {
  if (!dbReady()) return 0
  const row = await q1(
    `SELECT COUNT(*)::int AS n FROM corso_acquisti WHERE user_id = $1 AND status = 'paid'`,
    [userId],
  )
  return Number(row?.n ?? 0)
}

/**
 * Corso completo per uno studente che lo ha acquistato, progressi inclusi.
 * Torna null se il corso non esiste o se l'utente non lo ha comprato: il
 * controllo di accesso vive qui, non nella pagina.
 */
export async function getCorsoPerStudente(userId: string, slug: string): Promise<CorsoConProgramma | null> {
  if (!dbReady()) return null

  const row = await q1(
    `SELECT ${CAMPI_CATALOGO}, c.pubblicato, c.seo_title, c.seo_description,
            c.link_accesso, ${CONTEGGI_CATALOGO}
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
    incontri: await caricaIncontri(corsoId),
    posti_liberi: null,
    // Qui si: l'acquisto e gia stato verificato due righe sopra.
    link_accesso: row.link_accesso ? String(row.link_accesso) : null,
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

export type CorsoPerAcquisto = {
  id: string
  slug: string
  titolo: string
  prezzo_cents: number
  currency: string
  pubblicato: boolean
  in_prevendita: boolean
  modalita: Modalita
  posti_totali: number | null
}

/**
 * Dati minimi per avviare un pagamento. Prezzo e titolo si leggono SEMPRE da
 * qui e mai dalla richiesta del browser: e l'unico punto in cui si decide
 * quanto viene addebitato.
 */
export async function getCorsoPerAcquisto(slug: string): Promise<CorsoPerAcquisto | null> {
  if (!dbReady()) return null
  const row = await q1(
    `SELECT id, slug, titolo, prezzo_cents, currency, pubblicato, disponibile_dal,
            modalita, posti_totali
       FROM corsi WHERE slug = $1 LIMIT 1`,
    [slug],
  )
  if (!row) return null
  return {
    id: String(row.id),
    slug: String(row.slug),
    titolo: String(row.titolo),
    prezzo_cents: Number(row.prezzo_cents),
    currency: String(row.currency ?? 'eur'),
    pubblicato: Boolean(row.pubblicato),
    in_prevendita: Boolean(row.disponibile_dal) && new Date(String(row.disponibile_dal)) > new Date(),
    modalita: String(row.modalita ?? 'registrato') as Modalita,
    posti_totali: row.posti_totali === null || row.posti_totali === undefined ? null : Number(row.posti_totali),
  }
}

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

// ── Amministrazione ─────────────────────────────────────────────────────────
//
// Tutto quello che sta sotto scrive, e viene chiamato solo da route che hanno
// gia passato requireAdmin(). Le colonne scrivibili sono elencate una per una:
// un `UPDATE` costruito dalle chiavi del body lascerebbe modificare campi che
// non devono essere toccati dall'esterno (per esempio lo stato di un acquisto).

const COLONNE_CORSO = new Set([
  'slug', 'titolo', 'sottotitolo', 'descrizione', 'immagine_url', 'prezzo_cents',
  'currency', 'livello', 'categoria', 'pubblicato', 'disponibile_dal',
  'in_evidenza', 'ordine', 'seo_title', 'seo_description',
  'modalita', 'posti_totali', 'link_accesso',
])

export type CorsoAdmin = CorsoCatalogo & {
  pubblicato: boolean
  in_evidenza: boolean
  ordine: number
  seo_title: string | null
  seo_description: string | null
  link_accesso: string | null
  moduli_totali: number
  incontri_totali: number
  venduti: number
  incasso_cents: number
}

/** Elenco completo per l'amministrazione: pubblicati e non, con le vendite. */
export async function listCorsiAdmin(): Promise<CorsoAdmin[]> {
  if (!dbReady()) return []
  const rows = await q(
    `SELECT ${CAMPI_CATALOGO}, c.pubblicato, c.in_evidenza, c.ordine,
            c.seo_title, c.seo_description, c.link_accesso,
            (SELECT COUNT(*)::int FROM corso_moduli m WHERE m.corso_id = c.id) AS moduli_totali,
            (SELECT COUNT(*)::int FROM corso_incontri i WHERE i.corso_id = c.id) AS incontri_totali,
            (SELECT COUNT(*)::int FROM corso_lezioni l
               JOIN corso_moduli m2 ON m2.id = l.modulo_id
              WHERE m2.corso_id = c.id) AS lezioni_totali,
            (SELECT COALESCE(SUM(l.durata_min), 0)::int FROM corso_lezioni l
               JOIN corso_moduli m3 ON m3.id = l.modulo_id
              WHERE m3.corso_id = c.id) AS durata_totale_min,
            (SELECT COUNT(*)::int FROM corso_acquisti a
              WHERE a.corso_id = c.id AND a.status = 'paid') AS venduti,
            (SELECT COALESCE(SUM(a.amount_cents), 0)::int FROM corso_acquisti a
              WHERE a.corso_id = c.id AND a.status = 'paid') AS incasso_cents
       FROM corsi c
      ORDER BY c.in_evidenza DESC, c.ordine, c.created_at DESC`,
  )
  return rows.map(row => ({
    ...rigaCatalogo(row),
    pubblicato: Boolean(row.pubblicato),
    in_evidenza: Boolean(row.in_evidenza),
    ordine: Number(row.ordine ?? 0),
    seo_title: row.seo_title ? String(row.seo_title) : null,
    seo_description: row.seo_description ? String(row.seo_description) : null,
    link_accesso: row.link_accesso ? String(row.link_accesso) : null,
    moduli_totali: Number(row.moduli_totali ?? 0),
    incontri_totali: Number(row.incontri_totali ?? 0),
    venduti: Number(row.venduti ?? 0),
    incasso_cents: Number(row.incasso_cents ?? 0),
  }))
}

/** Un corso con tutto dentro, per la pagina di modifica. */
export async function getCorsoAdmin(id: string): Promise<(CorsoAdmin & { moduli: Modulo[]; incontri: Incontro[] }) | null> {
  if (!dbReady()) return null
  const tutti = await listCorsiAdmin()
  const corso = tutti.find(c => c.id === id)
  if (!corso) return null
  return {
    ...corso,
    // sbloccato: in amministrazione si deve vedere anche il contenuto, altrimenti
    // non lo si puo correggere.
    moduli: await caricaProgramma(id, true),
    incontri: await caricaIncontri(id),
  }
}

function valoriScrivibili(dati: Record<string, unknown>, colonne: Set<string>): [string[], unknown[]] {
  const campi: string[] = []
  const valori: unknown[] = []
  for (const [chiave, valore] of Object.entries(dati)) {
    if (!colonne.has(chiave)) continue
    campi.push(chiave)
    valori.push(valore === '' ? null : valore)
  }
  return [campi, valori]
}

export async function creaCorso(dati: Record<string, unknown>): Promise<string> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_CORSO)
  if (!campi.includes('slug') || !campi.includes('titolo') || !campi.includes('prezzo_cents')) {
    throw new Error('Servono slug, titolo e prezzo')
  }
  const segnaposto = campi.map((_, i) => `$${i + 1}`).join(', ')
  const row = await q1(
    `INSERT INTO corsi (${campi.join(', ')}) VALUES (${segnaposto}) RETURNING id`,
    valori,
  )
  return String((row as { id: string }).id)
}

export async function aggiornaCorso(id: string, dati: Record<string, unknown>): Promise<boolean> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_CORSO)
  if (!campi.length) return false
  const set = campi.map((campo, i) => `${campo} = $${i + 2}`).join(', ')
  await q(`UPDATE corsi SET ${set}, updated_at = now() WHERE id = $1`, [id, ...valori])
  return true
}

/**
 * Elimina un corso. Fallisce di proposito se e stato venduto: il vincolo
 * `on delete restrict` su corso_acquisti tiene in piedi la prova che qualcuno lo
 * ha pagato. Un corso venduto si toglie dal catalogo con pubblicato = false.
 */
export async function eliminaCorso(id: string): Promise<{ eliminato: boolean; motivo?: string }> {
  const venduto = await q1(
    `SELECT 1 AS ok FROM corso_acquisti WHERE corso_id = $1 AND status = 'paid' LIMIT 1`,
    [id],
  )
  if (venduto) {
    return { eliminato: false, motivo: 'Questo corso e stato venduto: si puo togliere dal catalogo, non eliminare.' }
  }
  await q('DELETE FROM corsi WHERE id = $1', [id])
  return { eliminato: true }
}

const COLONNE_MODULO = new Set(['titolo', 'ordine'])
const COLONNE_LEZIONE = new Set([
  'titolo', 'ordine', 'tipo', 'video_storage_key', 'video_url', 'contenuto',
  'durata_min', 'anteprima_gratuita',
])
const COLONNE_INCONTRO = new Set(['titolo', 'ordine', 'inizio_il', 'durata_min', 'video_storage_key', 'note'])

export async function creaModulo(corsoId: string, dati: Record<string, unknown>): Promise<string> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_MODULO)
  const row = await q1(
    `INSERT INTO corso_moduli (corso_id${campi.length ? ', ' + campi.join(', ') : ''})
     VALUES ($1${campi.map((_, i) => `, $${i + 2}`).join('')}) RETURNING id`,
    [corsoId, ...valori],
  )
  return String((row as { id: string }).id)
}

export async function aggiornaModulo(id: string, dati: Record<string, unknown>): Promise<boolean> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_MODULO)
  if (!campi.length) return false
  const set = campi.map((campo, i) => `${campo} = $${i + 2}`).join(', ')
  await q(`UPDATE corso_moduli SET ${set} WHERE id = $1`, [id, ...valori])
  return true
}

export async function eliminaModulo(id: string): Promise<void> {
  await q('DELETE FROM corso_moduli WHERE id = $1', [id])
}

export async function creaLezione(moduloId: string, dati: Record<string, unknown>): Promise<string> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_LEZIONE)
  const row = await q1(
    `INSERT INTO corso_lezioni (modulo_id${campi.length ? ', ' + campi.join(', ') : ''})
     VALUES ($1${campi.map((_, i) => `, $${i + 2}`).join('')}) RETURNING id`,
    [moduloId, ...valori],
  )
  return String((row as { id: string }).id)
}

export async function aggiornaLezione(id: string, dati: Record<string, unknown>): Promise<boolean> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_LEZIONE)
  if (!campi.length) return false
  const set = campi.map((campo, i) => `${campo} = $${i + 2}`).join(', ')
  await q(`UPDATE corso_lezioni SET ${set} WHERE id = $1`, [id, ...valori])
  return true
}

export async function eliminaLezione(id: string): Promise<void> {
  await q('DELETE FROM corso_lezioni WHERE id = $1', [id])
}

export async function creaIncontro(corsoId: string, dati: Record<string, unknown>): Promise<string> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_INCONTRO)
  if (!campi.includes('inizio_il')) throw new Error('Serve la data dell\'incontro')
  const row = await q1(
    `INSERT INTO corso_incontri (corso_id, ${campi.join(', ')})
     VALUES ($1${campi.map((_, i) => `, $${i + 2}`).join('')}) RETURNING id`,
    [corsoId, ...valori],
  )
  return String((row as { id: string }).id)
}

export async function aggiornaIncontro(id: string, dati: Record<string, unknown>): Promise<boolean> {
  const [campi, valori] = valoriScrivibili(dati, COLONNE_INCONTRO)
  if (!campi.length) return false
  const set = campi.map((campo, i) => `${campo} = $${i + 2}`).join(', ')
  await q(`UPDATE corso_incontri SET ${set} WHERE id = $1`, [id, ...valori])
  return true
}

export async function eliminaIncontro(id: string): Promise<void> {
  await q('DELETE FROM corso_incontri WHERE id = $1', [id])
}

export type VenditaCorso = {
  id: string
  corso_titolo: string
  corso_slug: string
  studente_nome: string | null
  studente_email: string
  amount_cents: number
  currency: string
  status: string
  customer_type: string
  paid_at: string | null
  created_at: string
}

/** Vendite dei corsi, le piu recenti per prime. */
export async function listVenditeCorsi(limite = 200): Promise<VenditaCorso[]> {
  if (!dbReady()) return []
  const rows = await q(
    `SELECT a.id, a.amount_cents, a.currency, a.status, a.customer_type,
            a.paid_at, a.created_at,
            c.titolo AS corso_titolo, c.slug AS corso_slug,
            p.nome AS studente_nome, p.email AS studente_email
       FROM corso_acquisti a
       JOIN corsi c    ON c.id = a.corso_id
       JOIN profiles p ON p.id = a.user_id
      ORDER BY a.created_at DESC
      LIMIT $1`,
    [limite],
  )
  return rows.map(row => ({
    id: String(row.id),
    corso_titolo: String(row.corso_titolo),
    corso_slug: String(row.corso_slug),
    studente_nome: row.studente_nome ? String(row.studente_nome) : null,
    studente_email: String(row.studente_email ?? ''),
    amount_cents: Number(row.amount_cents ?? 0),
    currency: String(row.currency ?? 'eur'),
    status: String(row.status ?? ''),
    customer_type: String(row.customer_type ?? ''),
    paid_at: row.paid_at ? new Date(String(row.paid_at)).toISOString() : null,
    created_at: new Date(String(row.created_at)).toISOString(),
  }))
}

// ── Rimborsi ────────────────────────────────────────────────────────────────

export type EsitoRimborso = {
  acquistoId: string
  userId: string
  corsoId: string
  titolo: string
  slug: string
  /** Nome ed email di chi aveva comprato, per la notifica interna. */
  studenteNome: string | null
  studenteEmail: string
  amountCents: number
  rimborsatoCents: number
  /** True se il rimborso copre l'intero importo: solo allora l'accesso si chiude. */
  totale: boolean
}

/**
 * Registra un rimborso arrivato da Stripe e, se e totale, chiude l'accesso.
 *
 * La revoca non cancella la riga: diventa `status = 'refunded'`. Serve a tre
 * cose. `haAccessoAlCorso` filtra su 'paid', quindi l'accesso si chiude senza
 * altro codice; l'indice unico parziale vale solo sugli acquisti pagati, quindi
 * la stessa persona puo ricomprare il corso piu avanti; e resta la prova che
 * quel pagamento c'e stato e com'e finito, che e esattamente cio che serve se
 * qualcuno contesta.
 *
 * Un rimborso PARZIALE non chiude niente. Puo essere uno sconto concesso dopo,
 * o la restituzione di una parte concordata: togliere l'accesso a chi ha pagato
 * quasi tutto sarebbe una punizione per un gesto commerciale. Viene registrato
 * nei metadata e notificato, e se va chiuso lo si fa a mano.
 */
export async function registraRimborsoCorso(
  paymentIntentId: string,
  importi: { rimborsatoCents: number },
): Promise<EsitoRimborso | null> {
  if (!dbReady() || !paymentIntentId) return null

  const riga = await q1(
    `SELECT a.id, a.user_id, a.corso_id, a.amount_cents, a.status,
            c.titolo, c.slug, p.nome AS studente_nome, p.email AS studente_email
       FROM corso_acquisti a
       JOIN corsi c    ON c.id = a.corso_id
       JOIN profiles p ON p.id = a.user_id
      WHERE a.stripe_payment_intent_id = $1
      LIMIT 1`,
    [paymentIntentId],
  )
  if (!riga) return null

  const amountCents = Number(riga.amount_cents ?? 0)
  const totale = rimborsoChiudeAccesso(importi.rimborsatoCents, amountCents)

  // Idempotenza: Stripe puo consegnare lo stesso evento piu volte. Il secondo
  // passaggio riscrive gli stessi valori e non cambia nulla.
  await q(
    `UPDATE corso_acquisti
        SET status = CASE WHEN $3 THEN 'refunded' ELSE status END,
            metadata = metadata || jsonb_build_object(
              'rimborsato_cents', $2::int,
              'rimborsato_il', now()::text,
              'rimborso_totale', $3::boolean
            ),
            updated_at = now()
      WHERE id = $1`,
    [riga.id, importi.rimborsatoCents, totale],
  )

  return {
    acquistoId: String(riga.id),
    userId: String(riga.user_id),
    corsoId: String(riga.corso_id),
    titolo: String(riga.titolo),
    slug: String(riga.slug),
    studenteNome: riga.studente_nome ? String(riga.studente_nome) : null,
    studenteEmail: String(riga.studente_email ?? ''),
    amountCents,
    rimborsatoCents: importi.rimborsatoCents,
    totale,
  }
}

/**
 * Chiude o riapre l'accesso a un corso a mano, dall'amministrazione.
 *
 * Serve per i casi che il webhook non decide da solo: un rimborso parziale che
 * era in realta un recesso, una contestazione della carta, un acquisto fatto
 * per errore. E anche il modo per rimediare a una chiusura sbagliata.
 *
 * Gli unici due stati raggiungibili da qui sono 'paid' e 'refunded': un ordine
 * non torna a 'checkout_pending' e non si inventa uno stato nuovo da un menu.
 */
export async function impostaAccessoAcquisto(
  acquistoId: string,
  stato: 'paid' | 'refunded',
): Promise<boolean> {
  if (!dbReady()) return false
  const row = await q1(
    `UPDATE corso_acquisti
        SET status = $2,
            paid_at = CASE WHEN $2 = 'paid' THEN COALESCE(paid_at, now()) ELSE paid_at END,
            metadata = metadata || jsonb_build_object('stato_forzato_il', now()::text),
            updated_at = now()
      WHERE id = $1 AND status IN ('paid', 'refunded')
      RETURNING id`,
    [acquistoId, stato],
  )
  return Boolean(row)
}
