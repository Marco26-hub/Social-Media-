// Le fasi di lavoro dei servizi, in inglese.
//
// Stessi slug della versione italiana, cosi' una pagina inglese chiede le
// proprie fasi con la stessa chiave della gemella e non serve una seconda
// mappa di corrispondenze. Il numero e l'ordine delle fasi combaciano: se
// domani in italiano se ne aggiunge una, qui manca e si vede.

export type FaseEn = { number: string; title: string; text: string }

const FASI: Record<string, FaseEn[]> = {
  'gestione-social-media': [
    { number: '01', title: 'What we collect at the start', text: 'The kick-off is the session where we collect services, prices, photos, materials and the phrases you never want to read on your 2 profiles. One meeting is enough: we write the rest and you correct anything that does not sound like you.' },
    { number: '02', title: 'When you see the calendar', text: 'The first month’s calendar is ready before the month begins, with dates, formats and topics already assigned to the 2 channels. You read it calmly, remove what does not convince you, and only then does production start.' },
    { number: '03', title: 'How it gets produced', text: 'Production is the block where copy is written, graphics are designed and short videos for the 2 profiles are edited, all inside the fee of the active plan. Every piece lands on your dashboard before it goes out.' },
    { number: '04', title: 'When it goes out, and who checks', text: 'Publication is scheduled on the 2 profiles on the days and times set in the plan, and it starts only after your yes. If something fails to go out for a technical reason we notice it and put it back in the queue.' },
  ],
  'seo-geo': [
    { number: '01', title: 'Scan', text: 'Technical setup, content, queries, entities and brand presence.' },
    { number: '02', title: 'Architecture', text: 'One clear URL and hierarchy for each strategic intent.' },
    { number: '03', title: 'Optimisation', text: 'Strategic pages, FAQs, internal links and structured data.' },
    { number: '04', title: 'Measurement', text: 'Coverage, qualified traffic, conversions and AI signals.' },
  ],
  'blog-seo': [
    { number: '01', title: 'Collection', text: 'Services, audience, sources, tone and commercial priorities.' },
    { number: '02', title: 'Plan', text: 'Twelve topics ordered by intent, with internal links.' },
    { number: '03', title: 'Production', text: 'Articles, metadata, FAQs, images and structured data.' },
    { number: '04', title: 'Check', text: 'Review, approval and publication on the agreed channel.' },
  ],
  'siti-e-commerce': [
    { number: '01', title: 'Objectives', text: 'Audience, offer, conversions and commercial requirements.' },
    { number: '02', title: 'Prototype', text: 'Architecture, content, hierarchy and mobile-first journeys.' },
    { number: '03', title: 'Development', text: 'Interface, features, integrations and quality checks.' },
    { number: '04', title: 'Launch', text: 'Analytics, indexing, monitoring and improvements.' },
  ],
  'video-produzione': [
    { number: '01', title: 'Site visit', text: 'We look at the spaces, the natural light and the hours when filming will not stop the business.' },
    { number: '02', title: 'Shooting plan', text: 'Scenes, messages and formats decided in advance, based on the editorial plan for the months ahead.' },
    { number: '03', title: 'Filming day', text: 'Half a day or a full day, with a photographer and, if planned, the chosen face.' },
    { number: '04', title: 'Editing and release', text: 'Selection, editing, subtitles and publication inside the calendar we already run.' },
  ],
  'ricerca-clienti-b2b': [
    { number: '01', title: 'Brief', text: 'Offer, ideal client, markets and exclusion criteria.' },
    { number: '02', title: 'Research', text: 'A separate engine identifies candidates and their public sources.' },
    { number: '03', title: 'Verification', text: 'We check consistency, duplicates and information quality.' },
    { number: '04', title: 'Delivery', text: 'A prioritised list, with sources and reasons, ready for sales work.' },
  ],
  'segretaria-telefonica-ai': [
    { number: '01', title: 'We collect the information', text: 'Services, prices, opening hours, rules and what it must never say.' },
    { number: '02', title: 'We connect the diary and the number', text: 'The assistant reads real availability and answers on your own number.' },
    { number: '03', title: 'You test before activating', text: 'You listen to how it answers and correct it until you are convinced.' },
    { number: '04', title: 'It goes live', text: 'From then on you watch the outcomes and adjust when needed.' },
  ],
  'agenda-clienti-whatsapp': [
    { number: '01', title: 'We connect the data', text: 'We import clients and diary from the file or the system you already use.' },
    { number: '02', title: 'We set the rules', text: 'How often to follow up, who to exclude, what tone to use.' },
    { number: '03', title: 'You approve', text: 'Every morning a few clear actions, with the messages already written.' },
    { number: '04', title: 'We measure', text: 'Replies, recovered appointments and filled slots, month by month.' },
  ],
  'gestione-lavorazioni': [
    { number: '01', title: 'Reviewing the job cycle', text: 'We look at how requests are created today and how reports come back: who fills them in, who checks them and what is actually needed to invoice at the end of the month.' },
    { number: '02', title: 'Templates and records', text: 'We write the sections and fields of the report together, load clients and addresses, create the team’s logins and configure the channels the reports arrive on.' },
    { number: '03', title: 'Field test', text: 'One week of real reports, filled in on site by the operators: then we correct fields, photo categories and wording before extending the method to the whole team.' },
    { number: '04', title: 'Running and maintenance', text: 'The system stays in service with the website connected: new fields, new templates and new integrations are agreed first, and every extra job is approved before the cost.' },
  ],
  'automazione-gestionali': [
    { number: '01', title: 'Map', text: 'Systems in use, data that gets duplicated and recurring manual steps.' },
    { number: '02', title: 'Priorities', text: 'What to automate first, with costs and responsibilities defined before starting.' },
    { number: '03', title: 'Build', text: 'Integration or development, verified on real cases before activation.' },
    { number: '04', title: 'Operation', text: 'Monitoring, corrections and new flows only after the previous ones are verified.' },
  ],
}

export function metodoServizioEn(slug: string): FaseEn[] {
  const fasi = FASI[slug]
  if (!fasi) throw new Error(`metodoServizioEn: slug sconosciuto «${slug}»`)
  return fasi
}
