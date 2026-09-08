import { GIORNI_PROVA, PIANI_SALA, pianoSala } from '@/lib/ristoranti-listino'
import { CANONE_A_CARICO_CLIENTE_EN } from '@/lib/canone-incluso'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SETTORI_EN, EN_PRICES } from '@/lib/settori.en'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { motore, riconosciSettore, type Nodo } from '@/lib/odino/ricerca'

// ODINO in inglese.
//
// Ventotto pagine inglesi non avevano assistente: chi arrivava da fuori Italia
// trovava un sito che spiega tutto e nessuno a cui chiedere. I percorsi sono
// gli stessi dell'italiano e portano gli stessi identificatori, cosi' le
// continuazioni («poi») restano allineate fra le due lingue e una domanda
// aggiunta di qua si nota subito che manca di la'.
//
// I prezzi arrivano dalle stesse sorgenti uniche della versione italiana: il
// giorno che il listino cambia, cambiano tutte e due senza che nessuno debba
// ricordarsene. Un assistente inglese che cita una cifra vecchia sarebbe
// peggio di nessun assistente.

const euroEn = (valore: number) => `€${Number.isInteger(valore) ? valore : valore.toFixed(2)}`
const voce = (id: string) => SEGRETARIA_LISTINO.find(f => f.id === id)!
const pianoVoce = voce('voce').piani
const pianoAgenda = voce('agenda').piani
const canoneEn = (piano: { canone: number }) => `${euroEn(piano.canone)} per month`

// Le soglie e gli avvii sono scritti in italiano nella sorgente unica, perche'
// e' li' che vivono. Tradurli qui, invece di ricopiare le cifre, tiene ODINO
// inglese agganciato al listino: se cambia un minuto o un euro, cambia anche
// lui. Le cifre non si riscrivono mai a mano.
const inglese = (testo: string) => testo
  .replace(/(\d[\d.]*)\s*€/g, (_m, n: string) => `€${n.replace('.', ',')}`)
  .replace('minuti al mese', 'minutes a month')
  .replace('invii inclusi', 'messages included')
  .replace('minuti', 'minutes')
  .replace('invii', 'messages')
  .replace('una tantum', 'one-off')
  .replace(/^da /, 'from ')

// I nomi dei piani vocali e di agenda sono italiani nella sorgente unica.
// «Voce Attività» in mezzo a una risposta inglese si legge come una svista, e
// tradurli qui evita di duplicare il listino solo per il nome.
const NOMI_EN: Record<string, string> = {
  'Voce Base': 'Voice Basic',
  'Voce Attività': 'Voice Business',
  'Voce Azienda': 'Voice Company',
  'Agenda e clienti': 'Diary and clients',
  'Tutto in uno': 'All in one',
}
const nomeEn = (nome: string) => NOMI_EN[nome] ?? nome

export const NODI_EN: Nodo[] = [
  {
    id: 'da-dove-parto',
    domanda: 'Where should we start?',
    chiavi: ['start', 'begin', 'first step', 'getting started', 'advice', 'where do'],
    risposta: {
      titolo: 'With the most obvious gap, not the largest package.',
      testo:
        'There are four steps and none of them requires the others. The website brings the enquiries in, the content shows how you work, the phone assistant catches the people who call while you are busy, the diary brings back the clients who stopped coming. You start with whatever is costing you most today.',
      cifre: [
        { voce: '1. The website', valore: EN_PRICES.web, nota: 'Enquiries stay yours, not the portal’s' },
        { voce: '2. The content', valore: EN_PRICES.presenza, nota: '16 pieces a month on each of 2 channels' },
        { voce: '3. The phone', valore: EN_PRICES.voce, nota: 'It answers while you work' },
        { voce: '4. The diary', valore: EN_PRICES.agenda, nota: 'Clients missing for months come back into view' },
      ],
      link: [{ href: '/en/pricing', label: 'See the full price list' }],
      poi: ['quanto-costa-social', 'telefono-come-funziona', 'garantite-risultati'],
    },
  },
  {
    id: 'quanto-costa-social',
    domanda: 'What does managed social media cost?',
    chiavi: ['social', 'instagram', 'facebook', 'post', 'posts', 'content', 'how much'],
    risposta: {
      titolo: 'Two plans, published prices, VAT excluded.',
      testo:
        'The fee covers the people who plan, write, design and publish the content. Paid advertising budget, replying to comments and messages, and filming on site are not included: they have their own prices.',
      cifre: [
        { voce: 'Presence', valore: EN_PRICES.presenza, nota: 'Consistent presence across 2 social channels' },
        { voce: 'Growth', valore: EN_PRICES.crescita, nota: 'A wider system across 2 social channels' },
      ],
      link: [
        { href: '/en/services', label: 'What is included, item by item' },
        { href: '/en/pricing', label: 'Compare it with the other services' },
      ],
      poi: ['cosa-resta-fuori', 'chi-approva', 'garantite-risultati'],
    },
  },
  {
    id: 'telefono-come-funziona',
    domanda: 'How does the AI phone assistant work?',
    chiavi: ['phone', 'telephone', 'receptionist', 'calls', 'switchboard', 'answers', 'minutes', 'voice'],
    risposta: {
      titolo: 'It answers with the information you approved.',
      testo:
        'It gives the services, prices and opening hours you loaded, reads the calendar and books into the free slots. If a request falls outside the rules you set at the start, it takes the details and passes them to you. Whoever calls is told in the first sentence that they are speaking to an assistant.',
      cifre: pianoVoce.map(p => ({ voce: nomeEn(p.nome), valore: canoneEn(p), nota: inglese(p.soglia) })),
      link: [{ href: '/en/services', label: 'How it answers, in detail' }],
      poi: ['cosa-non-dice-assistente', 'quanto-costa-avvio', 'da-dove-parto'],
    },
  },
  {
    id: 'agenda-recupero',
    domanda: 'How do you bring back clients who stopped coming?',
    chiavi: ['diary', 'agenda', 'lost clients', 'recall', 'whatsapp', 'follow up', 'dormant'],
    risposta: {
      titolo: 'The system finds them and drafts the message. You send it.',
      testo:
        'Every day it reads the diary and the history, flags who has been missing too long and who could fill a slot that opened up, and prepares the message already written. It stays a draft until you approve it: no message reaches a client without your go-ahead.',
      cifre: pianoAgenda.map(p => ({ voce: nomeEn(p.nome), valore: canoneEn(p), nota: inglese(p.soglia) })),
      link: [{ href: '/en/services', label: 'How the recall works' }],
      poi: ['chi-approva', 'garantite-risultati', 'serve-cambiare-gestionale'],
    },
  },
  {
    id: 'video',
    domanda: 'What does filming cost?',
    chiavi: ['video', 'videos', 'filming', 'reel', 'reels', 'photographer', 'shoot', 'shooting'],
    risposta: {
      titolo: 'Monthly fees, with the filming session included.',
      testo:
        'We come to you with a photographer, lights and proper lenses. One session produces several weeks of material, because we film in a batch instead of one video at a time. Prices exclude VAT; travel inside the agreed area is included.',
      cifre: VIDEO_PACCHETTI.map(v => ({
        voce: v.nome,
        valore: `${euroEn(v.prezzo)} per month`,
        nota: `${v.video} videos in ${v.sessioni} session${v.sessioni > 1 ? 's' : ''}`,
      })),
      link: [{ href: '/en/services', label: 'How a session runs' }],
      poi: ['quanto-costa-social', 'cosa-resta-fuori'],
    },
  },
  {
    id: 'blog',
    domanda: 'What is the Blog service?',
    chiavi: ['blog', 'articles', 'writing', 'written content', 'editorial'],
    risposta: {
      titolo: '12 articles a month, written and reviewed.',
      testo:
        'Each article arrives complete with title tag, meta description, visible FAQs and structured data: ready to publish, not a draft to fix. The editorial plan comes from real search intent, not from a list of keywords.',
      cifre: [{ voce: 'Blog SEO + GEO', valore: EN_PRICES.blog, nota: `12 articles a month, ${BLOG_SERVICE.trialDays ?? 14} days to evaluate` }],
      link: [{ href: '/en/services', label: 'How the Blog service works' }],
      poi: ['farsi-trovare', 'quanto-costa-social', 'garantite-risultati'],
    },
  },
  {
    id: 'sito',
    domanda: 'What does a website cost?',
    chiavi: ['website', 'site', 'landing', 'page', 'web', 'ecommerce', 'e-commerce', 'online shop', 'hosting', 'domain', 'mail', 'mailbox', 'email'],
    risposta: {
      titolo: 'Two steps, and after 12 months the project is yours.',
      testo:
        `The fee covers hosting, maintenance, responsive design and essential technical SEO. ${CANONE_A_CARICO_CLIENTE_EN} The lower step is a landing page or an essential site; above it sits the company website built on the search intent of your sector. E-commerce, multilingual and unusual features are quoted separately and approved before any cost.`,
      cifre: [
        { voce: 'Basic website', valore: EN_PRICES.web, nota: 'Landing page or essential site, mobile-first' },
        { voce: 'Company website', valore: 'from €300 per month', nota: 'More pages, built on your sector’s search intent' },
      ],
      link: [{ href: '/en/services', label: 'What the website includes' }],
      poi: ['farsi-trovare', 'da-dove-parto', 'cosa-resta-fuori'],
    },
  },
  {
    id: 'farsi-trovare',
    domanda: 'How do you get us found on Google and by AI systems?',
    chiavi: ['google', 'seo', 'geo', 'found', 'ranking', 'search', 'chatgpt', 'engines', 'visibility'],
    risposta: {
      titolo: 'Structure, intent and readability. Not promised positions.',
      testo:
        'The work happens on three fronts: how the pages are built, what people searching for your service actually ask, and how quotable the text is for an AI answering system. Nobody controls Google’s algorithm or ChatGPT’s: we work on what can be governed, and the position is decided by others.',
      link: [{ href: '/en/services', label: 'SEO and GEO: what changes' }],
      poi: ['blog', 'garantite-risultati', 'sito'],
    },
  },
  {
    id: 'garantite-risultati',
    domanda: 'Do you guarantee results?',
    chiavi: ['guarantee', 'guaranteed', 'results', 'sales', 'promise', 'roi'],
    risposta: {
      titolo: 'No, and anyone promising them does not know what they are talking about.',
      testo:
        'We do not guarantee sales, appointments, Google positions or citations in AI answering systems. Those also depend on your offer, your price, the season and how you treat the people who contact you — things a supplier does not control. What we commit to is the process: material produced consistently, published after your approval, enquiries that get an answer. The proposal says exactly this.',
      link: [{ href: '/en/method', label: 'The method, step by step' }],
      poi: ['chi-approva', 'cosa-resta-fuori', 'disdetta'],
    },
  },
  {
    id: 'chi-approva',
    domanda: 'Who decides what gets published?',
    chiavi: ['approve', 'approval', 'control', 'publish', 'who decides', 'who approves', 'sign off'],
    risposta: {
      titolo: 'You do. Always, and before anything goes out.',
      testo:
        'Every piece of content passes your approval before publication, and every client message stays a draft until you give the go-ahead. AI speeds up analysis and production; the editorial decision and the responsibility stay with a person. Anything generated with AI is labelled where the law requires it.',
      link: [
        { href: '/en/method', label: 'The working cycle' },
        { href: '/trasparenza-ai', label: 'Where we use AI, and where we do not' },
      ],
      poi: ['garantite-risultati', 'dati-clienti'],
    },
  },
  {
    id: 'sala-ristorante',
    domanda: 'What does the restaurant system cost?',
    chiavi: ['restaurant', 'restaurants', 'bar', 'pizzeria', 'table', 'QR', 'menu', 'covers', 'waiter', 'bill', 'bookings', 'dining room'],
    risposta: {
      titolo: 'Two modules, and we keep no percentage of your takings.',
      testo:
        `The guest scans the QR at the table, orders and pays from their phone; bookings arrive in the same dashboard. The two modules can be bought separately. The money lands in the venue account and we keep no percentage: the fees are your own payment provider’s. One-off setup from ${euroEn(pianoSala('prenotazioni').attivazioneCents / 100)} to ${euroEn(pianoSala('ordini').attivazioneCents / 100)}, ${GIORNI_PROVA} days free with no card.`,
      cifre: PIANI_SALA.map(p => ({
        voce: p.chiave === 'prenotazioni' ? 'Bookings only' : p.chiave === 'ordini' ? 'Orders and payments' : 'Everything',
        valore: `${euroEn(p.canoneCents / 100)} per month`,
        nota: p.chiave === 'prenotazioni'
          ? 'Booking page for your site, calendar and confirmations.'
          : p.chiave === 'ordini'
            ? 'QR menu, table ordering, split bills, electronic invoicing.'
            : 'Orders, payments and bookings together.',
      })),
      link: [{ href: '/en/settori/ristoranti-e-bar', label: 'The table system for restaurants' }],
      poi: ['cosa-resta-fuori', 'da-dove-parto', 'disdetta'],
    },
  },
  {
    id: 'cosa-resta-fuori',
    domanda: 'What is not included in the fee?',
    chiavi: ['included', 'excluded', 'outside', 'extra', 'additional costs', 'domain', 'mail', 'mailbox', 'hosting', 'running costs'],
    risposta: {
      titolo: 'Whatever we do not collect ourselves.',
      testo:
        'Hosting is included in the fee: the project runs on our infrastructure and billing it separately would make no sense. What stays outside are the costs registered in your name: the domain and the mailboxes, which you pay to your own provider and keep even if you change agency. Also outside: the budget paid to advertising platforms, the phone number and the carrier traffic, and the charges applied by messaging platforms. We do not collect them, so we do not put them in the price and we do not resell them with a markup. Voice and diary services have a one-off setup cost, stated before activation.',
      link: [{ href: '/en/pricing', label: 'Price list with the exclusions' }],
      poi: ['quanto-costa-avvio', 'disdetta'],
    },
  },
  {
    id: 'quanto-costa-avvio',
    domanda: 'Is there a setup cost?',
    chiavi: ['setup', 'activation', 'onboarding', 'initial', 'one-off', 'upfront'],
    risposta: {
      titolo: 'Not on the social plans. On voice and diary yes, and it is stated first.',
      testo:
        'On the social plans setup is included in the fee. Voice and diary services have a one-off activation covering information gathering, configuration, connecting the diary and the number, recordings you can listen to and corrections until you approve. The figure is in the proposal before signing.',
      cifre: [...pianoVoce, ...pianoAgenda].map(p => ({ voce: nomeEn(p.nome), valore: inglese(p.avvio) })),
      poi: ['cosa-resta-fuori', 'disdetta'],
    },
  },
  {
    id: 'disdetta',
    domanda: 'How do we cancel?',
    chiavi: ['cancel', 'cancellation', 'terminate', 'withdraw', 'notice', 'lock-in', 'contract', 'duration'],
    risposta: {
      titolo: 'With the notice written in the contract, and there is an online procedure.',
      testo:
        'Fees are monthly and renew automatically unless cancelled. There is a dedicated page for withdrawal that records the date and time and issues a receipt you can keep, and it distinguishes between consumers and businesses because the rules differ.',
      link: [
        { href: '/recesso', label: 'Withdraw from the contract' },
        { href: '/termini', label: 'General terms' },
      ],
      poi: ['garantite-risultati'],
    },
  },
  {
    id: 'dati-clienti',
    domanda: 'What happens to my clients’ data?',
    chiavi: ['data', 'privacy', 'gdpr', 'security', 'processing', 'training'],
    risposta: {
      titolo: 'It stays yours, and it trains no model.',
      testo:
        'You remain the data controller. We process only the data the activated service needs, and client material is never used to train AI models. External providers are named one by one in the privacy notice, with the legal basis for every transfer outside the European Union. Deletion and export can be requested at any time, free of charge.',
      link: [
        { href: '/privacy', label: 'Full privacy notice' },
        { href: '/sicurezza', label: 'How we protect data' },
      ],
      poi: ['chi-approva'],
    },
  },
  {
    id: 'cosa-non-dice-assistente',
    domanda: 'What does the phone assistant NOT say?',
    chiavi: ['does not say', 'limits', 'what it answers', 'discounts', 'diagnosis', 'refuses'],
    risposta: {
      titolo: 'Everything you did not load into it.',
      testo:
        'It gives no clinical assessment, negotiates no discounts or trade-ins, and improvises no technical answer. In the cases you define at the start — a delicate question, an emergency, an unexpected request — it takes the name, number and reason and passes the call to a person. And it says it is an assistant in the first sentence.',
      link: [{ href: '/en/services', label: 'The handover rules' }],
      poi: ['telefono-come-funziona', 'garantite-risultati'],
    },
  },
  {
    id: 'serve-cambiare-gestionale',
    domanda: 'Do we have to change the software we use?',
    chiavi: ['software', 'system', 'change', 'integration', 'import', 'crm', 'management system'],
    risposta: {
      titolo: 'No. We start from what you use today.',
      testo:
        'Clients and diary are imported from a file or from the system already in use, even when they are split across different tools. If later you want the systems connected to each other that is integration work, which we quote after seeing it and which stays optional. Changing software in order to switch on a recall service is almost always an avoidable expense.',
      link: [{ href: '/en/services', label: 'When an integration is needed' }],
      poi: ['agenda-recupero', 'cosa-resta-fuori'],
    },
  },
  {
    id: 'settore',
    domanda: 'Do you work in my sector?',
    chiavi: ['sector', 'industry', 'category', 'trade', 'do you work with'],
    risposta: {
      titolo: `${SETTORI_EN.length} categories have a page of their own.`,
      testo:
        'Each page says what that trade needs and what is better left alone, with the entry price. If your sector is not listed the method does not change: what changes is what gets produced.',
      link: SETTORI_EN.map(s => ({ href: `/en/settori/${s.slug}`, label: s.nome })),
      poi: ['da-dove-parto', 'quanto-costa-social'],
    },
  },
  {
    id: 'metodo',
    domanda: 'How do you work, month by month?',
    chiavi: ['method', 'phases', 'process', 'how you work', 'workflow', 'report'],
    risposta: {
      titolo: 'Four phases, every month, always the same.',
      testo:
        'Assessment, direction, production, improvement. Each phase has an expected outcome and prepares the next, so strategy and production do not run on separate tracks. The decisions stay yours: we propose, you approve, and at the end of the month there is a report of what was done.',
      link: [{ href: '/en/method', label: 'The method, phase by phase' }],
      poi: ['chi-approva', 'da-dove-parto', 'garantite-risultati'],
    },
  },
  {
    id: 'ai-trasparenza',
    domanda: 'Do you use AI to write the content?',
    chiavi: ['AI', 'artificial intelligence', 'who writes', 'generated', 'automated', 'robot', 'chatgpt'],
    risposta: {
      titolo: 'Yes, and it is written down where.',
      testo:
        'We use AI tools in production and we declare it: art. 50 of the AI Act requires transparency, and the dedicated page says what is generated, what is verified and who approves. Nothing goes out without a person having read it, and nothing is published without your approval.',
      link: [
        { href: '/trasparenza-ai', label: 'Where we use AI, and where a person decides' },
        { href: '/en/faq', label: 'Frequently asked questions' },
      ],
      poi: ['chi-approva', 'dati-clienti', 'garantite-risultati'],
    },
  },
  {
    id: 'listino-completo',
    domanda: 'What does everything cost together?',
    chiavi: ['price list', 'pricing', 'how much in total', 'total cost', 'all the prices', 'full quote'],
    risposta: {
      titolo: 'There is no single price, and there is no surprise quote either.',
      testo:
        'Each service has its own fee and can be bought on its own: nobody has to take everything in order to take one thing. The full price list is public, with what is included and what stays outside. The total depends on what you actually need, and it is written down before we start.',
      cifre: [
        { voce: 'Managed social media', valore: EN_PRICES.presenza, nota: 'Presence, two channels' },
        { voce: 'Blog SEO + GEO', valore: EN_PRICES.blog, nota: 'Twelve articles a month' },
        { voce: 'Website', valore: EN_PRICES.web, nota: 'Landing page or essential site' },
      ],
      link: [{ href: '/en/pricing', label: 'The full price list' }],
      poi: ['cosa-resta-fuori', 'quanto-costa-avvio', 'da-dove-parto'],
    },
  },
  {
    id: 'pagamenti',
    domanda: 'How do we pay?',
    chiavi: ['payment', 'pay', 'invoice', 'bank transfer', 'card', 'annual', 'monthly', 'renewal', 'billing'],
    risposta: {
      titolo: 'A monthly fee, an invoice, and no surprise charges.',
      testo:
        'Fees are monthly and renew while the service is active; every payment has its invoice. Card payments go through an external provider: card details never pass through our systems. List prices exclude VAT, and any cost that is not the fee is written down and approved first, not charged afterwards.',
      link: [
        { href: '/en/pricing', label: 'Prices and conditions' },
        { href: '/termini', label: 'Terms and conditions' },
      ],
      poi: ['quanto-costa-avvio', 'cosa-resta-fuori', 'disdetta'],
    },
  },
  {
    id: 'parlare-con-persona',
    domanda: 'I want to talk to a person.',
    chiavi: ['person', 'human', 'call', 'contact', 'talk', 'speak', 'quote'],
    risposta: {
      titolo: 'WhatsApp is the fastest channel.',
      testo:
        'Write what you do and where you are losing time or enquiries today: that is enough to see which area is worth touching first, and which ones you can leave alone. No automatic quote and no surprise phone call.',
      link: [{ href: '/en/contact', label: 'Every channel and the response times' }],
      poi: ['da-dove-parto'],
    },
  },
]

export const MOTORE_EN = motore(NODI_EN)

export function settoreCitatoEn(testo: string) {
  return riconosciSettore(testo, SETTORI_EN)
}
