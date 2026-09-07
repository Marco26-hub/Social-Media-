import { PREZZI, type Settore } from '@/lib/settori'

const EN_PRICES = {
  presenza: PREZZI.presenza.replace('€ al mese', 'per month').replace(' al mese', ' per month'),
  crescita: PREZZI.crescita.replace('€ al mese', 'per month').replace(' al mese', ' per month'),
  web: PREZZI.web.replace('a partire da ', 'from ').replace(' al mese', ' per month'),
  agenda: PREZZI.agenda.replace('da ', 'from ').replace('€ al mese', 'per month').replace(' al mese', ' per month'),
  voce: PREZZI.voce.replace('da ', 'from ').replace('€ al mese', 'per month').replace(' al mese', ' per month'),
} as const

export const SETTORI_EN: Settore[] = [
  {
    slug: 'imprese-di-pulizia',
    nome: 'Housekeeping and cleaning companies',
    sommario: 'Jobs are signed on site, reports leave immediately and repeat clients are easier to follow up.',
    titoloSeo: 'Housekeeping and cleaning company operations | SWA',
    descrizioneSeo:
      'Signed job reports from the phone, a multilingual website that brings in quote requests and an assistant that answers while your teams are on site.',
    eyebrow: 'Housekeeping and cleaning',
    h1: 'The work happens on site. The proof should not wait for the office.',
    lead:
      'For cleaning teams, the weakest point is rarely the work itself. It is the paperwork afterwards: photos, signatures, notes, hours and client follow-up spread across messages and memory.',
    servizio: 'Digital operations for housekeeping and cleaning companies',
    tipoServizio: 'Job reporting, client follow-up, website and phone response for cleaning and housekeeping teams',
    promessa:
      'Each job can close with photos, notes and a client signature, while recurring clients remain visible before the next service is due. We do not promise new contracts.',
    notaPrezzi: `Job reporting is quoted after review. Website ${EN_PRICES.web}. Phone assistant ${EN_PRICES.voce}. Client agenda ${EN_PRICES.agenda}. Prices exclude VAT.`,
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
      { title: 'Recurring agenda', text: `Dormant clients, periodic services and open follow-ups are reviewed inside the agenda plan, ${EN_PRICES.agenda}.` },
      { title: 'Phone coverage', text: `The assistant answers routine calls, collects requests and routes exceptions. Entry plan: ${EN_PRICES.voce}.` },
      { title: 'A website that explains the service', text: `A fast mobile page for services, areas covered and contact requests, ${EN_PRICES.web}.` },
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
    notaPrezzi: 'Restaurant systems are quoted after review: tables, menu, payment flow and integrations change the project. Payment fees are stated before activation. Prices exclude VAT.',
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
      { title: 'Restaurant website', text: `Menu, booking and location on a fast mobile page, ${EN_PRICES.web}.` },
      { title: 'Content from the real venue', text: `Dishes, room and people, planned and published consistently. Presence ${EN_PRICES.presenza}, Growth ${EN_PRICES.crescita}.` },
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
    titoloSeo: 'Digital operations for real estate agencies | SWA',
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
    notaPrezzi: `Social management ${EN_PRICES.presenza} or ${EN_PRICES.crescita}. Website ${EN_PRICES.web}. Phone assistant ${EN_PRICES.voce}. Local SEO after audit. Prices exclude VAT.`,
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
      { title: 'Landing pages', text: `Pages for properties, areas or acquisition campaigns, ${EN_PRICES.web}.` },
      { title: 'Phone assistant', text: `Routine information, first qualification and appointment requests can be covered ${EN_PRICES.voce}.` },
      { title: 'Local SEO and GEO', text: 'Search structure, area pages and clear content that search engines and AI answer systems can understand. Quoted after audit.' },
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
      { q: 'Can you work with foreign buyers?', a: 'Yes, especially when the property or area already attracts international demand. English pages should answer the buyer’s real questions, not just repeat the Italian page.' },
      { q: 'Do you manage paid ads?', a: 'Paid campaigns are separate from Presence and Growth plans. Budget, accounts and objectives are agreed before activation.' },
      { q: 'Who approves listings and content?', a: 'The agency approves what matters before publication, especially prices, claims, property details and sensitive wording.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Websites and SEO' },
      { href: '/en/services', label: 'Managed social media' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'parrucchieri',
    nome: 'Hair salons and barbershops',
    sommario: 'The phone rings while your hands are in someone’s hair, and whoever gets no answer books elsewhere.',
    titoloSeo: 'Hair salons and barbershops: phone, diary and social | SWA',
    descrizioneSeo:
      'For salons: an assistant answers while your hands are busy, clients who stopped coming get a message you approve, and the salon publishes every week.',
    eyebrow: 'Hair salons and barbershops',
    h1: 'Whoever gets no answer tries the next salon.',
    lead:
      'A missed call in a salon is usually an appointment that went somewhere else. The entry plan covers 300 minutes a month, roughly 100 conversations of three minutes. And clients who start coming less often never announce it: they simply stop.',
    servizio: 'Phone cover, client recall and content for hair salons',
    tipoServizio: 'Phone answering, client recall and social content for hair salons and barbershops',
    promessa:
      'Callers reach a voice even when your hands are busy, and clients who have not booked for months get a message you approved first. We make no promise about how many chairs get filled.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Client diary and recall ${EN_PRICES.agenda}. Managed social ${EN_PRICES.presenza} or ${EN_PRICES.crescita}. One-off setup is stated before activation. Prices exclude VAT.`,
    segnali: ['Answers while your hands are busy', 'Every message is approved by you', 'Filmed between two clients'],
    risultati: [
      { title: 'The call you cannot take', text: 'The salon number is covered during a colour, in the evening and on the closing day, within the 300 monthly minutes of the entry plan. The caller hears a voice instead of three rings and a voicemail.' },
      { title: 'The gap in the week', text: 'Empty slots are offered to people already in the salon’s records, inside the 1000 monthly messages of the diary plan. The message reaches WhatsApp and only leaves once you say yes.' },
      { title: 'What people see before they call', text: `The salon that gets found is the one that publishes every week. Presence is ${EN_PRICES.presenza} and produces 16 pieces per channel each month: cuts, colour, hands and faces, not stock photography.` },
    ],
    cosaTitolo: 'The work we take off the hands of the person cutting.',
    cosaIntro:
      'A salon loses clients at two opposite points: the ones looking for you while you work, and the ones who stopped looking. They are two separate tools and can be switched on one at a time.',
    cosaFacciamo: [
      { title: 'How the phone answers', text: `The salon phone becomes a monthly service, ${EN_PRICES.voce}, with 300 minutes. The assistant gives the services, prices and opening hours you approved, reads the diary and books into a free slot while you are with a client.` },
      { title: 'Which clients get a message', text: `A daily pass over the salon’s records brings back whoever has not been in for months, with the reason attached. The 1000 monthly messages are already part of the plan, ${EN_PRICES.agenda}.` },
      { title: 'When the week has a hole', text: 'An empty Tuesday morning becomes a ready proposal for someone already on file. The text only goes out if you say yes, and the monthly messages cover free slots as well as recalls.' },
      { title: 'What goes out on social', text: `The salon’s editorial plan is 16 pieces per channel per month with Presence (${EN_PRICES.presenza}) and 24 with Growth (${EN_PRICES.crescita}). Plan, copy, editing and publishing across 2 channels.` },
      { title: 'How filming works in a salon', text: 'Filming is a half day with a photographer and lights, shot between one client and the next. One session produces several weeks of vertical clips plus stills. A face in front of the camera only if you want one.' },
      { title: 'Being found nearby', text: 'Local search is three things: the salon’s business listing, pages that answer someone looking for a hairdresser nearby, and text that AI systems can quote. Quoted after a review.' },
    ],
    ciclo: [
      { number: '01', title: 'What we collect', text: 'Services, prices, opening hours, salon rules and the phrases the assistant must never say. One session with you is enough; we prepare the rest and you correct it.' },
      { number: '02', title: 'How you test it', text: 'You listen to how it answers and read the sample messages before the salon number is connected. Words, prices, hours and greeting change until you are convinced. No real call arrives before you say so.' },
      { number: '03', title: 'When it goes live', text: 'The number goes into service and the 300 monthly minutes start covering calls. Messages to dormant clients stay in draft and leave only after your yes, one by one or in groups.' },
      { number: '04', title: 'What you see', text: 'A panel you can read from your phone: calls handled, appointments booked and messages sent out of the 1000 included. Every month rules and wording are reviewed against those numbers.' },
    ],
    faq: [
      { q: 'How does the assistant answer while I am doing a colour?', a: `It is a number that answers in your place when your hands are busy, with 300 minutes a month in the entry plan, ${EN_PRICES.voce}. It gives the services, prices and hours you approved, reads the calendar and books into a free slot. If the request falls outside the rules, it takes the details and passes them to you.` },
      { q: 'What can it say about cuts and prices?', a: 'Only what you loaded: the service list, list prices, indicative duration, opening hours and the two or three answers you repeat every day. Technical advice on colour, bleaching or scalp is never given, because it requires seeing the hair. Those calls reach you with the name and reason already noted.' },
      { q: 'How are the minutes counted?', a: 'On the length of the conversations handled, not on how many calls arrive. 300 minutes a month is roughly 100 conversations of three minutes, that is 5 hours of phone. Beyond that, minutes are charged at your plan rate without renegotiating the fee. The phone number and the carrier traffic stay outside the fee and are stated in the proposal.' },
      { q: 'When does a message reach a client who stopped coming?', a: 'Sending is your action, separate from preparation. Each day the system reads the diary and the history, flags who has not been in for a while and drafts the text, within the ceiling of 1000 messages a month. Anyone who asks not to be contacted is excluded permanently.' },
      { q: 'Can I activate only the phone answering?', a: `Yes. The phone on its own is ${EN_PRICES.voce}, with 300 minutes included and a one-off setup stated in the proposal. WhatsApp client recall is a separate service, ${EN_PRICES.agenda}, and can be added later without redoing the configuration.` },
      { q: 'Where do the client numbers end up?', a: 'They belong to the salon. They are used only for the contacts you approve, within the monthly messages, and are never sold, passed on or used to train systems. The panel shows who was contacted, when and with what outcome. Deleting a contact can be requested at any time, at no cost.' },
      { q: 'What if the caller wants a person?', a: 'That is written into the rules at setup. The assistant does not insist: it takes the name, number and reason and closes with a promise to call back. It can be set as an immediate transfer during opening hours or as a note to read at the end of the day. Callers are told they are speaking to an assistant in the first sentence.' },
      { q: 'Do you work with salons outside Italy?', a: 'The phone assistant and the recall messages work in Italian and English. Filming needs someone on site, so it depends on distance; everything else is configured and run remotely.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Managed social media' },
      { href: '/en/pricing', label: 'Pricing' },
      { href: '/en/method', label: 'How we work' },
    ],
  },
]

export function settoreEnBySlug(slug: string): Settore | undefined {
  return SETTORI_EN.find(s => s.slug === slug)
}
