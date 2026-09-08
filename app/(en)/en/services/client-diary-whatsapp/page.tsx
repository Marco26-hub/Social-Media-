import type { Metadata } from 'next'
import SegretariaLanding, { type ContenutoLanding } from '@/components/SegretariaLanding'
import { anteprimaOg } from '@/lib/anteprima'
import { metodoServizioEn } from '@/lib/metodo.en'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SITE_URL } from '@/lib/site-config'

const path = '/en/services/client-diary-whatsapp'
const title = 'Bring clients back and fill the diary with WhatsApp | SWA'
const description =
  'The system reads the diary and the history, finds who stopped coming and drafts the message. Nothing is sent without your yes. From €390 per month.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['client recall', 'fill the diary', 'WhatsApp reminders', 'dormant clients', 'appointment recovery'],
  alternates: {
    canonical: `${SITE_URL}${path}`,
    languages: {
      'it-IT': `${SITE_URL}/servizi/agenda-clienti-whatsapp`,
      en: `${SITE_URL}${path}`,
      'x-default': `${SITE_URL}/servizi/agenda-clienti-whatsapp`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', locale: 'en_US', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

const contenuto: ContenutoLanding = {
  path,
  briciola: 'Diary, clients and WhatsApp',
  occhiello: 'Diary, clients and WhatsApp',
  h1: 'Clients who stop coming are not lost. They just need calling back.',
  lead: 'The system reads the diary and the history, finds who has been missing too long and who could cover the slot that opened on Friday. It drafts the message and leaves it waiting: it goes out only after your yes.',
  descrizione: description,
  servizio: 'Diary, clients and WhatsApp',
  tipoServizio: 'Client recall and diary-filling service with approved messages',
  waTesto: 'Hello! I would like a call about Diary, clients and WhatsApp.',
  foto: '/segretaria-ai-hero.webp',
  consolePrima: 'Today’s opportunities',
  console: [
    ['Diary', 'Free slot on Friday at 15:30', 'Suggests the clients who could take it'],
    ['Recall', 'Course stopped three months ago', 'Message ready, waiting for your yes'],
  ],
  consoleCta: 'Check the messages ready',
  chiarezza: {
    occhiello: 'In plain words',
    h2: 'The greatest value is already in your records.',
    intro: 'Finding a new client costs money. Bringing back one who already knows you costs far less, but it requires remembering them at the right moment — and that is exactly what nobody has time to do.',
    voci: [
      ['It sees who is missing', 'Long absences, courses left half done, follow-ups never made: they come out of the history on their own.'],
      ['It sees the gaps', 'A free slot tomorrow is not a problem if you know who to call to fill it.'],
      ['It writes for you', 'The message arrives ready and personal. All that is left for you is to read it and decide.'],
    ],
  },
  dichiarazione: {
    occhiello: 'No message goes out without your yes.',
    h2: 'The system prepares the work. Who decides what reaches your clients is still you.',
  },
  funzioni: {
    occhiello: 'What it actually does',
    h2: 'It prepares the day’s work, it does not carry it out behind your back.',
    intro: 'Every morning you find a few clear actions, ordered by priority, each with the reason written next to it. No automation firing without you.',
    voci: [
      ['It checks every day', 'It reads the clients, the appointments and the free slots in the system.'],
      ['It orders by priority', 'It shows who to contact first and explains why it is suggesting them.'],
      ['It drafts the messages', 'Personal text, not the same for everyone. You read them and choose which to send.'],
      ['It records the outcomes', 'Replies, recovered appointments and filled slots stay tracked.'],
    ],
  },
  flusso: {
    occhiello: 'The full flow',
    h2: 'From a still archive to a diary that fills up.',
    passi: ['Reads diary and history', 'Finds the opportunities', 'Writes the messages', 'You approve', 'Measures the replies'],
    chiusura: 'Every step stays visible: which message went out, to whom, when and what they replied. Consent and the ability to opt out are recorded.',
  },
  pannello: {
    occhiello: 'One screen, few decisions',
    h2: 'Open it. Check. Approve.',
    testo: 'From your phone you see the day’s opportunities and the messages ready. Your staff carry on exactly as before: the only thing that changes is that somebody notices the clients who are quietly disappearing.',
    vedi: ['Who to contact, with the reason', 'The slots left free', 'The messages ready to approve', 'The replies and appointments obtained'],
    righe: [
      ['Restart the interrupted course', 'Messages ready, waiting for your yes'],
      ['Fill Friday’s free slot', 'Suitable clients already selected'],
    ],
  },
  passo: {
    n: 4,
    titolo: 'The diary',
    primaHref: '/en/services/ai-phone-assistant',
    primaLabel: 'the phone',
  },
  avvio: {
    occhiello: 'How it starts',
    h2: 'Running in four steps.',
    passi: metodoServizioEn('agenda-clienti-whatsapp').map(f => [f.title, f.text] as const),
  },
  settori: {
    occhiello: 'For businesses that work by appointment',
    h2: 'Useful anywhere a client can stop coming back without telling you.',
    voci: [
      ['Beauty salons', 'Half-finished packages, seasonal follow-ups, clients gone after the summer.', '/en/settori/centri-estetici'],
      ['Aesthetic clinics', 'Follow-ups, check-ups and continuity of treatment plans.', '/en/settori/cliniche-estetiche'],
      ['Hairdressers and barbers', 'Broken rhythms and clients thinning out without saying anything.', '/en/settori/parrucchieri'],
      ['Dental practices', 'Hygiene appointments to recall and quoted treatments never started.', '/en/settori/studi-dentistici'],
      ['Physiotherapy and osteopathy', 'Cycles interrupted halfway and sessions never resumed.', '/en/settori/fisioterapia-osteopatia'],
      ['Garages and local services', 'Services, deadlines and periodic maintenance.', '/en/settori/officine-e-servizi-locali'],
    ],
  },
  citta: ['Milan', 'Rome', 'Turin', 'Bologna', 'Florence', 'Naples', 'Verona', 'Como'],
  listino: {
    occhiello: 'Pricing',
    h2: 'Two plans: diary only, or diary plus phone.',
    intro: 'The first drafts the messages and helps you fill the free slots. The second adds the phone assistant, so people looking for you get an answer and people who stopped looking get contacted.',
    famiglia: SEGRETARIA_LISTINO.find(f => f.id === 'agenda')!,
  },
  faq: [
    ['Do the messages send themselves?', 'No, never. The system prepares drafts and queues them: no message reaches a client without your explicit approval.'],
    ['What happens to someone who no longer wants to be contacted?', 'They are excluded and stay excluded. Consent and opt-out are recorded in the system, and contacts without documented consent never enter the lists.'],
    ['Do we have to change our management software?', 'No. We import clients and diary from a file or from the system already in use. If a particular connection is needed we assess it first, and it is not included automatically.'],
    ['How many messages are included?', 'One thousand approved sends a month. Beyond that they cost €0.10 each, plus any charges applied by Meta, which stay separate from the fee.'],
    ['Do you guarantee a number of recovered clients?', 'No. The system finds the opportunities and prepares the work; how many come back also depends on your offer, the season and the relationship you have with them. Anyone promising a number does not know what they are talking about.'],
    ['How is this different from an advertising campaign?', 'Here we are not looking for new clients: we start again from the ones already in your records. It costs less and has different response rates, because those people already know you.'],
  ],
  gemella: {
    href: '/en/services/ai-phone-assistant',
    occhiello: 'The other half of the job',
    h2: 'And the people who call and find nobody?',
    testo: 'Filling the gaps helps little if the phone rings out during treatments. The AI phone assistant answers, informs and books for you. The two services are often used together.',
    cta: 'See the AI phone assistant',
  },
}

export default function Page() {
  return <SegretariaLanding c={contenuto} locale="en" />
}
