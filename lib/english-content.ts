import { BLOG_SERVICE } from '@/lib/blog-service'
import { TITOLARE } from '@/lib/legal-config'
import { PACCHETTI } from '@/lib/pacchetti'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'
import { PREZZO_INGRESSO } from '@/lib/prezzi-ingresso'
import { SETTORI } from '@/lib/settori'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'

const presence = PACCHETTI[0]
const growth = PACCHETTI[1]
const webService = STANDALONE_SERVICES.find(service => service.slug === 'web-commerce')
const leadPilot = STANDALONE_SERVICES.find(service => service.slug === 'lead-pilot')

export const EN_WHATSAPP_URL = `https://wa.me/393477196603?text=${encodeURIComponent('Hello, I would like to discuss Social Web Automation services.')}`

export const EN_PRICE_LABELS = {
  presence: `${presence.prezzo} / month`,
  growth: `${growth.prezzo} / month`,
  blog: `${BLOG_SERVICE.displayPrice.replace(',', '.')} / month`,
  web: `From ${webService?.displayPrice.replace(',', '.') ?? '€19.90'} / month`,
  leadPilot: `${leadPilot?.displayPrice ?? '€149'} one-off`,
  video: `From €${VIDEO_PACCHETTI[0].prezzo} / month`,
  // «minuti» restava in italiano su una pagina inglese.
  legal: PREZZO_INGRESSO.legale.replace('150 €', '€150').replace('minuti', 'minutes'),
} as const

export const EN_COMPANY = {
  name: TITOLARE.ragioneSociale,
  brand: TITOLARE.brand,
  founder: 'Marco Dibenedetto',
  location: 'Cermenate (CO), Italy',
  vat: `VAT IT${TITOLARE.partitaIva}`,
  email: TITOLARE.email,
  pec: TITOLARE.pec,
  phone: TITOLARE.telefono,
  address: TITOLARE.sedeLegale,
  serviceAreas: [
    'Province of Como',
    'Metropolitan City of Milan',
    'Monza and Brianza',
    'Province of Varese',
    'Remote projects across Italy',
  ],
  sectorCount: SETTORI.length,
}

export const EN_METHOD_STEPS = [
  {
    n: '01',
    title: 'Baseline assessment',
    text: 'We collect goals, offer details, audience, channels, assets and available data. The aim is to separate useful work from operational noise.',
    items: ['Brand and channel audit', 'Commercial priorities', 'Constraints and responsibilities'],
  },
  {
    n: '02',
    title: 'Shared direction',
    text: 'The assessment becomes messaging, editorial themes, calendars, pages and measurement criteria. Scope is agreed before production begins.',
    items: ['Monthly plan', 'Roles and deadlines', 'Measurement criteria'],
  },
  {
    n: '03',
    title: 'Production and approval',
    text: 'Copy, visuals, videos and pages follow the same direction. Human review protects tone, accuracy and editorial accountability.',
    items: ['Coordinated production', 'Tracked revisions', 'Approval before publication'],
  },
  {
    n: '04',
    title: 'Publishing and improvement',
    text: 'We schedule, measure and read the useful signals. The next cycle starts from evidence, not isolated impressions.',
    items: ['Controlled publishing', 'Readable reporting', 'Next priorities'],
  },
]

export const EN_FAQ_GROUPS = [
  {
    title: 'Service and process',
    items: [
      { q: 'Is Social Web Automation software or a managed service?', a: 'It is a managed service. The client portal simplifies approvals and results, while strategy, production and publishing are handled by the Social Web Automation team.' },
      { q: 'Can I approve content before it is published?', a: 'Yes. The process includes review and approval before publication, with the number of revisions defined in the selected package.' },
      { q: 'Which companies do you work with?', a: 'We mainly support SMEs, local businesses and professionals that need coordinated social content, website work, organic visibility and practical commercial research.' },
    ],
  },
  {
    title: 'Packages and costs',
    items: [
      { q: 'How much does managed social media cost?', a: `Presence costs ${EN_PRICE_LABELS.presence}: 16 pieces for each of 2 social channels, or 32 publications. Growth costs ${EN_PRICE_LABELS.growth}: 24 pieces for each of 2 channels, or 48 publications, plus one SEO + GEO article and competitor analysis. VAT excluded.` },
      { q: 'Do the plans include paid advertising?', a: 'No. Presence and Growth are organic publishing plans. Paid campaigns are agreed separately, and the media budget paid to platforms remains separate from the service fee.' },
      { q: 'Can you build a custom setup?', a: 'Yes. Multiple brands, higher volumes, automation, e-commerce, video production and integrations are assessed and priced after an initial review.' },
    ],
  },
  {
    title: 'SEO, GEO and technology',
    items: [
      { q: 'Do SEO and GEO guarantee rankings or AI citations?', a: 'No. We improve structure, quality, discoverability and citability, but no one can guarantee a Google position or a citation from AI systems.' },
      { q: 'Do you use artificial intelligence?', a: 'Yes, as support for analysis and production. Direction, verification and editorial responsibility remain human.' },
      { q: 'Do you build websites and e-commerce?', a: `${EN_PRICE_LABELS.web} covers a simple landing page or essential website. E-commerce, catalogues and advanced features are assessed and quoted separately.` },
    ],
  },
  {
    title: 'Legal and AI compliance',
    items: [
      { q: 'Who provides legal consulting?', a: 'Legal consulting is provided by Avv. Vincenzo Sapone, Cassazionista, from Studio Legale BCS, an external qualified professional.' },
      { q: 'Is legal consulting included in the social packages?', a: 'No. Legal consulting is separate from marketing services and is booked according to the specific case.' },
    ],
  },
]

// FAQ propria della pagina metodo. Prima rendeva EN_FAQ_GROUPS[0], cioe' le
// stesse tre domande di /en/faq parola per parola: 21,9% di sovrapposizione
// fra due pagine che devono rispondere a bisogni diversi. Qui si parla solo
// di come scorre il ciclo, non di che cosa comprende il servizio.
export const EN_METHOD_FAQ = [
  {
    q: 'What happens in the first month?',
    a: 'The cycle opens with the review that produces the monthly plan: objectives, roles, deadlines and the criteria used to judge the work. Production starts once that plan is agreed, so the first published item follows the approval rather than the signature.',
  },
  {
    q: 'What do I have to do each month?',
    a: 'Two things: approve the plan at the start of the cycle, and approve the material before it goes out. Everything between those two points is handled on our side.',
  },
  {
    q: 'What happens if I do not approve something?',
    a: 'It is not published. The item goes back into production with your notes and returns for a second look; how many rounds are included depends on the package you selected.',
  },
  {
    q: 'How are the next priorities chosen?',
    a: 'From what the previous cycle actually produced. We read the measurable signals first and let them set the order of work, instead of restarting from impressions.',
  },
  {
    q: 'Is the method the same for every service?',
    a: 'The four stages are. What changes is what is produced inside them: social content, pages, articles, a research list or a workflow configuration.',
  },
]

export const EN_ABOUT_FAQ = [
  { q: 'Who is Social Web Automation?', a: `${EN_COMPANY.name} is based in ${EN_COMPANY.location}. It supports SMEs and professionals with social content, websites, search and AI discoverability, B2B research, phone response workflows and operational systems.` },
  { q: 'How many sectors do you cover?', a: `The Italian site currently covers ${EN_COMPANY.sectorCount} sector categories. The English section only shows the sector pages that are ready for English-speaking readers today.` },
  { q: 'Do you guarantee sales or rankings?', a: 'No. We guarantee process, included work, review points and deliverables. Rankings, AI citations, appointments and sales depend on external systems and market response.' },
]
