import { PREZZI, SETTORI, type Settore } from '@/lib/settori'

/**
 * Porta un prezzo dalla convenzione italiana a quella inglese: «490 € al mese»
 * diventa «€490 per month». Le sostituzioni a catena che c'erano prima
 * (`.replace('€ al mese', 'per month')`) mangiavano il simbolo di valuta e
 * lasciavano «490 per month», mentre la virgola decimale di «19,90 €» restava
 * italiana su una pagina inglese. Il prezzo e' la riga che il lettore controlla
 * due volte: se e' scritto male, e' l'unica cosa che si ricorda.
 */
function enPrice(prezzo: string): string {
  return prezzo
    .replace(/(\d[\d.]*),(\d+)\s*€/g, '€$1.$2')
    .replace(/(\d[\d.]*)\s*€/g, '€$1')
    .replace(/^a partire da /, 'from ')
    .replace(/^da /, 'from ')
    .replace(/ al mese/g, ' per month')
    .replace(/ una tantum/g, ' one-off')
}

const EN_PRICES = {
  presenza: enPrice(PREZZI.presenza),
  crescita: enPrice(PREZZI.crescita),
  web: enPrice(PREZZI.web),
  agenda: enPrice(PREZZI.agenda),
  voce: enPrice(PREZZI.voce),
  video: enPrice(PREZZI.video),
  blog: enPrice(PREZZI.blog),
} as const

const ELENCO: Settore[] = [
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
      'A missed call in a salon is usually an appointment that went somewhere else. The entry plan covers 600 minutes a month, roughly 200 conversations of three minutes. And clients who start coming less often never announce it: they simply stop.',
    servizio: 'Phone cover, client recall and content for hair salons',
    tipoServizio: 'Phone answering, client recall and social content for hair salons and barbershops',
    promessa:
      'Callers reach a voice even when your hands are busy, and clients who have not booked for months get a message you approved first. We make no promise about how many chairs get filled.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Client diary and recall ${EN_PRICES.agenda}. Managed social ${EN_PRICES.presenza} or ${EN_PRICES.crescita}. One-off setup is stated before activation. Prices exclude VAT.`,
    segnali: ['Answers while your hands are busy', 'Every message is approved by you', 'Filmed between two clients', '0% commission: your clients stay yours'],
    risultati: [
      { title: 'The call you cannot take', text: 'The salon number is covered during a colour, in the evening and on the closing day, within the 300 monthly minutes of the entry plan. The caller hears a voice instead of three rings and a voicemail.' },
      { title: 'The gap in the week', text: 'Empty slots are offered to people already in the salon’s records, inside the 1000 monthly messages of the diary plan. The message reaches WhatsApp and only leaves once you say yes.' },
      { title: 'What people see before they call', text: `The salon that gets found is the one that publishes every week. Presence is ${EN_PRICES.presenza} and produces 16 pieces per channel each month: cuts, colour, hands and faces, not stock photography.` },
    ],
    cosaTitolo: 'The work we take off the hands of the person cutting.',
    cosaIntro:
      'A salon loses clients at two opposite points: the ones looking for you while you work, and the ones who stopped looking. They are two separate tools and can be switched on one at a time.',
    cosaFacciamo: [
      { title: 'How the phone answers', text: `The salon phone becomes a monthly service, ${EN_PRICES.voce}, with 600 minutes. The assistant gives the services, prices and opening hours you approved, reads the diary and books into a free slot while you are with a client.` },
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
      { q: 'How does the assistant answer while I am doing a colour?', a: `It is a number that answers in your place when your hands are busy, with 600 minutes a month in the entry plan, ${EN_PRICES.voce}. It gives the services, prices and hours you approved, reads the calendar and books into a free slot. If the request falls outside the rules, it takes the details and passes them to you.` },
      { q: 'What can it say about cuts and prices?', a: 'Only what you loaded: the service list, list prices, indicative duration, opening hours and the two or three answers you repeat every day. Technical advice on colour, bleaching or scalp is never given, because it requires seeing the hair. Those calls reach you with the name and reason already noted.' },
      { q: 'How are the minutes counted?', a: 'On the length of the conversations handled, not on how many calls arrive. 600 minutes a month is roughly 200 conversations of three minutes, that is 10 hours of phone. Beyond that, minutes are charged at your plan rate without renegotiating the fee. The phone number and the carrier traffic stay outside the fee and are stated in the proposal.' },
      { q: 'When does a message reach a client who stopped coming?', a: 'Sending is your action, separate from preparation. Each day the system reads the diary and the history, flags who has not been in for a while and drafts the text, within the ceiling of 1000 messages a month. Anyone who asks not to be contacted is excluded permanently.' },
      { q: 'Can I activate only the phone answering?', a: `Yes. The phone on its own is ${EN_PRICES.voce}, with 600 minutes included and a one-off setup stated in the proposal. WhatsApp client recall is a separate service, ${EN_PRICES.agenda}, and can be added later without redoing the configuration.` },
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
  {
    slug: 'autosaloni',
    nome: 'Car dealerships',
    sommario: 'Every vehicle is a piece of content, and every listing produces a call somebody has to take.',
    titoloSeo: 'Marketing for car dealerships and used car lots | SWA',
    descrizioneSeo:
      'Car dealerships: every vehicle becomes a video, the website collects the requests and an assistant holds the line while you are mid-negotiation. Public prices.',
    eyebrow: 'Car dealerships',
    h1: 'The stock sells twice: online and on the forecourt.',
    lead:
      'A vehicle video is the first test drive a buyer takes, and the Presence plan delivers 16 pieces a month on each of the 2 managed channels. Whoever watches it and is convinced calls exactly while you are negotiating with somebody else.',
    servizio: 'Marketing for car dealerships',
    tipoServizio: 'Content, website, visibility and phone answering for car dealerships and used car lots',
    promessa:
      'Material about the stock produced every week, and no request left ringing. We make no commitment on the number of sales: those depend on price, stock and how the negotiation goes.',
    notaPrezzi: `On-site filming ${EN_PRICES.video}. Managed social ${EN_PRICES.presenza} or ${EN_PRICES.crescita}. Website ${EN_PRICES.web}. Phone assistant ${EN_PRICES.voce}. Prices exclude VAT.`,
    segnali: ['Filmed on the forecourt', 'Requests collected after closing time', 'Every edited piece passes by you'],
    risultati: [
      { title: 'What one session produces', text: 'A filming session on the forecourt is several weeks of material, not one vehicle: it feeds the 16 monthly pieces of the Presence plan. The photographer brings lights and lenses and shoots while the dealership keeps working.' },
      { title: 'When you are mid-negotiation', text: 'The call that arrives while you are closing a quote is covered by the 300 monthly minutes of the entry plan: opening hours, availability and approved trim levels, then the test drive goes into the diary. Everything else comes to you.' },
      { title: 'Where campaigns land', text: `The dealership page is where a request becomes your contact instead of the portal’s, ${EN_PRICES.web}, and the project becomes yours after 12 months. The statistics say where it came from.` },
    ],
    cosaTitolo: 'What we produce and what we cover.',
    cosaIntro:
      'The work splits in two: showing the stock to people who have not walked in yet, and taking the call from people who already looked. Every piece goes out after your approval, in the real format of the channel.',
    cosaFacciamo: [
      { title: 'How we film on the forecourt', text: 'Filming at the dealership is organised in half days with a photographer, lights and lenses, and covers 2 formats: vertical for social, photographic for listings and the website. Quoted after a site visit.' },
      { title: 'What we publish each month', text: `The dealership calendar is 16 pieces a month on each channel with Presence (${EN_PRICES.presenza}) and 24 with Growth (${EN_PRICES.crescita}). Copy, editing and publishing across 2 channels are included.` },
      { title: 'Where the requests end up', text: `The landing page is the form that turns a video into a test drive request, ${EN_PRICES.web} excluding VAT. Forms, statistics and the link to campaigns are included.` },
      { title: 'When the dealership is full', text: `The phone assistant is what holds the line when everybody is busy: ${EN_PRICES.voce} with 300 minutes included. It informs, books the appointment and passes the call on when the request falls outside the rules.` },
      { title: 'What the assistant does not say', text: 'Trade-ins, discounts and valuations stay outside the answers loaded into the 300 minutes of the plan: the assistant takes the details and hands over to a person. You write the handover rules at setup.' },
      { title: 'How people find you', text: 'Being found is work on 3 fronts: page structure, the search intent of somebody looking for a used car nearby, and readability for search engines and AI answer systems. Quoted after an audit.' },
      { title: 'Vehicles uploaded automatically', text: 'Vehicle records enter the website without being retyped: they are uploaded once and update themselves when the stock changes.' },
      { title: 'Images processed in batches', text: 'Vehicle photos are cropped, standardised and prepared for listings and social in a single pass, not one at a time.' },
    ],
    ciclo: [
      { number: '01', title: 'What we look at on the site visit', text: 'The site visit is the half day when we measure space, light and the hours of the forecourt, and pick the 2 windows in which filming does not stop a negotiation. We also look at the workshop, the handovers and the people: that is the material a listings portal does not have.' },
      { number: '02', title: 'How we film the stock', text: 'The shoot is a single half-day block: vehicles ready, photographer with lights and lenses, 2 formats collected in the same pass. From there come the calendar weeks of the active plan, and nobody returns a second time to redo the same shots.' },
      { number: '03', title: 'When the content goes out', text: 'Publishing is scheduled on the 2 channels of the plan and starts only after you have seen the edited piece. With Presence that is 16 posts a month per channel, with Growth 24 plus one SEO + GEO article. No surprise posts.' },
      { number: '04', title: 'Where the requests arrive', text: 'Requests from posts, campaigns and the phone are collected in one place: the website form, the log of calls covered by the 300 monthly minutes, and appointments already booked. The ones outside the rules reach a person at the dealership, with the name and the reason already noted.' },
    ],
    faq: [
      { q: 'How do you film the vehicles without stopping the dealership?', a: `Filming is organised in blocks inside a half day, in the windows the site visit shows to be quietest, and it feeds the calendar of the Presence plan at ${EN_PRICES.presenza}. The photographer arrives with lights and lenses, shoots the vehicles that are ready and moves aside when a customer walks in. A full day is only needed with more locations or more people in front of the camera. Editing happens afterwards, and you see the finished piece before it is published.` },
      { q: 'What content does a dealership need beyond the listings?', a: 'The content that sets a dealership apart is what a portal does not host: handovers, the workshop, the history of the vehicles and the people who work on them, 16 a month per channel with Presence. The listing states price and mileage; the rest shows who the buyer would be dealing with. The calendar is agreed together and every piece passes your approval before it goes out, in the real format of the channel.' },
      { q: 'What can the phone assistant say about a vehicle for sale?', a: 'The phone assistant is limited to the information you load — opening hours, availability, trim levels, appointments — and works within the 300 minutes a month of the entry plan, 5 hours of conversation. Trade-in valuations, discounts and negotiations stay with a person at the dealership, following the rules written at setup. Callers know from the first sentence that they are speaking to an assistant, because it does not pretend to be a salesperson.' },
      { q: 'How much does managed social cost for a dealership?', a: `Managed social for a dealership is ${EN_PRICES.presenza} with Presence and ${EN_PRICES.crescita} with Growth, which adds 24 pieces a month per channel and one SEO + GEO article. Filming on the forecourt is quoted separately, because it depends on the vehicles, the space and the people to be filmed. Fees exclude VAT and stay public on the website, with no reserved price list.` },
      { q: 'How does the dealership website compare with a listings portal?', a: `The dealership website is where a request stays yours instead of becoming a portal contact, ${EN_PRICES.web}, and the project becomes yours after 12 months of the fee. Portals exist to be found; the page exists to collect. Forms and statistics show which content brought the requests, and campaigns land there rather than on a record shared with your competitors.` },
      { q: 'Why do you not guarantee a number of sales?', a: 'Sales are not a result a supplier can guarantee: they depend on price, stock, finance and how the negotiation goes on the floor, not on the 16 pieces that go out each month. What we do commit to is the process — material produced consistently, published after your approval, requests that get an answer. We write it that way in the proposal too, because a promise of sales would be a promise nobody can keep.' },
      { q: 'Where do the contacts from the website and the phone end up?', a: 'The contacts are yours and stay in the dealership systems: within the 300 monthly minutes the assistant records the outcome and a summary of the call, while audio recording is not on by default. We process only what the activated service requires and we do not use client material to train models. Access and deletion can be requested at any time, and the request is handled at no cost.' },
      { q: 'How do you handle paid campaigns?', a: 'Paid campaigns sit outside the Presence and Growth plans, which cover 2 channels growing organically, and belong to a separate agreed configuration. The budget paid to the platform stays separate from the fee and under your control, on your own advertising accounts. Objectives, spending limits and management are put in writing before any advert goes live.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Managed social media' },
      { href: '/en/pricing', label: 'Pricing' },
      { href: '/en/method', label: 'How we work' },
    ],
  },
  {
    slug: 'centri-estetici',
    nome: 'Beauty salons',
    sommario: 'A course of treatments left half finished is worth more than a new client you still have to find.',
    titoloSeo: 'Beauty salons: unfinished courses and phone cover | SWA',
    descrizioneSeo:
      'Beauty salons: clients with a half-finished package come back through a message you approved, and the phone is answered even from the treatment room.',
    eyebrow: 'Beauty salons',
    h1: 'An interrupted course is work you have already sold.',
    lead:
      'A package left half finished is a course already chosen and never completed, and the diary plan includes 1000 messages a month to pick it up again. The treatment room, meanwhile, keeps the phone out of reach an hour at a time.',
    servizio: 'Marketing and diary for beauty salons',
    tipoServizio: 'Phone answering, client recall and social content for beauty salons',
    promessa:
      'Clients with a stalled course become visible again every day, and the phone is answered even from the treatment room. We make no commitment on the number of treatments sold.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Diary and client recall ${EN_PRICES.agenda}. Managed social ${EN_PRICES.presenza} or ${EN_PRICES.crescita}. One-off setup is stated before activation. Prices exclude VAT.`,
    segnali: ['Answers with the room occupied', 'Stalled courses flagged every day', 'Texts written first, sent after', '0% commission: your clients stay yours'],
    risultati: [
      { title: 'Which courses have stalled', text: 'The daily pass over the records brings back whoever has sessions left that were never booked, within the 1000 messages included each month. Every name arrives with the reason for the contact beside it.' },
      { title: 'How the treatment room is covered', text: 'The treatment hour is the gap where nobody can answer: the 300 minutes included in the base plan cover whoever calls in that window. Approved information, free slots and the appointment booked.' },
      { title: 'When the season comes round', text: 'Seasonal recalls are contacts built on each client’s history and prepared weeks ahead, not improvised: they sit inside the 1000 included messages and the text leaves when you approve it, in groups or one client at a time.' },
    ],
    cosaTitolo: 'What goes into the treatment room and what stays out.',
    cosaIntro:
      'A salon has an archive full of courses to pick up again and a phone nobody can watch. They are two separate jobs, and neither of them has anything to do with assessing a client’s skin.',
    cosaFacciamo: [
      { title: 'How it answers from the room', text: `The phone in the treatment room is covered by a monthly fee, ${EN_PRICES.voce}, with 300 minutes included: treatments, durations and prices you approved, free slots and the appointment saved after confirmation.` },
      { title: 'Which packages are half done', text: `Course recovery is a daily scan of the records that flags sessions left unbooked, with the reason beside each one and 1000 messages included every month in the fee, ${EN_PRICES.agenda}.` },
      { title: 'When the season changes', text: 'A seasonal recall is a contact built on each client’s history and prepared weeks in advance, inside the 1000 messages included in the month. Not one text for everybody, but the right reason for the right person.' },
      { title: 'Where the free hours go', text: 'The hour that falls through is offered to somebody who already has an open course, with the text ready and the 1000 messages included in the month. A gap in the room stops being a cost you discover looking at a week already closed.' },
      { title: 'What comes out of the salon', text: `The calendar is 16 pieces a month on each channel with Presence (${EN_PRICES.presenza}) and 24 with Growth (${EN_PRICES.crescita}). Rooms, hands at work, products and people, not downloaded stock photos.` },
      { title: 'How filming works in a salon', text: 'The shoot is agreed for hours when the rooms are free, with lights and equipment brought by us: 2 formats, vertical for social and stills for the salon profile. Faces only if you want them. Quoted separately.' },
    ],
    ciclo: [
      { number: '01', title: 'What we load', text: 'The first step is loading the price list, durations, opening hours, salon rules and the phrases the assistant must never use, starting with any advice about skin, alongside the 1000 messages included in the plan. One meeting is enough: from that material come the phone answers and the tone of the recalls.' },
      { number: '02', title: 'How the trials sound', text: 'The trials are recordings you listen to before the salon number is connected to the 300 minutes of the plan, together with the sample recall texts. Words, prices and the way a slot is offered are corrected until they sound like the way you speak in the room. No real client is involved before that.' },
      { number: '03', title: 'When it goes live', text: 'Going live is the final step: the 300 minutes cover the phone even with the room occupied, and the 1000 included messages open the recalls. Messages stay in draft until you approve them, one by one or in groups.' },
      { number: '04', title: 'How it gets corrected', text: 'The monthly review reads replies received, appointments obtained and messages ignored out of the 1000 included, and exists to change the rules that did not work. It is a short step, but it is why the seasonal recalls of the second year are sharper than those of the first.' },
    ],
    faq: [
      { q: 'What can the assistant say about a treatment?', a: 'The assistant only gives the information you approved: services, how long a session lasts, list prices and availability. The base fee includes 300 minutes a month, that is 5 hours of phone. Any judgement about skin, contraindications, pregnancy or a course in progress stays with a person at the salon, and the call is passed on following the rules written at setup. Callers are told they are speaking to an assistant straight away, not only if they ask.' },
      { q: 'How are clients chosen for a recall?', a: 'The choice is driven by history, not by a random list: every morning the diary and the client records are read again, within the 1000 messages included in the plan. Back come the clients with sessions left unbooked, those who have not been in for a period you define, and those with an open seasonal course. Every name arrives with the reason beside it, so you can remove anyone you do not want contacted before anything leaves.' },
      { q: 'When does a seasonal recall go out?', a: 'A seasonal recall is prepared weeks in advance from what the client has already done in previous years, and it goes out when you approve it, inside the 1000 messages included in the month. It is not one text sent to everybody: the reason changes, and whoever has never had that treatment does not receive it. You set the calendar of periods at setup and it can be corrected at any time.' },
      { q: 'Why do the messages not go out automatically?', a: 'Sending is kept separate from preparation as a matter of method: the system writes within the 1000 included messages, you decide what leaves. In our experience a wrong message to a long-standing client costs far more than one extra appointment, and in a salon the personal relationship is half the service. The text can be rewritten, and anyone who asks not to be contacted again is excluded permanently.' },
      { q: 'How are the WhatsApp messages counted?', a: 'The included allowance is 1000 a month, counted as messages actually sent after your approval: drafts prepared and never approved consume nothing. Messages above the threshold are charged as used, and the fees applied by the messaging platforms are stated separately, because they are not ours and we do not collect them. The panel keeps the count up to date day by day.' },
      { q: 'How much does client recall cost on its own?', a: `Client recall on its own is ${EN_PRICES.agenda}, with 1000 messages included and a one-off setup fee stated before activation. Phone answering remains a separate service, ${EN_PRICES.voce}, and can be added later without redoing the configuration. Both fees exclude VAT, and no function starts without your written approval.` },
      { q: 'What client data is processed?', a: 'The data processed is the minimum the service requires: name, contact, appointment history and treatments booked, plus the 1000 messages recorded each month with their outcome. It stays the property of the salon, your content never feeds the training of any model, and health or special-category information is not handled by the phone assistant. Deletion and export can be requested at any time, at no cost.' },
      { q: 'What can be filmed without showing faces?', a: `There is a great deal that can be filmed without faces: hands at work, products, textures, the room and technical gestures, shot in 2 formats while the rooms are free. The session is agreed for the quietest hours and feeds several weeks of the calendar at ${EN_PRICES.presenza}. Clients and staff appear only if they have consented, and the choice stays yours until the last moment.` },
    ],
    correlati: [
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/services', label: 'Client diary and WhatsApp' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'cliniche-estetiche',
    nome: 'Aesthetic clinics',
    sommario: 'First enquiries and bookings on the phone, clinical questions to the staff.',
    titoloSeo: 'Aesthetic clinics: reception and bookings | SWA',
    descrizioneSeo:
      'Aesthetic clinics: first enquiries and bookings handled on the phone, while every clinical question is passed to a member of the medical staff.',
    eyebrow: 'Aesthetic clinics',
    h1: 'First enquiry or clinical question: two different routes.',
    lead:
      'The first enquiry is the call a clinic takes most often — what do you do, how long does it take, when is there a slot — and the largest plan covers 3000 minutes a month. A clinical assessment never passes through an automated system.',
    servizio: 'Marketing and bookings for aesthetic clinics',
    tipoServizio: 'Phone answering, bookings, content and website for aesthetic clinics',
    promessa:
      'First enquiries and bookings stop saturating the reception desk, and every clinical request is passed to a person. No promise of a medical or commercial outcome.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Diary and follow-up ${EN_PRICES.agenda}. Website ${EN_PRICES.web}. Managed social ${EN_PRICES.presenza} or ${EN_PRICES.crescita}. Prices exclude VAT.`,
    segnali: ['No automated clinical answers', 'Rules written before activation', 'Transcripts available to the staff', '0% commission: your patients stay yours'],
    risultati: [
      { title: 'What takes the load off reception', text: 'Repetitive questions are the share of calls that does not need a doctor, and the plans cover from 600 up to 3000 minutes a month. Whoever is at the desk goes back to looking after the patients who are actually there.' },
      { title: 'How the clinical side is separated', text: 'The rule is written before activation: 2 distinct routes, one informational handled by the assistant and one clinical transferred to a person. No grey area left to chance.' },
      { title: 'When a check-up is due', text: 'A follow-up reminder is prepared and approved by the clinic before it goes out, within the 1000 monthly messages of the plan. Whoever needs to come back knows it without somebody having to remember by hand.' },
    ],
    cosaTitolo: 'Rules first, technology after.',
    cosaIntro:
      'In a clinic the question is not what an assistant can do, but what it is allowed to say. That boundary is written before activation and stays on file: the data controller remains the clinic.',
    cosaFacciamo: [
      { title: 'What it says on the phone', text: `First enquiries are services, locations, opening hours and availability approved by the management, within the minutes of the chosen plan, from 600 to 3000 a month. Fee ${EN_PRICES.voce}. No clinical content, ever.` },
      { title: 'How a visit is booked', text: 'Booking is made on the connected calendar: the assistant offers only genuinely free slots, saves after the patient confirms and re-checks availability to avoid 2 overlapping appointments.' },
      { title: 'When it hands over to a person', text: 'Transfer to a person is set for 3 cases you define: a clinical question, an urgent case, a request that was not anticipated. The assistant takes the details, does not improvise and does not try to answer in place of the medical staff.' },
      { title: 'What a follow-up remembers', text: `A follow-up reminder is text prepared and approved before sending, within the 1000 monthly messages of the plan, ${EN_PRICES.agenda}. The patient receives a date, not a clinical communication.` },
      { title: 'Where the requests land', text: `The clinic website is the set of pages that explain the treatment paths and collect requests, ${EN_PRICES.web}, with the project passing to the clinic after 12 months. Forms, statistics and a readable structure.` },
      { title: 'How to communicate within the rules', text: `Content is produced with human oversight and with your approval on every piece, 16 a month per channel with Presence at ${EN_PRICES.presenza}. Anything generated by AI is labelled as such.` },
    ],
    ciclo: [
      { number: '01', title: 'What it may say', text: 'The setup document lists what the assistant may say and what it must transfer, written with the medical management before configuring the 600 or the 3000 minutes of the plan. Services, locations, opening hours and availability are in; contraindications and outcomes stay out.' },
      { number: '02', title: 'How it is tested on real cases', text: 'The trials are recorded conversations based on cases the clinic actually receives, listenable before the number is connected to the minutes of the plan, from 600 to 3000 a month. It is corrected until every answer respects the rules: a phrase close to the clinical boundary gets rewritten.' },
      { number: '03', title: 'When the number goes live', text: 'Activation is the moment the plan minutes enter service, from 600 to 3000 a month depending on the clinic’s volumes. First enquiries and bookings are handled, clinical requests transferred, and the first weeks stay under close observation.' },
      { number: '04', title: 'What is reviewed each month', text: 'The monthly review reads outcomes, transcripts and conversations flagged by authorised staff, against the minutes actually used out of the 600 to 3000 of the plan. It is the point where an answer that does not convince gets changed: quality is part of the service, not an extra to ask for.' },
    ],
    faq: [
      { q: 'What does the assistant answer to a medical question?', a: 'The answer is always the same: no clinical information and a handover to somebody at the clinic, because a medical question is one of the 3 transfer cases set out in the rules. The assistant stays within the services offered, the locations, the opening hours and the availability you approved, inside the minutes of the chosen plan. Questions about contraindications, expected outcomes, medication or a treatment in progress are transferred without any attempt at a partial answer.' },
      { q: 'How is patient data protected?', a: 'The data controller remains the clinic, including with 2 or more connected sites. We process only the data the activated service requires, and no clinic material is used to train systems. Audio recording is not on by default and can be enabled only with adequate privacy rules that you decide. Transcripts and outcomes remain available to authorised staff.' },
      { q: 'Which sites and departments can be handled?', a: 'Multi-site operation is supported, with different routes per site or department, up to the 3000 monthly minutes of the largest plan, 50 hours of conversation. Opening hours, available services and transfer rules change, while the ban on clinical answers stays identical everywhere. Additional numbers, additional assistants and links between systems are quoted separately, after we have seen how you are organised.' },
      { q: 'How does the patient know they are speaking to an assistant?', a: 'Transparency is a configuration rule, not an option left to chance: the assistant states that it is an automated system in the first sentence of the conversation, before the patient has to ask. In a setting where trust weighs as much as the service, letting somebody believe they are speaking to a person would be a problem of relationship as much as of transparency. Anyone who would rather have reception says so and the call is passed on.' },
      { q: 'How much does it cost to handle high call volumes?', a: `The fee starts at ${EN_PRICES.voce} for the base plan with 600 minutes included and rises with the included minutes, up to the 3000 a month of the plan designed for clinics and departments. Beyond the threshold minutes are charged as used at the plan rate, without renegotiating the contract. The phone number, carrier traffic and bespoke development stay outside the fee and are stated in the proposal before signing.` },
      { q: 'What rules does published content follow?', a: `Content is produced according to the direction you give us and passes your approval one piece at a time, 16 a month per channel on the Presence plan at ${EN_PRICES.presenza}. Anything generated with AI is labelled as such, and human oversight always precedes publication. Compliance with the rules on healthcare communication remains with the clinic, which knows its own regulatory position.` },
      { q: 'What happens to an urgent request?', a: 'Urgency is one of the 3 immediate-transfer cases defined in the rules, along with a clinical question and an unanticipated request. The assistant does not assess severity: it collects the essential details and passes the call on according to the rules you wrote. Outside opening hours, the emergency route indicated by the clinic is communicated without interpretation.' },
      { q: 'Where can you check what was said?', a: 'The call log is available to authorised staff and records the outcome, a summary and a transcript of the minutes used, from 600 to 3000 a month depending on the plan. It is where you check whether an answer respected the rules, and it is where the corrections of the monthly review come from. Access and permissions are assigned by role, so whoever should not see a conversation does not see it.' },
    ],
    correlati: [
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/services', label: 'Client diary and WhatsApp' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'studi-dentistici',
    nome: 'Dental practices',
    sommario: 'Hygiene recalls, treatment plans never started, and chairs freed at the last minute.',
    titoloSeo: 'Dental practices: hygiene recalls and a full diary | SWA',
    descrizioneSeo:
      'Dental practices: hygiene recalls and stalled treatment plans come back to the top every day, and a chair freed by a cancellation is offered again.',
    eyebrow: 'Dental practices',
    h1: 'The next few months of work are already in your records.',
    lead:
      'A hygiene recall is work already decided that is only waiting for a contact, and the diary plan provides 1000 messages a month to set it going. An accepted treatment plan that was never started stays where it is until somebody notices.',
    servizio: 'Diary and recalls for dental practices',
    tipoServizio: 'Phone answering, recalls and diary management for dental practices',
    promessa:
      'Recalls, cancellations and stalled treatment plans stop depending on who happens to remember. Clinical questions stay with the practice, and we make no commitment on how many treatments are accepted.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Diary and recalls ${EN_PRICES.agenda}. Website ${EN_PRICES.web}. One-off setup is stated before activation. Prices exclude VAT.`,
    segnali: ['The day’s priorities, each with its reason', 'A free chair offered again at once', 'Sending is a separate action'],
    risultati: [
      { title: 'Which recalls go out today', text: 'The day’s priorities are the list of patients due for hygiene, with the reason beside each one and the text already written, inside the 1000 monthly messages of the diary plan. No list to rebuild by hand.' },
      { title: 'How a cancellation is filled', text: 'An hour freed the day before becomes an immediate offer to somebody already on the waiting list, inside the 1000 messages included in the month: the text is ready and only waits for the front desk to say yes.' },
      { title: 'What becomes of stalled treatment plans', text: 'Treatments quoted and never started are the quietest part of a practice’s work. They come back among the day’s priorities with a date and a reason, inside the 1000 monthly messages, instead of sitting at the bottom of the practice software.' },
    ],
    cosaTitolo: 'The work the practice records already contain.',
    cosaIntro:
      'A dental practice does not have a visibility problem: it has thousands of rows of history that nobody has time to read every morning. The value is not in the message, it is in the fact that somebody looks.',
    cosaFacciamo: [
      { title: 'When there is a queue at reception', text: `The phone assistant is the line that holds bookings, changes and cancellations with the 600 minutes of the fee, ${EN_PRICES.voce}, while there is already a patient to look after at the desk.` },
      { title: 'Which hygiene appointments are due', text: `The daily check is a pass over the due dates that flags whoever has reached the interval you set, with the reason and the text ready: 1000 messages included in the month, ${EN_PRICES.agenda}.` },
      { title: 'How a cancellation is covered', text: 'The hour that frees up becomes an offer to somebody who is already a patient and is waiting for a slot, with the message written and waiting for your yes, inside the 1000 messages included in the month. An empty chair stops being a silent loss.' },
      { title: 'What happens to treatment plans', text: 'Treatment plans accepted and never started are brought back among the day’s priorities with the date they were accepted, and the contact sits inside the 1000 messages of the month. No pressure: one message, and the patient decides.' },
      { title: 'Where a first appointment is requested', text: `The practice website is the set of pages that explain the treatments and collect first-appointment requests, ${EN_PRICES.web}: after 12 months of the fee the project belongs to the practice. Forms and statistics included.` },
      { title: 'When it passes to the practice', text: 'Pain, emergencies and clinical questions are the 3 cases that go to a person, following the rules you write. The assistant does not interpret a symptom: it takes the details and hands over, outside opening hours too.' },
    ],
    ciclo: [
      { number: '01', title: 'What we read at setup', text: 'Setup is the collection of the diary, the history, the recall intervals, the contact rules and the tone the practice uses with its patients, alongside the 1000 messages included in the month. The morning priorities come from here: without written rules, a recall turns into just another promotion.' },
      { number: '02', title: 'How the tone is tuned', text: 'Tuning is the stage where you read the sample texts and listen to the phone answers of the 600 minutes of the fee, and correct them before the number is connected. A badly written hygiene recall sounds like an advert: it gets rewritten until it sounds like the practice sending it.' },
      { number: '03', title: 'Which priorities come out each day', text: 'The day’s priorities are a list of 3 kinds: hygiene appointments due, stalled treatment plans and chairs freed by a cancellation, each with the reason written beside it. The 1000 messages included in the month cover the recall activity of a practice working on its own records.' },
      { number: '04', title: 'How a send is approved', text: 'Sending is separate from preparation: the 1000 messages included in the month stay in draft until the front desk gives the go-ahead, one at a time or in groups. A record is kept of what went out, to whom and with what outcome, so next month’s review starts from real numbers.' },
    ],
    faq: [
      { q: 'How do hygiene recalls work?', a: 'A hygiene recall prepares itself and is sent by hand. Every day the system reads the diary and the history, identifies whoever has reached the interval you set and writes the message, inside the 1000 monthly messages. The reason stays written beside each name, so the front desk knows why that person is on the list. Nothing goes out before the go-ahead, and every send leaves a record.' },
      { q: 'What does the assistant answer to somebody in pain?', a: 'Pain is among the 3 cases that pass immediately to a person: no assessment, no advice, handled according to the rules you wrote. Within the 600 minutes of the base fee the assistant handles bookings, changes, cancellations and general information already approved. If the practice is closed, it communicates the instructions you prepared, without adding interpretations of its own.' },
      { q: 'When is a freed chair offered again?', a: 'Immediately: as soon as the cancellation enters the diary, the system identifies who is already a patient and waiting for a compatible slot and prepares the message, inside the 1000 messages included in the month. The front desk reads it and decides whether to send it, to one person or to a small group. In our experience this is where a lost hour is most often recovered, because the offer reaches somebody who had already asked for that appointment.' },
      { q: 'Which treatment plans are picked up again?', a: 'The ones accepted and never started, which sit at the bottom of the practice software without anybody reopening them, and they fall inside the 1000 messages of the month like any other recall. They come back among the day’s priorities with the date of acceptance and the reason, so the front desk decides whether to contact the patient and in what tone. No automatic insistence: the decision about treatment stays with the patient and the practice.' },
      { q: 'How much does the diary and recall service cost?', a: `The fee is ${EN_PRICES.agenda} for the diary and recall side, with 1000 messages included in the month, plus a one-off setup cost stated in the proposal before activation. Phone answering is separate and starts at ${EN_PRICES.voce} with 600 minutes, 10 hours of phone a month. The fees applied by the messaging platforms stay outside the fee, because we do not collect them.` },
      { q: 'How is the practice software connected?', a: 'The practice software does not change: if it works, it stays where it is. The connection with the other tools is quoted after we have seen which of the 2 routes is viable, a direct interface or a periodic export. Exports alone are enough to build the day’s priorities. No record migration is done without an explicit request from the practice.' },
      { q: 'Where does patient data stay?', a: 'The data belongs to the practice, which remains the data controller. What passes through our systems does not end up in any training, and each of the 1000 monthly messages leaves a record of recipient, text and outcome. We process the minimum needed to run recalls and phone answering, and every access is limited to authorised staff. Export and deletion can be requested at any time, at no cost.' },
      { q: 'How many messages are included each month?', a: 'The included allowance is 1000 a month, counted on messages actually sent after the front desk gives the go-ahead: drafts prepared and discarded consume nothing. Messages above the threshold are charged as used at the plan rate, and the messaging platform fees are stated separately. For a practice working on recalls and confirmations the threshold covers ordinary activity.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Client diary and WhatsApp' },
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'fisioterapia-osteopatia',
    nome: 'Physiotherapy and osteopathy',
    sommario: 'People who feel better after three sessions out of six disappear, and nobody calls them back.',
    titoloSeo: 'Physiotherapy: courses resumed and sessions booked | SWA',
    descrizioneSeo:
      'Physiotherapy and osteopathy: patients who stop halfway become visible again every day, with a ready message the practice approves before it is sent.',
    eyebrow: 'Physiotherapy and osteopathy',
    h1: 'They feel better, so they stop. The course is left halfway.',
    lead:
      'An interrupted course is a treatment path that stops when the pain goes rather than when the work is done, and the diary plan puts it back on top with 1000 messages a month included. In the practice, nobody has time to go looking for it by hand.',
    servizio: 'Diary and recalls for physiotherapy and osteopathy',
    tipoServizio: 'Phone answering, recalls and session management for physiotherapy and osteopathy practices',
    promessa:
      'Sessions still to be booked and stalled courses become visible every day, with the text already written. No clinical assessment and no promise of a therapeutic outcome.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Diary and recalls ${EN_PRICES.agenda}. Managed social ${EN_PRICES.presenza}. One-off setup is stated before activation. Prices exclude VAT.`,
    segnali: ['Stalled courses flagged every day', 'Not a word about a patient’s pain', 'The practice approves the text'],
    risultati: [
      { title: 'Which courses have stalled', text: 'An interrupted course is a treatment path with sessions left unbooked, and every day it comes back to the top with the reason written beside it, within the ceiling of 1000 monthly messages. No name picked at random.' },
      { title: 'How the treatment hour is covered', text: 'The hour on the table is when the phone is left uncovered: the 600 minutes of the entry plan cover whoever calls while you are with a patient. Opening hours, availability and the session booked.' },
      { title: 'When the diary has a gap', text: 'A free hour is a ready offer for somebody already in treatment, inside the ceiling of 1000 messages a month and before spending anything to look for new patients. The text stays in draft and goes out after a practitioner gives the go-ahead.' },
    ],
    cosaTitolo: 'The treatment path that interrupts itself.',
    cosaIntro:
      'In physiotherapy the most profitable work is the work already begun: stalled courses, sessions never booked, patients who would come back if somebody called them. What is needed is something that looks at the records every day, without talking about clinical matters.',
    cosaFacciamo: [
      { title: 'When you are at the table', text: `The phone assistant is the voice that answers during sessions: 600 minutes included, fee ${EN_PRICES.voce}. It gives opening hours, availability and approved general information, and books after confirmation.` },
      { title: 'Which patients come back to the top', text: `The daily check compares sessions planned against sessions booked: stalled courses resurface with the reason beside them, and 1000 messages a month are in the fee, ${EN_PRICES.agenda}.` },
      { title: 'How the next session gets booked', text: 'The next appointment is the thing most often lost, because it lives in somebody’s memory: it becomes a ready-written offer, inside the ceiling of 1000 messages a month, that the patient confirms from their phone.' },
      { title: 'Where the free hours go', text: 'A gap in the diary is offered to somebody already in treatment with an open course, with a text ready to approve within the ceiling of 1000 monthly messages. The practice recovers the hour before investing to find a new patient.' },
      { title: 'What the practice publishes', text: `The calendar is 16 posts a month per channel with Presence, ${EN_PRICES.presenza}: exercises, prevention, equipment and the people who work at the practice. Copy and editing included.` },
      { title: 'Where patients look for you', text: 'Being found locally means 3 pieces of work: page structure, the intent of somebody looking for a physiotherapist nearby, and readability for AI answer systems. Quoted after an audit of the existing ones.' },
    ],
    ciclo: [
      { number: '01', title: 'What data is needed', text: 'Setup is the collection of the diary, the session history, the contact rules and the subjects that must never be touched, starting with any clinical reference. The tools you use today are enough: there is no need to change software for the 1000 monthly messages of the plan.' },
      { number: '02', title: 'How the trial sounds', text: 'The trial is listening to the phone answers and reading the sample texts, before the practice number goes live on the 600 minutes of the plan. It is corrected until the tone sounds like the person who greets patients at reception: no real patient is involved during the trial.' },
      { number: '03', title: 'What arrives each morning', text: 'The morning priorities are 3 lists: interrupted courses, sessions still to be booked and hours left empty, each with the reason written beside it. The 1000 monthly messages included cover the ordinary recall work of a practice using the records it already has, without buying lists from anyone.' },
      { number: '04', title: 'When a message goes out', text: 'Sending depends on the go-ahead of a practitioner at the practice, and each of the 1000 monthly messages leaves a record: recipient, reason, text, outcome. Anyone who asks not to be contacted again is excluded permanently, without having to repeat the request.' },
    ],
    faq: [
      { q: 'How does the system notice that a course has stalled?', a: 'An interrupted course is recognised by comparing planned sessions with booked ones. If some are left and there is no future appointment, the patient comes back among the day’s priorities, inside the ceiling of 1000 monthly messages. The check runs every day on the practice’s own records, not on external lists, and the reason for the contact stays written beside each name. Anyone who has completed their course is not flagged.' },
      { q: 'What can the assistant say about a patient’s pain?', a: 'The assistant gives no clinical answers: it answers on opening hours, availability, locations and general information you approved, within the 600 minutes of the entry plan, and books appointments. Judgements about pain, about how the course is going, about exercises to do at home or about whether an examination is needed stay with a practitioner at the practice. The call is passed on according to the rules written at setup.' },
      { q: 'When is the right moment to get back in touch?', a: 'You decide it at setup: after how many days to flag a stalled course, in which time bands to write and when it is better to let it go. The ceiling stays at 1000 messages a month. The system proposes, it does not decide: it prepares the text and queues it, and a practitioner chooses whether and when to send it. In our experience the message works when it recalls an agreed treatment path, not when it looks like an offer.' },
      { q: 'Which contact rules stay with the practice?', a: 'The rules are yours and are written before activation: who to contact, after how long, in what tone and who to exclude for good. Every choice applies across all 1000 messages of the month. The text stays in draft until you approve it, and every send leaves a record of recipient, reason and outcome. Changing a rule takes a request, not a paid reconfiguration.' },
      { q: 'How much does it cost to start with recalls only?', a: `The diary and recall plan is ${EN_PRICES.agenda} with 1000 monthly messages included, plus a one-off setup written in the proposal before activation. Phone answering is a separate service, ${EN_PRICES.voce}, with 600 minutes a month: 10 hours of conversation, addable later without redoing the configuration you already paid for. Fees exclude VAT.` },
      { q: 'Who is the controller of patient data?', a: 'The data controller is the practice, always: patient data stays yours. We process only the minimum the service requires, and nothing that passes through our systems is reused to train models. Clinical or diagnostic information does not enter the messages, which talk about appointments and treatment paths already agreed. Export and deletion can be requested at any time.' },
      { q: 'What practice software is needed to start?', a: 'Practice software is not a requirement to start: we begin from the diary and the history as you keep them today, even if they are split across 2 different tools. If later you want to connect the systems to each other, that is integration work we quote after seeing it, and it stays optional. Changing software in order to activate a recall service is almost always an expense you can avoid.' },
      { q: 'What content does a physiotherapy practice publish?', a: `The useful content is what explains the work without giving therapeutic instructions: general prevention exercises, equipment, typical treatment paths, the people who work at the practice, 16 posts a month per channel with Presence, ${EN_PRICES.presenza}. Every piece passes your approval before it goes out. Anything concerning individual cases or clinical results stays outside the editorial calendar.` },
    ],
    correlati: [
      { href: '/en/services', label: 'Client diary and WhatsApp' },
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'officine-e-servizi-locali',
    nome: 'Garages and local services',
    sommario: 'Opening hours, quotes and service deadlines asked on the phone while you are under the car.',
    titoloSeo: 'Garages and local services: phone and service reminders | SWA',
    descrizioneSeo:
      'Garages and local services: the assistant answers while you are under the ramp, services due come back into view and the website collects the quote requests.',
    eyebrow: 'Garages and local services',
    h1: 'The phone always rings at the worst possible moment.',
    lead:
      'The typical call to a garage is made of three questions — when is there a slot, how much does it cost, what time do you close — and 600 minutes a month cover roughly 200 of them. None of them needs you, but none of them can be missed.',
    servizio: 'Marketing and phone answering for garages and local services',
    tipoServizio: 'Phone answering, service reminders and website for garages and local service businesses',
    promessa:
      'Repetitive calls get an answer and periodic service deadlines come back into view before the customer goes elsewhere. We make no commitment on the number of jobs.',
    notaPrezzi: `Phone assistant ${EN_PRICES.voce}. Diary and reminders ${EN_PRICES.agenda}. Website ${EN_PRICES.web}. Managed social ${EN_PRICES.presenza}. Prices exclude VAT.`,
    segnali: ['Answers with the car on the ramp', 'Service dates remembered for your own customers', 'Quote requests collected overnight'],
    risultati: [
      { title: 'How the phone is answered under the ramp', text: 'Questions about opening hours, availability and timing are handled without stopping the job in progress, inside the 600 minutes of the base fee. The car stays on the ramp and the call still finds a voice.' },
      { title: 'Which service dates come back into view', text: 'Services, inspections and periodic maintenance are work that is already yours, coming back to the top of the list before it falls due, with the allowance of 1000 messages of the diary plan. The reminder waits for your go-ahead before it leaves.' },
      { title: 'Where a quote request lands at 10pm', text: `The 10pm request is collected by the website, which is online ${EN_PRICES.web}, and after 12 months of the fee the project is yours. Whoever is looking for a quote finds a form, not a number ringing out.` },
    ],
    cosaTitolo: 'First the noise, then the work that comes back.',
    cosaIntro:
      'In a garage you start by taking the noise off the phone, because it is the most obvious cost of the day. Then you go and pick up the periodic work that is already in the customer records.',
    cosaFacciamo: [
      { title: 'What it says on the phone', text: `The phone assistant is the switchboard that answers with your hands in an engine: 600 minutes included, fee ${EN_PRICES.voce}. It gives opening hours, services, indicative timings and availability that you approved.` },
      { title: 'When a service falls due', text: `The service reminder is prepared by reading the job history: whoever is approaching the date comes back flagged, within the allowance of 1000 messages a month, ${EN_PRICES.agenda}.` },
      { title: 'Where a quote is requested', text: `The garage website is the page that collects quote and appointment requests even with the shutters down, ${EN_PRICES.web}. Forms, journey statistics and contact numbers in plain view.` },
      { title: 'How drivers find you', text: 'Local search is the work on the intent of somebody looking for a garage open right now, on 3 fronts: page structure, services listed by name, and text readable by AI systems. Quoted after an audit.' },
      { title: 'What shows the work', text: `Content is 16 pieces a month per channel on the Presence plan at ${EN_PRICES.presenza}: jobs, the bench, vehicles and people. It is the material that tells a garage apart from a phone number.` },
      { title: 'How the systems are connected', text: 'Integration is the work needed when the same piece of data is asked for 3 times: the management software, the website forms and the records stop being separate islands. Quoted after seeing what you actually use.' },
    ],
    ciclo: [
      { number: '01', title: 'Which questions you get', text: 'The first step is putting in writing the 3 questions you hear every day: when is there a slot, how much does it cost, what time do you close. Along with the indicative timings and costs you are willing to give on the phone. The configuration comes from those answers, and what is not written does not get said.' },
      { number: '02', title: 'How the voice is tested', text: 'The trial is listening to the answers on real cases from the garage, before the number is connected to the 600 minutes of the plan. Words, timings and the way an appointment is offered are corrected: if an answer seems wrong to you, it is rewritten there and then instead of being discovered with a real customer.' },
      { number: '03', title: 'How it goes into service', text: 'Activation is putting the 600 monthly minutes into service, roughly 200 conversations of three minutes, with the number connected the way you decided. Calls get an answer even with a car on the ramp, and each one leaves an outcome and a summary to read when you stop.' },
      { number: '04', title: 'When a service comes due', text: 'Periodic dates are read from the history and offered before the deadline: services, inspections, seasonal changes, within the allowance of 1000 monthly messages. They cover the recall of the customers you already have on file, and every reminder leaves only after your go-ahead.' },
    ],
    faq: [
      { q: 'What can the assistant say about a quote?', a: 'A quote is and remains your judgement: the assistant gives only the indicative costs you loaded, collects the request and books the appointment at the desk, inside the 600 minutes of the base fee. A figure given on the phone about a fault nobody has seen becomes an expectation that is hard to correct once the car is on the ramp. Callers leave the registration, the model and the reason, so when you call back you already know what it is about.' },
      { q: 'How do the service reminders work?', a: 'A service reminder comes from the job history, inside the 1000 monthly messages. Every day the system finds who is approaching a service, an inspection or a maintenance date, and prepares the message with the reason. The text is ready, but it only leaves after your go-ahead. Anyone who no longer wants reminders is excluded permanently.' },
      { q: 'Which calls get passed to you?', a: 'The ones that fall outside the rules written at setup: faults to be assessed, complaints and requests you did not load among the answers of the 600 minutes of the plan. The assistant does not improvise a technical answer: it takes the name, number and reason and leaves you the note, or transfers the call straight away during the hours you decide. It handles the rest on its own, without making you come down off the ramp.' },
      { q: 'How much does the phone assistant cost?', a: `The fee starts at ${EN_PRICES.voce} with 600 minutes included, roughly 200 conversations of three minutes: 10 hours of calls a month, plus a one-off setup cost stated in the proposal. Minutes above the threshold are charged as used at the plan rate, without renegotiating the contract. The phone number and carrier traffic stay separate from the fee, because they are third-party costs we do not collect.` },
      { q: 'How is the garage number connected?', a: 'The connection is a call diversion to the assistant’s number, or a dedicated number alongside yours: the choice is made at setup, on the 600 minutes of the base plan, and it can be changed. Anyone with a single number usually diverts calls when the garage is closed or when nobody answers within a few rings. The garage’s long-standing number stays yours, registered to you.' },
      { q: 'What about businesses other than garages?', a: 'The mechanism is identical for anyone working by appointment with periodic deadlines: installations, maintenance, technical support, fitters. The same 2 thresholds apply, 600 minutes of phone a month and 1000 messages for the recalls. What changes is the wording loaded into the panel, not the way it works. The configuration is adapted to the vocabulary of your trade during setup.' },
      { q: 'Where can you read the calls received?', a: 'The call log is where you find the outcome, a summary and, depending on the active plan, the transcript of the conversations handled within the 600 minutes of the month. It is what you check at the end of the day to know what happened while you were under the ramp: who called, what they wanted, what appointment was booked. It is also where you correct the answers that do not convince you.' },
      { q: 'Why does a local garage need a website?', a: `The website is where a 10pm request becomes an appointment the next morning, and the base fee is ${EN_PRICES.web}, with the project yours after 12 months. Somebody looking for a garage in the evening does not wait for opening time to call: either they find a form, or they move on to the next name. Forms, journey statistics and services listed by name are included in the fee.` },
    ],
    correlati: [
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/services', label: 'Websites and automation' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
  {
    slug: 'elettricisti-e-idraulici',
    nome: 'Electricians and plumbers',
    sommario: 'The job report signed on site, instead of the paper pad in the van.',
    titoloSeo: 'Job reports and websites for electricians and plumbers | SWA',
    descrizioneSeo:
      'Job report filled in and signed on the phone, PDF to the client before you leave, a website that collects the calls and an assistant that answers.',
    eyebrow: 'Electricians and plumbers',
    h1: 'The report closes before you get back in the van.',
    lead:
      'The paper receipt pad is still the most common tool, and the slowest: it gets written twice, it gets lost, and when a client disputes the work there is nothing to show. The same job, on the phone, closes with photos and a signature.',
    servizio: 'Job reporting and online presence for trades',
    tipoServizio: 'Digital job reports, website and phone answering for electricians, plumbers and maintenance technicians',
    promessa:
      'Every job stays documented with photos and the client’s signature, and the calls that come in while you work get an answer. No promise about the number of jobs.',
    notaPrezzi: `Job report module quoted on request: it depends on the number of operators and on the report templates. Website ${EN_PRICES.web}. Phone assistant ${EN_PRICES.voce}. Prices exclude VAT.`,
    segnali: ['Client signature on the phone', 'PDF sent before you leave', 'Calls collected while you work'],
    risultati: [
      { title: 'No writing it twice', text: 'What you write on site is already the final document: it is not copied out again at the office in the evening and it does not get lost on the way.' },
      { title: 'Disputes that close', text: 'Photos of the installation, materials used and the client’s signature sit in the same report: the argument ends with a document.' },
      { title: 'Calls not lost', text: 'Whoever calls while your hands are inside a consumer unit finds an answer, opening hours and an appointment booked.' },
    ],
    cosaTitolo: 'What we do for a trade business.',
    cosaIntro:
      'The path is the same as for the other trades, tuned to the van: the website brings the call, the phone collects it, the report closes the job.',
    cosaFacciamo: [
      { title: 'Report on the phone', text: 'A pre-filled form per type of job, materials, notes on faults and photos: filled in on site, even with a weak signal.' },
      { title: 'Client signature', text: 'The client signs directly on the screen at the end of the job, and the signature stays inside the document along with the date and time.' },
      { title: 'PDF to the client at once', text: 'The report comes out as a PDF and goes by email, WhatsApp or Telegram before you get back in the van.' },
      { title: 'Hours that add themselves up', text: 'Start, finish and break become the total hours, ready to put on an invoice without redoing the sums.' },
      { title: 'A website that brings calls', text: `A page that says what you do, where you work and how to call you, built for the phone. ${EN_PRICES.web}.` },
      { title: 'Somebody answering for you', text: `The assistant gives information on areas and availability, collects the request and books the job. ${EN_PRICES.voce}.` },
    ],
    ciclo: [
      { number: '01', title: 'Templates', text: 'We write the forms for your typical jobs together, so the report is already half filled in.' },
      { number: '02', title: 'Field trial', text: 'You try it on real jobs for a few days and we correct the forms wherever they get in the way.' },
      { number: '03', title: 'In service', text: 'Every job closes on site and the client receives the signed document.' },
      { number: '04', title: 'Calls', text: 'The website and the assistant collect the requests while you are under a sink.' },
    ],
    faq: [
      { q: 'Does it work without a signal in a basement?', a: 'Yes. The report can be filled in on a slow connection too. Photos are compressed on the phone before they leave and the text saves as you write, so a basement or a tunnel does not lose the work already done.' },
      { q: 'Is a signature on a phone valid?', a: 'A signature collected on screen counts as proof that the work was handed over, together with photos, date and time recorded in the document. For uses that require a qualified electronic signature you need a dedicated service, to be assessed with your own advisor.' },
      { q: 'Can I use it with more than one operator?', a: 'Yes. Each operator has their own login and fills in the reports for their own jobs, while whoever is at the office sees everyone’s day, filters by operator or client, and approves or disputes.' },
      { q: 'What is the difference from a paper pad?', a: 'A paper pad gets written twice, gets lost and holds no photos. A digital report starts already filled in from the template for that type of job, carries the images inside the document and reaches the client the same day.' },
      { q: 'Does it replace the invoice?', a: 'No. It is the record of the work done, not a tax document: it describes the job, the materials, the hours and the signature. The invoice stays with your accounting software or your accountant.' },
      { q: 'How much does the whole setup cost?', a: `The job report module is quoted on request, because it depends on the operators and the report templates. The website is ${EN_PRICES.web} and the phone assistant ${EN_PRICES.voce}, with the setup cost stated before activation.` },
      { q: 'Do I need a new phone?', a: 'No. The application installs from the browser on Android phones and iPhones already in use and takes up very little: it is designed to be opened with one hand while the other is holding a tool.' },
      { q: 'Does it work for other trades too?', a: 'Yes, but with adaptation work. The structure is the same — form, photos, signatures, PDF, statuses, panel — while the checklist items, the list of faults and the wording of the document are currently tuned to cleaning companies. Rewriting them for electrical, air conditioning, fire safety or technical support is part of the project and is quoted before starting.' },
    ],
    correlati: [
      { href: '/en/services', label: 'Websites and automation' },
      { href: '/en/services', label: 'AI phone assistant' },
      { href: '/en/pricing', label: 'Pricing' },
    ],
  },
]

// L'ordine e' quello italiano: l'indice /en/settori e la mappa delle lingue
// devono elencare le stesse categorie nella stessa sequenza delle pagine
// italiane, altrimenti chi cambia lingua non ritrova la scaletta che aveva.
const ORDINE = new Map(SETTORI.map((settore, i) => [settore.slug, i]))

export const SETTORI_EN: Settore[] = [...ELENCO].sort(
  (a, b) => (ORDINE.get(a.slug) ?? Number.MAX_SAFE_INTEGER) - (ORDINE.get(b.slug) ?? Number.MAX_SAFE_INTEGER),
)

export function settoreEnBySlug(slug: string): Settore | undefined {
  return SETTORI_EN.find(s => s.slug === slug)
}
