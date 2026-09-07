import { PREZZI, type Settore } from '@/lib/settori'

// English sector copy is rewritten, not translated line by line. The structure
// mirrors lib/settori.ts so pages can share the same component and pricing source.

export const SETTORI_EN: Settore[] = [
  {
    slug: 'imprese-di-pulizia',
    nome: 'Housekeeping and cleaning companies',
    sommario: 'Jobs are signed on site, reports leave immediately and repeat clients are easier to follow up.',
    titoloSeo: 'Housekeeping and cleaning company operations | SWA',
    descrizioneSeo:
      'Digital job reports, signed checklists, websites, phone support and client follow-up for cleaning and housekeeping teams in Italy.',
    eyebrow: 'Housekeeping and cleaning',
    h1: 'The work happens on site. The proof should not wait for the office.',
    lead:
      'For cleaning teams, the weakest point is rarely the work itself. It is the paperwork afterwards: photos, signatures, notes, hours and client follow-up spread across messages and memory.',
    servizio: 'Digital operations for housekeeping and cleaning companies',
    tipoServizio: 'Job reporting, client follow-up, website and phone response for cleaning and housekeeping teams',
    promessa:
      'Each job can close with photos, notes and a client signature, while recurring clients remain visible before the next service is due. We do not promise new contracts.',
    notaPrezzi: `Job reporting is quoted after scope. Website ${PREZZI.web}. Phone assistant ${PREZZI.voce}. Client agenda ${PREZZI.agenda}. Prices exclude VAT.`,
    segnali: ['Signed report on site', 'Photos and notes in one document', 'Recurring clients reviewed before they go cold'],
    risultati: [
      { title: 'Less office catch-up', text: 'The operator records the job while still on site, with photos, notes and signature attached to the same report.' },
      { title: 'Clearer client proof', text: 'When a client asks what was done, the answer is not buried in a chat thread: it is in a document linked to that job.' },
      { title: 'Better repeat work', text: 'Periodic cleaning, seasonal services and inactive clients come back into view through the monthly agenda workflow.' },
    ],
    cosaTitolo: 'What we put around the field work.',
    cosaIntro:
      'The system follows the real path of the job: request, assignment, work on site, signed report and follow-up.',
    cosaFacciamo: [
      { title: 'Digital job reports', text: 'Custom checklists for the services you provide, with rooms, tasks, anomalies, products used, notes and photos.' },
      { title: 'Client signature', text: 'The client signs on the phone at the end of the visit, so the report closes before the team leaves.' },
      { title: 'PDF delivery', text: 'The final report can be sent to the client and kept in the dashboard for later checks.' },
      { title: 'Recurring agenda', text: `Dormant clients, periodic services and open follow-ups are reviewed inside the agenda plan, ${PREZZI.agenda}.` },
      { title: 'Phone coverage', text: `The assistant answers routine calls, collects requests and routes exceptions. Entry plan: ${PREZZI.voce}.` },
      { title: 'A website that explains the service', text: `A fast mobile page for services, areas covered and contact requests. From ${PREZZI.web}.` },
    ],
    ciclo: [
      { number: '01', title: 'Map the jobs', text: 'We turn your recurring services into practical checklists instead of generic forms.' },
      { number: '02', title: 'Test on real work', text: 'The team uses the reports on actual jobs and we adjust what slows them down.' },
      { number: '03', title: 'Close on site', text: 'Photos, notes, hours and signature stay with the same job record.' },
      { number: '04', title: 'Review follow-ups', text: 'Open requests and repeat clients are reviewed on a monthly rhythm.' },
    ],
    faq: [
      { q: 'Is this only for large cleaning companies?', a: 'No. It is useful whenever more than one person needs to know what happened on site: owner, operator, office and client.' },
      { q: 'Can reports be customised?', a: 'Yes. The checklist is built around your real services, not around a generic inspection template.' },
      { q: 'Does it replace invoicing software?', a: 'No. It documents the work. Accounting and invoicing remain in your existing tools unless a separate integration is agreed.' },
      { q: 'Can clients receive the report?', a: 'Yes. The point is to make the completed work easy to inspect, approve and retrieve later.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Websites and automation' },
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'ristoranti-e-bar',
    nome: 'Restaurants and bars',
    sommario: 'QR ordering, table payments, bookings and a dining room that is easier to control.',
    titoloSeo: 'QR ordering and table payments for restaurants | SWA',
    descrizioneSeo:
      'Customers scan a table QR code, order and pay from their phone. Bookings, menus, live orders, websites and social content for restaurants in Italy.',
    eyebrow: 'Restaurants and bars',
    h1: 'The bill should not wait for someone to bring it.',
    lead:
      'In a busy dining room, the same time is lost again and again: taking orders, checking changes and closing bills. With a table QR, guests can order and pay from their phone.',
    servizio: 'QR ordering and table payment system for restaurants',
    tipoServizio: 'QR ordering, table payments, bookings, website and content for restaurants and bars',
    promessa:
      'Orders and payments move through the customer phone, bookings enter one dashboard and electronic invoicing can be handled from the flow. No promise on cover numbers.',
    notaPrezzi: 'Restaurant systems are quoted after scope: tables, menu, payment flow and integrations change the project. Payment fees are stated before activation. Prices exclude VAT.',
    segnali: ['QR ordering at the table', 'Bookings and live orders in one dashboard', 'Electronic invoice flow when needed'],
    risultati: [
      { title: 'Fewer trips for payment', text: 'Guests who are finished can pay without searching for staff, which helps tables close more smoothly.' },
      { title: 'Orders written by the guest', text: 'Options, notes and variations arrive as selected by the customer, reducing interpretation and recopying.' },
      { title: 'One room to watch', text: 'Bookings, tables, live orders and payments sit in one operational view.' },
    ],
    cosaTitolo: 'What we install in the room, and around it.',
    cosaIntro:
      'The flow covers the customer journey: book, sit down, order, pay and request an invoice. The website and content bring people to that room.',
    cosaFacciamo: [
      { title: 'Table QR', text: 'Each table has its own code. The customer opens the menu in the browser, without installing an app.' },
      { title: 'Phone payment', text: 'Card, Apple Pay, Google Pay or supported local payment methods can be configured depending on the payment provider.' },
      { title: 'Electronic invoice flow', text: 'When the customer asks for an invoice, the data can move through an accredited intermediary instead of being handled manually later.' },
      { title: 'Bookings in one place', text: 'Reservations enter the same dashboard with time, table and notes.' },
      { title: 'Editable menu', text: 'Dishes, prices, availability and allergens are updated from the panel and reflected across all tables.' },
      { title: 'Restaurant website', text: `Menu, booking and location on a fast mobile page. From ${PREZZI.web}.` },
      { title: 'Content from the real venue', text: `Dishes, room and people, planned and published consistently. Presence ${PREZZI.presenza}, Growth ${PREZZI.crescita}.` },
    ],
    ciclo: [
      { number: '01', title: 'Room check', text: 'We review tables, menu, current payment flow and booking habits before proposing the setup.' },
      { number: '02', title: 'Configuration', text: 'Menus, tables, QR codes and payment provider are configured.' },
      { number: '03', title: 'Room test', text: 'We start with a small number of tables and adjust the flow with staff present.' },
      { number: '04', title: 'Operations', text: 'The dashboard shows orders, bookings, payments and menu updates.' },
    ],
    faq: [
      { q: 'Does the customer need to install an app?', a: 'No. The QR opens a web page in the phone browser.' },
      { q: 'Can the staff still take orders?', a: 'Yes. The system supports the room; it does not force every interaction through the QR.' },
      { q: 'Are payment fees included?', a: 'No. Payment provider fees are third-party costs and are stated before activation.' },
      { q: 'Does it replace the fiscal register?', a: 'No. Fiscal obligations remain with the restaurant and should be checked with your accountant.' },
    ],
    correlati: [
      { href: 'https://ristoranti-dashboard.vercel.app/', label: 'View the room system' },
      { href: '/en/services', label: 'Websites and content' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'agenzie-immobiliari',
    nome: 'Real estate agencies',
    sommario: 'Properties need visibility, but owners and buyers also need fast, organised answers.',
    titoloSeo: 'Marketing and digital operations for real estate agencies | SWA',
    descrizioneSeo:
      'Content, landing pages, local SEO, request handling and digital workflows for real estate agencies working with Italian and international clients.',
    eyebrow: 'Real estate agencies',
    h1: 'A listing starts online, but the trust is built before the visit.',
    lead:
      'A property page, a video, a local search result and a fast answer all do different jobs. When they are disconnected, interested people hesitate or ask the same questions twice.',
    servizio: 'Marketing and request handling for real estate agencies',
    tipoServizio: 'Content, website, local discovery and phone response for real estate agencies',
    promessa:
      'Listings become clearer content, requests are collected in one place and routine answers do not wait for office time. We do not promise mandates or sales.',
    notaPrezzi: `Social management ${PREZZI.presenza} or ${PREZZI.crescita}. Website ${PREZZI.web}. Phone assistant ${PREZZI.voce}. Local SEO after audit. Prices exclude VAT.`,
    segnali: ['Property content approved before publishing', 'Requests collected outside office hours', 'Local pages for real search intent'],
    risultati: [
      { title: 'A listing with context', text: 'Photos and videos explain the property, area and next step instead of leaving the portal to do all the work.' },
      { title: 'Fewer lost requests', text: 'When someone asks outside office hours, the assistant can collect details and route the conversation.' },
      { title: 'Better local discovery', text: 'Pages can target the places and intents where owners and buyers actually search.' },
    ],
    cosaTitolo: 'What we build around the agency.',
    cosaIntro:
      'Real estate work depends on trust, timing and local context. The digital system should support all three.',
    cosaFacciamo: [
      { title: 'Property content', text: 'Short videos, posts and page copy built from real listings, not generic market phrases.' },
      { title: 'Landing pages', text: `Pages for properties, areas or acquisition campaigns, from ${PREZZI.web}.` },
      { title: 'Phone assistant', text: `Routine information, first qualification and appointment requests can be covered from ${PREZZI.voce}.` },
      { title: 'Local SEO and GEO', text: 'Search structure, area pages and content that can be understood by search engines and AI answer systems. Quoted after audit.' },
      { title: 'Social calendar', text: `Presence covers 16 monthly pieces per channel; Growth covers 24. Both keep publishing under approval.` },
      { title: 'Owner-facing clarity', text: 'Acquisition content can explain method, valuation limits and process without promising outcomes.' },
    ],
    ciclo: [
      { number: '01', title: 'Market and stock', text: 'We review areas, property types, current listings and the agency process.' },
      { number: '02', title: 'Content system', text: 'We decide what each channel must do: attract owners, answer buyers, support visits or explain the agency.' },
      { number: '03', title: 'Publishing', text: 'Content goes out only after approval, with clear links to the next action.' },
      { number: '04', title: 'Requests', text: 'Calls and forms are collected with context so the agency can follow up faster.' },
    ],
    faq: [
      { q: 'Do you promise more mandates?', a: 'No. Mandates depend on reputation, pricing, relationship and local market conditions. We commit to the process and deliverables.' },
      { q: 'Can you work with foreign buyers?', a: 'Yes, especially when the property or area already attracts international demand. English pages should be written for that buyer, not literally translated.' },
      { q: 'Do you manage paid ads?', a: 'Paid campaigns are separate from Presence and Growth plans. Budget, accounts and objectives are agreed before activation.' },
      { q: 'Who approves listings and content?', a: 'The agency approves what matters before publication, especially prices, claims, property details and sensitive wording.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Websites and SEO' },
      { href: '/en/services', label: 'Managed social media' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
]

export function settoreEnBySlug(slug: string): Settore | undefined {
  return SETTORI_EN.find(s => s.slug === slug)
}
