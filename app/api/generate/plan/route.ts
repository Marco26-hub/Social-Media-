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
import {
  getPackage,
  packageContentCount,
  packageMixForPeriod,
  type PackagePeriod,
  type PackagePeriodMix,
  type PackageSpec,
} from '@/lib/packages'
// Fabbisogno e vincoli media: quante slide vuole un carosello, quali formati
// possono ricevere un MP4 e come si legge la marcatura manuale dell'utente.
import { MEDIA_PER_FORMATO, normalizeMediaTag, type MediaTag } from '@/lib/media-requirements'
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

// Se il media resta su Auto, il nome/descrizione può comunque dichiararne la
// destinazione (es. "salotto reel 01.jpg" o "foto per story"). La selezione
// esplicita dell'utente ha sempre precedenza su questa inferenza.
function inferMediaTagFromLabel(value: string): MediaTag {
  const label = value.toLowerCase()
  if (/\b(reel|reels|video|short|shorts)\b/.test(label)) return 'reel'
  if (/\b(story|stories|storia|storie)\b/.test(label)) return 'story'
  if (/\b(carousel|carosello|caroselli)\b/.test(label)) return 'carosello'
  if (/\b(post|feed|pin)\b/.test(label)) return 'post'
  return 'auto'
}

// VISION: stesso principio di generate/content (buildAssetContext) applicato al piano
// multi-contenuto. Mostriamo alla AI le foto DAVVERO allegate a QUESTO chunk, ciascuna
// con la descrizione (nome prodotto) data dall'utente, così hook/caption/tema descrivono
// il capo VERO (colore, ambientazione) E — cruciale — il modello sceglie da sé la foto
// giusta per ogni contenuto dichiarandone il numero in `media_refs` (vedi schema item).
// Prima l'assegnazione era posizionale cieca: il modello riordinava gli item e le foto
// slittavano sul post sbagliato.
function buildPlanAssetContext(shown: string[], labels: Map<string, string>, tags: Map<string, MediaTag>) {
  if (!shown.length) return ''
  const imageUrls = shown.filter(url => !isVideoUrl(url))
  const videoUrls = shown.filter(isVideoUrl)
  return `

MEDIA CARICATI DALL'UTENTE PER QUESTO BLOCCO (numerati — il numero è il valore da usare in media_refs):
${shown.map((url, index) => {
  const tag = tags.get(url) ?? 'auto'
  const destination = tag === 'reel' ? 'REEL/VIDEO' : tag === 'carosello' ? 'CAROSELLO' : tag === 'story' ? 'STORY' : tag === 'post' ? 'POST' : 'AUTO'
  return `${index + 1}. ${labels.get(url) || 'media'} — [DESTINAZIONE: ${destination}] ${url}${isVideoUrl(url) ? ' [MP4]' : ''}`
}).join('\n')}

⚠️ VISION + ABBINAMENTO — istruzioni vincolanti:
- Le immagini (${imageUrls.length}) sono visibili in allegato: guardale e scrivi hook/caption/tema su quello che vedi davvero.
- Gli MP4 (${videoUrls.length}) sono video finali già caricati: assegnali preferibilmente a formati reel/video/short e non inventare un video alternativo.
- Rispetta DESTINAZIONE: REEL/VIDEO, CAROSELLO, STORY e POST sono vincoli scelti dall'utente; AUTO può essere assegnato liberamente.
- Per un Reel con MP4 usa il solo numero del video. Per un Reel senza MP4 usa 3-5 foto REEL/VIDEO coerenti tra loro in "media_refs", nell'ordine delle scene.
- Per un post usa una foto; per un carosello usa 3-5 foto.
- Non ripetere una foto su contenuti diversi dello stesso canale. Per il cross-post dello stesso Reel puoi riusare lo stesso gruppo su Instagram e Facebook.
- Se un contenuto non ha una foto adatta tra quelle mostrate, lascia "media_refs":[] (verrà completato in automatico).
- Non inventare dettagli visivi non presenti nei media.
- ⚠️ IL NOME ACCANTO A OGNI MEDIA È IL NOME UFFICIALE DEL PRODOTTO per quel contenuto: usalo
  come "nome_prodotto" e come base di hook/caption. NON scrivere invece su un prodotto diverso
  preso dal catalogo PRODOTTI qui sopra, anche se il catalogo elenca altri articoli — quando un
  contenuto usa media_refs, il media caricato vince SEMPRE sui dati del catalogo. Il catalogo
  PRODOTTI serve solo per i contenuti che restano senza foto (media_refs:[]).`
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
function buildPackageContext(pkg: PackageSpec | null, piano: PackagePeriodMix | null, periodo: PackagePeriod, perBlocco: number): string {
  if (!pkg || !piano) return ''
  return `

PACCHETTO ${pkg.nome.toUpperCase()} — VINCOLI DEL CLIENTE (ha acquistato questo pacchetto):
- In QUESTO blocco genera ESATTAMENTE ${perBlocco} contenuti, non di più.
- Il piano ${periodo} completo ha ESATTAMENTE ${piano.totale} contenuti social: ${piano.postSingoli} POST/PIN + ${piano.caroselli} CAROSELLI + ${piano.stories} STORY + ${piano.reelVideo} REEL/SHORT/VIDEO.
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

// --- Gruppi di formato: il ponte tra il formato scelto dall'AI e i vincoli media
// I formati del calendario sono 8, ma per i media contano quattro famiglie:
//  - 'reel'      → reel/short/video: SONO gli unici che possono ricevere un MP4
//  - 'carosello' → carousel: blocco di più immagini
//  - 'story'     → story: una sola immagine dedicata, mai un video
//  - 'post'      → post/pin/articolo: una sola immagine, mai un video
// I valori coincidono con MediaTag (meno 'auto'), così la marcatura manuale si
// confronta direttamente con il gruppo del contenuto.
type GruppoFormato = Exclude<MediaTag, 'auto'>
function gruppoFormato(formato: string): GruppoFormato {
  const f = String(formato || '').toLowerCase().trim()
  if (f === 'carousel' || f === 'carosello') return 'carosello'
  if (f === 'reel' || f === 'short' || f === 'video') return 'reel'
  if (f === 'story') return 'story'
  return 'post'
}

// --- Distribuzione dei media sui blocchi: consapevole di TIPO e MARCATURA ----
// Prima il pool veniva tagliato in fette CONTIGUE (blocco 1 = primi N file, ecc.).
// L'ordine naturale del file picker però è "prima le 28 foto, poi i 4 MP4":
// con 4 blocchi tutti gli MP4 finivano nell'ultimo e 3 reel su 4 restavano senza
// video, pur avendo caricato ESATTAMENTE il materiale che la schermata chiedeva.
// Stesso difetto per la marcatura manuale: 4 media marcati 'reel' caricati di
// seguito finivano tutti nello stesso blocco.
// Ora i media vengono prima RAGGRUPPATI per (marcatura, tipo) e poi assegnati ai
// blocchi a round-robin DENTRO ogni gruppo: 28 foto + 4 MP4 su 4 blocchi danno
// 7 foto + 1 MP4 per blocco qualunque sia l'ordine di caricamento.
// Invarianti mantenute: ogni media compare in UN SOLO blocco (unicità globale),
// nessun media resta inutilizzato, e dentro il blocco l'ordine è quello di
// caricamento → la numerazione mostrata all'AI è stabile e coincide con quella
// usata poi in fase di assegnazione (media_refs).
function distribuisciMediaSuBlocchi(
  pool: string[],
  blocchi: number,
  tagOf: (url: string) => MediaTag,
): string[][] {
  const k = Math.max(1, blocchi)
  const out: string[][] = Array.from({ length: k }, () => [] as string[])
  if (!pool.length) return out
  // Gruppi in ordine di prima apparizione: funzione pura e deterministica
  // (stesso input → stessa distribuzione), condizione necessaria perché la
  // numerazione mostrata nel prompt sia riproducibile.
  const gruppi = new Map<string, number[]>()
  pool.forEach((url, idx) => {
    const key = `${tagOf(url)}|${isVideoUrl(url) ? 'video' : 'immagine'}`
    const lista = gruppi.get(key)
    if (lista) lista.push(idx)
    else gruppi.set(key, [idx])
  })
  // Offset rotante tra un gruppo e il successivo: senza, i gruppi più piccoli
  // del numero di blocchi (es. 2 MP4 su 4 settimane) partirebbero tutti dal
  // blocco 0 e le ultime settimane resterebbero scoperte.
  let offset = 0
  const indiciPerBlocco: number[][] = Array.from({ length: k }, () => [] as number[])
  for (const indici of gruppi.values()) {
    indici.forEach((poolIdx, j) => indiciPerBlocco[(offset + j) % k].push(poolIdx))
    offset = (offset + indici.length) % k
  }
  indiciPerBlocco.forEach((indici, ci) => {
    out[ci] = indici.sort((a, b) => a - b).map(i => pool[i])
  })
  return out
}

// --- Mix dei formati imposto al modello -------------------------------------
// Il fabbisogno media mostrato all'utente NON è una stima libera: assume un mix
// preciso (1 carosello ogni 3 contenuti statici, ~1 contenuto su 4 in formato
// reel). Il prompt però non diceva nulla sui formati: il modello poteva generare
// 12 caroselli e servivano 60 immagini invece delle 28 annunciate — il numero
// mostrato non era garantito da nulla. Qui il mix diventa un vincolo scritto,
// per BLOCCO (non per mese: il modello si ancora a quello che legge).
// CAROSELLI_OGNI replica la costante omonima di lib/media-requirements.ts (non
// esportata): se cambia lì va cambiata anche qui, altrimenti il piano promette
// un fabbisogno e ne consuma un altro.
const CAROSELLI_OGNI = 3
// Quota reel del piano libero: stessa proporzione di QUOTA_REEL in
// lib/media-requirements.ts, usata quando non c'è un pacchetto che detti il mix.
const QUOTA_REEL_LIBERO = 0.25
type MixFormati = { caroselli: number; reel: number; story: number; postSingoli: number; fonte: 'pacchetto' | 'libero' }

// Ripartizione intera di un totale su N blocchi senza perdere né inventare unità
// (6 reel su 4 settimane → 1,2,1,2 = 6): gli arrotondamenti per blocco farebbero
// sballare il totale del mese in un verso o nell'altro.
function quotaBlocco(totale: number, blocchi: number, indice: number): number {
  if (blocchi <= 0) return 0
  const t = Math.max(0, Math.round(totale))
  return Math.floor(((indice + 1) * t) / blocchi) - Math.floor((indice * t) / blocchi)
}

function mixFormatiBlocco(piano: PackagePeriodMix | null, perBlocco: number, blocchi: number, indice: number): MixFormati {
  const totale = Math.max(0, Math.round(perBlocco))
  if (piano) {
    // Pacchetto: il mix è quello venduto (postCaroselli + reelBrevi), spalmato
    // sui blocchi con la stessa aritmetica del fabbisogno mostrato a schermo.
    const reel = quotaBlocco(piano.reelVideo, blocchi, indice)
    const story = quotaBlocco(piano.stories, blocchi, indice)
    const caroselli = quotaBlocco(piano.caroselli, blocchi, indice)
    return { caroselli, reel, story, postSingoli: Math.max(0, totale - reel - story - caroselli), fonte: 'pacchetto' }
  }
  // Piano libero: proporzione dichiarata (25% reel, 1 carosello ogni 3 statici).
  const reel = Math.round(totale * QUOTA_REEL_LIBERO)
  const statici = Math.max(0, totale - reel)
  const caroselli = Math.floor(statici / CAROSELLI_OGNI)
  return { caroselli, reel, story: 0, postSingoli: statici - caroselli, fonte: 'libero' }
}

function buildMixFormatiContext(mix: MixFormati): string {
  const perCarosello = MEDIA_PER_FORMATO.carousel.immagini
  const rigaCaroselli = mix.caroselli > 0
    ? `- Al MASSIMO ${mix.caroselli} ${mix.caroselli === 1 ? 'contenuto' : 'contenuti'} con formato "carousel": ogni carosello consuma ${perCarosello} immagini, produrne di più lascia gli altri contenuti senza foto.`
    : '- NESSUN carosello in questo blocco: il materiale caricato non ne prevede. Usa post/story/pin e reel.'
  return `

MIX DEI FORMATI IN QUESTO BLOCCO — vincolante (${mix.fonte === 'pacchetto' ? 'è il mix del pacchetto acquistato' : 'proporzione dichiarata: ~1 contenuto su 4 in formato reel, 1 carosello ogni 3 contenuti statici'}; il materiale che l'utente ha caricato è stato calcolato ESATTAMENTE su questi numeri):
${rigaCaroselli}
- ${mix.reel} ${mix.reel === 1 ? 'contenuto' : 'contenuti'} in formato reel/short/video (sono gli unici che possono usare un MP4).
- ${mix.story} ${mix.story === 1 ? 'contenuto' : 'contenuti'} in formato story, una immagine verticale 9:16 ciascuno.
- I restanti ${mix.postSingoli} ${mix.postSingoli === 1 ? 'contenuto' : 'contenuti'}: post/pin, una sola immagine ciascuno.
- Nel dubbio scegli "post": un post in più non rompe il piano, un carosello in più sì (vale 5 immagini).`
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
    const periodoEff: PackagePeriod = periodo === 'mensile' ? 'mensile' : 'settimanale'
    const mediaPool: string[] = Array.isArray(media_urls) ? media_urls.filter((u): u is string => typeof u === 'string' && u.length > 0) : []
    // Descrizione per foto (nome prodotto) dal client: mappa url→label. Serve al prompt
    // per far scegliere al modello la foto giusta per numero (media_refs). Opzionale:
    // se manca, il piano ripiega sull'assegnazione posizionale (retrocompatibile).
    const assetLabels = new Map<string, string>()
    // Marcatura manuale del media (`tag` in uploaded_assets): l'utente può dire
    // "questa foto è del carosello, questo MP4 è del reel". È un VINCOLO, non un
    // suggerimento: un media marcato non finisce mai su un altro gruppo di
    // formati. Assente o 'auto' → decide l'AI come prima (retrocompatibile).
    const assetTags = new Map<string, MediaTag>()
    if (Array.isArray(uploaded_assets)) {
      for (const raw of uploaded_assets) {
        if (!raw || typeof raw !== 'object') continue
        const rec = raw as Record<string, unknown>
        const url = typeof rec.url === 'string' ? rec.url.trim() : ''
        if (!url) continue
        const name = typeof rec.name === 'string' ? rec.name.trim() : ''
        const description = typeof rec.description === 'string' ? rec.description.trim() : ''
        const label = [name, description].filter(Boolean).join(' — ')
        if (label) assetLabels.set(url, label)
        const explicitTag = normalizeMediaTag(rec.tag)
        const tag = explicitTag === 'auto' ? inferMediaTagFromLabel(label) : explicitTag
        if (tag !== 'auto') assetTags.set(url, tag)
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
      const demoQuality = pkgRequested?.quality ?? resolveContentQuality({ requestedQuality })
      const selectedPlatforms = new Set<string>(piattaforme)
      if (pkgRequested && selectedPlatforms.size !== pkgRequested.social) {
        return NextResponse.json({ error: `Il pacchetto ${pkgRequested.nome} richiede esattamente ${pkgRequested.social} social.` }, { status: 400 })
      }
      const demoPackagePlan = pkgRequested ? packageMixForPeriod(pkgRequested, periodoEff) : null
      const count = demoPackagePlan?.totale
        ?? (demoContenuti.filter((item) => selectedPlatforms.has(item.canale)).length || (periodoEff === 'mensile' ? 30 : 7))
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
    const quotaCliente = Number(client?.contenuti_mese)
    const quotaMensile = Number.isFinite(quotaCliente) && quotaCliente > 0 ? quotaCliente : null
    const packagePlan = pkg ? packageMixForPeriod(pkg, periodoEff, quotaMensile) : null
    if (pkg && new Set<string>(piattaforme).size !== pkg.social) {
      return NextResponse.json(
        { error: `Il pacchetto ${pkg.nome} include ${pkg.social} social: selezionane esattamente ${pkg.social}.` },
        { status: 400 },
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
    // `images` nasce vuoto: la ripartizione vera avviene una sola volta sotto
    // (distribuisciMediaSuBlocchi), quando il numero di blocchi è definitivo.
    // Prima ogni ramo faceva la sua slice e poi veniva comunque sovrascritta.
    // Piano del pacchetto: numero ESATTO del periodo selezionato. Lo stesso
    // `packagePlan` alimenta UI, fabbisogno media, prompt, cap e risposta API.
    const chunks: Chunk[] = []
    if (periodoEff === 'mensile') {
      // Mensile: 4 chunk settimanali. Per medium/high riduciamo il targetMax
      // (7 invece di 9) perché lo schema esteso + credito limitato troncherebbe.
      const maxPerWeek = contentQuality === 'soft' ? 9 : 7
      const minPerWeek = 6
      // Il pacchetto copre sempre le 4 settimane; il piano libero può usare le fasi.
      const settimane = pkg ? [0, 1, 2, 3] : (faseNum === 1 ? [0, 1] : faseNum === 2 ? [2, 3] : [0, 1, 2, 3])
      settimane.forEach((i, indice) => {
        const targetPacchetto = packagePlan ? quotaBlocco(packagePlan.totale, settimane.length, indice) : null
        chunks.push({
          start: fmtDate(addDays(today, i * 7)),
          end: fmtDate(addDays(today, i * 7 + 6)),
          label: `Settimana ${i + 1} del piano mensile`,
          targetMin: targetPacchetto ?? minPerWeek,
          targetMax: targetPacchetto ?? maxPerWeek,
          images: [],
        })
      })
    } else if (packagePlan && packagePlan.totale > 4 && (contentQuality === 'high' || contentQuality === 'medium')) {
      // Crescita settimanale = 6 contenuti: due blocchi da 3 evitano JSON
      // troncati mantenendo il totale esatto e il mix condiviso.
      const primaMeta = quotaBlocco(packagePlan.totale, 2, 0)
      const secondaMeta = quotaBlocco(packagePlan.totale, 2, 1)
      chunks.push({
        start: fmtDate(today),
        end: fmtDate(addDays(today, 3)),
        label: 'Prima metà piano settimanale del pacchetto (giorni 1-4)',
        targetMin: primaMeta, targetMax: primaMeta,
        images: [],
      })
      chunks.push({
        start: fmtDate(addDays(today, 4)),
        end: fmtDate(addDays(today, 6)),
        label: 'Seconda metà piano settimanale del pacchetto (giorni 5-7)',
        targetMin: secondaMeta, targetMax: secondaMeta,
        images: [],
      })
    } else if (packagePlan) {
      chunks.push({
        start: fmtDate(today),
        end: fmtDate(addDays(today, 6)),
        label: 'Piano settimanale del pacchetto',
        targetMin: packagePlan.totale, targetMax: packagePlan.totale,
        images: [],
      })
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
        images: [],
      })
      chunks.push({
        start: fmtDate(addDays(today, 4)),
        end: fmtDate(addDays(today, 6)),
        label: 'Seconda metà piano settimanale (giorni 5-7)',
        targetMin: 3, targetMax: 5,
        images: [],
      })
    } else {
      chunks.push({
        start: fmtDate(today),
        end: fmtDate(addDays(today, 6)),
        label: 'Piano settimanale',
        targetMin: 7, targetMax: 10,
        images: [],
      })
    }

    // Ridistribuisci TUTTE le foto/MP4 caricati sui blocchi effettivi di questo
    // run. NON più a fette contigue (era il difetto: con "28 foto poi 4 MP4"
    // i video finivano tutti nell'ultimo blocco), ma a round-robin dentro ogni
    // gruppo (marcatura, tipo): ogni blocco riceve la sua quota di MP4, di media
    // marcati e di foto libere. Unicità globale invariata: un media, un blocco.
    if (mediaPool.length) {
      const perBlocco = distribuisciMediaSuBlocchi(mediaPool, chunks.length, url => assetTags.get(url) ?? 'auto')
      chunks.forEach((chunk, ci) => { chunk.images = perBlocco[ci] })
    }

    // Mix dei formati per blocco (difetto C): calcolato UNA volta qui perché
    // serve in due punti — al prompt (vincolo scritto per il modello) e a
    // sanitizeItem (degrado del carosello eccedente quando le foto non bastano).
    const mixPerChunk = new Map<Chunk, MixFormati>()
    chunks.forEach((chunk, ci) => {
      mixPerChunk.set(chunk, mixFormatiBlocco(packagePlan, chunk.targetMax, chunks.length, ci))
    })

    // Contesto stagionale calcolato sull'intero range del piano (comune a tutti i blocchi).
    const temporalContext = buildTemporalContext(chunks[0].start, chunks[chunks.length - 1].end)

    // --- Cadenza + fasce orarie (dal pacchetto e dalle piattaforme) ----------
    // Prima il prompt non diceva NULLA sugli orari e il modello li inventava
    // (09:30, 18:45, 19:15...) mentre il fallback schiacciava tutto su '10:00'.
    // Ora il modello riceve: quante uscite a settimana, su quanti giorni, quante
    // al massimo nello stesso giorno (cadenza del pacchetto) e le fasce reali di
    // ogni canale selezionato. L'enforcement resta comunque deterministico sotto.
    // Passiamo un target PER SETTIMANA (i blocchi del mensile sono settimanali).
    const targetPerSettimana = pkg
      ? periodoEff === 'mensile'
        ? packageContentCount(pkg, 'settimanale', quotaMensile)
        : packagePlan?.totale ?? chunks.reduce((sum, c) => sum + c.targetMax, 0)
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
    // chunk fino a 90s) non ha margine per +10s serial. Fail-safe: errore/timeout
    // restituisce contesto vuoto e la generazione prosegue.
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
      async function attempt(targetMin: number, targetMax: number, maxTok: number, compact = false): Promise<{ ok: true; items: Record<string, unknown>[] } | { ok: false; error: string }> {
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
          + '\n' + PLAN_STANDARDS + '\n' + (compact
            ? 'FALLBACK COMPATTO: mantieni ESATTAMENTE il numero richiesto. Compila sempre hook, caption, hashtag, CTA, data, ora, canale e formato; limita i campi strategici opzionali a frasi brevi.'
            : qualityPrompt)
          + historyContext + temporalContext + trendContext
          + buildPackageContext(pkg, packagePlan, periodoEff, targetMax)
          // Vincolo sui FORMATI: senza, il fabbisogno media annunciato all'utente
          // resta una stima che il modello può far saltare con 12 caroselli.
          + buildMixFormatiContext(mixPerChunk.get(chunk) ?? mixFormatiBlocco(packagePlan, targetMax, chunks.length, chunkIndex))
          + buildChunkDiversitySeed(chunkIndex, chunks.length)
          + buildPlanAssetContext(chunk.images, assetLabels, assetTags)
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
      // Retry compatto: riduce la verbosità, MAI il numero di contenuti. Per un
      // pacchetto 6/24 sono un contratto, non un target da dimezzare al fallback.
      if (/malformed|truncat|no json array/i.test(first.error)) {
        console.warn('[plan retry]', `chunk "${chunk.label}" incompleto, retry compatto con ${chunk.targetMin}-${chunk.targetMax} item`)
        const retry = await attempt(chunk.targetMin, chunk.targetMax, baseMaxTok, true)
        if (retry.ok) return retry
        return retry
      }
      return first
    }

    // Blocchi indipendenti eseguiti in parallelo: se uno fallisce (rate limit,
    // JSON malformato) gli altri proseguono comunque invece di perdere tutto il
    // mese per un solo blocco sfortunato.
    const chunkResults = await Promise.all(chunks.map((chunk, i) => generateChunk(chunk, i)))
    const failedChunks = chunkResults.filter((r): r is { ok: false; error: string } => !r.ok)
    // Ciò che l'AI ha generato bene viene conservato. I posti mancanti diventano
    // slot ERRORE_MANUALE nello stesso ciclo: data/formato/media restano prenotati
    // e l'utente può modificarli o rigenerarli singolarmente dal calendario.
    const itemChunkPairs: { item: Record<string, unknown>; chunk: Chunk }[] = []
    let pkgTruncated = 0
    function fallbackFormats(chunk: Chunk): string[] {
      const mix = mixPerChunk.get(chunk) ?? { caroselli: 0, reel: 0, story: 0, postSingoli: chunk.targetMax, fonte: 'libero' as const }
      return [
        ...Array(mix.postSingoli).fill('post'),
        ...Array(mix.caroselli).fill('carousel'),
        ...Array(mix.story).fill('story'),
        ...Array(mix.reel).fill('reel'),
      ]
    }
    function fallbackItem(chunk: Chunk, index: number, reason: string, original?: Record<string, unknown>): Record<string, unknown> {
      const formats = fallbackFormats(chunk)
      return {
        ...(original || {}),
        data_pubblicazione: original?.data_pubblicazione || '',
        canale: original?.canale || piattaforme[index % piattaforme.length] || 'instagram',
        formato: original?.formato || formats[index] || 'post',
        obiettivo: original?.obiettivo || obiettivo || 'mix',
        tema: original?.tema || 'Slot del piano da completare',
        hook: '',
        caption: '',
        _generation_fallback: true,
        _fallback_reason: reason.slice(0, 280),
      }
    }
    chunkResults.forEach((r, i) => {
      const chunk = chunks[i]
      const target = pkg ? chunk.targetMax : chunk.targetMin
      if (!r.ok) {
        for (let index = 0; index < target; index++) {
          itemChunkPairs.push({ item: fallbackItem(chunk, index, r.error), chunk })
        }
        return
      }
      const items = pkg ? r.items.slice(0, chunk.targetMax) : r.items
      if (pkg) pkgTruncated += Math.max(0, r.items.length - items.length)
      items.forEach((item, index) => {
        const hasCopy = String(item.hook || '').trim() || String(item.caption || '').trim()
        itemChunkPairs.push({
          item: hasCopy ? item : fallbackItem(chunk, index, 'La risposta AI non conteneva hook o caption.', item),
          chunk,
        })
      })
      for (let index = items.length; index < target; index++) {
        itemChunkPairs.push({
          item: fallbackItem(chunk, index, `L'AI ha generato ${items.length}/${target} contenuti per questo blocco.`),
          chunk,
        })
      }
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
    // Caroselli accettati per blocco + quanti sono stati degradati a 'post'
    // perché eccedevano il mix dichiarato E non c'erano abbastanza immagini
    // libere per farne uno vero (vedi sanitizeItem).
    const caroselliPerChunk = new Map<Chunk, number>()
    let caroselliDegradati = 0
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

      // --- Carosello eccedente → 'post' (rete di sicurezza del mix formati) ---
      // Il vincolo vero sta nel prompt (buildMixFormatiContext). Qui NON si
      // riscrive il piano a tavolino: si degrada un carosello a post SOLO se
      // ricorrono ENTRAMBE le condizioni, cioè quando il carosello sarebbe
      // comunque finto:
      //   (a) il blocco ha già usato tutti i caroselli previsti dal mix, e
      //   (b) nel blocco non restano abbastanza immagini libere e compatibili
      //       per un carosello vero (minimo 3 slide).
      // Con (b) falsa il carosello in più è sostenibile e resta com'è; senza
      // media caricati non si tocca nulla (il piano vale come brief editoriale).
      // Un post con 1 immagine è un contenuto pubblicabile, un "carosello" con
      // 1 slide no: il degrado toglie una promessa che non potremmo mantenere.
      if (gruppoFormato(String(out.formato)) === 'carosello' && chunk.images.length) {
        const quota = mixPerChunk.get(chunk)?.caroselli ?? 0
        const giaUsati = caroselliPerChunk.get(chunk) ?? 0
        const usati = usedMedia(chunk, `carosello:${String(out.canale)}`)
        let liberiPerCarosello = 0
        for (let i = 0; i < chunk.images.length; i++) {
          if (!usati?.has(i) && mediaCompatibile(chunk.images[i], 'carosello')) liberiPerCarosello++
        }
        if (giaUsati >= quota && liberiPerCarosello < CAROUSEL_MIN) {
          out.formato = 'post'
          caroselliDegradati++
        } else {
          caroselliPerChunk.set(chunk, giaUsati + 1)
        }
      }

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
    // Statici/caroselli usano ogni foto una volta nel blocco; i Reel consumano
    // per canale, così lo stesso montaggio può essere cross-postato IG + Facebook.
    // Fallback robusto: se media_refs manca/è invalido, si completa dalle foto libere
    // del blocco in ordine (retrocompatibile). Foto finite → contenuto senza media (null),
    // segnalato — mai riusare la stessa immagine di nascosto.
    // NOVITÀ: la scelta dell'AI non è più l'ultima parola. Prima di essere accettata
    // passa da due vincoli DURI (mediaCompatibile): il TIPO del file (un MP4 solo su
    // reel/short/video) e la MARCATURA manuale dell'utente. Un media respinto viene
    // rimpiazzato da uno libero e compatibile; se non ce n'è, lo slot resta vuoto.
    const MEDIA_SLOTS = 10
    // Target e minimo del carosello vengono dalle regole di fabbisogno (una sola
    // fonte di verità con la schermata che dice all'utente quanti media caricare).
    const CAROUSEL_TARGET = MEDIA_PER_FORMATO.carousel.immagini      // 5, dentro il range 3..10
    const CAROUSEL_MIN = MEDIA_PER_FORMATO.carousel.min ?? 3
    const chunkUsedIdx = new Map<Chunk, Map<string, Set<number>>>()
    function usedMedia(chunk: Chunk, scope: string): Set<number> {
      let scopes = chunkUsedIdx.get(chunk)
      if (!scopes) {
        scopes = new Map<string, Set<number>>()
        chunkUsedIdx.set(chunk, scopes)
      }
      let used = scopes.get(scope)
      if (!used) {
        used = new Set<number>()
        scopes.set(scope, used)
      }
      return used
    }
    let photosExhausted = false      // finite le foto → contenuti senza immagine
    let carouselUnderfilled = false  // carosello con meno di 3 foto disponibili
    let mediaScartatiTipo = 0        // MP4 che l'AI aveva messo su post/carosello/story
    let mediaScartatiTag = 0         // media marcati a mano per un altro gruppo di formati
    let slotSenzaMediaCompatibile = 0 // contenuti lasciati senza media: nessuno compatibile

    // --- Compatibilità media ↔ contenuto: due vincoli DURI ---------------------
    // 1) TIPO: un MP4 è un video finale, può stare SOLO su reel/short/video. Il
    //    prompt lo chiedeva come preferenza ("assegnali preferibilmente a...") e
    //    nessuno lo verificava: un MP4 poteva finire su un post statico.
    // 2) MARCATURA manuale: un media marcato 'carosello'/'reel'/'story'/'post' vale solo
    //    per quel gruppo di formati. Se per un contenuto non resta nulla di
    //    compatibile lo slot resta VUOTO: meglio senza foto che con la foto
    //    sbagliata (il calendario mostra il contenuto come da completare).
    function mediaCompatibile(url: string, gruppo: GruppoFormato): boolean {
      const tag = assetTags.get(url) ?? 'auto'
      if (tag !== 'auto' && tag !== gruppo) return false
      if (isVideoUrl(url) && gruppo !== 'reel') return false
      return true
    }

    function nextChunkMediaSlots(chunk: Chunk, canale: string, formato: string, mediaRefs: unknown): (string | null)[] {
      const empty = Array<string | null>(MEDIA_SLOTS).fill(null)
      const total = chunk.images.length
      if (!total) return empty

      const gruppo = gruppoFormato(formato)
      const isCarousel = gruppo === 'carosello'
      const isVideoFormat = gruppo === 'reel'
      // Ogni destinazione ha il proprio pool e ogni social può riusare lo stesso
      // gruppo creativo: IG non deve "consumare" le foto prima di Facebook.
      const used = usedMedia(chunk, `${gruppo}:${canale}`)
      const compatibile = (idx: number) => mediaCompatibile(chunk.images[idx], gruppo)

      // Indici richiesti dal modello (1-based → 0-based): validi, in range, ancora
      // liberi in questo blocco, in ordine e senza duplicati. In più ora devono
      // essere COMPATIBILI: la scelta dell'AI si rispetta, ma non può violare il
      // tipo del file né la marcatura decisa dall'utente.
      const requested: number[] = []
      const seen = new Set<number>()
      if (Array.isArray(mediaRefs)) {
        for (const ref of mediaRefs) {
          const n = typeof ref === 'number' ? ref : parseInt(String(ref), 10)
          const idx = n - 1
          if (!Number.isInteger(idx) || idx < 0 || idx >= total || used.has(idx) || seen.has(idx)) continue
          seen.add(idx)
          const url = chunk.images[idx]
          // MP4 su un formato statico: scartato e rimpiazzato più sotto da
          // un'immagine libera (fallback), non assegnato "tanto per".
          if (isVideoUrl(url) && !isVideoFormat) { mediaScartatiTipo++; continue }
          if (!compatibile(idx)) { mediaScartatiTag++; continue }
          requested.push(idx)
        }
      }

      const picked: number[] = []

      // REEL/SHORT/VIDEO: l'MP4 ha la precedenza sulle immagini. Se il modello ne
      // ha già scelto uno si usa il suo; altrimenti si pesca il primo MP4 libero e
      // compatibile del blocco — un reel deve ricevere il video, non una foto.
      if (isVideoFormat) {
        const videoRichiesto = requested.find(i => isVideoUrl(chunk.images[i]))
        if (videoRichiesto !== undefined) {
          picked.push(videoRichiesto)
        } else {
          for (let i = 0; i < total; i++) {
            if (used.has(i) || !isVideoUrl(chunk.images[i]) || !compatibile(i)) continue
            picked.push(i)
            break
          }
        }
      }

      // Reel senza MP4: le foto richieste diventano scene. Completiamo fino a 5
      // privilegiando stesso nome/descrizione e marcatura esplicita Reel.
      if (isVideoFormat && !picked.length) {
        const target = MEDIA_PER_FORMATO.reel.immagini
        picked.push(...requested.filter(i => !isVideoUrl(chunk.images[i])).slice(0, target))
        const firstLabel = picked.length ? String(assetLabels.get(chunk.images[picked[0]]) || '').trim().toLowerCase() : ''
        const candidates = Array.from({ length: total }, (_, i) => i)
          .filter(i => !used.has(i) && !picked.includes(i) && !isVideoUrl(chunk.images[i]) && compatibile(i))
          .sort((a, b) => {
            const labelA = String(assetLabels.get(chunk.images[a]) || '').trim().toLowerCase()
            const labelB = String(assetLabels.get(chunk.images[b]) || '').trim().toLowerCase()
            const sameA = firstLabel && labelA === firstLabel ? 0 : 1
            const sameB = firstLabel && labelB === firstLabel ? 0 : 1
            if (sameA !== sameB) return sameA - sameB
            const tagA = (assetTags.get(chunk.images[a]) ?? 'auto') === 'reel' ? 0 : 1
            const tagB = (assetTags.get(chunk.images[b]) ?? 'auto') === 'reel' ? 0 : 1
            return tagA - tagB || a - b
          })
        for (const idx of candidates) {
          if (picked.length >= target) break
          picked.push(idx)
        }
      }

      // Statici e caroselli conservano il comportamento precedente.
      if (!picked.length) picked.push(...requested.slice(0, isCarousel ? MEDIA_SLOTS : 1))
      if (!picked.length) {
        const fallbackTarget = isCarousel ? CAROUSEL_TARGET : isVideoFormat ? MEDIA_PER_FORMATO.reel.immagini : 1
        for (let i = 0; i < total && picked.length < fallbackTarget; i++) {
          if (!used.has(i) && compatibile(i)) picked.push(i)
        }
      }

      if (!picked.length) {
        // Distinguiamo le due cause: foto finite (carica più materiale) oppure
        // materiale presente ma tutto marcato/tipizzato per altri formati.
        let liberi = 0
        for (let i = 0; i < total; i++) if (!used.has(i)) liberi++
        if (liberi > 0) slotSenzaMediaCompatibile++
        else photosExhausted = true
        return empty
      }
      // carouselUnderfilled = SCARSITÀ reale di foto, non scelta volontaria del modello.
      // Segnala solo se il carosello ha <3 foto E non ne restano di libere e compatibili
      // nel blocco: se il modello ne ha scelte poche ma ce ne sono ancora di
      // disponibili è una sua decisione legittima, non una carenza da segnalare.
      if (isCarousel && picked.length < CAROUSEL_MIN) {
        let freeRemaining = 0
        for (let i = 0; i < total; i++) {
          if (!used.has(i) && !picked.includes(i) && compatibile(i)) freeRemaining++
        }
        if (freeRemaining <= 0) carouselUnderfilled = true
      }

      picked.forEach(i => used.add(i))
      const urls = picked.map(i => chunk.images[i])
      return [...urls, ...Array(MEDIA_SLOTS - urls.length).fill(null)]
    }

    const inseriti: { id_contenuto: string; canale: string; data_pubblicazione: string }[] = []
    const scartati: string[] = []
    let fallbackInseriti = 0
    let schemaFallbackUsed = false

    for (const { item: rawItem, chunk } of itemChunkPairs) {
      const item = sanitizeItem(rawItem, chunk)
      const isGenerationFallback = rawItem._generation_fallback === true

      // Un contenuto senza testo non è un contenuto: i modelli piccoli (tipici del
      // tier gratuito) chiudono a volte il JSON con oggetti che hanno data, canale e
      // formato ma hook/caption vuoti. Prima finivano in calendario come contenuti
      // veri — un piano "da 7" di cui 4 gusci vuoti, senza che nulla lo segnalasse.
      // Ora vengono scartati e contati, così il messaggio finale dice la verità.
      const haTesto = String(item.hook || '').trim() || String(item.caption || '').trim()
      if (!haTesto && !isGenerationFallback) {
        scartati.push('contenuto senza hook né caption (risposta del modello incompleta)')
        continue
      }

      const id_contenuto = `C${Date.now().toString(36).toUpperCase()}_${inseriti.length}_${scartati.length}`
      const itemQuality = normalizeContentQuality(item.quality_level) ?? contentQuality
      const [media1, media2, media3, media4, media5, media6, media7, media8, media9, media10] = nextChunkMediaSlots(chunk, String(item.canale || ''), String(item.formato || 'post'), item.media_refs)
      // Lookup link prodotto per l'item: se il piano riferisce un product_id valido,
      // persistiamo il link così il publisher può appenderlo al testo Blotato.
      const itemProduct = (products as Array<Record<string, unknown>>).find(p => p.product_id === item.product_id)
      const itemLinkProdotto = (itemProduct?.link_prodotto as string) || null
      const insertColumns = [
        'cliente_id', 'id_contenuto', 'data_pubblicazione', 'ora_pubblicazione',
        'canale', 'formato', 'obiettivo', 'product_id', 'nome_prodotto',
        'tema', 'hook', 'caption', 'hashtag', 'cta', 'status', 'note', 'errore_tecnico',
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
        isGenerationFallback ? 'ERRORE_MANUALE' : 'DA_APPROVARE',
        isGenerationFallback ? `[GENERATION_FALLBACK] ${String(rawItem._fallback_reason || 'Generazione incompleta')}` : null,
        isGenerationFallback ? `Generazione AI da completare: ${String(rawItem._fallback_reason || 'contenuto mancante')}` : null,
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
        if (isGenerationFallback) fallbackInseriti++
      } catch (error) {
        console.warn('[plan] insert item fallito, salto e continuo:', error instanceof Error ? error.message : error)
        scartati.push(error instanceof Error ? error.message : 'errore insert sconosciuto')
      }
    }

    // Pacchetto Crescita: l'articolo SEO+GEO non si genera qui (resta nella sezione
    // Blog), ma inseriamo nel calendario una VOCE DI COLLEGAMENTO così è chiaro che
    // fa parte del piano del mese e con il link per generarlo/gestirlo nel Blog.
    const contenutiSocialInseriti = inseriti.length
    let articoloBlogInserito = false
    if (pkg?.articoloBlog && periodoEff === 'mensile') {
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
      count: pkg ? contenutiSocialInseriti : inseriti.length,
      count_totale: inseriti.length,
      completed_count: Math.max(0, contenutiSocialInseriti - fallbackInseriti),
      fallback_slots: fallbackInseriti,
      partial: fallbackInseriti > 0,
      ...(pkg && { pacchetto: pkg.id, pacchetto_nome: pkg.nome, pacchetto_contenuti: packagePlan?.totale, periodo: periodoEff, articolo_blog: articoloBlogInserito }),
      ...(pkgTruncated && { pacchetto_troncati: pkgTruncated }),
      requested_range: packagePlan ? String(packagePlan.totale) : periodoEff === 'mensile' ? '25-35' : '7-10',
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
      // Vincoli media applicati: quante scelte dell'AI sono state respinte perché
      // violavano il tipo (MP4 su formato statico) o la marcatura manuale, e quanti
      // contenuti sono rimasti senza media perché non ne restava uno compatibile.
      // Caroselli richiesti dal modello oltre il mix dichiarato e degradati a
      // post perché non restavano immagini per farne uno vero (min 3 slide).
      ...(caroselliDegradati && { caroselli_degradati: caroselliDegradati }),
      ...(mediaScartatiTipo && { media_scartati_tipo: mediaScartatiTipo }),
      ...(mediaScartatiTag && { media_scartati_tag: mediaScartatiTag }),
      ...(slotSenzaMediaCompatibile && { contenuti_senza_media_compatibile: slotSenzaMediaCompatibile }),
      ...(Boolean(schemaFallbackUsed) ? { schema_fallback: true, warning: 'Eseguire npm run migrate per abilitare tutti i campi qualità e ottimizzazione' } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione piano'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
