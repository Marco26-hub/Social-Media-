import type { Metadata } from 'next'
import SegretariaLanding, { type ContenutoLanding } from '@/components/SegretariaLanding'
import { anteprimaOg } from '@/lib/anteprima'
import { metodoServizioEn } from '@/lib/metodo.en'
import { SEGRETARIA_LISTINO } from '@/lib/segretaria-listino'
import { SITE_URL } from '@/lib/site-config'

// La gemella inglese della pagina VOCE.
//
// Usa la stessa landing dell'italiana, che ora accetta la lingua: le etichette
// fisse — intestazioni di tabella, briciole, pulsanti — erano l'unica ragione
// per cui questa pagina non poteva esistere.

const path = '/en/services/ai-phone-assistant'
const title = 'AI phone assistant that answers and books | SWA'
const description =
  'An AI phone assistant that answers when you cannot: it gives services and opening hours, books appointments and hands the call to a person. From €199 per month.'

export const metadata: Metadata = {
  title,
  description,
  keywords: ['AI phone assistant', 'AI receptionist', 'automated appointment booking', 'voice assistant', 'missed calls'],
  alternates: {
    canonical: `${SITE_URL}${path}`,
    languages: {
      'it-IT': `${SITE_URL}/servizi/segretaria-telefonica-ai`,
      en: `${SITE_URL}${path}`,
      'x-default': `${SITE_URL}/servizi/segretaria-telefonica-ai`,
    },
  },
  openGraph: { title, description, url: `${SITE_URL}${path}`, type: 'website', locale: 'en_US', images: anteprimaOg(path) },
  twitter: { card: 'summary_large_image', title, description, images: anteprimaOg(path) },
}

const contenuto: ContenutoLanding = {
  path,
  briciola: 'AI phone assistant',
  occhiello: 'AI phone assistant',
  h1: 'It answers the phone even when you cannot.',
  lead: 'Whoever calls always gets an answer: services, prices, opening hours and availability, using the information you approved. It books, moves and cancels appointments, and when a request is delicate it hands the call to a person.',
  descrizione: description,
  servizio: 'AI phone assistant',
  tipoServizio: 'Automated phone answering and appointment booking service',
  waTesto: 'Hello! I would like a call about the AI phone assistant.',
  foto: '/segretaria-ai-hero.webp',
  consolePrima: 'Call in progress',
  console: [
    ['On the line', 'Asking for a first appointment', 'Reads the free slots and offers one'],
    ['Handover', 'Request outside the rules', 'Transfers to a person'],
  ],
  consoleCta: 'Open the call log',
  chiarezza: {
    occhiello: 'In plain words',
    h2: 'The phone no longer rings out.',
    intro: 'In a business that works by appointment, a missed call is almost always a missed appointment. Whoever gets no answer calls the next name on the list.',
    voci: [
      ['It always answers', 'While you are with a client, outside opening hours, and on closing days too.'],
      ['It only says true things', 'Services, prices and hours are written by you in the dashboard: the assistant does not invent and does not improvise.'],
      ['It knows when to stop', 'Delicate or unforeseen requests are handed to a person, not handled by guesswork.'],
    ],
  },
  dichiarazione: {
    occhiello: 'When you cannot answer, it does.',
    h2: 'The caller gets help immediately. You find the request and the appointment in the dashboard.',
  },
  funzioni: {
    occhiello: 'What it actually does',
    h2: 'It handles the repetitive calls, without taking control away from you.',
    intro: 'The questions you get a hundred times a month — how much is it, what time do you open, do you have space on Thursday — do not need you. Everything else does, and it stays with you.',
    voci: [
      ['It greets the caller', 'It introduces itself with your business name, in the voice and with the opening line you chose.'],
      ['It informs', 'Services, prices, hours and rules: only the ones you approved in the dashboard.'],
      ['It books', 'It reads the connected calendar, offers the slots that are genuinely free and saves only after confirmation.'],
      ['It routes and forwards', 'It understands what the call is about and passes it to the right person, following the rules you wrote.'],
      ['It transcribes everything', 'Every call leaves a transcript and a summary: you no longer replay voicemail to work out who called.'],
      ['It closes the loop', 'When the call ends it records the outcome and updates what needs updating, with nobody retyping anything.'],
    ],
  },
  flusso: {
    occhiello: 'The full flow',
    h2: 'From the phone call to the confirmed appointment.',
    passi: ['Takes the call', 'Understands the request', 'Checks the calendar', 'Books or routes', 'Transcribes and logs'],
    chiusura: 'Every call leaves a trace: what was asked, what was answered and whether the appointment was booked. You can read it back whenever you like.',
  },
  pannello: {
    occhiello: 'One screen, few decisions',
    h2: 'Open it. Check. Correct.',
    testo: 'From your phone you see the calls handled, the appointments booked and the requests passed to staff. If an answer does not convince you, you change it and from then on the new one applies.',
    vedi: ['The calls handled and their outcome', 'The appointments booked', 'The requests passed to a person', 'The answers to correct'],
    righe: [
      ['Out-of-hours call handled', 'Appointment offered and confirmed'],
      ['Unforeseen request', 'Transferred to the number given'],
    ],
  },
  passo: {
    n: 3,
    titolo: 'The phone',
    primaHref: '/en/services/social-media-management',
    primaLabel: 'the content',
    poiHref: '/en/services/client-diary-whatsapp',
    poiLabel: 'who remembers the clients',
  },
  avvio: {
    occhiello: 'How it starts',
    h2: 'Live in four steps.',
    passi: metodoServizioEn('segretaria-telefonica-ai').map(f => [f.title, f.text] as const),
  },
  settori: {
    occhiello: 'For businesses that work by appointment',
    h2: 'Useful every time a missed call becomes lost work.',
    voci: [
      ['Beauty salons', 'Calls during treatments, when nobody can answer.', '/en/settori/centri-estetici'],
      ['Aesthetic clinics', 'First enquiries, bookings and follow-up checks.', '/en/settori/cliniche-estetiche'],
      ['Hairdressers and barbers', 'The phone ringing while your hands are busy.', '/en/settori/parrucchieri'],
      ['Dental practices', 'Bookings, changes and last-minute cancellations.', '/en/settori/studi-dentistici'],
      ['Physiotherapy and osteopathy', 'Sessions to book and requests to pass to the practice.', '/en/settori/fisioterapia-osteopatia'],
      ['Garages and local services', 'Quotes, hours and availability asked over the phone.', '/en/settori/officine-e-servizi-locali'],
    ],
  },
  citta: ['Milan', 'Rome', 'Turin', 'Bologna', 'Florence', 'Naples', 'Verona', 'Como'],
  listino: {
    occhiello: 'Pricing',
    h2: 'Three plans, based on how much the phone rings.',
    intro: 'The difference is the minutes included: what counts is the conversations handled, not the calls received. If you do not know where to start, you begin with the smallest plan and move up without rebuilding the assistant.',
    famiglia: SEGRETARIA_LISTINO.find(f => f.id === 'voce')!,
  },
  faq: [
    ['Does it replace my receptionist?', 'No. It handles the repetitive calls and the ones that would otherwise be lost. Delicate or unforeseen requests are passed to a person, and the decisions stay with the practice.'],
    ['How are the minutes counted?', 'What counts is the recorded duration of the conversations the assistant handled, not the number of calls. Rounding and the monthly reset date are written in the proposal.'],
    ['Which plan if I do not know my minutes?', 'During the call we estimate monthly calls from the traffic on your current number. You can start with the smallest plan and move up without recreating the assistant.'],
    ['Does the caller understand it is an assistant?', 'Yes, and we say so: the assistant introduces itself as one. Hiding that someone is speaking to an automated system is not a choice we recommend, legally or for the relationship with the client.'],
    ['Is the phone number included?', 'No. The number and the carrier traffic stay separate from the fee and are stated in the proposal before activation.'],
    ['Can I hear how it answers before activating it?', 'Yes. Before connecting the number we prepare recordings you can listen to and have corrected.'],
  ],
  gemella: {
    href: '/en/services/client-diary-whatsapp',
    occhiello: 'The other half of the job',
    h2: 'The phone is solved. What about the half-empty diary?',
    testo: 'Answering calls only fills the gaps left by people who look for you. The ones who stopped calling — courses left half done, clients gone for months — have to be contacted. That is the other service, and the two are often used together.',
    cta: 'See Diary, clients and WhatsApp',
  },
}

export default function Page() {
  return <SegretariaLanding c={contenuto} locale="en" />
}
