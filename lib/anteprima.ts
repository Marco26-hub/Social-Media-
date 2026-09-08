import { CANONE, PREZZI } from '@/lib/prezzi-ingresso'
import { SETTORI } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { SITE_URL } from '@/lib/site-config'

// L'anteprima di ogni pagina: quello che si vede quando un link finisce su
// WhatsApp, LinkedIn o in un messaggio.
//
// Fino a ieri le settantasei pagine condividevano un unico /og.png, per giunta
// vecchio: diceva «Social Automation» invece del nome dell'azienda, mostrava un
// fulmine al posto del logo e in fondo portava il dominio di un hosting
// dismesso. Chi riceveva un link a un settore, a un servizio o al listino
// vedeva sempre la stessa immagine sbagliata — e un'anteprima sbagliata e' la
// prima cosa che il cliente vede di noi.
//
// Ogni pagina ha adesso il suo titolo, il suo sottotitolo e il suo colore. Il
// testo sta qui e non dentro le pagine perche' l'immagine viene disegnata da
// una rotta sola: le pagine dichiarano il percorso, il testo lo decide questo
// file. I prezzi arrivano dalle sorgenti uniche, cosi l'anteprima non puo'
// promettere una cifra diversa da quella scritta nella pagina.

/** Le famiglie di colore. Servono a distinguere le anteprime a colpo d'occhio. */
export type Tinta = 'verde' | 'oro' | 'terra' | 'notte'

export type Anteprima = {
  occhiello: string
  titolo: string
  sottotitolo: string
  tinta: Tinta
}

const IT: Record<string, Anteprima> = {
  '/': {
    occhiello: 'Social Web Automation',
    titolo: 'Social, SEO, siti e clienti B2B per le PMI.',
    sottotitolo: `Un solo interlocutore per presenza, visibilità e chiamate. Piani social da ${PREZZI.presenza}.`,
    tinta: 'verde',
  },
  '/servizi': {
    occhiello: 'Tutti i servizi',
    titolo: 'Undici competenze, un solo interlocutore.',
    sottotitolo: 'Social, SEO e GEO, blog, siti, video, lead B2B, voce, agenda, gestionali.',
    tinta: 'verde',
  },
  '/servizi/gestione-social-media': {
    occhiello: 'Gestione social',
    titolo: 'Due canali presidiati, ogni mese.',
    sottotitolo: `Piano editoriale, produzione e pubblicazione, da ${PREZZI.presenza}.`,
    tinta: 'verde',
  },
  '/servizi/seo-geo': {
    occhiello: 'SEO + GEO',
    titolo: 'Trovabili su Google e citabili dai sistemi AI.',
    sottotitolo: 'Struttura tecnica, entità, fonti e dati strutturati. Nessuna promessa di posizione.',
    tinta: 'oro',
  },
  '/servizi/blog-seo': {
    occhiello: 'Blog SEO + GEO',
    titolo: 'Dodici articoli al mese, pronti da pubblicare.',
    sottotitolo: `Ricerca, scrittura, metadati e FAQ, ${PREZZI.blog}.`,
    tinta: 'oro',
  },
  '/servizi/siti-e-commerce': {
    occhiello: 'Siti ed e-commerce',
    titolo: 'Il sito è tuo dopo dodici mesi.',
    sottotitolo: `Canone da ${CANONE.web}, hosting compreso. Dominio e caselle restano tuoi.`,
    tinta: 'verde',
  },
  '/servizi/ricerca-clienti-b2b': {
    occhiello: 'Ricerca clienti B2B',
    titolo: 'Aziende verificate, non liste comprate.',
    sottotitolo: `Pilot con contatti qualificati e priorità dichiarate, ${PREZZI.b2b}.`,
    tinta: 'notte',
  },
  '/servizi/segretaria-telefonica-ai': {
    occhiello: 'Segretaria telefonica AI',
    titolo: 'Risponde mentre hai le mani occupate.',
    sottotitolo: `Servizi, orari e prenotazioni, con il riassunto della chiamata, ${PREZZI.voce}.`,
    tinta: 'notte',
  },
  '/servizi/agenda-clienti-whatsapp': {
    occhiello: 'Agenda e richiamo clienti',
    titolo: 'I clienti fermi tornano a farsi vedere.',
    sottotitolo: `Agenda, storico e messaggi WhatsApp approvati da te, ${PREZZI.agenda}.`,
    tinta: 'notte',
  },
  '/servizi/video-produzione': {
    occhiello: 'Riprese in azienda',
    titolo: 'Mezza giornata di riprese, settimane di contenuti.',
    sottotitolo: `Fotografo, luci e montaggio dove lavori, ${PREZZI.video}.`,
    tinta: 'terra',
  },
  '/servizi/gestione-lavorazioni': {
    occhiello: 'Sito e lavorazioni',
    titolo: 'Rapportini firmati in cantiere, non a fine mese.',
    sottotitolo: 'Foto, firma e PDF al cliente. Il sito e il gestionale parlano la stessa lingua.',
    tinta: 'terra',
  },
  '/servizi/automazione-gestionali': {
    occhiello: 'Automazione e gestionali',
    titolo: 'Gli strumenti che già usi, collegati fra loro.',
    sottotitolo: 'Meno doppie digitazioni, meno fogli paralleli, dati che restano tuoi.',
    tinta: 'notte',
  },
  '/settori': {
    occhiello: 'Settori',
    titolo: 'Dodici mestieri, dodici modi di lavorare.',
    sottotitolo: 'Quello che serve davvero alla tua categoria, con i prezzi della tua categoria.',
    tinta: 'oro',
  },
  '/pacchetti': {
    occhiello: 'Listino',
    titolo: 'Prezzi scritti prima, non dopo il preventivo.',
    sottotitolo: `Presenza ${PREZZI.presenza} · Crescita ${PREZZI.crescita} · Blog ${PREZZI.blog}. IVA esclusa.`,
    tinta: 'oro',
  },
  '/metodo': {
    occhiello: 'Sistema operativo SWA',
    titolo: 'Quattro fasi, ogni mese, sempre le stesse.',
    sottotitolo: 'Analisi, direzione, produzione, miglioramento. Le decisioni restano tue.',
    tinta: 'verde',
  },
  '/chi-siamo': {
    occhiello: 'Azienda',
    titolo: 'Chi risponde quando scrivi.',
    sottotitolo: 'Una struttura piccola, responsabilità dichiarate e nessun intermediario.',
    tinta: 'verde',
  },
  '/consulenza': {
    occhiello: 'Consulenza legale AI',
    titolo: 'AI Act e GDPR, spiegati da un avvocato.',
    sottotitolo: 'Trenta minuti con lo Studio BCS su obblighi, rischi e documenti da avere.',
    tinta: 'notte',
  },
  '/contatti': {
    occhiello: 'Contatti',
    titolo: 'Parliamo del progetto, non del preventivo.',
    sottotitolo: 'Scrivi su WhatsApp o via email: si parte dal problema, non dal pacchetto.',
    tinta: 'verde',
  },
  '/faq': {
    occhiello: 'Domande frequenti',
    titolo: 'Le risposte che servono prima di scegliere.',
    sottotitolo: 'Costi, attività incluse, approvazioni, disdetta, SEO, GEO e proprietà dei dati.',
    tinta: 'oro',
  },
  '/blog': {
    occhiello: 'SWA Journal',
    titolo: 'Come funziona il marketing digitale, senza scorciatoie.',
    sottotitolo: 'Articoli su social, SEO, GEO, AI e vendita, scritti per chi decide.',
    tinta: 'terra',
  },
  '/autore/marco-dibenedetto': {
    occhiello: 'Autore',
    titolo: 'Marco Dibenedetto',
    sottotitolo: 'Titolare di Social Web Automation. Scrive di social, SEO, GEO e automazione.',
    tinta: 'terra',
  },
  '/privacy': {
    occhiello: 'Documento legale',
    titolo: 'Informativa privacy.',
    sottotitolo: 'Che dati trattiamo, per quale base giuridica, per quanto tempo e con chi.',
    tinta: 'notte',
  },
  '/cookie-policy': {
    occhiello: 'Documento legale',
    titolo: 'Cookie policy.',
    sottotitolo: 'Quali cookie usiamo, quali no, e come cambiare idea in ogni momento.',
    tinta: 'notte',
  },
  '/termini': {
    occhiello: 'Documento legale',
    titolo: 'Termini e condizioni.',
    sottotitolo: 'Perimetro dei servizi, durata, pagamenti, proprietà dei materiali.',
    tinta: 'notte',
  },
  '/recesso': {
    occhiello: 'Documento legale',
    titolo: 'Diritto di recesso.',
    sottotitolo: 'Come si disdice, entro quando, e che cosa succede ai lavori in corso.',
    tinta: 'notte',
  },
  '/sicurezza': {
    occhiello: 'Trasparenza',
    titolo: 'Come proteggiamo i dati.',
    sottotitolo: 'Accessi, cifratura, fornitori e procedura in caso di violazione.',
    tinta: 'notte',
  },
  '/accessibilita': {
    occhiello: 'Trasparenza',
    titolo: 'Dichiarazione di accessibilità.',
    sottotitolo: 'A che punto siamo su WCAG 2.1 AA, che cosa manca e come segnalarlo.',
    tinta: 'notte',
  },
  '/trasparenza-ai': {
    occhiello: 'Trasparenza',
    titolo: 'Dove usiamo l’AI, e dove decide una persona.',
    sottotitolo: 'Art. 50 AI Act: che cosa è generato, che cosa è verificato, chi approva.',
    tinta: 'notte',
  },
}

const EN: Record<string, Anteprima> = {
  '/en': {
    occhiello: 'Social Web Automation',
    titolo: 'Social, SEO, websites and B2B leads for SMEs.',
    sottotitolo: 'One partner for presence, visibility and inbound calls. Published prices.',
    tinta: 'verde',
  },
  '/en/services': {
    occhiello: 'All services',
    titolo: 'Eleven capabilities, one point of contact.',
    sottotitolo: 'Social, SEO and GEO, blog, websites, video, B2B leads, voice, diary, systems.',
    tinta: 'verde',
  },
  '/en/settori': {
    occhiello: 'Sectors',
    titolo: 'Twelve trades, twelve ways of working.',
    sottotitolo: 'What your category actually needs, at your category’s prices.',
    tinta: 'oro',
  },
  '/en/pricing': {
    occhiello: 'Pricing',
    titolo: 'Prices written before the quote, not after.',
    sottotitolo: 'Presence €490 · Growth €990 per month. VAT excluded.',
    tinta: 'oro',
  },
  '/en/method': {
    occhiello: 'The SWA operating system',
    titolo: 'Four phases, every month, always the same.',
    sottotitolo: 'Assessment, direction, production, improvement. Decisions stay with you.',
    tinta: 'verde',
  },
  '/en/about': {
    occhiello: 'Company',
    titolo: 'Who answers when you write.',
    sottotitolo: 'A small team, stated responsibilities and no intermediaries.',
    tinta: 'verde',
  },
  '/en/contact': {
    occhiello: 'Contact',
    titolo: 'Let’s talk about the project, not the quote.',
    sottotitolo: 'Write on WhatsApp or by email: we start from the problem, not the package.',
    tinta: 'verde',
  },
  '/en/faq': {
    occhiello: 'Frequently asked',
    titolo: 'The answers you need before choosing.',
    sottotitolo: 'Costs, what is included, approvals, cancellation, SEO, GEO and data ownership.',
    tinta: 'oro',
  },
  '/en/blog': {
    occhiello: 'SWA Journal',
    titolo: 'How digital marketing actually works.',
    sottotitolo: 'Articles on social, SEO, GEO, AI and selling, written for decision makers.',
    tinta: 'terra',
  },
  '/en/author/marco-dibenedetto': {
    occhiello: 'Author',
    titolo: 'Marco Dibenedetto',
    sottotitolo: 'Owner of Social Web Automation. Writes on social, SEO, GEO and automation.',
    tinta: 'terra',
  },
}

const FISSE: Record<string, Anteprima> = { ...IT, ...EN }

/**
 * Il sommario di un settore e' gia' una riga sola: e' quello che va
 * nell'anteprima. La promessa serve solo se un settore il sommario non ce
 * l'ha, e allora se ne prende la prima frase — perche' scritta per stare
 * sotto un titolo, non dentro un'immagine, e a taglio secco finisce a meta'
 * parola come «sull'incassato non tratteniamo…».
 */
function prima(frase: string, massimo = 130): string {
  const punto = frase.indexOf('. ')
  const corta = punto > 40 ? frase.slice(0, punto + 1) : frase
  if (corta.length <= massimo) return corta
  const taglio = corta.lastIndexOf(' ', massimo)
  return `${corta.slice(0, taglio > 0 ? taglio : massimo).replace(/[,;:]$/, '')}…`
}

function settoreAnteprima(percorso: string): Anteprima | undefined {
  const en = percorso.startsWith('/en/')
  const slug = percorso.replace('/en', '').replace('/settori/', '')
  if (en) {
    const s = SETTORI_EN.find(x => x.slug === slug)
    if (!s) return undefined
    return { occhiello: 'Sector', titolo: s.nome, sottotitolo: s.sommario || prima(s.promessa), tinta: 'oro' }
  }
  const s = SETTORI.find(x => x.slug === slug)
  if (!s) return undefined
  return { occhiello: 'Settore', titolo: s.nome, sottotitolo: s.sommario || prima(s.promessa), tinta: 'oro' }
}

/** Il testo dell'anteprima per un percorso. Sconosciuto ⇒ la scheda dell'azienda. */
export function contenutoAnteprima(percorso: string): Anteprima {
  const pulito = percorso.replace(/\/+$/, '') || '/'
  const fissa = FISSE[pulito]
  if (fissa) return fissa
  if (pulito.includes('/settori/')) {
    const settore = settoreAnteprima(pulito)
    if (settore) return settore
  }
  return pulito.startsWith('/en') ? EN['/en'] : IT['/']
}

/** Vero solo per i percorsi che sappiamo disegnare: la rotta non accetta testo libero. */
export function anteprimaNota(percorso: string): boolean {
  const pulito = percorso.replace(/\/+$/, '') || '/'
  if (FISSE[pulito]) return true
  return pulito.includes('/settori/') ? Boolean(settoreAnteprima(pulito)) : false
}

/**
 * Il blocco `images` da mettere nei metadata. Assoluto, perche' WhatsApp e
 * LinkedIn non risolvono i percorsi relativi.
 */
export function anteprimaOg(percorso: string) {
  const { titolo } = contenutoAnteprima(percorso)
  return [{
    url: `${SITE_URL}/api/anteprima?p=${encodeURIComponent(percorso)}`,
    width: 1200,
    height: 630,
    alt: titolo,
  }]
}
