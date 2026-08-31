import { MEDIA_PER_FORMATO } from '@/lib/media-requirements'
import { packageMixForPeriod, type PackageSpec } from '@/lib/packages'
import { findCreativeNearDuplicate, isCoordinatedCrossPlatformVariant, type CreativeRecord } from '@/lib/editorial-variation'

// ─────────────────────────────────────────────────────────────────────────
// CONTROLLO FINALE DEL PIANO (referto del ciclo)
//
// Problema che risolve: generate le fasi 1-2 e 3-4, nessuno verificava il mese
// COME INSIEME. I controlli esistenti sono tutti per singolo contenuto e al
// momento della generazione (anti-duplicato, contratto narrativo) o prima della
// pubblicazione (preflight, approvazione umana). Restava invisibile tutto ciò
// che si vede solo guardando il ciclo intero: una fase mai generata, il mix
// formati che non corrisponde al pacchetto venduto, caroselli con una slide,
// slot rotti rimasti in calendario, settimane 3-4 che ripetono le 1-2, e i gate
// che il modello si auto-dichiara ("PROFILE_COHERENCE: REVISE") che nessuno
// rileggeva mai.
//
// FINESTRA — perché non è il mese solare: i blocchi del piano partono da OGGI
// (+0/+7/+14/+21 giorni), non dal primo del mese. Un referto per mese solare
// spezzerebbe a metà quasi ogni ciclo e segnalerebbe settimane vuote che vuote
// non sono. Qui la finestra è il CICLO: 28 giorni dal primo contenuto in corso.
//
// Modulo PURO: nessun DB, nessuna rete, nessun Math.random → stesso input,
// stesso referto (calcolo riproducibile e testabile).
// ─────────────────────────────────────────────────────────────────────────

export type PlanAuditStato = 'ok' | 'attenzione' | 'blocco'

export type PlanAuditCheck = {
  id: string
  titolo: string
  stato: PlanAuditStato
  dettaglio: string
  // id_contenuto coinvolti, per far filtrare il calendario dall'interfaccia.
  contenuti?: string[]
}

export type PlanAuditReport = {
  // Finestra effettivamente controllata (ISO YYYY-MM-DD, estremi inclusi).
  dal: string
  al: string
  attesi: number
  pianificati: number
  settimanePiene: number
  bloccanti: number
  attenzioni: number
  pronto: boolean
  checks: PlanAuditCheck[]
}

export type PlanAuditInput = {
  rows: Record<string, unknown>[]
  // Quota del cliente per il ciclo (clienti.contenuti_mese). 0 = sconosciuta:
  // il controllo di copertura viene saltato invece di inventare un numero.
  quota: number
  pkg: PackageSpec | null
  // Data di riferimento ISO (YYYY-MM-DD): "oggi" secondo il fuso del cliente.
  oggi: string
}

const GIORNI_CICLO = 28
const MAX_ELENCO = 8

// Stati che non contano come piano attivo: scartati o archiviati.
const STATI_INATTIVI = new Set(['NON_APPROVATO', 'ARCHIVIATO'])

function testo(value: unknown): string {
  return typeof value === 'string' ? value.trim() : typeof value === 'number' ? String(value) : ''
}

function normalizzaFormato(value: unknown): string {
  const raw = testo(value).toLowerCase()
  if (raw === 'carosello') return 'carousel'
  if (raw === 'short' || raw === 'video') return 'reel'
  if (raw === 'pin') return 'post'
  return raw
}

function giorniTraDate(aISO: string, bISO: string): number {
  const a = Date.parse(`${aISO}T00:00:00Z`)
  const b = Date.parse(`${bISO}T00:00:00Z`)
  if (Number.isNaN(a) || Number.isNaN(b)) return 0
  return Math.round((b - a) / 86400000)
}

function addGiorni(iso: string, giorni: number): string {
  const base = Date.parse(`${iso}T00:00:00Z`)
  if (Number.isNaN(base)) return iso
  return new Date(base + giorni * 86400000).toISOString().slice(0, 10)
}

function dataDi(row: Record<string, unknown>): string {
  const raw = row.data_pubblicazione
  if (raw instanceof Date) return raw.toISOString().slice(0, 10)
  const value = testo(raw)
  return /^\d{4}-\d{2}-\d{2}/.test(value) ? value.slice(0, 10) : ''
}

// I media vivono su 10 colonne separate (link_media_1..10), non su un array.
function mediaDi(row: Record<string, unknown>): string[] {
  const out: string[] = []
  for (let i = 1; i <= 10; i++) {
    const url = testo(row[`link_media_${i}`])
    if (url) out.push(url)
  }
  return out
}

function isVideo(url: string): boolean {
  return url.split('?')[0].toLowerCase().endsWith('.mp4')
}

function etichetta(row: Record<string, unknown>): string {
  return testo(row.id_contenuto) || testo(row.id) || dataDi(row) || '?'
}

// Fase del funnel dichiarata dal modello, ricondotta alle quattro dell'agenzia.
// Il campo è testo libero: arrivano sia "ATTENZIONE" sia "awareness" sia "TOFU".
function faseFunnel(row: Record<string, unknown>): string {
  const raw = `${testo(row.funnel_stage)} ${testo(row.obiettivo)}`.toLowerCase()
  if (/azione|conversion|convers|acquist|vendita|bofu|decision/.test(raw)) return 'AZIONE'
  if (/scelta|consideration|consider|obiezion|confronto|mofu/.test(raw)) return 'SCELTA'
  if (/fiducia|trust|prova|proof|testimon|autorevol|educazione/.test(raw)) return 'FIDUCIA'
  if (/attenzione|awareness|scoperta|tofu|ispirazione|trending/.test(raw)) return 'ATTENZIONE'
  return ''
}

// Settimana del ciclo (1-4) a partire dall'inizio finestra, non dal mese solare.
function settimanaCiclo(dataISO: string, inizioISO: string): number {
  const delta = giorniTraDate(inizioISO, dataISO)
  if (delta < 0) return 0
  return Math.min(4, Math.floor(delta / 7) + 1)
}

function check(
  id: string,
  titolo: string,
  stato: PlanAuditStato,
  dettaglio: string,
  contenuti?: string[],
): PlanAuditCheck {
  return contenuti?.length
    ? { id, titolo, stato, dettaglio, contenuti: contenuti.slice(0, MAX_ELENCO) }
    : { id, titolo, stato, dettaglio }
}

// Sceglie la finestra del ciclo in corso: 28 giorni dal primo contenuto ancora
// in gioco. Guardare indietro di una settimana serve a non tagliare fuori un
// ciclo iniziato pochi giorni fa (il piano parte da oggi, non dal lunedì).
export function finestraCiclo(rows: Record<string, unknown>[], oggi: string): { dal: string; al: string } {
  const date = rows.map(dataDi).filter(Boolean).sort()
  const soglia = addGiorni(oggi, -7)
  const inizio = date.find(d => d >= soglia) || date[0] || oggi
  return { dal: inizio, al: addGiorni(inizio, GIORNI_CICLO - 1) }
}

export function auditPianoCiclo(input: PlanAuditInput): PlanAuditReport {
  const { rows, quota, pkg, oggi } = input
  // Il blog non è una pubblicazione social: sta fuori dalla quota e dal mix,
  // esattamente come nel consuntivo pacchetto.
  const social = rows.filter(row => testo(row.canale).toLowerCase() !== 'blog')
  const { dal, al } = finestraCiclo(social, oggi)
  const nelCiclo = social.filter(row => {
    const d = dataDi(row)
    return Boolean(d) && d >= dal && d <= al
  })
  const attivi = nelCiclo.filter(row => !STATI_INATTIVI.has(testo(row.status).toUpperCase()))

  const checks: PlanAuditCheck[] = []

  // 1. COPERTURA — il ciclo contiene i contenuti venduti?
  if (quota > 0) {
    const mancanti = Math.max(0, quota - attivi.length)
    const extra = Math.max(0, attivi.length - quota)
    checks.push(mancanti > 0
      ? check('copertura', 'Copertura del pacchetto', 'blocco',
          `${attivi.length} contenuti attivi su ${quota} previsti: ne mancano ${mancanti}. Se hai generato solo una fase, genera l'altra dalla pagina Piano.`)
      : check('copertura', 'Copertura del pacchetto', extra > 0 ? 'attenzione' : 'ok',
          extra > 0
            ? `${attivi.length} contenuti attivi, ${extra} oltre la quota di ${quota} (tipico di una cartella campagna che impone più gruppi).`
            : `${attivi.length} contenuti attivi, quota ${quota} rispettata.`))
  } else {
    checks.push(check('copertura', 'Copertura del pacchetto', 'attenzione',
      'Quota del cliente non impostata: impossibile dire se il ciclo è completo. Imposta i contenuti/mese nella scheda cliente.'))
  }

  // 2. SETTIMANE — è il controllo che scopre la fase mai generata.
  const perSettimana = [0, 0, 0, 0]
  attivi.forEach(row => {
    const s = settimanaCiclo(dataDi(row), dal)
    if (s >= 1 && s <= 4) perSettimana[s - 1]++
  })
  const vuote = perSettimana.map((n, i) => (n === 0 ? i + 1 : 0)).filter(Boolean)
  const settimanePiene = perSettimana.filter(n => n > 0).length
  checks.push(vuote.length
    ? check('settimane', 'Le quattro settimane del ciclo', 'blocco',
        `Settimana ${vuote.join(' e ')} senza contenuti (distribuzione ${perSettimana.join(' · ')}). Manca una fase: le settimane 1-2 sono la fase 1, le 3-4 la fase 2.`)
    : check('settimane', 'Le quattro settimane del ciclo', 'ok',
        `Contenuti su tutte e quattro le settimane (${perSettimana.join(' · ')}).`))

  // 3. MIX FORMATI — confrontato sul totale REALMENTE pianificato, non sulla
  // quota: con una cartella campagna il totale legittimamente sale, ma le
  // proporzioni vendute devono restare quelle.
  if (pkg && attivi.length) {
    const mix = packageMixForPeriod(pkg, 'mensile', attivi.length)
    const conta = { post: 0, carousel: 0, story: 0, reel: 0 }
    attivi.forEach(row => {
      const f = normalizzaFormato(row.formato)
      if (f === 'carousel') conta.carousel++
      else if (f === 'story') conta.story++
      else if (f === 'reel') conta.reel++
      else conta.post++
    })
    const attesi: Array<[string, number, number]> = [
      ['post/pin', conta.post, mix.postSingoli],
      ['caroselli', conta.carousel, mix.caroselli],
      ['story', conta.story, mix.stories],
      ['reel/short', conta.reel, mix.reelVideo],
    ]
    // Tolleranza: 2 contenuti O il 25% dell'atteso, quale dei due è maggiore.
    // Sotto questa soglia è arrotondamento, non uno sgarro al pacchetto.
    const fuori = attesi.filter(([, avuti, previsti]) =>
      Math.abs(avuti - previsti) > Math.max(2, Math.round(previsti * 0.25)))
    checks.push(fuori.length
      ? check('mix', 'Mix dei formati del pacchetto', 'attenzione',
          `Il mix non segue il pacchetto ${pkg.nome}: ${fuori.map(([nome, avuti, previsti]) => `${nome} ${avuti} invece di ${previsti}`).join(', ')}.`)
      : check('mix', 'Mix dei formati del pacchetto', 'ok',
          `Mix coerente con ${pkg.nome}: ${attesi.map(([nome, avuti]) => `${avuti} ${nome}`).join(', ')}.`))
  }

  // 4. MEDIA — un carosello con una slide non è un carosello.
  const senzaMedia: string[] = []
  const sottoSoglia: string[] = []
  attivi.forEach(row => {
    const formato = normalizzaFormato(row.formato)
    if (formato === 'articolo') return
    const regola = MEDIA_PER_FORMATO[formato] || MEDIA_PER_FORMATO.post
    const media = mediaDi(row)
    if (!media.length) { senzaMedia.push(etichetta(row)); return }
    // Un MP4 copre da solo un reel; per gli altri formati contano le immagini.
    const coperto = regola.video > 0 && media.some(isVideo)
    if (!coperto && media.length < (regola.min ?? 1)) sottoSoglia.push(etichetta(row))
  })
  const mediaRotti = [...senzaMedia, ...sottoSoglia]
  checks.push(mediaRotti.length
    ? check('media', 'Media assegnati a ogni contenuto', 'blocco',
        `${senzaMedia.length} contenuti senza alcun media${sottoSoglia.length ? ` e ${sottoSoglia.length} sotto il minimo del formato (un carosello vuole almeno 3 slide)` : ''}.`,
        mediaRotti)
    : check('media', 'Media assegnati a ogni contenuto', 'ok',
        'Ogni contenuto ha i media richiesti dal suo formato.'))

  // 5. SLOT ROTTI — quello che la generazione non è riuscita a produrre.
  const rotti = attivi.filter(row =>
    testo(row.status).toUpperCase() === 'ERRORE_MANUALE'
    || testo(row.note).startsWith('[GENERATION_FALLBACK]')).map(etichetta)
  checks.push(rotti.length
    ? check('slot', 'Slot da sistemare', 'blocco',
        `${rotti.length} slot sono rimasti da completare: apri il contenuto e rigeneralo dal calendario.`, rotti)
    : check('slot', 'Slot da sistemare', 'ok', 'Nessuno slot incompleto rimasto nel ciclo.'))

  // 6. COPY — senza hook o caption non è pubblicabile.
  const senzaCopy = attivi.filter(row => !testo(row.hook) || !testo(row.caption)).map(etichetta)
  checks.push(senzaCopy.length
    ? check('copy', 'Copy completo', 'blocco',
        `${senzaCopy.length} contenuti senza hook o senza caption.`, senzaCopy)
    : check('copy', 'Copy completo', 'ok', 'Hook e caption presenti su tutti i contenuti.'))

  // 7. ARCO NARRATIVO — le settimane 3-4 devono CHIUDERE il funnel, non
  // ripetere l'apertura. È il difetto che i piani generati prima della
  // correzione della fase mostrano: due mezzi mesi identici.
  const fasiPerMeta = { apertura: new Set<string>(), chiusura: new Set<string>() }
  attivi.forEach(row => {
    const fase = faseFunnel(row)
    if (!fase) return
    const s = settimanaCiclo(dataDi(row), dal)
    if (s === 1 || s === 2) fasiPerMeta.apertura.add(fase)
    else if (s === 3 || s === 4) fasiPerMeta.chiusura.add(fase)
  })
  const chiude = fasiPerMeta.chiusura.has('SCELTA') || fasiPerMeta.chiusura.has('AZIONE')
  const fasiTotali = new Set([...fasiPerMeta.apertura, ...fasiPerMeta.chiusura])
  if (!fasiTotali.size) {
    checks.push(check('arco', 'Arco narrativo del ciclo', 'attenzione',
      'Nessun contenuto dichiara la fase del funnel: impossibile verificare che il ciclo vada da attenzione ad azione.'))
  } else {
    checks.push(fasiPerMeta.chiusura.size && !chiude
      ? check('arco', 'Arco narrativo del ciclo', 'attenzione',
          `Le settimane 3-4 restano su ${[...fasiPerMeta.chiusura].join(' e ')} e non chiudono il funnel: mancano scelta e azione. Rigenera la fase 2.`)
      : check('arco', 'Arco narrativo del ciclo', 'ok',
          `Il ciclo attraversa ${[...fasiTotali].join(' → ')}.`))
  }

  // 8. DUPLICATI — lo stesso hook due volte nel mese. Le varianti coordinate
  // dello stesso concept su due social NON sono duplicati: sono il prodotto.
  const visti: CreativeRecord[] = []
  const duplicati: string[] = []
  attivi.forEach(row => {
    const record = row as CreativeRecord
    const confrontabili = visti.filter(prev => !isCoordinatedCrossPlatformVariant(record, prev))
    if (findCreativeNearDuplicate(record, confrontabili)) duplicati.push(etichetta(row))
    visti.push(record)
  })
  checks.push(duplicati.length
    ? check('duplicati', 'Contenuti che si somigliano', 'attenzione',
        `${duplicati.length} contenuti quasi identici ad altri dello stesso ciclo (stesso hook o stesso tema).`, duplicati)
    : check('duplicati', 'Contenuti che si somigliano', 'ok', 'Nessun contenuto ripetuto nel ciclo.'))

  // 9. GATE AUTO-DICHIARATI — il modello scrive "REVISE" nelle note quando lui
  // stesso giudica il contenuto non pronto. Finora nessuno le rileggeva.
  const daRivedere = attivi.filter(row =>
    /(?:PROFILE_COHERENCE|CINEMATIC_GATE)\s*:\s*REVISE/i.test(testo(row.production_notes))).map(etichetta)
  checks.push(daRivedere.length
    ? check('gate', 'Gate di coerenza e regia', 'attenzione',
        `${daRivedere.length} contenuti sono marcati REVISE dal modello stesso nelle note di produzione.`, daRivedere)
    : check('gate', 'Gate di coerenza e regia', 'ok', 'Nessun contenuto marcato REVISE.'))

  const bloccanti = checks.filter(c => c.stato === 'blocco').length
  const attenzioni = checks.filter(c => c.stato === 'attenzione').length

  return {
    dal,
    al,
    attesi: quota,
    pianificati: attivi.length,
    settimanePiene,
    bloccanti,
    attenzioni,
    pronto: bloccanti === 0,
    checks,
  }
}
