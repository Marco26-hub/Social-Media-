import type { PackageSpec } from '@/lib/packages'

// ─────────────────────────────────────────────────────────────────────────
// GOVERNO DI GIORNI E ORARI DEL PIANO EDITORIALE
//
// Problema che questo modulo risolve: il prompt del piano non diceva NULLA
// sugli orari (chiedeva solo "ora_pubblicazione":"HH:MM") e il fallback della
// route era un fisso '10:00'. Risultato in produzione: blocchi di contenuti
// tutti alle 10:00 e il resto a orari casuali scelti dal modello, senza
// alcun rapporto con quando il pubblico di quel canale è davvero attivo.
//
// Qui l'orario smette di essere casuale e diventa una funzione di TRE cose:
//  1) PACCHETTO del cliente (lib/packages.ts) → cadenza: quanti contenuti a
//     settimana, su quanti giorni, quanti al massimo nello stesso giorno.
//  2) PIATTAFORMA → fasce di attività reale del pubblico di quel canale,
//     distinte tra feriale e weekend (CHANNEL_SLOTS).
//  3) STRATEGIA del contenuto → formato (reel/short/story = fascia serale,
//     articolo/post informativo = mattina) e obiettivo (vendita, awareness,
//     community, educazione, ispirazione, trending).
//
// NON sostituisce la distribuzione delle DATE già presente nella route
// (spreadDate + enforcement weekend): quella resta la rete di sicurezza sui
// giorni, questo modulo aggiunge il livello mancante (orario) e i due helper
// di giorno per i canali che nel weekend non hanno senso (LinkedIn, blog).
//
// Modulo PURO: nessun accesso a DB/rete, nessun Math.random (a parità di
// input l'output è identico → il piano è riproducibile e testabile).
// ─────────────────────────────────────────────────────────────────────────

// Fasce della giornata. Ordine cronologico: l'indice serve a scegliere il
// ripiego "più vicino" quando la fascia preferita è satura.
export type NomeFascia = 'mattina' | 'pranzo' | 'pomeriggio' | 'sera' | 'seraTardi'

const ORDINE_FASCE: NomeFascia[] = ['mattina', 'pranzo', 'pomeriggio', 'sera', 'seraTardi']

// Confini duri di ogni fascia: nessun orario generato può uscire da qui,
// nemmeno dopo la variazione dei minuti anti-collisione. È ciò che garantisce
// che un reel resti davvero "serale" (>= 18:00) anche dopo il jitter.
const CONFINI_FASCIA: Record<NomeFascia, [string, string]> = {
  mattina: ['06:30', '11:30'],
  pranzo: ['11:30', '14:30'],
  pomeriggio: ['14:30', '18:00'],
  sera: ['18:00', '21:59'],
  seraTardi: ['20:00', '23:30'],
}

export type FasceOrarie = Partial<Record<NomeFascia, string[]>>

export type CanaleSlots = {
  feriale: FasceOrarie
  weekend: FasceOrarie
  // Canali il cui pubblico è al lavoro: nel weekend il contenuto va spostato
  // a un feriale (vedi giornoValidoPerCanale / prossimoGiornoValido).
  soloFeriali: boolean
  // Fascia usata quando né formato né obiettivo impongono altro.
  fasciaDefault: NomeFascia
  // Le due fasce da mostrare all'AI nel prompt (slotsPerPrompt).
  fascePrompt: [NomeFascia, NomeFascia]
}

// Fasce consigliate per canale (mercato italiano, fuso del cliente).
// Una riga di razionale per canale: chi legge deve poterla discutere e cambiare.
export const CHANNEL_SLOTS: Record<string, CanaleSlots> = {
  // Instagram: due picchi netti, la pausa pranzo e il divano dopo cena; il weekend il picco slitta a tarda mattina e si anticipa la sera.
  instagram: {
    feriale: {
      mattina: ['07:45', '08:30', '09:15'],
      pranzo: ['12:15', '12:45', '13:20'],
      sera: ['19:00', '19:45', '20:30', '21:10'],
    },
    weekend: {
      mattina: ['10:15', '11:00'],
      pomeriggio: ['16:30', '17:15'],
      sera: ['18:45', '19:30', '20:15', '21:00'],
    },
    soloFeriali: false,
    fasciaDefault: 'sera',
    fascePrompt: ['pranzo', 'sera'],
  },
  // Facebook: pubblico mediamente più adulto, legge nel primo pomeriggio e dopo cena (prime time TV), quasi nulla la mattina presto.
  facebook: {
    feriale: {
      mattina: ['08:15', '09:00'],
      pranzo: ['13:00', '13:45', '14:20'],
      sera: ['20:00', '20:45', '21:15'],
    },
    weekend: {
      mattina: ['10:30', '11:15'],
      pomeriggio: ['15:30', '16:15', '17:00'],
      sera: ['19:45', '20:30', '21:15'],
    },
    soloFeriali: false,
    fasciaDefault: 'sera',
    fascePrompt: ['pranzo', 'sera'],
  },
  // TikTok: consumo prevalentemente serale e post-cena, con una coda pomeridiana; nel weekend la finestra si allarga dal pomeriggio.
  tiktok: {
    feriale: {
      pranzo: ['12:30', '13:15'],
      pomeriggio: ['16:45', '17:30'],
      sera: ['19:15', '20:00', '20:45', '21:30'],
    },
    weekend: {
      mattina: ['11:00'],
      pomeriggio: ['15:00', '16:30', '17:30'],
      sera: ['19:00', '20:15', '21:00', '21:45'],
    },
    soloFeriali: false,
    fasciaDefault: 'sera',
    fascePrompt: ['pomeriggio', 'sera'],
  },
  // Pinterest: è un motore di ricerca per la pianificazione, il picco è la sera tardi (e il weekend di giorno, quando si progetta).
  pinterest: {
    feriale: {
      pomeriggio: ['17:00'],
      sera: ['20:00', '20:45'],
      seraTardi: ['21:30', '22:15', '23:00'],
    },
    weekend: {
      mattina: ['10:00', '11:00'],
      pomeriggio: ['15:15', '16:45'],
      seraTardi: ['21:00', '22:00', '22:45'],
    },
    soloFeriali: false,
    fasciaDefault: 'seraTardi',
    fascePrompt: ['sera', 'seraTardi'],
  },
  // LinkedIn: si legge in orario di lavoro — pre-ufficio e pausa pranzo; nel weekend il pubblico B2B non c'è, quindi soloFeriali.
  linkedin: {
    feriale: {
      mattina: ['07:30', '08:15', '09:00'],
      pranzo: ['12:00', '12:45'],
      pomeriggio: ['17:15', '18:00'],
    },
    weekend: {
      mattina: ['10:30', '11:15'],
    },
    soloFeriali: true,
    fasciaDefault: 'mattina',
    fascePrompt: ['mattina', 'pranzo'],
  },
  // Threads: conversazione, quindi funziona quando c'è gente che risponde — mattina presto e dopo cena, molto simile a Instagram.
  threads: {
    feriale: {
      mattina: ['08:00', '08:45'],
      pranzo: ['12:20', '13:00'],
      sera: ['19:30', '20:15', '21:00'],
    },
    weekend: {
      mattina: ['10:45', '11:30'],
      sera: ['19:00', '20:00', '20:45'],
    },
    soloFeriali: false,
    fasciaDefault: 'sera',
    fascePrompt: ['mattina', 'sera'],
  },
  // X: ritmo da rassegna stampa, picco al mattino presto e alla pausa pranzo, coda nel rientro serale.
  x: {
    feriale: {
      mattina: ['07:45', '08:30', '09:15'],
      pranzo: ['12:10', '12:50'],
      sera: ['18:15', '19:00', '19:45'],
    },
    weekend: {
      mattina: ['09:45', '10:30'],
      pomeriggio: ['15:45', '16:30'],
      sera: ['18:30', '19:15'],
    },
    soloFeriali: false,
    fasciaDefault: 'mattina',
    fascePrompt: ['mattina', 'pranzo'],
  },
  // YouTube Shorts: consumo dal rientro a casa fino a sera; nel weekend parte già dal primo pomeriggio.
  youtube_shorts: {
    feriale: {
      pranzo: ['12:45'],
      pomeriggio: ['16:30', '17:15', '18:00'],
      sera: ['19:30', '20:15', '21:00'],
    },
    weekend: {
      mattina: ['11:15'],
      pomeriggio: ['14:30', '15:45', '17:00'],
      sera: ['19:00', '20:30', '21:15'],
    },
    soloFeriali: false,
    fasciaDefault: 'sera',
    fascePrompt: ['pomeriggio', 'sera'],
  },
  // Blog: pubblicare la mattina presto di un feriale dà a Google e agli AI engine tutta la giornata lavorativa per scoprire e citare l'articolo.
  blog: {
    feriale: {
      mattina: ['07:00', '07:45', '08:30', '09:15'],
      pranzo: ['12:00'],
    },
    weekend: {
      mattina: ['09:30', '10:30'],
    },
    soloFeriali: true,
    fasciaDefault: 'mattina',
    fascePrompt: ['mattina', 'pranzo'],
  },
}

// Canale sconosciuto (o non ancora mappato): si comporta come Instagram, che è
// il profilo di consumo più generico. Meglio di un '10:00' fisso.
const SLOTS_DEFAULT: CanaleSlots = CHANNEL_SLOTS.instagram

export function getCanaleSlots(canale: string): CanaleSlots {
  return CHANNEL_SLOTS[normalizzaCanale(canale)] ?? SLOTS_DEFAULT
}

function normalizzaCanale(canale: unknown): string {
  return String(canale ?? '').trim().toLowerCase()
}

// ── Utility data/ora ─────────────────────────────────────────────────────

const RE_DATA = /^\d{4}-\d{2}-\d{2}$/

// 'YYYY-MM-DD' è interpretata come UTC (stessa convenzione della route del
// piano, che usa getUTCDay): 0=domenica, 6=sabato.
export function isWeekend(giorno: string): boolean {
  if (!RE_DATA.test(giorno)) return false
  const g = new Date(`${giorno}T00:00:00Z`).getUTCDay()
  return g === 0 || g === 6
}

function aMinuti(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number)
  return (Number.isFinite(h) ? h : 0) * 60 + (Number.isFinite(m) ? m : 0)
}

function aHHMM(minuti: number): string {
  const m = ((minuti % 1440) + 1440) % 1440
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(Math.floor(m / 60))}:${p(m % 60)}`
}

// Hash deterministico (djb2): ruota il punto di partenza dentro la fascia in
// funzione di canale+giorno, così due giorni diversi non aprono sempre con lo
// stesso orario pur restando riproducibili (niente Math.random).
function hash(s: string): number {
  let h = 5381
  for (let i = 0; i < s.length; i++) h = ((h * 33) ^ s.charCodeAt(i)) >>> 0
  return h
}

// ── Scelta della fascia: formato e obiettivo ─────────────────────────────

// Il formato pesa più dell'obiettivo: un reel a mezzogiorno è sbagliato anche
// se l'obiettivo è "vendita".
const FORMATI_SERALI = new Set(['reel', 'short', 'story', 'video'])   // video verticale = consumo dopo cena
const FORMATI_MATTUTINI = new Set(['articolo'])                       // long-form: si legge a mente fresca
const FORMATI_SERA_TARDI = new Set(['pin'])                           // Pinterest: si salvano idee la sera tardi

const FASCIA_OBIETTIVO: Record<string, NomeFascia> = {
  vendita: 'pranzo',       // pausa pranzo = finestra d'acquisto da mobile
  awareness: 'sera',       // reach massima quando il feed è più affollato
  community: 'sera',       // si risponde ai commenti quando la gente è online
  educazione: 'mattina',   // contenuto informativo: attenzione alta a inizio giornata
  ispirazione: 'sera',     // mood/lifestyle: consumo rilassato
  trending: 'sera',        // il trend si cavalca nel prime time
}

function fasciaPreferita(formato: string, obiettivo: string | undefined, slots: CanaleSlots): NomeFascia {
  const f = String(formato ?? '').trim().toLowerCase()
  if (FORMATI_SERA_TARDI.has(f)) return 'seraTardi'
  if (FORMATI_SERALI.has(f)) return 'sera'
  if (FORMATI_MATTUTINI.has(f)) return 'mattina'
  const o = String(obiettivo ?? '').trim().toLowerCase()
  if (o && FASCIA_OBIETTIVO[o]) return FASCIA_OBIETTIVO[o]
  return slots.fasciaDefault
}

// Fasce disponibili per quel canale/giorno, ordinate: prima la preferita, poi
// le altre per vicinanza cronologica (una fascia serale satura ripiega sul
// pomeriggio/sera tardi, non sulla mattina).
function fasceOrdinate(fasce: FasceOrarie, preferita: NomeFascia): NomeFascia[] {
  const disponibili = ORDINE_FASCE.filter(n => (fasce[n]?.length ?? 0) > 0)
  const p = ORDINE_FASCE.indexOf(preferita)
  const tardiva = p >= ORDINE_FASCE.indexOf('sera')
  return disponibili.sort((a, b) => {
    const ia = ORDINE_FASCE.indexOf(a)
    const ib = ORDINE_FASCE.indexOf(b)
    const da = Math.abs(ia - p)
    const db = Math.abs(ib - p)
    if (da !== db) return da - db
    return tardiva ? ib - ia : ia - ib
  })
}

// ── pickSlot ─────────────────────────────────────────────────────────────

export type SlotRequest = {
  canale: string
  formato: string
  obiettivo?: string
}

// Variazioni di minuti provate quando gli orari base della fascia sono già
// occupati: meglio 20:37 che il quarto contenuto di nuovo alle 20:00.
const JITTER = [0, 8, -8, 17, -17, 23, -23, 5, -5, 12, -12, 27, -27, 34, -34, 41, -41]

// Chiavi registrate in `usati` per ogni assegnazione:
//   'canale|giorno|ora' → il vincolo richiesto (niente due volte lo stesso canale alla stessa ora)
//   '*|giorno|ora'      → nessun altro canale usa lo stesso identico minuto quel giorno (piano leggibile)
//   'canale|giorno|*'   → marker interrogabile con canaleGiaUsatoNelGiorno()
function chiaveSlot(canale: string, giorno: string, ora: string): string {
  return `${canale}|${giorno}|${ora}`
}

export function canaleGiaUsatoNelGiorno(canale: string, giorno: string, usati: Set<string>): boolean {
  return usati.has(`${normalizzaCanale(canale)}|${giorno}|*`)
}

/**
 * Sceglie l'orario 'HH:MM' per un contenuto: parte dalle fasce del canale,
 * corregge in base a formato/obiettivo, distingue feriale e weekend (ricavati
 * dalla data) ed evita le collisioni già registrate in `usati`, variando anche
 * i minuti invece di ripetere sempre la stessa ora. Registra ciò che assegna.
 */
export function pickSlot(req: SlotRequest, giorno: string, usati: Set<string>): string {
  const canale = normalizzaCanale(req.canale)
  const slots = getCanaleSlots(canale)
  const weekend = isWeekend(giorno)
  // Un canale può non avere fasce weekend configurate (o viceversa): non si
  // resta mai senza orario, si ripiega sull'altro set.
  const fasce: FasceOrarie = weekend
    ? (Object.keys(slots.weekend).length ? slots.weekend : slots.feriale)
    : (Object.keys(slots.feriale).length ? slots.feriale : slots.weekend)

  const preferita = fasciaPreferita(req.formato, req.obiettivo, slots)
  const ordine = fasceOrdinate(fasce, preferita)
  const seed = hash(`${canale}|${giorno}`)

  let ripiego = ''
  for (const nome of ordine) {
    const base = fasce[nome] ?? []
    if (!base.length) continue
    const min = aMinuti(base[0])
    const max = aMinuti(base[base.length - 1])
    const [confMin, confMax] = CONFINI_FASCIA[nome]
    // Le fasce con un solo orario avrebbero zero margine: si concede ±20'.
    const margine = base.length > 1 ? 0 : 20
    const basso = Math.max(min - margine, aMinuti(confMin))
    const alto = Math.min(max + margine, aMinuti(confMax))
    // Rotazione deterministica del punto di partenza dentro la fascia.
    const start = seed % base.length

    for (const delta of JITTER) {
      for (let i = 0; i < base.length; i++) {
        const candidato = aMinuti(base[(start + i) % base.length]) + delta
        if (candidato < basso || candidato > alto) continue
        const ora = aHHMM(candidato)
        if (!ripiego) ripiego = ora
        if (usati.has(chiaveSlot(canale, giorno, ora))) continue
        if (usati.has(chiaveSlot('*', giorno, ora))) continue
        registra(canale, giorno, ora, usati)
        return ora
      }
    }
  }

  // Caso patologico (giornata satura su tutte le fasce di quel canale):
  // si restituisce comunque un orario della fascia giusta, registrandolo.
  // Se nemmeno un ripiego è emerso — succede solo se una fascia di CHANNEL_SLOTS
  // finisce fuori dai CONFINI_FASCIA — NON si torna al vecchio '10:00': quel
  // default silenzioso è il difetto che questo modulo esiste per eliminare, e
  // collasserebbe l'intero canale sulla stessa ora senza che nulla lo segnali.
  // Si prende il primo orario dichiarato per il canale e si logga la config rotta.
  let finale = ripiego
  if (!finale) {
    const slots = getCanaleSlots(canale)
    const tutte = [...Object.values(slots.feriale), ...Object.values(slots.weekend)].flat()
    finale = tutte[0] || '10:00'
    console.warn(`[scheduling] fasce non valide per '${canale}': nessuno slot dentro i confini. Uso ${finale}. Controlla CHANNEL_SLOTS.`)
  }
  registra(canale, giorno, finale, usati)
  return finale
}

function registra(canale: string, giorno: string, ora: string, usati: Set<string>): void {
  usati.add(chiaveSlot(canale, giorno, ora))
  usati.add(chiaveSlot('*', giorno, ora))
  usati.add(chiaveSlot(canale, giorno, '*'))
}

// ── Giorni: canali che nel weekend non hanno pubblico ────────────────────

export function canalePreferisceFeriali(canale: string): boolean {
  return getCanaleSlots(canale).soloFeriali
}

// LinkedIn e blog nel weekend sono sprecati: il giorno non è valido per loro.
export function giornoValidoPerCanale(canale: string, giorno: string): boolean {
  if (!canalePreferisceFeriali(canale)) return true
  return !isWeekend(giorno)
}

/**
 * Se il giorno non va bene per quel canale (LinkedIn/blog nel weekend), sposta
 * al feriale disponibile più vicino DENTRO l'elenco dei giorni del blocco (così
 * non si esce mai dal range del piano). Se non ci sono feriali, resta com'è.
 */
export function prossimoGiornoValido(canale: string, giorno: string, giorniDisponibili: string[]): string {
  if (giornoValidoPerCanale(canale, giorno)) return giorno
  const validi = giorniDisponibili.filter(d => giornoValidoPerCanale(canale, d))
  if (!validi.length) return giorno
  const target = new Date(`${giorno}T00:00:00Z`).getTime()
  let migliore = validi[0]
  let distanza = Number.POSITIVE_INFINITY
  for (const d of validi) {
    const delta = Math.abs(new Date(`${d}T00:00:00Z`).getTime() - target)
    if (delta < distanza) {
      distanza = delta
      migliore = d
    }
  }
  return migliore
}

// ── Requeue: prossimo slot libero per un contenuto rimasto indietro ────────
// Diverso da pickSlot: quello sceglie l'ORA dentro un giorno già deciso da chi
// genera il piano. Qui il giorno stesso non è dato — un contenuto la cui data
// è passata va prima incamminato al prossimo giorno libero per il suo canale,
// poi gli si assegna l'ora con la stessa pickSlot di sempre. Usato dal requeue
// dei contenuti APPROVATI mai sincronizzati la cui data/ora è già nel passato.

export function addDays(giorno: string, n: number): string {
  const d = new Date(`${giorno}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  const p = (x: number) => String(x).padStart(2, '0')
  return `${d.getUTCFullYear()}-${p(d.getUTCMonth() + 1)}-${p(d.getUTCDate())}`
}

/**
 * Primo giorno, a partire da `daGiorno` incluso, dove il canale non è ancora
 * usato (canaleGiaUsatoNelGiorno) e il giorno gli è valido (niente weekend per
 * LinkedIn/blog). `maxGiorni` è un tetto di sicurezza: se anche dopo due mesi
 * non si trova nulla (calendario abnormemente pieno), meglio restituire
 * l'ultimo giorno provato con un warning che raddoppiare in silenzio su un
 * giorno già saturo.
 */
export function nextFreeDay(canale: string, daGiorno: string, usati: Set<string>, maxGiorni = 60): string {
  let giorno = daGiorno
  for (let i = 0; i < maxGiorni; i++) {
    if (giornoValidoPerCanale(canale, giorno) && !canaleGiaUsatoNelGiorno(canale, giorno, usati)) return giorno
    giorno = addDays(giorno, 1)
  }
  console.warn(`[scheduling] nextFreeDay: nessun giorno libero per '${canale}' entro ${maxGiorni} giorni da ${daGiorno}, uso ${giorno} comunque.`)
  return giorno
}

export type RequeueRequest = SlotRequest & { daGiorno: string }

/** Prossimo giorno libero (nextFreeDay) + prima ora libero in quel giorno (pickSlot). */
export function nextAvailableSlot(req: RequeueRequest, usati: Set<string>): { giorno: string; ora: string } {
  const giorno = nextFreeDay(req.canale, req.daGiorno, usati)
  const ora = pickSlot(req, giorno, usati)
  return { giorno, ora }
}

// ── Cadenza dal pacchetto ────────────────────────────────────────────────

export type CadenzaPiano = {
  contenutiSettimana: number
  giorniAttivi: number
  maxPerGiorno: number
}

// Settimane medie in un mese: 16/4.33 ≈ 4 (Presenza), 24/4.33 ≈ 6 (Crescita).
const SETTIMANE_PER_MESE = 4.33

// Piano libero senza numero dichiarato: cadenza prudente ma non banale.
const CONTENUTI_SETTIMANA_DEFAULT = 5

/**
 * Dal pacchetto ricava la cadenza: quanti contenuti a settimana, su quanti
 * giorni distribuirli e quanti al massimo nello stesso giorno.
 *
 * `maxPerGiorno` vale 1 finché i giorni bastano: in quel caso è impossibile
 * avere due contenuti dello stesso canale nello stesso giorno. Quando i
 * contenuti superano i giorni disponibili, il giorno ne ospita più d'uno e il
 * chiamante deve variare canale (canaleGiaUsatoNelGiorno) prima di raddoppiare.
 *
 * Senza pacchetto (piano libero) si parte da `contenutiRichiesti`, se noto.
 */
export function cadenzaDaPacchetto(
  pkg: PackageSpec | null,
  periodo: 'settimanale' | 'mensile',
  includeWeekend: boolean,
  contenutiRichiesti?: number,
): CadenzaPiano {
  const giorniDisponibili = includeWeekend ? 7 : 5

  let contenutiSettimana: number
  if (pkg) {
    // Il pacchetto è mensile per definizione: la cadenza settimanale si
    // ricava dal totale mese, non dal `periodo` richiesto.
    contenutiSettimana = Math.round(pkg.contenutiMese / SETTIMANE_PER_MESE)
  } else if (typeof contenutiRichiesti === 'number' && Number.isFinite(contenutiRichiesti) && contenutiRichiesti > 0) {
    contenutiSettimana = periodo === 'mensile'
      ? Math.round(contenutiRichiesti / SETTIMANE_PER_MESE)
      : Math.round(contenutiRichiesti)
  } else {
    contenutiSettimana = CONTENUTI_SETTIMANA_DEFAULT
  }
  contenutiSettimana = Math.max(1, contenutiSettimana)

  // I giorni su cui spalmare restano tutti quelli scelti (weekend incluso se
  // richiesto): è la distribuzione voluta.
  const giorniAttivi = Math.max(1, Math.min(giorniDisponibili, contenutiSettimana))
  // La CAPIENZA per giorno va però calcolata sui 5 feriali, perché LinkedIn e
  // blog non possono usare sabato e domenica: con il tetto tarato su 7 giorni,
  // un LinkedIn espulso dal weekend trovava tutti i feriali già pieni e il
  // giorno sforava lo stesso, contraddicendo il vincolo dichiarato nel prompt.
  const giorniPerCapienza = Math.max(1, Math.min(5, giorniAttivi))
  const maxPerGiorno = Math.max(1, Math.ceil(contenutiSettimana / giorniPerCapienza))
  return { contenutiSettimana, giorniAttivi, maxPerGiorno }
}

// ── Testo per il prompt ──────────────────────────────────────────────────

function rangeFascia(fasce: FasceOrarie, nome: NomeFascia): string {
  const s = fasce[nome] ?? []
  if (!s.length) return ''
  return s.length === 1 ? s[0] : `${s[0]}-${s[s.length - 1]}`
}

/**
 * Blocco compatto in italiano da iniettare nel prompt del piano, con le fasce
 * consigliate SOLO per le piattaforme selezionate. Il modello smette così di
 * inventare orari e il sanitizer deterministico ha meno da correggere.
 */
export function slotsPerPrompt(piattaforme: string[]): string {
  const viste = new Set<string>()
  const righe: string[] = []
  for (const raw of piattaforme ?? []) {
    const canale = normalizzaCanale(raw)
    if (!canale || viste.has(canale) || !CHANNEL_SLOTS[canale]) continue
    viste.add(canale)
    const s = CHANNEL_SLOTS[canale]
    const parti = s.fascePrompt
      .map(nome => rangeFascia(s.feriale, nome) || rangeFascia(s.weekend, nome))
      .filter(Boolean)
    if (!parti.length) continue
    const quando = s.soloFeriali ? ' (solo lun-ven)' : ''
    righe.push(`- ${canale}: ${parti.join(' o ')}${quando}`)
  }
  if (!righe.length) return ''

  return `

ORARI — vincolante, usa SOLO queste fasce (ora locale del cliente), niente orari inventati:
${righe.join('\n')}
- Reel, short, story e video: sempre in fascia serale (dalle 18:00 in poi).
- Articoli e post informativi/educativi: in mattinata.
- Varia i minuti (evita di mettere tutto a :00) e non ripetere lo stesso orario due volte nello stesso giorno.`
}
