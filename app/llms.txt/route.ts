import { COPPIE_LINGUA } from '@/lib/lingue'
import { TITOLARE } from '@/lib/legal-config'
import { PACCHETTI } from '@/lib/pacchetti'
import { PREZZI, PREZZO_INGRESSO } from '@/lib/prezzi-ingresso'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SETTORI } from '@/lib/settori'
import { SETTORI_EN } from '@/lib/settori.en'
import { SITE_URL } from '@/lib/site-config'
import { STANDALONE_SERVICES, type StandaloneService } from '@/lib/standalone-services'
import { SWA_BLOG_ARTICLES } from '@/lib/swa-blog-content'
import { SWA_BLOG_ARTICLES_EN } from '@/lib/swa-blog-content.en'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'

// /llms.txt
//
// Era un file statico in public/, ed e' finito esattamente dove finiscono le
// copie scritte a mano: dichiarava le riprese video «quotate sul progetto»
// mentre il listino pubblico diceva gia' 590 euro al mese, e non nominava
// nessuna delle undici pagine di settore ne' una sola pagina inglese — 36
// URL del sito su 56 mancavano all'appello. Ora e' generato dalle stesse
// sorgenti uniche delle pagine, come /llms-full.txt: un prezzo che cambia si
// riscrive da se', un settore nuovo entra da se'.

export const dynamic = 'force-static'

const url = (percorso: string) => `${SITE_URL}${percorso === '/' ? '' : percorso}`

function sezione(titolo: string, righe: string[]): string {
  return `## ${titolo}\n\n${righe.join('\n')}\n`
}

/** Voce dell'elenco pagine nel formato previsto dallo standard. */
const voce = (titolo: string, percorso: string, descrizione: string) =>
  `- [${titolo}](${url(percorso)}): ${descrizione}`

const SERVIZI: Array<[string, string, string]> = [
  ['Gestione social media', '/servizi/gestione-social-media', `Piano editoriale, produzione, approvazione e pubblicazione su 2 canali. Presenza ${PREZZI.presenza}, Crescita ${PREZZI.crescita}.`],
  ['Segretaria telefonica AI', '/servizi/segretaria-telefonica-ai', `Risponde con le informazioni approvate, propone gli orari liberi e fissa l’appuntamento. Piani ${PREZZI.voce}, da 300 a 1500 minuti.`],
  ['Agenda, clienti e WhatsApp', '/servizi/agenda-clienti-whatsapp', `Trova chi non torna e gli orari rimasti liberi, prepara i messaggi e li lascia da approvare. ${PREZZI.agenda}, 1000 invii inclusi.`],
  ['Siti web e landing page', '/servizi/siti-e-commerce', `Landing e siti base mobile-first, ${PREZZI.web}. Dopo 12 mesi di canone il progetto è del cliente.`],
  ['Riprese video in azienda', '/servizi/video-produzione', `Sessioni di ripresa con fotografo, luci e ottiche. Pacchetti mensili ${PREZZI.video}, da 5 a 20 video.`],
  ['Blog SEO + GEO', '/servizi/blog-seo', `12 articoli al mese con piano editoriale e controllo umano, ${PREZZI.blog}.`],
  ['SEO e GEO', '/servizi/seo-geo', 'Struttura delle pagine, intenti di ricerca e leggibilità per i sistemi di risposta AI. Su preventivo, dopo audit.'],
  ['Ricerca clienti B2B', '/servizi/ricerca-clienti-b2b', `Fino a 30 aziende analizzate su fonti pubbliche verificate, ${PREZZI.b2b}. Nessun invio automatico.`],
  ['Rapportini di intervento', '/servizi/gestione-lavorazioni', 'Sito, applicazione di campo e pannello ufficio per rapporti di intervento con foto, ore e firma del cliente. Su preventivo.'],
  ['Automazione e gestionali', '/servizi/automazione-gestionali', 'Collegamento fra gestionale, CRM, moduli e archivi, e automazione dei passaggi manuali ricorrenti. Su preventivo.'],
  ['Consulenza AI Act e GDPR', '/consulenza', `Consulenza legale con ${TITOLARE.partnerLegale}. ${PREZZO_INGRESSO.legale}.`],
]

const ISTITUZIONALI: Array<[string, string, string]> = [
  ['Home', '/', 'Il percorso completo: sito, contenuti, risposta al telefono e agenda, con il prezzo d’ingresso di ogni passo.'],
  ['Servizi', '/servizi', 'Elenco di tutti i servizi con prezzo d’ingresso e collegamento alla pagina dedicata.'],
  ['Pacchetti', '/pacchetti', 'Listino completo: pacchetti social, piani vocali, agenda, video e servizi a consumo, IVA esclusa.'],
  ['Settori', '/settori', 'Le undici categorie servite, ognuna con la propria pagina e il proprio prezzo d’ingresso.'],
  ['Metodo', '/metodo', 'Come si lavora: analisi, piano, produzione, approvazione del cliente, pubblicazione e misura.'],
  ['FAQ', '/faq', 'Domande frequenti su prezzi, tempi, proprietà dei contenuti, disdetta e trattamento dei dati.'],
  ['Chi siamo', '/chi-siamo', 'Chi c’è dietro il servizio, come è nato e che cosa non facciamo.'],
  ['Marco Dibenedetto', '/autore/marco-dibenedetto', 'Profilo dell’autore dei contenuti e responsabile del servizio, con le aree di competenza.'],
  ['Contatti', '/contatti', 'Email, PEC, telefono e WhatsApp, con i tempi di risposta dichiarati.'],
  ['SWA Journal', '/blog', 'Articoli su gestione social, SEO e GEO, AI Act e organizzazione del lavoro per PMI.'],
  ['Trasparenza AI', '/trasparenza-ai', 'Dove interviene l’intelligenza artificiale, dove decide una persona e come sono etichettati i contenuti.'],
  ['Privacy', '/privacy', 'Informativa sul trattamento dei dati personali ai sensi del GDPR.'],
  ['Termini', '/termini', 'Condizioni generali di servizio, durata, rinnovo e limiti di responsabilità.'],
  ['Recesso', '/recesso', 'Chi ha diritto di recesso, entro quando e con quale procedura.'],
  ['Cookie policy', '/cookie-policy', 'Cookie tecnici e di misurazione utilizzati e come revocare il consenso.'],
]

export function GET() {
  // Il nome del piano porta gia' la famiglia («Agenda e clienti», «Voce Base»):
  // anteporla di nuovo produceva «Agenda e clienti Agenda e clienti: 390 €».
  const voceListino = SEGRETARIA_LISTINO.flatMap(f =>
    f.piani.map(p => `- ${p.nome}: ${p.canone} € al mese, ${p.soglia}.`),
  )

  // I servizi a listino vengono dalla sorgente unica: quando ne entra uno nuovo
  // — il sito impresa e l'apertura dei profili sono arrivati dopo — compare qui
  // da se', invece di restare fuori finche' qualcuno non se ne accorge.
  const ALTRI_A_LISTINO: StandaloneService['slug'][] = ['web-impresa', 'profili-social-gbp']
  const altriListino = ALTRI_A_LISTINO
    .map(slug => STANDALONE_SERVICES.find(s => s.slug === slug))
    .filter((s): s is StandaloneService => Boolean(s))
    .map(s => `- ${s.name}: ${s.pricePrefix ? `${s.pricePrefix} ` : ''}${s.displayPrice.replace('€', '')} € ${s.cadenceLabel}.`)

  const testo = [
    `# ${TITOLARE.brand}`,
    '',
    `> Servizi digitali per PMI e professionisti italiani: gestione social, siti web, risposta telefonica AI, agenda e recupero clienti, riprese video, SEO e GEO. Prezzi pubblici.`,
    '',
    sezione('Identità', [
      `- Nome commerciale: ${TITOLARE.brand}`,
      `- Impresa: ${TITOLARE.ragioneSociale}`,
      `- Fondatore e responsabile: Marco Dibenedetto`,
      `- Sede: ${TITOLARE.sedeLegale}`,
      `- Area servita: Italia; assistenza e contenuti anche in inglese`,
      `- Partita IVA: ${TITOLARE.partitaIva}`,
      `- Sito canonico: ${SITE_URL}`,
      `- Contatti: ${TITOLARE.email} · PEC ${TITOLARE.pec} · ${TITOLARE.telefono}`,
      `- Partner legale: ${TITOLARE.partnerLegale}`,
    ]),
    sezione('Come lavoriamo', [
      '- Ogni contenuto passa dall’approvazione del cliente prima di essere pubblicato o inviato.',
      '- L’intelligenza artificiale supporta analisi e produzione; la decisione editoriale resta umana.',
      '- I prezzi sono pubblici e IVA esclusa; non esistono listini riservati.',
      '- Non promettiamo vendite, contatti o posizionamenti: mettiamo per iscritto che cosa fa il servizio.',
      '- I dati e i contenuti dei clienti non vengono usati per addestrare modelli.',
    ]),
    sezione('Listino', [
      ...PACCHETTI.map(p => `- ${p.nome}: ${p.prezzo.replace('€', '')} € al mese. ${p.sottotitolo}`),
      `- Blog SEO + GEO: ${PREZZI.blog} per 12 articoli, con piano editoriale e controllo umano.`,
      `- Sito web e landing: ${PREZZI.web}. Dopo 12 mesi di canone il progetto è del cliente.`,
      `- Ricerca clienti B2B: ${PREZZI.b2b}, fino a 30 aziende da fonti pubbliche verificate.`,
      ...altriListino,
      ...voceListino,
      ...VIDEO_PACCHETTI.map(v => `- Video ${v.nome}: ${v.prezzo} € al mese, ${v.video} video in ${v.sessioni} ${v.sessioni === 1 ? 'sessione' : 'sessioni'} di ripresa.`),
      `- SEO e GEO, gestione lavorazioni, automazione dei gestionali: su preventivo, dopo audit.`,
      `- Consulenza legale AI Act e GDPR: ${PREZZO_INGRESSO.legale}.`,
      '',
      'Nei piani social il setup è compreso. I servizi vocali e di agenda hanno un avvio una tantum indicato prima dell’attivazione. Numero telefonico, traffico dell’operatore, costi delle piattaforme di messaggistica e budget pubblicitario restano fuori dal canone.',
    ]),
    sezione('Servizi', SERVIZI.map(([t, p, d]) => voce(t, p, d))),
    sezione('Settori', SETTORI.map(s => voce(s.nome, `/settori/${s.slug}`, s.sommario))),
    sezione('Pagine principali', ISTITUZIONALI.map(([t, p, d]) => voce(t, p, d))),
    sezione('Articoli', SWA_BLOG_ARTICLES.map(a => voce(a.h1 ?? a.meta_title ?? a.slug, `/blog/${a.slug}`, a.meta_description ?? a.intro ?? ''))),
    sezione('English', [
      ...Object.entries(COPPIE_LINGUA)
        .filter(([it]) => !it.startsWith('/settori/') && !it.startsWith('/blog/'))
        .map(([, en]) => `- ${url(en)}`)
        .filter((riga, i, tutte) => tutte.indexOf(riga) === i),
      ...SETTORI_EN.map(s => `- ${url(`/en/settori/${s.slug}`)} — ${s.nome}`),
      ...SWA_BLOG_ARTICLES_EN.map(a => `- ${url(`/en/blog/${a.slug}`)} — ${a.h1}`),
    ]),
    sezione('Corpus completo', [
      `- Contenuto integrale in un file solo: ${url('/llms-full.txt')}`,
      '  Comprende listino, pacchetti, piani vocali, tutte le pagine di settore con le',
      '  relative domande frequenti e il testo degli articoli.',
      `- Mappa del sito: ${url('/sitemap.xml')}`,
      `- Feed del Journal: ${url('/blog/feed.xml')}`,
    ]),
  ].join('\n')

  return new Response(testo, {
    headers: {
      'content-type': 'text/plain; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  })
}
