import type { BusinessCategory } from '@/lib/business-categories'
import type { StrategyProfile } from '@/lib/strategy-profiles'

export type EditorialSlotSeed = {
  contentKey: string
  channel: string
  format: string
  week?: number | null
}

export type EditorialContentDirection = {
  directionKey: string
  contentKey: string
  conceptKey: string
  channel: string
  format: string
  week: number
  funnelStage: 'ATTENZIONE' | 'FIDUCIA' | 'SCELTA' | 'AZIONE'
  commercialRole: string
  themeSeed: string
  angle: string
  hookArchetype: string
  proofMechanism: string
  narrativeArc: string
  visualSignature: string
  visualBrief: string
  primaryMessageInstruction: string
  ctaInstruction: string
  ctaFallback: string
  hashtagFamily: string
  platformInstruction: string
}

const STAGES = ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'] as const

const COMMERCIAL_ROLES = {
  ATTENZIONE: [
    'diagnosi di un segnale riconoscibile',
    'costo invisibile del problema',
    'opportunita non ancora sfruttata',
    'cambio di prospettiva sulla categoria',
    'momento osservato che apre il caso',
    'errore comune reso immediatamente visibile',
  ],
  FIDUCIA: [
    'metodo spiegato con una sequenza concreta',
    'processo dietro le quinte',
    'micro-prova osservabile',
    'framework utile da salvare',
    'criterio professionale che guida una scelta',
    'trasformazione dal caos a una regia leggibile',
  ],
  SCELTA: [
    'obiezione sciolta con una prova',
    'confronto fra improvvisazione e sistema',
    'criteri per scegliere la soluzione giusta',
    'rischio di continuare senza metodo',
    'caso applicato che rende tangibile il servizio',
    'confine fra lavoro amatoriale e lavoro professionale',
  ],
  AZIONE: [
    'recap del valore costruito nel mese',
    'lead magnet coerente con il caso',
    'invito a una diagnosi qualificata',
    'prossimo passo semplice e concreto',
    'risultato operativo atteso senza promesse gonfiate',
    'chiusura del caso con apertura al confronto',
  ],
} as const

const ANGLES = {
  ATTENZIONE: [
    'partire da cio che il titolare vede ogni giorno ma non interpreta come problema editoriale',
    'quantificare il costo in tempo, continuita o occasioni perse senza inventare numeri',
    'mostrare il contrasto fra un momento reale e un contenuto che non riesce a raccontarlo',
    'ribaltare una convinzione diffusa nella nicchia con un esempio immediato',
    'entrare nella scena dal punto di vista del cliente ideale',
    'isolare un solo segnale diagnostico e renderlo memorabile',
  ],
  FIDUCIA: [
    'far vedere una decisione professionale e il motivo per cui viene presa',
    'trasformare il processo in una checklist applicabile',
    'collegare un dettaglio produttivo a un beneficio operativo',
    'mostrare la progressione prima, durante e dopo senza risultati inventati',
    'spiegare cosa succede fra brief, produzione, approvazione e pubblicazione',
    'usare una prova visiva per rispondere a una domanda concreta',
  ],
  SCELTA: [
    'confrontare due approcci sullo stesso problema usando criteri verificabili',
    'rispondere all obiezione piu costosa prima di presentare la soluzione',
    'mostrare cosa manca a una soluzione apparentemente sufficiente',
    'rendere leggibile il valore del coordinamento fra strategia, copy e visual',
    'applicare il metodo a una situazione completa della nicchia',
    'far scegliere sulla base del processo e non di una promessa generica',
  ],
  AZIONE: [
    'ricomporre i passaggi gia dimostrati in un prossimo passo naturale',
    'consegnare una risorsa utile che continua il ragionamento del contenuto',
    'qualificare il contatto con una domanda precisa',
    'mostrare cosa verra analizzato nel primo confronto',
    'chiudere il caso con una decisione operativa raggiungibile',
    'usare urgenza solo quando deriva da un costo o da una scadenza reale',
  ],
} as const

const HOOK_ARCHETYPES = {
  ATTENZIONE: [
    'segnale diagnostico specifico',
    'contrasto prima/dopo senza anticipare il payoff',
    'costo nascosto espresso in una frase netta',
    'domanda decisionale rivolta al pubblico giusto',
    'POV professionale dentro una situazione reale',
    'myth-busting con premessa verificabile',
  ],
  FIDUCIA: [
    'process reveal: quello che normalmente non si vede',
    'lista numerata con promessa concreta',
    'micro-caso con dettaglio osservabile',
    'errore e correzione mostrati nello stesso hook',
    'framework nominato con beneficio pratico',
    'open loop sul passaggio decisivo del metodo',
  ],
  SCELTA: [
    'obiezione esplicita seguita da una risposta incompleta',
    'confronto A/B basato su un criterio',
    'red flag che aiuta a scegliere',
    'domanda di qualificazione',
    'caso applicato con tensione prima della soluzione',
    'conseguenza concreta di una scelta debole',
  ],
  AZIONE: [
    'recap con risultato operativo',
    'invito specifico legato alla risorsa',
    'next step con destinatario esplicito',
    'future pacing realistico',
    'chiusura del caso e apertura della conversazione',
    'callout qualificante: per chi e e per chi non e',
  ],
} as const

const PROOF_MECHANISMS = {
  ATTENZIONE: [
    'situazione reale osservabile',
    'dettaglio visivo che rende evidente il problema',
    'contrasto fra due esecuzioni',
    'comportamento ricorrente del pubblico',
  ],
  FIDUCIA: [
    'passaggio del processo mostrato in azione',
    'sequenza operativa o checklist',
    'artefatto reale: brief, calendario, storyboard o dashboard',
    'dimostrazione prima/durante/dopo senza metriche inventate',
  ],
  SCELTA: [
    'confronto verificabile su criteri dichiarati',
    'risposta a una obiezione con esempio',
    'caso completo con limiti dichiarati',
    'prova del coordinamento fra piu fasi del lavoro',
  ],
  AZIONE: [
    'recap delle prove gia mostrate',
    'anteprima concreta della risorsa o del confronto',
    'checklist di qualificazione',
    'passaggio successivo descritto senza ambiguita',
  ],
} as const

const SHOTS = [
  'campo largo ambientato con soggetto in scala',
  'campo medio laterale con azione leggibile',
  'primo piano espressivo con profondita reale',
  'macro di mani, materiale o interfaccia',
  'soggettiva operativa sopra la spalla',
  'composizione simmetrica con fuga prospettica',
  'inquadratura bassa dinamica con spazio copy protetto',
  'doppio piano: azione in primo piano e contesto sul fondo',
] as const

const LIGHTING = [
  'luce pratica calda con accento freddo controllato',
  'luce laterale morbida e contrasto editoriale',
  'controluce motivato con volti ancora leggibili',
  'illuminazione pulita da lavoro con un solo accento di brand',
  'luce ambiente autentica corretta con fill discreto',
  'high contrast premium con neri leggibili e incarnati naturali',
] as const

const COMPOSITIONS = [
  'testo breve nel terzo alto opposto al soggetto',
  'spazio negativo laterale, logo e handle su zone separate',
  'gerarchia diagonale che conduce dalla prova alla CTA',
  'soggetto centrale basso, safe area superiore completamente libera',
  'regola dei terzi con payoff nel quadrante piu pulito',
  'profondita su tre piani e CTA nel frame finale, mai sopra il volto',
  'asse visivo continuo fra apertura e chiusura',
] as const

const FORMAT_ARCS: Record<string, string> = {
  reel: '5 scene: hook visivo, tensione, prova, payoff, CTA/loop; ogni scena cambia funzione e inquadratura',
  short: '5 scene: hook visivo, tensione, prova, payoff, CTA/loop; ritmo breve e nessuna scena filler',
  video: '5 scene: hook, tensione, prova, payoff, CTA; chiusura completa e pubblicabile',
  carousel: '5-10 slide: cover, problema, sviluppo progressivo, prova/payoff, CTA; una idea per slide',
  story: '3 frame: apertura, sviluppo, risoluzione/CTA; il terzo chiude esattamente l open loop del primo',
  post: 'visual 4:5 con un solo hook; caption: contesto, prova, takeaway e CTA senza ripetere la grafica',
  pin: 'visual verticale con promessa chiara, prova leggibile e destinazione reale',
  articolo: 'tesi, sviluppo, prova, sintesi e prossimo passo coerente',
}

const PLATFORM_RULES: Record<string, string> = {
  instagram: 'apertura visual-first, hook breve, caption essenziale; privilegia salvataggio, condivisione o DM coerente',
  facebook: 'apertura piu contestuale, prova esplicita e caption leggibile anche fuori dal profilo; CTA verso messaggio, condivisione o link reale',
  tiktok: 'voce creator diretta, pattern interrupt nei primi secondi, testo parlato naturale e chiusura commentabile',
  linkedin: 'insight professionale, tesi chiara, prova operativa e domanda qualificante; niente tono da intrattenimento generico',
  threads: 'tesi conversazionale breve, osservazione specifica e invito a rispondere senza hashtag invasivi',
  x: 'hook condensato, punto di vista netto e prova o link immediatamente comprensibile',
  pinterest: 'titolo ricercabile, utilita salvabile e visual verticale che anticipa chiaramente il beneficio',
  youtube_shorts: 'promessa comprensibile senza contesto, progressione rapida e payoff prima della CTA',
  blog: 'titolo informativo, intento di ricerca esplicito e struttura leggibile per sezioni',
}

const CATEGORY_SUBJECTS: Record<string, readonly string[]> = {
  'social-media-agency': [
    'strategist che annota decisioni su un calendario editoriale reale',
    'team che confronta storyboard, copy e visual sullo stesso tavolo',
    'smartphone in ripresa mentre il monitor mostra la regia del contenuto',
    'responsabile cliente durante un passaggio di approvazione',
    'dashboard e artefatti di lavoro usati da una persona, non schermate decorative',
    'set di produzione compatto con camera, luce e shot list',
    'editor che verifica safe area, hook e frame finale',
    'sequenza fisica brief-produzione-approvazione-pubblicazione',
  ],
  ecommerce: [
    'prodotto reale in uso con dettaglio di vestibilita o funzione',
    'macro di materiale, finitura o costruzione',
    'confronto fra due abbinamenti o modalita d uso',
    'persona che sceglie il prodotto nel contesto corretto',
    'preparazione ordine o packaging autentico',
    'hero prodotto con scala, texture e spazio informativo',
  ],
  'restaurant-hospitality': [
    'chef durante un gesto tecnico riconoscibile',
    'piatto reale nel momento finale del servizio',
    'dettaglio appetitoso con texture credibile',
    'sala vissuta con ospiti e personale autorizzati',
    'ingrediente e preparazione collegati nello stesso racconto',
    'servizio al tavolo visto dal punto di vista dell ospite',
  ],
  'local-retail': ['prodotto reale nel negozio', 'consulenza fra addetto e cliente', 'dettaglio di assortimento', 'vetrina contestualizzata', 'dimostrazione pratica', 'momento di servizio'],
  'beauty-wellness': ['gesto professionale autorizzato', 'ambiente trattamento reale', 'strumento e metodo', 'consulenza iniziale', 'dettaglio del processo', 'risultato documentabile con consenso'],
  'hospitality-tourism': ['arrivo nella struttura', 'camera o spazio reale', 'dettaglio del servizio', 'esperienza nel territorio', 'staff durante l accoglienza', 'momento ospite autorizzato'],
  'real-estate': ['ambiente principale dell immobile', 'dettaglio costruttivo', 'agente durante una visita', 'relazione immobile-zona', 'planimetria usata nel contesto', 'luce e flusso fra gli spazi'],
  'fitness-sports': ['allenamento reale guidato', 'coach che corregge un gesto', 'dettaglio attrezzatura', 'progressione di un esercizio', 'community durante una sessione', 'spazio e servizi della struttura'],
  'education-training': ['docente durante una spiegazione', 'studente che applica il metodo', 'materiale didattico reale', 'esercizio prima e dopo la correzione', 'momento di confronto', 'risultato di apprendimento osservabile'],
  healthcare: ['professionista in un contesto informativo', 'strumento spiegato senza allarmismo', 'percorso del paziente rappresentato con privacy', 'ambiente reale e rassicurante', 'gesto preventivo', 'materiale educativo verificato'],
  'professional-services': ['professionista durante l analisi', 'documento o artefatto di processo', 'confronto con il cliente', 'dettaglio che dimostra competenza', 'mappa del percorso decisionale', 'momento di verifica'],
  'b2b-technology': ['workflow software usato da una persona', 'team che verifica una integrazione', 'problema operativo prima della soluzione', 'dashboard con dato contestualizzato', 'passaggio fra due sistemi', 'decision maker durante una demo'],
  'home-services': ['tecnico durante il sopralluogo', 'dettaglio prima del lavoro', 'fase operativa reale', 'materiale e strumento corretti', 'controllo qualita finale', 'risultato nel suo ambiente'],
  automotive: ['veicolo reale in uso', 'dettaglio tecnico verificabile', 'tecnico durante un controllo', 'persona durante una prova', 'servizio di assistenza', 'confronto fra configurazioni reali'],
  'nonprofit-community': ['persona e azione raccontate con consenso', 'volontari durante il lavoro', 'impatto osservabile', 'processo trasparente', 'momento di comunita', 'prossimo passo per partecipare'],
  'leisure-venue': ['ambiente della venue durante un momento reale', 'gestore che osserva il flusso della serata', 'team durante il servizio', 'dettaglio dell esperienza', 'community in azione', 'preparazione prima dell apertura'],
  custom: ['persona durante il processo principale', 'ambiente reale dell attivita', 'dettaglio che dimostra competenza', 'cliente nel momento di scelta', 'artefatto del servizio', 'risultato osservabile'],
}

const PROFILE_SUBJECTS: Partial<Record<StrategyProfile['id'], readonly string[]>> = {
  'bowling-case-study': [
    'gestore del bowling che osserva pista, pubblico e punti di contenuto',
    'strategist SWA che trasforma una serata in una shot list sul tablet',
    'smartphone che riprende un gesto reale sulla pista con monitor di regia sul fondo',
    'team SWA che ordina hook, scene e CTA del caso bowling',
    'calendario editoriale del caso bowling collegato alle immagini della venue',
    'gestore e strategist durante il passaggio di approvazione',
    'editor che monta una sequenza bowling con apertura, prova e payoff',
    'mappa della regia SWA applicata ai momenti della serata',
  ],
  'swa-services': CATEGORY_SUBJECTS['social-media-agency'],
  'silkincom-ecommerce': CATEGORY_SUBJECTS.ecommerce,
  restaurant: CATEGORY_SUBJECTS['restaurant-hospitality'],
}

function normalizedFormat(value: string): string {
  const format = String(value || 'post').trim().toLowerCase()
  if (format === 'carosello') return 'carousel'
  if (format === 'reels') return 'reel'
  return format
}

function stableHash(value: string): number {
  let hash = 2166136261
  for (let index = 0; index < value.length; index++) {
    hash ^= value.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return hash >>> 0
}

function pick<T>(values: readonly T[], seed: string): T {
  return values[stableHash(seed) % values.length]
}

function stageFor(seed: EditorialSlotSeed, conceptIndex: number, totalConcepts: number): typeof STAGES[number] {
  const week = Number(seed.week)
  if (Number.isInteger(week) && week >= 1 && week <= 4) return STAGES[week - 1]
  const quartile = Math.min(3, Math.floor((conceptIndex / Math.max(1, totalConcepts)) * 4))
  return STAGES[quartile]
}

function ctaFor(profile: StrategyProfile, stage: typeof STAGES[number]): { instruction: string; fallback: string } {
  if (profile.id === 'bowling-case-study') {
    if (stage === 'AZIONE') return {
      instruction: 'porta a un solo passo: scrivere BOWLING in DM per ricevere la Mappa Regia SWA; non offrire contenuti gratuiti',
      fallback: 'Scrivi BOWLING in DM per ricevere la Mappa Regia SWA.',
    }
    return {
      instruction: 'chiedi di salvare il metodo o continuare il caso; usa la keyword BOWLING solo quando la risorsa e la naturale conclusione',
      fallback: 'Salva questo passaggio della regia SWA.',
    }
  }
  if (stage === 'AZIONE') return {
    instruction: `scegli una sola azione realmente disponibile fra: ${profile.ctaRules.join(' ')}`,
    fallback: 'Scrivi in DM per il prossimo passo.',
  }
  return {
    instruction: 'usa una micro-azione coerente con il contenuto: salva, condividi o approfondisci; niente CTA di vendita forzata',
    fallback: 'Salva questo contenuto per usarlo nel momento giusto.',
  }
}

export function createEditorialContentDirections(args: {
  creativeCode: string
  category: BusinessCategory
  profile: StrategyProfile
  slots: EditorialSlotSeed[]
  conceptOffset?: number
}): EditorialContentDirection[] {
  const { creativeCode, category, profile, slots } = args
  const conceptKeys = [...new Set(slots.map((slot, index) => slot.contentKey || `slot_${index + 1}`))]
  const conceptIndex = new Map(conceptKeys.map((key, index) => [key, index]))
  const subjects = PROFILE_SUBJECTS[profile.id] || CATEGORY_SUBJECTS[category.id] || CATEGORY_SUBJECTS.custom
  const offset = Math.max(0, Math.round(args.conceptOffset || 0))

  return slots.map((slot, slotIndex) => {
    const contentKey = slot.contentKey || `slot_${slotIndex + 1}`
    const localConceptIndex = conceptIndex.get(contentKey) ?? slotIndex
    const ordinal = offset + localConceptIndex
    const stage = stageFor(slot, localConceptIndex, conceptKeys.length)
    const rawWeek = Number(slot.week)
    const resolvedWeek = Number.isInteger(rawWeek) && rawWeek >= 1 && rawWeek <= 4
      ? rawWeek
      : STAGES.indexOf(stage) + 1
    const baseSeed = `${creativeCode}:${profile.id}:${category.id}:w${resolvedWeek}:${ordinal}`
    const role = pick(COMMERCIAL_ROLES[stage], `${baseSeed}:role`)
    const angle = pick(ANGLES[stage], `${baseSeed}:angle`)
    const hookArchetype = pick(HOOK_ARCHETYPES[stage], `${baseSeed}:hook`)
    const proof = pick(PROOF_MECHANISMS[stage], `${baseSeed}:proof`)
    const subject = pick(subjects, `${baseSeed}:subject`)
    const shot = pick(SHOTS, `${baseSeed}:shot`)
    const light = pick(LIGHTING, `${baseSeed}:light`)
    const composition = pick(COMPOSITIONS, `${baseSeed}:composition`)
    const format = normalizedFormat(slot.format)
    const channel = String(slot.channel || 'instagram').toLowerCase()
    const cta = ctaFor(profile, stage)
    const conceptKey = `${creativeCode.toLowerCase()}-w${resolvedWeek}-concept-${String(ordinal + 1).padStart(2, '0')}`
    const directionKey = `${conceptKey}-${channel}-${format}`
    const visualSignature = `${profile.id}|w${resolvedWeek}|${String(ordinal + 1).padStart(2, '0')}|${stableHash(subject) % 997}|${stableHash(shot) % 997}|${stableHash(composition) % 997}`

    return {
      directionKey,
      contentKey,
      conceptKey,
      channel,
      format,
      week: resolvedWeek,
      funnelStage: stage,
      commercialRole: role,
      themeSeed: `${role} | ${angle}`,
      angle,
      hookArchetype,
      proofMechanism: proof,
      narrativeArc: FORMAT_ARCS[format] || FORMAT_ARCS.post,
      visualSignature,
      visualBrief: `Soggetto: ${subject}. Inquadratura: ${shot}. Luce: ${light}. Composizione: ${composition}. Il visual deve dimostrare: ${proof}. Mantieni palette e grading del profilo, ma non riusare soggetto, posa, apertura o composizione di un altro concept. Logo, handle, hook e CTA devono occupare zone separate e non coprire volti, prodotto o prova.`,
      primaryMessageInstruction: `fai capire ${role} attraverso ${angle}; una sola promessa, sostenuta da ${proof}`,
      ctaInstruction: cta.instruction,
      ctaFallback: cta.fallback,
      hashtagFamily: `crea un blocco specifico per ${role}: massimo 5 hashtag, con nicchia, problema, formato e brand; non copiare il blocco di nessun altro slot`,
      platformInstruction: PLATFORM_RULES[channel] || 'adatta linguaggio, lunghezza e micro-azione alle meccaniche reali del canale',
    }
  })
}

export function buildEditorialDirectionsContext(directions: EditorialContentDirection[]): string {
  if (!directions.length) return ''
  const compact = directions.map(direction => ({
    content_key: direction.contentKey,
    direction_key: direction.directionKey,
    canale: direction.channel,
    formato: direction.format,
    settimana: direction.week,
    funnel_stage: direction.funnelStage,
    lavoro_commerciale: direction.commercialRole,
    angolo: direction.angle,
    archetipo_hook: direction.hookArchetype,
    prova: direction.proofMechanism,
    arco_formato: direction.narrativeArc,
    firma_visuale: direction.visualSignature,
    brief_visuale: direction.visualBrief,
    messaggio: direction.primaryMessageInstruction,
    cta: direction.ctaInstruction,
    famiglia_hashtag: direction.hashtagFamily,
    adattamento_canale: direction.platformInstruction,
  }))

  return `

DISTINTA DI REGIA PER OGNI CONTENUTO — CONTRATTO VINCOLANTE:
- Genera ESATTAMENTE una card per ogni riga, nello stesso ordine. Copia content_key, canale e formato.
- Ogni riga ha un lavoro commerciale, un archetipo di hook, una prova e una firma visuale diversi: non scambiarli e non fonderli.
- I concept coordinati su piu canali mantengono la stessa tesi, ma hook, caption, CTA e blocco hashtag devono essere adattati e non possono essere identici.
- La firma visuale e un vincolo di unicita: concept diversi non possono riusare la stessa foto, cover, posa, scena iniziale o composizione.
- Il tema finale deve descrivere davvero il contenuto. Sono vietati segnaposto come "slot da completare", "contenuto brand", "tema da definire" e residui di generazioni fallite.
${JSON.stringify(compact, null, 2)}`
}

const PLACEHOLDER_RE = /^(?:slot(?: del piano)? da completare|contenuto brand|tema da definire|da completare|todo|placeholder|n\/?a)$/i

export function isPlaceholderEditorialText(value: unknown): boolean {
  return typeof value === 'string' && PLACEHOLDER_RE.test(value.trim())
}

export function applyEditorialContentDirection(
  item: Record<string, unknown>,
  direction: EditorialContentDirection,
): Record<string, unknown> {
  const out = { ...item }
  out.content_key = direction.contentKey
  out.canale = direction.channel
  out.formato = direction.format
  if (!String(out.tema || '').trim() || isPlaceholderEditorialText(out.tema)) out.tema = direction.themeSeed
  if (!String(out.funnel_stage || '').trim()) out.funnel_stage = direction.funnelStage
  if (!String(out.angle || '').trim()) out.angle = direction.angle
  if (!String(out.primary_message || '').trim()) out.primary_message = direction.primaryMessageInstruction
  if (!String(out.idea_visual || '').trim()) out.idea_visual = direction.visualBrief
  if (!String(out.creative_brief || '').trim()) out.creative_brief = direction.visualBrief
  if (!String(out.cta || '').trim()) out.cta = direction.ctaFallback
  return out
}

export function editorialDirectionNotes(direction: EditorialContentDirection): string[] {
  return [
    `EDITORIAL_SLOT: ${direction.directionKey}`,
    `EDITORIAL_CONCEPT: ${direction.conceptKey}`,
    `STRATEGY_PROFILE: ${direction.visualSignature.split('|')[0]}`,
    `VISUAL_SIGNATURE: ${direction.visualSignature}`,
    `CHANNEL_ADAPTATION: ${direction.channel}`,
  ]
}
