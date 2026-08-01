import { NextResponse } from 'next/server'
import { callAI, extractJSONArray } from '@/lib/ai'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { demoContenuti } from '@/lib/demo-data'
import {
  buildExtendedOutputSchema,
  jsonbParam,
  normalizeContentQuality,
  pickJson,
  pickText,
  resolveContentQuality,
  summarizeQualityForPrompt,
  isQualityDowngraded,
} from '@/lib/content-quality'
import { getClientGenerationContext } from '@/lib/client-context'
import { PRO_COPY_STANDARDS, SEO_GEO_STANDARDS, DIVERSITY_STANDARDS, FUNNEL_STANDARDS, HOOK_FORMULAS, COPY_FRAMEWORKS, COPY_ANGLES } from '@/lib/prompt-standards'
import { fetchSectorTrends, buildTrendContext } from '@/lib/trends'
import { getPackage, type PackageSpec } from '@/lib/packages'
import { buildBrandContext } from '@/lib/brand-context'
import { buildGenerationOptimizationCyclePrompt, normalizeProductionCycleStage } from '@/lib/production-cycle'
import { filterExistingColumnPairs, getTableColumns } from '@/lib/db-schema'
// Governo di ORARI (e del solo vincolo di giorno che dipende dal canale): il
// piano non deve più affidarsi a un default fisso '10:00' né agli orari a caso
// del modello. Fasce per canale + cadenza dal pacchetto vivono in lib/scheduling.
import {
  cadenzaDaPacchetto,
  getCanaleSlots,
  giornoValidoPerCanale,
  isWeekend,
  pickSlot,
  prossimoGiornoValido,
  slotsPerPrompt,
} from '@/lib/scheduling'

// Standard del piano: composti dalla "bibbia" condivisa (lib/prompt-standards).
// Forza DIVERSITÀ + funnel strategico + SEO/GEO + copy professionale.
const PLAN_STANDARDS = `
STANDARD DEL PIANO (vincolanti):

${DIVERSITY_STANDARDS}

${FUNNEL_STANDARDS}

${HOOK_FORMULAS}

${COPY_FRAMEWORKS}

${SEO_GEO_STANDARDS}

${PRO_COPY_STANDARDS}

Non inventare prezzi, stock, sconti o claim non presenti nei dati brand/prodotti.`

// VISION: stesso principio di generate/content (buildAssetContext) applicato al piano
// multi-contenuto. Mostriamo alla AI le foto DAVVERO allegate a QUESTO chunk, ciascuna
// con la descrizione (nome prodotto) data dall'utente, così hook/caption/tema descrivono
// il capo VERO (colore, ambientazione) E — cruciale — il modello sceglie da sé la foto
// giusta per ogni contenuto dichiarandone il numero in `media_refs` (vedi schema item).
// Prima l'assegnazione era posizionale cieca: il modello riordinava gli item e le foto
// slittavano sul post sbagliato.
function buildPlanAssetContext(shown: string[], labels: Map<string, string>) {
  if (!shown.length) return ''
  const imageUrls = shown.filter(url => !isVideoUrl(url))
  const videoUrls = shown.filter(isVideoUrl)
  return `

MEDIA CARICATI DALL'UTENTE PER QUESTO BLOCCO (numerati — il numero è il valore da usare in media_refs):
${shown.map((url, index) => `${index + 1}. ${labels.get(url) || 'media'} — ${url}${isVideoUrl(url) ? ' [MP4]' : ''}`).join('\n')}

⚠️ VISION + ABBINAMENTO — istruzioni vincolanti:
- Le immagini (${imageUrls.length}) sono visibili in allegato: guardale e scrivi hook/caption/tema su quello che vedi davvero.
- Gli MP4 (${videoUrls.length}) sono video finali già caricati: assegnali preferibilmente a formati reel/video/short e non inventare un video alternativo.
- Per OGNI contenuto scegli la/le foto giuste in base alla descrizione accanto al numero e a ciò che vedi, e indica il/i numero/i nel campo "media_refs": es. "media_refs":[2] per un post/reel singolo, "media_refs":[2,5,7] per un carosello.
- Usa ogni foto UNA sola volta in questo blocco: non ripetere lo stesso numero su contenuti diversi.
- Se un contenuto non ha una foto adatta tra quelle mostrate, lascia "media_refs":[] (verrà completato in automatico).
- Non inventare dettagli visivi non presenti nei media.`
}

// --- Date helpers -----------------------------------------------------------
// Prima il modello doveva INDOVINARE le date (placeholder "YYYY-MM-DD" nel prompt,
// nessun ancoraggio a "oggi"). Ora ogni blocco riceve un range di date REALE e
// verificabile: il modello ci scrive dentro, e sanitizeItem() lo forza comunque
// a restare nel range se sbaglia.
function fmtDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}
function addDays(d: Date, days: number): Date {
  const copy = new Date(d)
  copy.setDate(copy.getDate() + days)
  return copy
}

// --- Memoria anti-ripetizione ----------------------------------------------
// Additivo: il piano riceve gli ultimi contenuti già in calendario e l'ordine di
// NON ricalcarli. È la leva che spezza la ripetitività TRA una generazione e la
// successiva (la diversità intra-piano è già coperta da DIVERSITY_STANDARDS).
function buildHistoryContext(rows: Record<string, unknown>[]): string {
  if (!rows.length) return ''
  const hooks = rows.map(r => (typeof r.hook === 'string' ? r.hook.trim() : '')).filter(Boolean).slice(0, 25)
  const temi = [...new Set(rows.map(r => (typeof r.tema === 'string' ? r.tema.trim() : '')).filter(Boolean))].slice(0, 15)
  if (!hooks.length && !temi.length) return ''
  return `

CONTENUTI GIÀ IN CALENDARIO (evita di ripeterli — devi essere diverso da questi):
${hooks.length ? `Hook già usati:\n${hooks.map(h => `- ${h.slice(0, 90)}`).join('\n')}\n` : ''}${temi.length ? `Temi già battuti: ${temi.map(t => t.slice(0, 50)).join(' · ')}\n` : ''}Genera hook, angoli e temi NUOVI: non ricalcare quelli sopra, cambia apertura e prospettiva.`
}

// --- Contesto temporale/stagionale (deterministico, zero costo AI) ----------
const MONTH_NAMES = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre']
function seasonOf(month: number): string {
  if (month === 12 || month <= 2) return 'inverno'
  if (month <= 5) return 'primavera'
  if (month <= 8) return 'estate'
  return 'autunno'
}
// Momenti commerciali forti (Italia, fashion e-commerce), per mese coperto dal range.
const SEASONAL_EVENTS: { m: number; label: string }[] = [
  { m: 1, label: 'Saldi invernali' },
  { m: 2, label: 'San Valentino (14/2)' },
  { m: 3, label: 'Festa della donna (8/3)' },
  { m: 5, label: 'Festa della mamma' },
  { m: 7, label: 'Saldi estivi' },
  { m: 8, label: 'Ferragosto (15/8)' },
  { m: 9, label: 'Rientro / nuova stagione autunno-inverno' },
  { m: 10, label: 'Halloween (31/10)' },
  { m: 11, label: 'Black Friday e Cyber Monday' },
  { m: 12, label: 'Natale, regali e Capodanno' },
]
function buildTemporalContext(startISO: string, endISO: string): string {
  const s = new Date(`${startISO}T00:00:00Z`)
  const e = new Date(`${endISO}T00:00:00Z`)
  if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return ''
  const months = new Set<number>()
  for (const d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) months.add(d.getUTCMonth() + 1)
  const monthList = [...months]
  if (!monthList.length) return ''
  const monthLabels = monthList.map(m => MONTH_NAMES[m - 1])
  const season = seasonOf(monthList[0])
  const events = SEASONAL_EVENTS.filter(ev => months.has(ev.m)).map(ev => ev.label)
  return `

CONTESTO TEMPORALE (aggancia i contenuti al momento reale, senza forzare):
- Periodo del piano: ${monthLabels.join(', ')} — stagione: ${season}.
${events.length ? `- Ricorrenze/momenti nel periodo: ${events.join(' · ')}. Sfruttali dove pertinenti al brand.` : '- Nessuna ricorrenza commerciale forte: punta su stagionalità e novità di stagione.'}
- Collega mood, palette e occasioni d'uso alla stagione; niente riferimenti fuori stagione.`
}

// --- Seed di diversità per BLOCCO (anti-ripetizione intra-mensile) -----------
// I blocchi settimanali del mensile girano in parallelo e non si vedono tra loro:
// senza un seed potrebbero ripetere pilastri/angoli. Assegnando a monte a ogni
// blocco pilastri editoriali e angoli creativi DIVERSI (rotazione deterministica
// sull'indice), i 4 blocchi risultano distinti pur restando paralleli. Additivo.
const EDITORIAL_PILLARS = ['Prodotto', 'Educativo/Styling', 'Brand/Valori', 'Community/UGC', 'Dietro le quinte', 'Trend']
function buildChunkDiversitySeed(chunkIndex: number, totalChunks: number): string {
  if (totalChunks <= 1) return ''   // un solo blocco: DIVERSITY_STANDARDS è sufficiente
  const p = EDITORIAL_PILLARS.length
  const pStart = (chunkIndex * 2) % p
  const pillars = [EDITORIAL_PILLARS[pStart], EDITORIAL_PILLARS[(pStart + 1) % p], EDITORIAL_PILLARS[(pStart + 2) % p]]
  const a = COPY_ANGLES.length
  const aStart = (chunkIndex * 3) % a
  const angles = [COPY_ANGLES[aStart], COPY_ANGLES[(aStart + 1) % a], COPY_ANGLES[(aStart + 2) % a]]
  return `

FOCUS DI QUESTO BLOCCO (i blocchi del piano NON devono somigliarsi tra loro):
- Pilastri editoriali dominanti di questo blocco: ${pillars.join(' · ')}. Guidano questo blocco (puoi toccarne altri, ma questi comandano).
- Angoli creativi da privilegiare qui: ${angles.map((ang, i) => `(${i + 1}) ${ang}`).join(' ')}
- Cambia apertura, tono e struttura rispetto agli altri blocchi del mese: mai lo stesso hook/tema di un altro blocco.`
}

// Vincoli del pacchetto acquistato iniettati nel prompt. `perBlocco` è il numero di
// contenuti da generare in QUESTO blocco settimanale: va tenuto distinto dal totale
// mensile, altrimenti il modello si ancora al totale e sovraproduce per blocco.
function buildPackageContext(pkg: PackageSpec | null, perBlocco: number): string {
  if (!pkg) return ''
  return `

PACCHETTO ${pkg.nome.toUpperCase()} — VINCOLI DEL CLIENTE (ha acquistato questo pacchetto):
- In QUESTO blocco genera ESATTAMENTE ${perBlocco} contenuti, non di più.
- Contesto (NON generarlo tutto qui): nel mese il piano completo avrà ${pkg.contenutiMese} contenuti social = ${pkg.postCaroselli} tra POST/CAROSELLI + ${pkg.reelBrevi} tra REEL/STORY/SHORT; rispetta questo mix di formati nell'insieme del mese.
- Distribuisci i contenuti sui ${pkg.social} social selezionati.
- Mantieni lo standard qualità del pacchetto su ogni contenuto.`
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/
const VALID_CANALI = new Set(['instagram', 'facebook', 'tiktok', 'pinterest', 'linkedin', 'threads', 'x', 'youtube_shorts', 'blog'])
const VALID_FORMATI = new Set(['post', 'carousel', 'reel', 'story', 'pin', 'short', 'video', 'articolo'])

type Chunk = { start: string; end: string; label: string; targetMin: number; targetMax: number; images: string[] }

function isVideoUrl(url: string) {
  return url.split('?')[0].toLowerCase().endsWith('.mp4')
}

// --- Schema DB: introspection dinamica invece di due liste hardcoded --------
// Prima c'erano DUE elenchi di colonne mantenuti a mano (insertColumns completo +
// retryColumns "base" per il fallback): sono andati fuori sync — le colonne extra
// aggiunte dopo (audience_segment, kpi_target, ecc.) non erano nella retry list,
// quindi un DB non ancora migrato le perdeva silenziosamente invece di avvisare.
// Ora leggiamo UNA volta le colonne vere da information_schema e filtriamo su quelle.
async function insertCalendario(columns: string[], values: unknown[]): Promise<boolean> {
  const existing = await getTableColumns('calendario')
  const { columns: finalColumns, values: finalValues, skipped } = filterExistingColumnPairs(columns, values, existing)
  if (!finalColumns.length) throw new Error('Nessuna colonna valida per insert su calendario (schema DB inatteso)')
  await q(
    `INSERT INTO calendario (${finalColumns.join(', ')}) VALUES (${finalColumns.map((_, index) => `$${index + 1}`).join(', ')})`,
    finalValues,
  )
  return skipped.length > 0
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, piattaforme, obiettivo, model, openrouter_key, periodo, quality, quality_level, post_quality, qualita, media_urls, uploaded_assets, fase, visual_effects, visual_preset, use_trending_effects, include_weekend, use_web_trends, pacchetto } = await request.json()
    // Modalità "piano del pacchetto": la generazione è guidata dalla ricetta del
    // pacchetto (numero, mix, social, qualità) invece che dai parametri manuali.
    // Il body dice SOLO che la si vuole: quale pacchetto sia davvero è un dato
    // commerciale e va letto dal cliente a DB (vedi più sotto), altrimenti
    // chiunque potrebbe chiedere il pacchetto superiore e scavalcare il cap di
    // qualità del proprio piano.
    const pkgRequested: PackageSpec | null = getPackage(pacchetto)
    const periodoEff = pkgRequested ? 'mensile' : periodo
    const mediaPool: string[] = Array.isArray(media_urls) ? media_urls.filter((u): u is string => typeof u === 'string' && u.length > 0) : []
    // Descrizione per foto (nome prodotto) dal client: mappa url→label. Serve al prompt
    // per far scegliere al modello la foto giusta per numero (media_refs). Opzionale:
    // se manca, il piano ripiega sull'assegnazione posizionale (retrocompatibile).
    const assetLabels = new Map<string, string>()
    if (Array.isArray(uploaded_assets)) {
      for (const raw of uploaded_assets) {
        if (!raw || typeof raw !== 'object') continue
        const rec = raw as Record<string, unknown>
        const url = typeof rec.url === 'string' ? rec.url.trim() : ''
        const name = typeof rec.name === 'string' ? rec.name.trim() : ''
        if (url && name) assetLabels.set(url, name)
      }
    }
    // Weekend nel piano: default INCLUSO. Se false, il piano usa solo lun-ven
    // (prompt esplicito + enforcement deterministico in sanitizeItem).
    const includeWeekend = include_weekend !== false
    // Mensile in 2 fasi (opzionale): fase 1 = settimane 1-2, fase 2 = settimane 3-4.
    // Serve a spezzare una richiesta lunga in due più corte (meno rischio timeout).
    // Senza `fase` genera tutte e 4 le settimane come prima (retrocompatibile).
    const faseNum = fase === 1 || fase === 2 ? fase : null

    if (!piattaforme?.length) {
      return NextResponse.json({ error: 'piattaforme richieste' }, { status: 400 })
    }
    const clientContext = await getClientGenerationContext(cliente_id)
    const effectiveClienteId = clientContext.clienteId
    if (!effectiveClienteId) return NextResponse.json({ error: 'Nessun cliente selezionato' }, { status: 400 })
    await requireClienteAccess(effectiveClienteId)
    const requestedQuality = quality ?? quality_level ?? post_quality ?? qualita

    if (isDemo() || !dbReady()) {
      const demoQuality = resolveContentQuality({ requestedQuality })
      const selectedPlatforms = new Set<string>(piattaforme)
      const count = demoContenuti.filter((item) => selectedPlatforms.has(item.canale)).length || (periodo === 'mensile' ? 30 : 7)
      return NextResponse.json({
        ok: true,
        demo: true,
        count,
        quality_level: demoQuality,
        quality_downgraded: isQualityDowngraded(requestedQuality, demoQuality),
        warning: 'Fallback demo: DATABASE_URL non configurato, piano non persistito su Neon.',
      })
    }

    const [brandRows, products, clientRows, recentRows] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [effectiveClienteId]),
      q('SELECT * FROM prodotti WHERE cliente_id = $1', [effectiveClienteId]),
      q('SELECT * FROM clienti WHERE id = $1 LIMIT 1', [effectiveClienteId]),
      // Storico per l'anti-ripetizione: solo hook/tema, ordinati dal più recente.
      // Colonne base garantite da 001_full_schema (nessun rischio su DB non migrati).
      q("SELECT hook, tema FROM calendario WHERE cliente_id = $1 AND (hook IS NOT NULL OR tema IS NOT NULL) ORDER BY created_at DESC LIMIT 30", [effectiveClienteId]),
    ])
    const brand = brandRows[0] ?? null
    const client = (clientRows[0] ?? null) as Record<string, unknown> | null

    // Il pacchetto che conta è quello acquistato, non quello chiesto dal client.
    const pkg: PackageSpec | null = pkgRequested ? getPackage(client?.pacchetto) : null
    if (pkgRequested && !pkg) {
      return NextResponse.json(
        { error: 'Questo cliente non ha un pacchetto attivo: usa il piano libero oppure assegna il pacchetto dalla scheda cliente.' },
        { status: 403 },
      )
    }

    // Qualità: il pacchetto la impone (Presenza=Medium, Crescita=High); altrimenti
    // si risolve da richiesta + piano del cliente come prima.
    const contentQuality = pkg ? pkg.quality : resolveContentQuality({ requestedQuality, piano: client?.piano })
    const piattaformeStr = piattaforme.join(', ')
    // Stesso contesto brand del generatore di post singoli (campi espliciti + default),
    // non più un dump JSON grezzo. Vuoto se il brand non è configurato → nota esplicita.
    const brandContext = buildBrandContext(brand)
    const productsJson = JSON.stringify(products || [], null, 2)
    const historyContext = buildHistoryContext(recentRows as Record<string, unknown>[])

    const qualityPrompt = `

QUALITÀ OPERATIVA:
${summarizeQualityForPrompt(contentQuality)}

${contentQuality === 'high' ? 'Per ogni contenuto includi TUTTI i campi dello schema: audience_segment, funnel_stage, angle, primary_message, proof_points, hook_variants, cta_variants, creative_brief, template_id, template_style, layout_spec, asset_requirements, scenes/slides, ab_variants, kpi_target, expected_outcome, optimization_cycle, compliance_notes, risk_flags, production_notes, missing_inputs, content_checklist.' : contentQuality === 'medium' ? 'Per ogni contenuto includi: audience_segment, funnel_stage, angle, primary_message, hook_variants, cta_variants, creative_brief, template_id, kpi_target, expected_outcome, production_notes, missing_inputs, content_checklist.' : 'Contenuto essenziale pronto da pubblicare: hook, caption, hashtag, cta, idea_visual, alt_text, tags.'}
${contentQuality === 'high' ? 'Per Reel/Short/Video includi scenes con timing. Per Story includi frames o scenes. Per Carousel includi slides.' : ''}
${buildGenerationOptimizationCyclePrompt(contentQuality)}
Schema operativo per ogni item:
${buildExtendedOutputSchema(contentQuality)}
`

    // --- Chunking: 1 blocco per settimanale, 4 per mensile -------------------
    // Un piano mensile intero (25-35 item con lo schema esteso sopra) in UNA
    // chiamata AI può arrivare a 25-30K token di output: sui modelli free il
    // rischio concreto è il troncamento a metà risposta → JSON malformato →
    // l'intera generazione falliva e l'utente non riceveva NULLA. Spezzare in
    // 4 blocchi settimanali (stessa forma del piano settimanale, che già
    // funzionava) elimina il problema alla radice invece di sperare in un
    // maxTokens abbastanza alto. Bonus: ogni blocco riceve una fetta diversa
    // delle foto caricate, quindi la vision copre molte più immagini nel mese
    // invece delle sole prime 7 di sempre.
    const today = new Date()
    const IMAGES_PER_CHUNK = 7
    // Piano del pacchetto: numero ESATTO di contenuti al mese, distribuito sulle 4
    // settimane (16→4/sett, 24→6/sett). targetMin=targetMax forza il modello sul numero.
    const pkgPerWeek = pkg ? Math.round(pkg.contenutiMese / 4) : 0
    const chunks: Chunk[] = []
    if (periodoEff === 'mensile') {
      // Mensile: 4 chunk settimanali. Per medium/high riduciamo il targetMax
      // (7 invece di 9) perché lo schema esteso + credito limitato troncherebbe.
      const maxPerWeek = pkg ? pkgPerWeek : (contentQuality === 'soft' ? 9 : 7)
      const minPerWeek = pkg ? pkgPerWeek : 6
      // Pacchetto = sempre le 4 settimane (numero esatto). Altrimenti rispetta la fase.
      const settimane = pkg ? [0, 1, 2, 3] : (faseNum === 1 ? [0, 1] : faseNum === 2 ? [2, 3] : [0, 1, 2, 3])
      for (const i of settimane) {
        chunks.push({
          start: fmtDate(addDays(today, i * 7)),
          end: fmtDate(addDays(today, i * 7 + 6)),
          label: `Settimana ${i + 1} del piano mensile`,
          targetMin: minPerWeek, targetMax: maxPerWeek,
          images: mediaPool.slice(i * IMAGES_PER_CHUNK, (i + 1) * IMAGES_PER_CHUNK),
        })
      }
    } else if (contentQuality === 'high' || contentQuality === 'medium') {
      // Quality medium/high: schema esteso (campi strategia, scenes, A/B, KPI...)
      // con 7-10 item in un solo chunk il JSON tronca anche a 12000 token, e su
      // OpenRouter con credito limitato (~10400) tronca sempre. Split in 2 mezze
      // settimane (4-5 item ciascuna) = ~4000-7500 token per chunk, rientra nei limiti.
      chunks.push({
        start: fmtDate(today),
        end: fmtDate(addDays(today, 3)),
        label: 'Prima metà piano settimanale (giorni 1-4)',
        targetMin: 4, targetMax: 5,
        images: mediaPool.slice(0, 4),
      })
      chunks.push({
        start: fmtDate(addDays(today, 4)),
        end: fmtDate(addDays(today, 6)),
        label: 'Seconda metà piano settimanale (giorni 5-7)',
        targetMin: 3, targetMax: 5,
        images: mediaPool.slice(4, 8),
      })
    } else {
      chunks.push({
        start: fmtDate(today),
        end: fmtDate(addDays(today, 6)),
        label: 'Piano settimanale',
        targetMin: 7, targetMax: 10,
        images: mediaPool.slice(0, IMAGES_PER_CHUNK),
      })
    }

    // Ridistribuisci TUTTE le foto caricate sui blocchi effettivi di questo run,
    // in fette contigue disgiunte: così ogni immagine viene usata una volta sola
    // (unicità globale garantita) e nessuna foto resta inutilizzata perché lo
    // slice fisso a 7 la tagliava fuori. Le fette restano ordinate → la vision
    // di ciascun blocco vede le stesse foto che poi gli vengono assegnate.
    if (mediaPool.length) {
      const n = mediaPool.length
      const k = chunks.length
      for (let ci = 0; ci < k; ci++) {
        const from = Math.floor((ci * n) / k)
        const to = Math.floor(((ci + 1) * n) / k)
        chunks[ci].images = mediaPool.slice(from, to)
      }
    }

    // Contesto stagionale calcolato sull'intero range del piano (comune a tutti i blocchi).
    const temporalContext = buildTemporalContext(chunks[0].start, chunks[chunks.length - 1].end)

    // --- Cadenza + fasce orarie (dal pacchetto e dalle piattaforme) ----------
    // Prima il prompt non diceva NULLA sugli orari e il modello li inventava
    // (09:30, 18:45, 19:15...) mentre il fallback schiacciava tutto su '10:00'.
    // Ora il modello riceve: quante uscite a settimana, su quanti giorni, quante
    // al massimo nello stesso giorno (cadenza del pacchetto) e le fasce reali di
    // ogni canale selezionato. L'enforcement resta comunque deterministico sotto.
    // Passiamo un target PER SETTIMANA (i blocchi del mensile sono settimanali),
    // quindi periodo 'settimanale'; con pacchetto il 4° parametro è ignorato.
    const targetPerSettimana = pkg
      ? pkgPerWeek
      : periodoEff === 'mensile'
        ? chunks[0].targetMax
        : chunks.reduce((sum, c) => sum + c.targetMax, 0)
    const cadenza = cadenzaDaPacchetto(pkg, 'settimanale', includeWeekend, targetPerSettimana)
    const cadenzaContext = `

CADENZA DEL PIANO — vincolante:
- Ritmo: ${cadenza.contenutiSettimana} contenuti a settimana, distribuiti su ${cadenza.giorniAttivi} giorni DIVERSI${includeWeekend ? '' : ' (solo lun-ven)'}.
- Massimo ${cadenza.maxPerGiorno} contenut${cadenza.maxPerGiorno === 1 ? 'o' : 'i'} nello stesso giorno.${cadenza.maxPerGiorno === 1 ? ' Mai due contenuti nella stessa data.' : ' Se un giorno ne ospita più d\'uno, devono essere su canali diversi e a orari diversi.'}`
    const orariCadenzaPrompt = `${cadenzaContext}${slotsPerPrompt(piattaforme)}`.trim()

    // Trend web reali (opt-in): una sola ricerca prima dei blocchi, iniettata in tutti.
    // SOLO per il mensile: la ricerca è awaited sul path critico (i blocchi la usano nel
    // prompt) e il mensile ha budget timeout ampio (130-140s); il settimanale (95s, con
    // chunk fino a 90s) non ha margine per +10s serial → il piano del pacchetto (sempre
    // mensile) la sfrutta, il settimanale libero no. Fail-safe: errore/timeout → '' e prosegue.
    let trendContext = ''
    if (use_web_trends === true && periodoEff === 'mensile') {
      const startMonth = new Date(`${chunks[0].start}T00:00:00Z`).getUTCMonth() + 1
      const periodoLabel = `${MONTH_NAMES[startMonth - 1]}, ${seasonOf(startMonth)}`
      const settore = (typeof brand?.settore === 'string' && brand.settore) || (typeof client?.settore === 'string' && client.settore) || ''
      const brandName = typeof brand?.brand_name === 'string' ? brand.brand_name : ''
      const trends = await fetchSectorTrends({ settore, brandName, periodoLabel, model, openrouterKey: openrouter_key, timeoutMs: 10000 })
      trendContext = buildTrendContext(trends)
    }

    const systemPrompt = `Sei un social media manager, creative strategist e SEO/GEO specialist senior (10+ anni, brand premium). Obiettivo: ${obiettivo || 'mix'}. Livello qualità: ${contentQuality}. Crei piani editoriali dove OGNI contenuto è unico, professionale, moderno e trend-aware: hook diversi, angoli ruotati, funnel bilanciato, keyword SEO/GEO sfruttate, meccaniche native da feed 2026, zero cliché, grammatica italiana impeccabile. Rispondi con JSON array valido, nessun altro testo. Non inventare prezzi, stock, canzoni virali, eventi o claim non presenti nei dati.`

    async function generateChunk(chunk: Chunk, chunkIndex: number): Promise<{ ok: true; items: Record<string, unknown>[] } | { ok: false; error: string }> {
      async function attempt(targetMin: number, targetMax: number, maxTok: number): Promise<{ ok: true; items: Record<string, unknown>[] } | { ok: false; error: string }> {
        const userPrompt = `Agisci come Social Media Manager senior per brand abbigliamento e-commerce.
Crea contenuti per ${chunk.label}, dal ${chunk.start} al ${chunk.end}, per / ${piattaformeStr} /.
Genera TRA ${targetMin} E ${targetMax} contenuti (mai meno di ${targetMin}). Ogni data_pubblicazione DEVE cadere dentro il range ${chunk.start}..${chunk.end} incluso — mai fuori, mai un placeholder generico.

${brandContext || 'BRAND non ancora configurato: resta coerente con i prodotti e la stagione, NON inventare tono di voce, valori o claim.'}

PRODOTTI:
${productsJson}

${includeWeekend
  ? 'Distribuisci i contenuti su TUTTI i 7 giorni, weekend (sabato e domenica) COMPRESI: lun/gio = inspiration, ven = vendita/promo, sab/dom = community/lifestyle.'
  : 'Pubblica SOLO da lunedi a venerdi: NIENTE contenuti sabato e domenica. Lun/gio = inspiration, ven = vendita/promo.'}
Non concentrare prodotti in pochi giorni.
DATE — vincolante: usa date REALI dentro ${chunk.start}..${chunk.end}, distribuite su GIORNI DIVERSI (spalma i contenuti sull'intero range, non ammucchiarli sullo stesso giorno e soprattutto NON metterli tutti su ${chunk.start}). Mai placeholder "YYYY-MM-DD".

${orariCadenzaPrompt}
Tono moderno fashion coerente con brand. Ogni contenuto deve sembrare attuale e social-native: POV, micro-storia, swipe tension, behind-the-scenes, myth-busting o creator-style voice quando coerente; mai copy statico/corporate.

Output SOLO JSON array valido:
[{"data_pubblicazione":"YYYY-MM-DD (dentro ${chunk.start}..${chunk.end})","ora_pubblicazione":"HH:MM","canale":"USA SOLO un canale tra quelli in / ${piattaformeStr} / (valori ammessi: instagram|facebook|tiktok|pinterest|linkedin|threads|x|youtube_shorts|blog)","formato":"post|carousel|reel|story|pin|short|video|articolo","obiettivo":"vendita|awareness|community|educazione|ispirazione|trending","media_refs":[numeri delle foto di QUESTO blocco usate in questo contenuto, in ordine; [] se nessuna adatta],"product_id":"","nome_prodotto":"","tema":"","hook":"","caption":"","hashtag":"","cta":""}]`
          + '\n' + PLAN_STANDARDS + '\n' + qualityPrompt
          + historyContext + temporalContext + trendContext
          + buildPackageContext(pkg, pkgPerWeek)
          + buildChunkDiversitySeed(chunkIndex, chunks.length)
          + buildPlanAssetContext(chunk.images, assetLabels)
        const visionImages = chunk.images.filter(url => !isVideoUrl(url))

        try {
          const aiRes = await callAI({
            // Default piano = Gemini 2.5 Flash (65K output, 1M contesto): il piano — specie
            // il mensile — produce JSON grandi che i modelli con 8K output troncano. Se manca
            // la key Gemini, la cascade ripiega comunque su OpenRouter free.
            model: model || 'google/gemma-4-31b-it:free',
            systemPrompt,
            userPrompt,
            openrouterKey: openrouter_key,
            images: visionImages,
            maxTokens: maxTok,
            timeoutMs: 90000,
          })
          const items = extractJSONArray(aiRes) as Record<string, unknown>[]
          return { ok: true, items }
        } catch (e) {
          return { ok: false, error: e instanceof Error ? e.message : 'Errore generazione blocco' }
        }
      }

      const baseMaxTok = contentQuality === 'high' ? 16000 : contentQuality === 'medium' ? 12000 : 8000
      // Primo tentativo: target completo
      const first = await attempt(chunk.targetMin, chunk.targetMax, baseMaxTok)
      if (first.ok) return first
      // Retry su malformed JSON (troncamento): riduci item e token. Il modello
      // a volte è più verboso del previsto e sfora anche col bridge 402.
      if (/malformed|truncat|no json array/i.test(first.error)) {
        console.warn('[plan retry]', `chunk "${chunk.label}" malformed, retry con ${Math.max(2, Math.floor(chunk.targetMin / 2))}-${Math.max(3, Math.floor(chunk.targetMax / 2))} item`)
        const retry = await attempt(Math.max(2, Math.floor(chunk.targetMin / 2)), Math.max(3, Math.floor(chunk.targetMax / 2)), Math.floor(baseMaxTok / 2))
        if (retry.ok) return retry
      }
      return first
    }

    // Blocchi indipendenti eseguiti in parallelo: se uno fallisce (rate limit,
    // JSON malformato) gli altri proseguono comunque invece di perdere tutto il
    // mese per un solo blocco sfortunato.
    const chunkResults = await Promise.all(chunks.map((chunk, i) => generateChunk(chunk, i)))
    const failedChunks = chunkResults.filter((r): r is { ok: false; error: string } => !r.ok)
    // Piano del pacchetto: cap PER-BLOCCO a pkgPerWeek, non troncamento globale dalla
    // coda. Troncare in coda svuoterebbe le ultime settimane (mese front-loaded su
    // sett. 1-2); cappare ogni blocco mantiene la distribuzione su tutto il mese e
    // rispetta comunque il totale pagato (4 blocchi × pkgPerWeek = contenutiMese).
    const itemChunkPairs: { item: Record<string, unknown>; chunk: Chunk }[] = []
    let pkgTruncated = 0
    chunkResults.forEach((r, i) => {
      if (!r.ok) return
      const items = pkg ? r.items.slice(0, pkgPerWeek) : r.items
      if (pkg) pkgTruncated += Math.max(0, r.items.length - items.length)
      items.forEach(item => itemChunkPairs.push({ item, chunk: chunks[i] }))
    })

    if (!itemChunkPairs.length) {
      return NextResponse.json({
        error: failedChunks.length
          ? `Generazione fallita su tutti i ${chunks.length} blocchi: ${failedChunks.map(f => f.error).join(' | ')}`
          : 'Nessun contenuto generato',
      }, { status: 502 })
    }

    // --- Validazione + sanitizzazione: mai fidarsi ciecamente del JSON AI ---
    // Prima canale/formato/data/ora finivano diretti nella query INSERT: un
    // valore fuori standard (es. "Instagram" maiuscolo, o una data fuori range)
    // faceva fallire il CHECK constraint A METÀ del loop, perdendo il resto.
    const piattaformeSet = new Set<string>(piattaforme)
    const fallbackCanale = piattaforme[0] || 'instagram'
    const globalStart = chunks[0].start
    const globalEnd = chunks[chunks.length - 1].end

    // --- Distribuzione date deterministica -----------------------------------
    // Il modello (specie i free) spesso sbaglia le date: placeholder "YYYY-MM-DD"
    // o tutte lo stesso giorno. Prima il fallback le collassava TUTTE su chunk.start
    // (= oggi per il piano settimanale) → i contenuti finivano ammucchiati su oggi.
    // Ora enumeriamo i giorni reali del blocco e distribuiamo i fallback in
    // round-robin su quei giorni (saltando il weekend se escluso), così il piano
    // copre davvero tutti i giorni successivi come richiesto.
    function enumerateDays(start: string, end: string): string[] {
      const out: string[] = []
      const s = new Date(`${start}T00:00:00Z`)
      const e = new Date(`${end}T00:00:00Z`)
      for (const d = new Date(s); d <= e; d.setUTCDate(d.getUTCDate() + 1)) {
        out.push(d.toISOString().slice(0, 10))
      }
      return out.length ? out : [start]
    }
    const chunkDays = new Map<Chunk, string[]>()
    const chunkDateCursor = new Map<Chunk, number>()
    // Giorni reali del blocco (weekend escluso se il cliente lo esclude). Estratta
    // da spreadDate perché ora serve anche alle correzioni di giorno: qualsiasi
    // spostamento deve scegliere DENTRO questa lista, mai fuori dal range.
    function giorniDelChunk(chunk: Chunk): string[] {
      let days = chunkDays.get(chunk)
      if (!days) {
        const all = enumerateDays(chunk.start, chunk.end)
        // Se il weekend è escluso, distribuiamo solo su lun-ven (getUTCDay: 0=dom,6=sab).
        const weekdays = includeWeekend ? all : all.filter(d => { const g = new Date(`${d}T00:00:00Z`).getUTCDay(); return g !== 0 && g !== 6 })
        days = weekdays.length ? weekdays : all
        chunkDays.set(chunk, days)
      }
      return days
    }
    function spreadDate(chunk: Chunk): string {
      const days = giorniDelChunk(chunk)
      const cursor = chunkDateCursor.get(chunk) ?? 0
      chunkDateCursor.set(chunk, cursor + 1)
      return days[cursor % days.length]
    }

    // --- Orari governati: stato condiviso da TUTTO il batch ------------------
    // `slotUsati` contiene le assegnazioni già fatte (chiavi gestite da pickSlot):
    // passandolo a ogni chiamata, due contenuti dello stesso canale non possono
    // finire stesso giorno + stessa ora. `contenutiPerGiorno` fa rispettare
    // cadenza.maxPerGiorno senza toccare la distribuzione di spreadDate.
    const slotUsati = new Set<string>()
    const contenutiPerGiorno = new Map<string, number>()

    // Giorno con capacità residua: se la data proposta ha già raggiunto il tetto
    // di contenuti/giorno della cadenza, si sposta al giorno VALIDO più vicino del
    // blocco che ha ancora spazio. Se il blocco è pieno si resta dov'è (meglio un
    // giorno affollato che una data fuori range).
    function giornoConCapacita(canale: string, giorno: string, giorni: string[]): string {
      if ((contenutiPerGiorno.get(giorno) ?? 0) < cadenza.maxPerGiorno) return giorno
      const target = new Date(`${giorno}T00:00:00Z`).getTime()
      const candidati = giorni
        .filter(d => giornoValidoPerCanale(canale, d))
        .sort((a, b) => Math.abs(new Date(`${a}T00:00:00Z`).getTime() - target) - Math.abs(new Date(`${b}T00:00:00Z`).getTime() - target))
      for (const d of candidati) {
        if ((contenutiPerGiorno.get(d) ?? 0) < cadenza.maxPerGiorno) return d
      }
      return giorno
    }

    // Telemetria (non decide nulla): l'orario proposto dal modello cadeva davvero
    // in una fascia di quel canale? Misura quanto il vincolo ORARI del prompt
    // viene rispettato — l'orario effettivo lo assegna comunque pickSlot.
    function oraFuoriFascia(canale: string, giorno: string, ora: string): boolean {
      if (!TIME_RE.test(ora)) return true
      const slots = getCanaleSlots(canale)
      const fasce = isWeekend(giorno)
        ? (Object.keys(slots.weekend).length ? slots.weekend : slots.feriale)
        : (Object.keys(slots.feriale).length ? slots.feriale : slots.weekend)
      const inMinuti = (hhmm: string) => Number(hhmm.slice(0, 2)) * 60 + Number(hhmm.slice(3, 5))
      const m = inMinuti(ora)
      return !Object.values(fasce).some(lista => {
        if (!lista?.length) return false
        return m >= inMinuti(lista[0]) - 20 && m <= inMinuti(lista[lista.length - 1]) + 20
      })
    }

    // Conta le correzioni forzate (canale/data fuori scelta): sono invisibili
    // all'utente ma possono ammassare i contenuti sul primo canale → va segnalato.
    let itemsCorrettiCanale = 0
    let itemsCorrettiData = 0
    let itemsOraFuoriFascia = 0
    function sanitizeItem(raw: Record<string, unknown>, chunk: Chunk): Record<string, unknown> {
      const out = { ...raw }
      const rawDate = typeof out.data_pubblicazione === 'string' ? out.data_pubblicazione : ''
      // Validazione contro il range del BLOCCO (non globale): un item del blocco
      // "settimana 3" con una data della settimana 1 cade nel giorno sbagliato pur
      // stando nel range globale. Il fallback distribuisce sui giorni del blocco.
      if (!DATE_RE.test(rawDate) || rawDate < chunk.start || rawDate > chunk.end) {
        out.data_pubblicazione = spreadDate(chunk)
        itemsCorrettiData++
      }
      // Enforcement weekend deterministico: se il cliente esclude il weekend,
      // sposta sabato→venerdì e domenica→lunedì (il prompt "soft" non garantisce).
      // getUTCDay perché 'YYYY-MM-DD' è interpretata come UTC.
      if (!includeWeekend && typeof out.data_pubblicazione === 'string' && DATE_RE.test(out.data_pubblicazione)) {
        const d = new Date(`${out.data_pubblicazione}T00:00:00Z`)
        const day = d.getUTCDay()
        if (day === 6 || day === 0) {
          d.setUTCDate(d.getUTCDate() + (day === 6 ? -1 : 1))
          const shifted = d.toISOString().slice(0, 10)
          if (shifted >= globalStart && shifted <= globalEnd) {
            out.data_pubblicazione = shifted
            itemsCorrettiData++
          }
        }
      }
      // Canale e formato PRIMA dell'orario: adesso l'orario dipende da entrambi
      // (fasce del canale + regola di formato), quindi vanno normalizzati prima.
      const rawCanale = typeof out.canale === 'string' ? out.canale.toLowerCase().trim() : ''
      const canaleOk = VALID_CANALI.has(rawCanale) && piattaformeSet.has(rawCanale)
      out.canale = canaleOk ? rawCanale : fallbackCanale
      if (!canaleOk) itemsCorrettiCanale++
      const rawFormato = typeof out.formato === 'string' ? out.formato.toLowerCase().trim() : ''
      out.formato = VALID_FORMATI.has(rawFormato) ? rawFormato : 'post'
      const canale = String(out.canale)
      const formato = String(out.formato)

      // --- Giorno: due sole correzioni, entrambe dentro i giorni del blocco ---
      // spreadDate resta la logica di distribuzione: qui si interviene solo se
      // (a) il canale nel weekend non ha pubblico (linkedin, blog) oppure
      // (b) il giorno ha già raggiunto il maxPerGiorno della cadenza.
      const giorniChunk = giorniDelChunk(chunk)
      const giornoProposto = typeof out.data_pubblicazione === 'string' ? out.data_pubblicazione : spreadDate(chunk)
      const giorno = giornoConCapacita(canale, prossimoGiornoValido(canale, giornoProposto, giorniChunk), giorniChunk)
      if (giorno !== giornoProposto) itemsCorrettiData++
      out.data_pubblicazione = giorno
      contenutiPerGiorno.set(giorno, (contenutiPerGiorno.get(giorno) ?? 0) + 1)

      // --- Ora: niente più default fisso '10:00' -----------------------------
      // pickSlot si applica SEMPRE (non solo quando l'ora manca): un orario fuori
      // dalle fasce del canale è sbagliato quanto un orario assente. Riceve il Set
      // condiviso del batch, quindi non può ripetere canale+giorno+ora.
      const rawTime = typeof out.ora_pubblicazione === 'string' ? out.ora_pubblicazione.trim() : ''
      if (oraFuoriFascia(canale, giorno, rawTime)) itemsOraFuoriFascia++
      const rawObiettivo = typeof out.obiettivo === 'string' ? out.obiettivo.toLowerCase().trim() : ''
      out.ora_pubblicazione = pickSlot(
        { canale, formato, obiettivo: rawObiettivo || (typeof obiettivo === 'string' ? obiettivo.toLowerCase().trim() : '') },
        giorno,
        slotUsati,
      )
      return out
    }

    // Media: il modello sceglie la foto giusta per ogni contenuto e la dichiara in
    // `media_refs` (numeri 1-based delle foto mostrate a QUEL blocco). Qui rispettiamo
    // quella scelta invece di distribuire alla cieca in ordine — così il post sulla
    // "T-shirt Lario" prende la foto della T-shirt, non quella dei pantaloni.
    // Regole invariate: ogni foto usata UNA volta sola (Set indici per-blocco), il
    // singolo prende 1 foto, il carosello un blocco (min 3, max 10 = limite Instagram).
    // Fallback robusto: se media_refs manca/è invalido, si completa dalle foto libere
    // del blocco in ordine (retrocompatibile). Foto finite → contenuto senza media (null),
    // segnalato — mai riusare la stessa immagine di nascosto.
    const MEDIA_SLOTS = 10
    const CAROUSEL_TARGET = 5   // dentro il range 3..10
    const CAROUSEL_MIN = 3
    const chunkUsedIdx = new Map<Chunk, Set<number>>()
    let photosExhausted = false      // finite le foto → contenuti senza immagine
    let carouselUnderfilled = false  // carosello con meno di 3 foto disponibili
    function nextChunkMediaSlots(chunk: Chunk, formato: string, mediaRefs: unknown): (string | null)[] {
      const empty = Array<string | null>(MEDIA_SLOTS).fill(null)
      const total = chunk.images.length
      if (!total) return empty
      const used = chunkUsedIdx.get(chunk) ?? new Set<number>()
      chunkUsedIdx.set(chunk, used)

      // Indici richiesti dal modello (1-based → 0-based): validi, in range, ancora
      // liberi in questo blocco, in ordine e senza duplicati.
      const requested: number[] = []
      const seen = new Set<number>()
      if (Array.isArray(mediaRefs)) {
        for (const ref of mediaRefs) {
          const n = typeof ref === 'number' ? ref : parseInt(String(ref), 10)
          const idx = n - 1
          if (Number.isInteger(idx) && idx >= 0 && idx < total && !used.has(idx) && !seen.has(idx)) {
            seen.add(idx)
            requested.push(idx)
          }
        }
      }

      const isCarousel = formato === 'carousel'

      // Se il modello ha scelto foto valide, rispettiamo ESATTAMENTE la sua scelta
      // (singolo = 1 foto, carosello = tutte le foto dichiarate, cap 10): completare
      // un carosello con foto NON scelte reintrodurrebbe l'abbinamento sbagliato che
      // stiamo eliminando. Solo se il modello non dichiara nulla di valido si ripiega
      // sul pool in ordine (fallback retrocompatibile: 1 per singolo, 5 per carosello).
      const picked: number[] = requested.slice(0, isCarousel ? MEDIA_SLOTS : 1)
      if (!picked.length) {
        const fallbackTarget = isCarousel ? CAROUSEL_TARGET : 1
        for (let i = 0; i < total && picked.length < fallbackTarget; i++) {
          if (!used.has(i)) picked.push(i)
        }
      }

      if (!picked.length) { photosExhausted = true; return empty }
      // carouselUnderfilled = SCARSITÀ reale di foto, non scelta volontaria del modello.
      // Segnala solo se il carosello ha <3 foto E non ne restano di libere nel blocco:
      // se il modello ne ha scelte poche ma ci sono ancora foto disponibili è una sua
      // decisione legittima, non una carenza da segnalare ("carica più foto").
      if (isCarousel && picked.length < CAROUSEL_MIN) {
        const freeRemaining = total - used.size - picked.length
        if (freeRemaining <= 0) carouselUnderfilled = true
      }

      picked.forEach(i => used.add(i))
      const urls = picked.map(i => chunk.images[i])
      return [...urls, ...Array(MEDIA_SLOTS - urls.length).fill(null)]
    }

    const inseriti: { id_contenuto: string; canale: string; data_pubblicazione: string }[] = []
    const scartati: string[] = []
    let schemaFallbackUsed = false

    // Insert per-item con try/catch: un item rotto (constraint violation, tipo
    // dato inatteso) viene loggato e saltato, MAI abortisce l'intero batch —
    // prima un solo errore a metà loop faceva perdere anche gli item già validi.
    for (const { item: rawItem, chunk } of itemChunkPairs) {
      const item = sanitizeItem(rawItem, chunk)

      // Un contenuto senza testo non è un contenuto: i modelli piccoli (tipici del
      // tier gratuito) chiudono a volte il JSON con oggetti che hanno data, canale e
      // formato ma hook/caption vuoti. Prima finivano in calendario come contenuti
      // veri — un piano "da 7" di cui 4 gusci vuoti, senza che nulla lo segnalasse.
      // Ora vengono scartati e contati, così il messaggio finale dice la verità.
      const haTesto = String(item.hook || '').trim() || String(item.caption || '').trim()
      if (!haTesto) {
        scartati.push('contenuto senza hook né caption (risposta del modello incompleta)')
        continue
      }

      const id_contenuto = `C${Date.now().toString(36).toUpperCase()}_${inseriti.length}_${scartati.length}`
      const itemQuality = normalizeContentQuality(item.quality_level) ?? contentQuality
      const [media1, media2, media3, media4, media5, media6, media7, media8, media9, media10] = nextChunkMediaSlots(chunk, String(item.formato || 'post'), item.media_refs)
      // Lookup link prodotto per l'item: se il piano riferisce un product_id valido,
      // persistiamo il link così il publisher può appenderlo al testo Blotato.
      const itemProduct = (products as Array<Record<string, unknown>>).find(p => p.product_id === item.product_id)
      const itemLinkProdotto = (itemProduct?.link_prodotto as string) || null
      const insertColumns = [
        'cliente_id', 'id_contenuto', 'data_pubblicazione', 'ora_pubblicazione',
        'canale', 'formato', 'obiettivo', 'product_id', 'nome_prodotto',
        'tema', 'hook', 'caption', 'hashtag', 'cta', 'status',
        'link_prodotto', 'link_prodotto_finale',
        'visual_preset', 'use_trending_effects', 'visual_effects',
        'link_media_1', 'link_media_2', 'link_media_3', 'link_media_4', 'link_media_5',
        'link_media_6', 'link_media_7', 'link_media_8', 'link_media_9', 'link_media_10',
        'scenes_json', 'slides_json', 'overlay_text', 'alt_text', 'tags',
        'idea_visual', 'voiceover_script', 'music_mood',
        'quality_level', 'audience_segment', 'funnel_stage', 'angle', 'primary_message',
        'proof_points', 'hook_variants', 'caption_long', 'cta_variants', 'creative_brief',
        'template_id', 'template_style', 'layout_spec_json', 'asset_requirements_json',
        'production_notes', 'compliance_notes', 'risk_flags', 'platform_best_practices',
        'ab_variants_json', 'kpi_target', 'expected_outcome', 'production_cycle_stage',
        'optimization_cycle_json', 'performance_hypothesis', 'next_iteration_actions',
        'missing_inputs', 'content_checklist',
      ]
      const insertValues = [
        effectiveClienteId,
        id_contenuto,
        item.data_pubblicazione || null,
        // sanitizeItem garantisce sempre un HH:MM governato: nessun default fisso.
        item.ora_pubblicazione,
        item.canale || 'instagram',
        item.formato || 'post',
        item.obiettivo || obiettivo || 'mix',
        item.product_id || null,
        item.nome_prodotto || null,
        item.tema || null,
        item.hook || null,
        item.caption || null,
        item.hashtag || null,
        item.cta || null,
        // Il piano nasce già "da approvare": così i contenuti appaiono subito nel
        // filtro default del calendario CON i bottoni Approva/Rifiuta (che si mostrano
        // solo per DA_APPROVARE). Prima nascevano BOZZA → invisibili e senza azioni,
        // in disaccordo con gli altri generatori (content/agents) che usano DA_APPROVARE.
        'DA_APPROVARE',
        itemLinkProdotto,
        itemLinkProdotto,
        typeof visual_preset === 'string' ? visual_preset : null,
        Boolean(use_trending_effects),
        jsonbParam(Array.isArray(visual_effects) ? visual_effects : null),
        media1, media2, media3, media4, media5,
        media6, media7, media8, media9, media10,
        jsonbParam(pickJson(item, ['scenes', 'scene', 'frames'])),
        jsonbParam(pickJson(item, ['slides', 'immagini'])),
        pickText(item, ['overlay_text', 'overlay_testo']) || null,
        pickText(item, ['alt_text', 'alt']) || null,
        jsonbParam(pickJson(item, ['tags', 'keywords_target', 'hashtag_array'])),
        pickText(item, ['idea_visual', 'visual']) || null,
        pickText(item, ['voiceover_script', 'voiceover']) || null,
        pickText(item, ['music_mood', 'musica_mood']) || null,
        itemQuality,
        pickText(item, ['audience_segment', 'audience', 'target_segment']) || null,
        pickText(item, ['funnel_stage', 'fase_funnel']) || null,
        pickText(item, ['angle', 'angolo_creativo']) || null,
        pickText(item, ['primary_message', 'messaggio_chiave']) || null,
        jsonbParam(pickJson(item, ['proof_points', 'prove', 'benefici_verificabili'])),
        jsonbParam(pickJson(item, ['hook_variants', 'hook_alternativi'])),
        pickText(item, ['caption_long', 'caption_estesa', 'corpo']) || null,
        jsonbParam(pickJson(item, ['cta_variants', 'cta_alternative'])),
        pickText(item, ['creative_brief', 'brief_creativo']) || null,
        pickText(item, ['template_id', 'template', 'template_operativo']) || null,
        pickText(item, ['template_style', 'stile_template', 'visual_style']) || null,
        jsonbParam(pickJson(item, ['layout_spec', 'layout_spec_json', 'layout'])),
        jsonbParam(pickJson(item, ['asset_requirements', 'asset_requirements_json', 'asset_richiesti'])),
        pickText(item, ['production_notes', 'note_produzione']) || null,
        pickText(item, ['compliance_notes', 'note_compliance']) || null,
        jsonbParam(pickJson(item, ['risk_flags', 'rischi'])),
        jsonbParam(pickJson(item, ['platform_best_practices', 'best_practices_applicate'])),
        jsonbParam(pickJson(item, ['ab_variants', 'ab_variants_json', 'varianti_ab'])),
        pickText(item, ['kpi_target', 'kpi_primario']) || null,
        pickText(item, ['expected_outcome', 'risultato_atteso']) || null,
        normalizeProductionCycleStage(pickText(item, ['production_cycle_stage', 'cycle_stage', 'fase_ciclo']), 'brief'),
        jsonbParam(pickJson(item, ['optimization_cycle', 'optimization_cycle_json', 'ciclo_ottimizzazione'])),
        pickText(item, ['performance_hypothesis', 'ipotesi_performance', 'hypothesis']) || null,
        jsonbParam(pickJson(item, ['next_iteration_actions', 'azioni_prossima_iterazione', 'next_actions'])),
        jsonbParam(pickJson(item, ['missing_inputs', 'input_mancanti'])),
        jsonbParam(pickJson(item, ['content_checklist', 'checklist'])),
      ]
      try {
        const usedFallback = await insertCalendario(insertColumns, insertValues)
        if (usedFallback) schemaFallbackUsed = true
        inseriti.push({ id_contenuto, canale: item.canale as string, data_pubblicazione: item.data_pubblicazione as string })
      } catch (error) {
        console.warn('[plan] insert item fallito, salto e continuo:', error instanceof Error ? error.message : error)
        scartati.push(error instanceof Error ? error.message : 'errore insert sconosciuto')
      }
    }

    // Pacchetto Crescita: l'articolo SEO+GEO non si genera qui (resta nella sezione
    // Blog), ma inseriamo nel calendario una VOCE DI COLLEGAMENTO così è chiaro che
    // fa parte del piano del mese e con il link per generarlo/gestirlo nel Blog.
    let articoloBlogInserito = false
    if (pkg?.articoloBlog) {
      try {
        // Anche la voce blog esce dal governo orari: mattina di un feriale del
        // primo blocco (il blog nel weekend perde la giornata di indicizzazione).
        const giornoArticolo = prossimoGiornoValido('blog', chunks[0].start, giorniDelChunk(chunks[0]))
        const oraArticolo = pickSlot({ canale: 'blog', formato: 'articolo', obiettivo: 'educazione' }, giornoArticolo, slotUsati)
        await insertCalendario(
          ['cliente_id', 'id_contenuto', 'data_pubblicazione', 'ora_pubblicazione', 'canale', 'formato', 'obiettivo', 'nome_prodotto', 'tema', 'hook', 'caption', 'cta', 'status', 'link_prodotto', 'link_prodotto_finale', 'quality_level'],
          [effectiveClienteId, `C${Date.now().toString(36).toUpperCase()}_ART`, giornoArticolo, oraArticolo, 'blog', 'articolo', 'educazione', `Articolo SEO+GEO — pacchetto ${pkg.nome}`, 'Articolo SEO+GEO del mese', 'Approfondimento SEO/GEO incluso nel pacchetto', 'Articolo SEO+GEO incluso nel pacchetto: generalo e gestiscilo nella sezione Blog.', 'Vai alla sezione Blog', 'DA_APPROVARE', '/dashboard/blog', '/dashboard/blog', pkg.quality],
        )
        inseriti.push({ id_contenuto: 'ARTICOLO_BLOG', canale: 'blog', data_pubblicazione: giornoArticolo })
        articoloBlogInserito = true
      } catch (error) {
        console.warn('[plan] voce articolo blog non inserita:', error instanceof Error ? error.message : error)
      }
    }

    return NextResponse.json({
      ok: true,
      count: inseriti.length,
      ...(pkg && { pacchetto: pkg.id, pacchetto_nome: pkg.nome, pacchetto_contenuti: pkg.contenutiMese, articolo_blog: articoloBlogInserito }),
      ...(pkgTruncated && { pacchetto_troncati: pkgTruncated }),
      requested_range: pkg ? String(pkg.contenutiMese) : periodo === 'mensile' ? '25-35' : '7-10',
      chunks_total: chunks.length,
      chunks_failed: failedChunks.length,
      ...(failedChunks.length && { chunks_failed_detail: failedChunks.map(f => f.error) }),
      ...(scartati.length && { items_scartati: scartati.length }),
      // Correzioni forzate rese visibili: canale riassegnato / data spostata nel range.
      ...(itemsCorrettiCanale && { items_canale_corretto: itemsCorrettiCanale }),
      ...(itemsCorrettiData && { items_data_corretta: itemsCorrettiData }),
      // Quanti orari proposti dal modello erano fuori dalle fasce del canale
      // (l'orario finale è comunque quello governato da pickSlot).
      ...(itemsOraFuoriFascia && { items_ora_fuori_fascia: itemsOraFuoriFascia }),
      cadenza: { contenuti_settimana: cadenza.contenutiSettimana, giorni_attivi: cadenza.giorniAttivi, max_per_giorno: cadenza.maxPerGiorno },
      quality_level: contentQuality,
      quality_downgraded: isQualityDowngraded(requestedQuality, contentQuality),
      images_provided: mediaPool.length,
      // Foto finite prima dei contenuti → alcuni post restano senza immagine.
      images_insufficient: photosExhausted,
      // Almeno un carosello ha meno di 3 foto disponibili (sotto il minimo).
      carousel_underfilled: carouselUnderfilled,
      ...(schemaFallbackUsed && { schema_fallback: true, warning: 'Eseguire npm run migrate per abilitare tutti i campi qualità e ottimizzazione' }),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione piano'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
