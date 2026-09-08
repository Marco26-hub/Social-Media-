import type { BlogArticleData } from '@/lib/blog-render'
import { PACCHETTI } from '@/lib/pacchetti'
import { SITE_URL } from '@/lib/site-config'

// Versione inglese del Journal.
//
// Gli articoli italiani stanno in lib/swa-blog-content.ts; qui c'e' la loro
// traduzione, con lo slug in inglese perche' /en/blog/editorial-plan si cerca,
// /en/blog/piano-editoriale-social-esempio-pmi no. `slugIt` tiene il legame con
// l'originale, ed e' quello che permette al cambio lingua di portare il lettore
// sullo stesso articolo invece che sulla home.
//
// I prezzi non sono riscritti a mano: vengono dal listino, come ovunque.

export type BlogArticleEn = BlogArticleData & { slugIt: string }

const PREZZO = {
  presenza: `€${PACCHETTI[0].prezzo.replace('€', '')} per month`,
  crescita: `€${PACCHETTI[1].prezzo.replace('€', '')} per month`,
} as const

export const SWA_BLOG_ARTICLES_EN: BlogArticleEn[] = [
  {
    slug: 'social-media-management-small-business-costs',
    slugIt: 'gestione-social-media-pmi-cosa-include-costi',
    meta_title: 'Social media management for small business: cost and scope | SWA',
    meta_description:
      'What managed social media actually covers for a small business, what it costs per month and how content is counted per channel, with no promises of results.',
    h1: 'Social media management for small businesses: what it covers and what it costs',
    intro:
      'Managed social media for a small business is not a matter of publishing a few posts. It is a continuous process that joins strategy, an editorial plan, production, approval, publishing and analysis of the results. The cost depends above all on the number of channels, the quantity and format of the content, campaigns and the level of support required.',
    sezioni: [
      {
        h2: 'What it means to hand over your social channels',
        paragrafi: [
          'Handing over your social channels means transferring the day-to-day responsibility for the editorial calendar to a professional or a team. The business keeps control of objectives, positioning and final approval, while the supplier organises the work needed to maintain a consistent presence.',
          'A complete service starts from an analysis of the brand, the audience and the offer. Only then are channels, recurring themes, formats and frequency chosen. Without that stage, even visually polished content risks supporting no commercial objective at all.',
        ],
        lista_punti: [
          'Analysis of the brand, the audience and the competitors',
          'Strategy and a monthly editorial plan',
          'Copy, graphics, carousels and short video',
          'Review and approval before anything is published',
          'Scheduling on the agreed channels',
          'A report with the priorities for the following month',
        ],
      },
      {
        h2: 'Which activities drive the price',
        paragrafi: [
          'The number of posts on its own does not describe the value of the service. A piece of content has to be conceived, written, designed, adapted to each platform and checked. A Reel needs a different workflow from a static post; an advertising campaign needs setup, monitoring and separate management of the budget.',
          'The cost is also affected by the number of brands, the number of people involved in approvals, the availability of original material, video production and the need to connect social channels, website, e-commerce or CRM.',
        ],
      },
      {
        h2: 'What managed social media costs with SWA',
        paragrafi: [
          `Social Web Automation offers two transparent monthly levels. The Presence plan costs ${PREZZO.presenza}, excluding VAT, and covers 16 pieces of content a month on each of the two managed channels, that is 32 publications. It is built for businesses that need to communicate consistently and want a managed flow of production, approval and publishing.`,
          `The Growth plan costs ${PREZZO.crescita}, excluding VAT. It covers 24 pieces a month on each of the two channels, that is 48 publications, one SEO and GEO article and competitor analysis. Both plans cover organic growth only: paid campaigns belong to a bespoke configuration, with the budget paid to the platforms kept separate from the fee.`,
          'For e-commerce, multiple brands, high volumes, integrations or complex productions a bespoke configuration is defined. The proposal must clearly state the activities, the revisions, the responsibilities, the timings and the costs that are excluded.',
        ],
      },
      {
        h2: 'How to choose the right service for your business',
        paragrafi: [
          'The choice should start from your internal capacity. If the company already has a strategy, material and somebody coordinating publication, specialist support may be enough. If instead the work stalls because there is no time, you need fuller management.',
          'Before buying, it is worth asking who approves the content, how many revisions are included, which formats are covered, who owns the accounts and how the results are read. A reliable service avoids promises of virality or guaranteed sales and defines what it can actually control.',
        ],
      },
      {
        h2: 'Which results to measure',
        paragrafi: [
          'Followers and views help you understand distribution, but they are not enough to judge the return. A small business should connect social activity to qualified visits, contact requests, appointments, sales and the quality of the conversations generated.',
          'The monthly report therefore has to turn numbers into decisions: which subjects attracted the right audience, which formats produced action, and what is worth changing in the next editorial cycle.',
        ],
      },
    ],
    faq: [
      { domanda: 'Is the advertising budget included in the fee?', risposta: 'No. Campaign management can be included in the service, but the budget paid to Meta, Google or other platforms stays separate.' },
      { domanda: 'Is content published without approval?', risposta: 'No. The SWA process requires the client to review and approve before publication, within the revisions included.' },
      { domanda: 'Can we start with two channels?', risposta: 'Yes. The Presence plan includes two coordinated channels with 16 pieces of content a month on each, that is 32 publications.' },
      { domanda: 'Does managed social media guarantee sales?', risposta: 'No. No serious supplier can guarantee sales or virality. What can be designed and measured is a process aimed at concrete objectives.' },
    ],
    cta_finale: 'Want to work out which plan is sustainable for your business? Compare the SWA packages or ask for an initial analysis.',
    keywords_target: ['Social media', 'social media management for small business', 'social media management costs', 'social media packages'],
    immagine_cover: '/blog/gestione-social-pmi.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 7,
    data_pubblicazione: '2026-08-11T08:00:00.000Z',
    fonti: [
      { titolo: 'Instagram, professional accounts and tools for businesses', url: 'https://help.instagram.com/1038071743007909', nota: 'Meta’s official guide: what changes between a personal profile and a professional account.' },
      { titolo: 'Google Search Central, helpful and reliable content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', nota: 'The criteria Google uses to judge whether content is written for people.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'Managed social media', nota: 'Plan, production, your approval and publishing on 2 channels of your choice.' },
      { href: '/en/pricing', label: 'Packages and prices', nota: 'Presence and Growth item by item, including what stays out.' },
      { href: '/en/method', label: 'How we work', nota: 'The cycle behind every plan, from analysis to the monthly report.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/social-media-management-small-business-costs`,
  },
  {
    slug: 'seo-vs-geo-ai-search-visibility',
    slugIt: 'seo-geo-differenze-visibilita-motori-ai',
    meta_title: 'SEO vs GEO: the differences, and what to do | SWA',
    meta_description:
      'SEO and GEO are not the same thing: one works on being found in a list, the other on being understood and quoted by AI answer systems.',
    h1: 'SEO and GEO: the differences, and how to be found by AI search too',
    intro:
      'SEO improves visibility in search engine results. GEO works on the likelihood that your content, sources and entities are understood and used by generative systems. The two disciplines share the same foundation: content that is useful, accessible, verifiable and tied to a clear identity.',
    sezioni: [
      {
        h2: 'What SEO is',
        paragrafi: [
          'Search Engine Optimization covers the work that helps search engines discover, interpret and present a page. It includes technical aspects, information architecture, editorial quality, internal linking, authority and performance.',
          'For a small business the objective is not to appear for every possible word. It is to hold the searches that express a problem, a comparison or a buying intention consistent with the services you actually offer.',
        ],
      },
      {
        h2: 'What GEO is',
        paragrafi: [
          'Generative Engine Optimization is the name used to describe optimising your presence inside AI-based answer systems. These systems can synthesise several sources, quote pages and offer answers without showing a traditional list of results.',
          'No piece of code can guarantee a citation. What does help is publishing clear, consistent and current information, stating who is responsible for the content, using structured data that matches the page, and earning mentions from relevant sources.',
        ],
      },
      {
        h2: 'SEO and GEO side by side',
        paragrafi: [
          'The two disciplines work on the same content but answer two different questions: SEO asks “does this page deserve to appear among the results?”, GEO asks “can this passage be quoted inside an answer?”. The table puts the differences next to each other.',
        ],
        tabella: {
          caption: 'Differences between SEO and GEO across six practical dimensions',
          colonne: ['Dimension', 'SEO', 'GEO'],
          righe: [
            ['Objective', 'Appearing among the search results', 'Being quoted inside a generated answer'],
            ['Where the result appears', 'On the results page, as a link', 'Inside the text of the answer, with or without a link'],
            ['Unit of measurement', 'Position, clicks, impressions', 'Presence and frequency of the citation'],
            ['What it rewards', 'Relevance, domain authority, page experience', 'Short self-contained answers, verifiable data, cited sources'],
            ['Useful structure', 'Headings, internal links, structured data', 'Question and answer blocks, tables, lists, definitions'],
            ['How you check it', 'Search Console and keyword positions', 'Asking the answer engines the questions your clients ask'],
          ],
        },
      },
      {
        h2: 'What SEO and GEO have in common',
        paragrafi: [
          'A site has to be accessible to crawlers, with stable URLs, correct canonicals and pages linked to each other. Titles and descriptions have to tell the subjects apart, while the text has to answer the user’s question directly before going deeper.',
          'Identity and trust play a central part. The registered company name, the author, contacts, credentials, sources and update dates all help people and automated systems judge the context of what is published.',
        ],
        lista_punti: [
          'Original content that is useful for a precise intent',
          'A structure with descriptive headings and direct answers',
          'Structured data consistent with the visible text',
          'Author and about pages that can be verified',
          'Internal links and relevant external sources',
          'Content updated when the context changes',
        ],
      },
      {
        h2: 'A practical route for a small business',
        paragrafi: [
          'The first step is fixing indexing, sitemap, canonicals, performance and duplicate pages. The second is building an architecture that separates services, commercial questions, guides and case studies. The third is publishing content based on real experience and checking which queries generate impressions and contacts.',
          'For GEO it is also worth checking how the company is described by the main AI systems, without treating a single answer as a definitive result. Answers can change depending on the model, the date, the wording of the question and the sources available.',
        ],
      },
      {
        h2: 'What to avoid',
        paragrafi: [
          'Repeating keywords, creating dozens of near-identical pages or publishing automated text without review does not build authority. Structured data must not declare reviews, FAQs or services that the user cannot actually see on the page.',
          'The most sustainable strategy is to cover well the few areas where the business genuinely has expertise, show authentic evidence, and improve the content on the basis of search data and the questions clients actually ask.',
        ],
      },
    ],
    faq: [
      { domanda: 'Does GEO replace SEO?', risposta: 'No. GEO uses a technical and editorial foundation very similar to SEO and extends it to the way generative systems understand and summarise sources.' },
      { domanda: 'Can a citation on ChatGPT or Gemini be guaranteed?', risposta: 'No. No supplier can control or guarantee the citations produced by an external AI system.' },
      { domanda: 'Do you need an llms.txt file?', risposta: 'It can give some systems a useful summary, but it does not replace indexing, quality content, structured data and authority.' },
      { domanda: 'How long does it take to see results?', risposta: 'It depends on the starting state of the site, the competition, how often you publish and the authority you build. There is no guaranteed timeline.' },
    ],
    cta_finale: 'An effective SEO and GEO strategy starts from a concrete audit. See the SWA service dedicated to organic visibility.',
    keywords_target: ['SEO and GEO', 'generative engine optimization', 'AI search visibility', 'GEO for small business'],
    immagine_cover: '/blog/seo-geo-ai-discoverability.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 7,
    data_pubblicazione: '2026-08-11T08:10:00.000Z',
    fonti: [
      { titolo: 'Google Search Central, AI features in search', url: 'https://developers.google.com/search/docs/appearance/ai-features', nota: 'How Google selects the pages it shows inside generated answers.' },
      { titolo: 'Schema.org, the FAQPage type', url: 'https://schema.org/FAQPage', nota: 'The specification of the vocabulary used to mark up frequently asked questions.' },
      { titolo: 'llms.txt, the proposed standard', url: 'https://llmstxt.org/', nota: 'The format a site uses to declare its own content to language models.' },
      { titolo: 'OpenAI, the crawlers and how to allow them', url: 'https://platform.openai.com/docs/bots', nota: 'The official list of OpenAI user agents and the rules for robots.txt.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'SEO and GEO', nota: 'Audit, intents, entities and structured data: what to change and in what order.' },
      { href: '/en/services', label: 'Blog SEO + GEO', nota: 'Twelve articles a month, reviewed by a person.' },
      { href: '/en/method', label: 'How we work', nota: 'The technical foundation everything else rests on.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/seo-vs-geo-ai-search-visibility`,
  },
  {
    slug: 'social-media-editorial-plan-small-business',
    slugIt: 'piano-editoriale-social-esempio-pmi',
    meta_title: 'Social editorial plan: method and example | SWA',
    meta_description:
      'How to build an editorial plan that holds for a whole month: recurring themes, formats, how much material to gather and who approves before anything is published.',
    h1: 'Social media editorial plan for small businesses: method, structure and a worked example',
    intro:
      'A social media editorial plan translates objectives and positioning into a sustainable content calendar. It is not a list of anniversaries: it establishes the audience, the messages, the recurring themes, the formats, the responsibilities, the approval dates and the indicators to watch.',
    sezioni: [
      {
        h2: 'Where an editorial plan starts',
        paragrafi: [
          'The starting point is the commercial priority. A business may need to explain a complex service, build trust, generate enquiries, support a sales network or promote an online shop. Each objective calls for different content and different calls to action.',
          'Before the calendar you have to define the audience, the problems, the objections, the evidence available and the tone of the brand. It also helps to clarify who supplies material, who approves, and how much time the internal team can give.',
        ],
      },
      {
        h2: 'The recurring themes that keep a calendar balanced',
        paragrafi: [
          'Recurring themes stop you improvising every week. A small business can alternate education, evidence, product, people and conversation. How much weight each area carries depends on the sector and on how much the audience already knows.',
        ],
        lista_punti: [
          'Education: explanations, common mistakes and answers to questions',
          'Evidence: case studies, method, processes and verifiable results',
          'Offer: services, products, differences and terms',
          'People: skills, culture and the work behind the scenes',
          'Conversation: questions, polls and content that gathers signals',
        ],
      },
      {
        h2: 'What an editorial week looks like',
        paragrafi: [
          'A Monday can be given to an educational carousel answering a frequent question. Wednesday can show a stage of the process in a short video. Friday can present a service or a case, linking it to a page on the site and to a measurable call to action.',
          'The same subject should not be copied identically onto every platform. LinkedIn can develop the argument, Instagram can use a visual sequence, while Facebook can favour local context and conversation. The direction stays the same, the language changes.',
        ],
      },
      {
        h2: 'Approval and production without bottlenecks',
        paragrafi: [
          'The calendar has to include the internal deadlines, not only the publication dates. Copy and visuals should be approved in blocks, with one named contact and a defined number of revisions.',
          'An approval portal reduces scattered messages and duplicate versions. Artificial intelligence can speed up research, variants and adaptations, but human oversight remains necessary for accuracy, tone and editorial responsibility.',
        ],
      },
      {
        h2: 'How to measure and improve the plan',
        paragrafi: [
          'Every recurring theme should be tied to a signal. For educational content that can be saves, qualified visits and time on page. For commercial content what counts is clicks, enquiries, appointments and attributable sales.',
          'At the end of the month there is no need to scrap everything that did not get many views. You have to separate distribution, audience quality and objective. A piece with less reach may still have produced a valuable enquiry.',
        ],
      },
    ],
    faq: [
      { domanda: 'How much should a small business publish?', risposta: 'There is no universal number. Frequency and formats have to be sustainable and consistent with your channels, objectives and production capacity.' },
      { domanda: 'Can the same post be used on every social channel?', risposta: 'The subject can be shared, but the text, the format and the call to action should be adapted to how the audience behaves on each channel.' },
      { domanda: 'How far ahead should content be approved?', risposta: 'It is advisable to work in blocks and close approval far enough ahead to allow for revisions, scheduling and the unexpected.' },
      { domanda: 'Can AI produce the whole editorial plan?', risposta: 'It can support analysis and production, but priorities, accuracy, tone and approval have to stay under human control.' },
    ],
    cta_finale: 'SWA builds and runs the editorial plan alongside production, approval and publishing. Compare the packages available.',
    keywords_target: ['Editorial plan', 'social media editorial plan small business', 'social calendar example', 'social content strategy'],
    immagine_cover: '/blog/piano-editoriale-social-pmi.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 6,
    data_pubblicazione: '2026-08-11T08:20:00.000Z',
    fonti: [
      { titolo: 'Google Search Central, helpful and reliable content', url: 'https://developers.google.com/search/docs/fundamentals/creating-helpful-content', nota: 'The editorial quality criteria a social plan should align with too.' },
      { titolo: 'Instagram, professional accounts and tools for businesses', url: 'https://help.instagram.com/1038071743007909', nota: 'What the platform makes available to those publishing as a business.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'Managed social media', nota: 'The editorial plan described here, built for your own business.' },
      { href: '/en/pricing', label: 'How much content per month', nota: '16 or 24 per channel, depending on the plan.' },
      { href: '/en/settori', label: 'Your sector', nota: 'Eleven categories, each with its own recurring themes.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/social-media-editorial-plan-small-business`,
  },
  {
    slug: 'missed-calls-empty-diary-what-to-do',
    slugIt: 'chiamate-perse-agenda-vuota-cosa-fare',
    meta_title: 'Missed calls and an empty diary: what helps | SWA',
    meta_description:
      'Why a missed call is almost always a missed appointment, how to bring back clients who stop coming, and what to check before automating the phone.',
    h1: 'Missed calls and an empty diary: two different problems, two different fixes',
    intro:
      'A business that works by appointment has two gaps that look alike but are not the same thing. The first is people looking for you who cannot reach you: the phone rings while you are with a client and the caller moves on to the next name. The second is people who stopped looking for you: the client who came every six weeks and has not been seen for four months. Confusing the two leads you to buy the wrong tool.',
    sezioni: [
      {
        h2: 'Why a missed call costs more than it looks',
        paragrafi: [
          'Somebody phoning a beauty salon, a dental practice or a garage has already decided to book: they are not looking for general information, they are looking for a free slot. If they get no answer they rarely call back later. They call the next number on the list, and that number is almost always a competitor.',
          'The problem is structural, not organisational. Calls arrive exactly when you cannot answer: during a treatment, with your hands busy, while you are speaking to somebody at the desk. The hours when the phone rings most are the same hours when you are busiest.',
          'A classic answering machine does not solve it, it only moves it: it records a message that somebody will have to listen to, understand and call back. Meanwhile the client has already booked somewhere else.',
        ],
        lista_punti: [
          'Somebody calling to book has already decided: the enquiry is warm',
          'Calls arrive in the hours when you are least available',
          'An answering machine defers the problem instead of closing it',
          'Nobody counts the missed calls, so the cost stays invisible',
        ],
      },
      {
        h2: 'The other gap: clients who stop coming without saying so',
        paragrafi: [
          'A client who stops coming almost never leaves slamming the door. They simply thin out: they skip an appointment, then put it off, then months pass. Nobody notices, because there is no precise moment when it happens.',
          'It is the greatest asset you have on file and also the most neglected. Those people know you, they know where you are, they have already spent money with you: bringing them back costs far less than finding new ones. But it takes remembering them at the right moment, and that is exactly what nobody has time for at the end of the day.',
          'The same goes for free slots. A cancellation leaves a gap that could be filled, if only somebody knew who to call in the two hours that remain.',
        ],
      },
      {
        h2: 'What you can do without any technology',
        paragrafi: [
          'Before buying any tool it is worth sorting out three things, because they cost nothing and sometimes they are enough.',
          'First: know how many calls you actually miss. Almost no business measures it, and without that number every decision is guesswork. The phone records will tell you.',
          'Second: write down the answers to the questions you get a hundred times. Prices, opening hours, how long things take, how to find you. If they are written down, anybody at the practice can answer without calling you.',
          'Third: keep a list, even on paper, of everybody who has not been seen for more than three months. Looking at it once a week is already a form of client recovery.',
        ],
        lista_punti: [
          'Measure the missed calls: without that number you are deciding blind',
          'Put the answers to recurring questions in writing',
          'Keep a list of everybody who has not come back for over three months',
          'Decide who calls back, and when: if it is everybody’s job it is nobody’s',
        ],
      },
      {
        h2: 'What an AI phone assistant can do',
        paragrafi: [
          'When the call volume goes beyond what one person can handle while working, a phone assistant can answer in your place: it gives information on services, prices and opening hours, checks the calendar, offers the free slots and books the appointment. Sensitive or unanticipated requests are passed to a person.',
          'The difference from an automated switchboard is that there is no menu to get through: the caller simply talks. And every call leaves a transcript, so you no longer have to listen back to messages to work out what happened.',
          'The limit has to be said out loud: an assistant handles repetitive requests well, not delicate conversations. A complaint, a clinical situation, a negotiation all want a person. Anybody selling it as a complete replacement for staff is overstating it.',
        ],
      },
      {
        h2: 'What automated client recovery can do',
        paragrafi: [
          'For the second gap the tool is different. A system that reads the diary and the history can flag whoever has been missing too long, whoever left a treatment course halfway, and whoever could cover the slot that came free on Friday, and prepare the message already written.',
          'Here there is only one rule that matters: the message must not go out on its own. It has to reach you, you read it and you decide whether to send it. A system that writes to your clients without your oversight will sooner or later send the wrong thing to the wrong person, and you are the one who pays for it.',
          'Consent and the ability to opt out have to be handled too: contacting somebody on WhatsApp who never gave consent is not only bad manners, it is a regulatory problem.',
        ],
      },
      {
        h2: 'What to ask before you buy',
        paragrafi: [
          'The questions that separate a serious supplier from one who improvises are few and concrete.',
          'How minutes or messages are counted, and what happens above the threshold. What exactly the setup cost covers. Whether the phone number and the carrier traffic are included or separate. Whether you can listen to how it answers before it goes live on your number. Who owns the data and where it is stored.',
          'And above all: what is actually guaranteed. A straight supplier guarantees that the service works, not a number of appointments recovered. That depends on your offer, the season and the relationship you have with your clients — and anybody promising a figure does not know what they are talking about.',
        ],
        lista_punti: [
          'How minutes and messages are counted, and the cost above the threshold',
          'What the setup cost covers, item by item',
          'Whether the phone number and carrier traffic are included',
          'Whether you can trial it before going live',
          'Who owns the data and where it is stored',
          'What is genuinely guaranteed, put in writing',
        ],
      },
    ],
    faq: [
      { domanda: 'Does an AI phone assistant replace the receptionist?', risposta: 'No. It handles the repetitive calls and the ones that would otherwise be lost. Sensitive or unanticipated requests are passed to a person, and the decisions stay with the practice.' },
      { domanda: 'Does the caller understand they are speaking to an automated system?', risposta: 'They should, and the assistant should introduce itself as one. Hiding that it is an automated system is not advisable, either from a regulatory point of view or for the relationship with the client.' },
      { domanda: 'Do recovery messages go out automatically?', risposta: 'They should not. The system can prepare the drafts, but sending has to be approved by a person. A wrong message sent to a client is damage the business pays for, not the supplier.' },
      { domanda: 'Do we need to change our practice software?', risposta: 'Normally no. Client and diary data can be imported from a file or from the software already in use. Particular integrations have to be assessed beforehand and are not automatically included.' },
      { domanda: 'How many clients come back?', risposta: 'That is not a number anybody can promise. The system spots the opportunities and prepares the work; how many people return also depends on your offer, the season and the existing relationship.' },
    ],
    cta_finale: 'Want to work out which of the two gaps costs you more? Look at how the AI phone assistant works, or the WhatsApp client recovery, and let us talk it through.',
    keywords_target: ['missed calls', 'AI phone assistant', 'win back clients', 'fill the diary', 'lost appointments'],
    immagine_cover: '/blog/chiamate-perse-segretaria-ai.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 8,
    data_pubblicazione: '2026-09-07T09:00:00.000Z',
    fonti: [
      { titolo: 'WhatsApp Business Messaging Policy', url: 'https://business.whatsapp.com/policy', nota: 'Meta’s rules on what you may write to a customer and with what consent.' },
      { titolo: 'Regulation (EU) 2016/679, GDPR', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', nota: 'The official text on EUR-Lex: lawful bases for processing and the rights of the data subject.' },
      { titolo: 'Italian public opt-out register for marketing calls', url: 'https://www.registrodelleopposizioni.it/', nota: 'The register through which a person objects to promotional calls in Italy.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'AI phone assistant', nota: 'Answers while you work, with your own price list and opening hours.' },
      { href: '/en/services', label: 'Diary and client recovery', nota: 'Whoever has not come back for months returns among the day’s priorities.' },
      { href: '/en/settori/parrucchieri', label: 'Hair salons and barbershops', nota: 'How it works in a salon, with your hands busy.' },
      { href: '/en/settori/studi-dentistici', label: 'Dental practices', nota: 'Hygiene recalls and treatment plans never started.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/missed-calls-empty-diary-what-to-do`,
  },
  {
    slug: 'ai-act-obligations-small-business',
    slugIt: 'ai-act-obblighi-pmi-cosa-fare',
    meta_title: 'AI Act: what applies to a small business | SWA',
    meta_description:
      'Which AI Act obligations apply to a small business, the difference between developing and using AI, the deadlines, and the staff training already in force.',
    h1: 'The AI Act: what it actually means for a small business',
    intro:
      'The European regulation on artificial intelligence is in force and its main rules apply from 2 August 2026. Many businesses do not realise they are covered, because they assume it concerns whoever builds AI systems. In fact it also concerns whoever uses them, and using an assistant that answers customers or a tool that writes text is enough to trigger some obligations. Not all of them, though, and the difference matters.',
    sezioni: [
      {
        h2: 'The dates, in order',
        paragrafi: [
          'The AI Act is Regulation (EU) 2024/1689. It entered into force on 1 August 2024, but not everything applies at once: the deadlines are staggered, which is why many people stopped following it after the first headlines.',
          'Prohibited practices — those of unacceptable risk — apply from 2 February 2025, together with the duty to ensure an adequate level of AI literacy among those who use it at work. From 2 August 2025 the rules on general-purpose models, governance and penalties apply. From 2 August 2026 the transparency obligations of Article 50 take effect and enforcement properly begins on prohibitions, general-purpose models, transparency and literacy. It is not the date on which “everything applies”: high-risk systems come later, and the calendar was amended along the way by the digital simplification package on AI. It is worth re-checking it on the Commission’s site before taking decisions. For some high-risk systems tied to regulated products the deadline is 2 August 2027.',
        ],
        lista_punti: [
          '1 August 2024: entry into force',
          '2 February 2025: general provisions, AI literacy and prohibited practices',
          '2 August 2025: general-purpose models, national authorities, European governance',
          '2 August 2026: the transparency obligations of Article 50, measures supporting innovation, and the start of enforcement for general-purpose models, prohibited practices, transparency and literacy',
          '2 December 2026: new prohibitions on non-consensual sexual deepfakes and child sexual abuse material, and the transitional deadline for those already placing systems generating synthetic content on the market',
          '2 August 2027: every Member State must have at least one regulatory sandbox operational',
          '2 December 2027: high-risk systems listed in Annex III',
          '2 August 2028: high-risk AI embedded in products already regulated, Annex I',
        ],
      },
      {
        h2: 'Provider or deployer: the question everything starts from',
        paragrafi: [
          'The regulation assigns different obligations depending on the role. Whoever develops an AI system and places it on the market under their own name is a provider, and carries the heaviest obligations. Whoever uses a system developed by somebody else, under their own authority and in the course of their own business, is a deployer, and carries far lighter obligations.',
          'The great majority of small businesses sit in the second category: they use tools made by others. A beauty salon that switches on a phone assistant does not become an AI provider, any more than it becomes a software manufacturer by using practice management software.',
          'One caution though: the role can change. If a system is substantially modified, or resold under your own brand, whoever does that may take on the provider’s obligations. That is a check to make beforehand, not afterwards.',
        ],
      },
      {
        h2: 'The risk levels, and why almost everything you use is not high risk',
        paragrafi: [
          'The regulation classifies systems by risk. Some practices are prohibited outright: manipulation causing harm, exploitation of vulnerabilities, social scoring, certain forms of emotion recognition in the workplace.',
          'Then there are high-risk systems, those used in areas such as recruitment, access to credit, education and certain essential services. Here the obligations are serious.',
          'Below that sits the band covering the vast majority of everyday business use: tools that write text, answer the phone, organise appointments. They are not high risk, but neither are they exempt from everything: they carry transparency obligations.',
        ],
      },
      {
        h2: 'Transparency: the rule that touches whoever answers customers',
        paragrafi: [
          'If a person interacts with an AI system, they have to be able to know it, unless it is already obvious from the context. In plain terms: an assistant answering the phone or a chat should not let anybody believe it is a person.',
          'On artificially generated content there is a widespread misunderstanding worth clearing up. The duty to mark outputs in a machine-readable format falls on the provider of the system that generates them, that is on whoever makes the model: not on whoever uses it to work.',
          'The deployer has narrower obligations: to declare deepfakes, to inform people exposed to emotion recognition or biometric categorisation, and to label AI-generated text published to inform the public on matters of public interest. On that last point the Commission spells out the exemption that covers almost everybody: if the text has undergone human review or editorial control, no label is needed. Human review means that a person with competence and professional judgement genuinely examined the substance of the content; a spellcheck is not enough.',
          'Translated for a small business publishing commercial content approved by a person before it goes out: the labelling obligation generally does not apply. What does remain is the duty to declare the assistant when it speaks to customers, and staff AI literacy, both in force since February 2025.',
          'The positive flip side: saying it is an assistant does not drive customers away. What drives them away is finding out afterwards.',
        ],
      },
      {
        h2: 'The obligation almost nobody talks about: training',
        paragrafi: [
          'Since February 2025 providers and deployers must take steps to ensure that the staff dealing with the use of AI systems have a sufficient level of competence, taking into account their knowledge, the context, and the people the systems are used on.',
          'That does not mean sending everybody on a master’s course. It means that whoever in the company uses an AI tool has to know what it does, what it does not do, and when to stop. It is an obligation of means, and for a small business it is met with proportionate, documented training.',
          'It is also why this obligation goes unnoticed: there is no form to fill in and no body to send it to. But if it is ever challenged, being able to show you thought about it makes the difference.',
        ],
      },
      {
        h2: 'What to do, in practice',
        paragrafi: [
          'The first step is not to buy anything: it is to take an inventory. Which AI tools are genuinely used in the business, who uses them, what data they work on and which people they come into contact with. The list is often longer than expected.',
          'From there you look at the role — provider or deployer — for each one, check whether any falls among the prohibited or high-risk practices, and review the information given to customers when they speak to a system.',
          'Finally the contracts: what your supplier guarantees, where they keep the data, what happens if the service changes. These are clauses negotiated before signing, not after.',
        ],
        lista_punti: [
          'An inventory of the AI tools genuinely in use',
          'The role for each one: provider or deployer',
          'A check on prohibited practices and high-risk cases',
          'Information given to customers when they speak to a system',
          'Proportionate, documented training for whoever uses them',
          'Supplier contracts: guarantees, data, continuity',
        ],
      },
    ],
    faq: [
      { domanda: 'Does the AI Act also apply to those who only use tools made by others?', risposta: 'Yes, with different and lighter obligations than for those who develop them. Whoever uses an AI system under their own authority in the course of their business is a deployer and still has duties, in particular on transparency and staff competence.' },
      { domanda: 'Do I have to tell customers that an AI assistant is answering?', risposta: 'The regulation provides that anybody interacting with an AI system must be able to know it, unless it is obvious from the context. In practice an assistant answering the phone or a chat should not let anybody believe it is a person.' },
      { domanda: 'Does using AI to write posts make my company high risk?', risposta: 'Generally no: marketing and communication uses do not fall into the high-risk categories, which cover areas such as recruitment, credit or essential services. The transparency obligations on artificially generated content still apply. The assessment has to be made on the actual case.' },
      { domanda: 'What is the risk of not complying?', risposta: 'The regulation provides for administrative fines, with different amounts depending on the infringement: the highest concern prohibited practices. The amount that applies depends on the infringement and on the size of the business.' },
      { domanda: 'Is one document enough to be compliant?', risposta: 'No. The obligations concern conduct, not forms: what you tell customers, how you train whoever uses the tools, what you checked before switching them on. Documentation serves to demonstrate that, not to replace it.' },
    ],
    cta_finale: 'This article is for information only and does not replace advice on your actual situation. We are preparing video courses on the AI Act with Avv. Vincenzo Sapone, a Cassation lawyer: you can reserve a place from the legal AI consulting page.',
    keywords_target: ['AI Act', 'AI Act obligations small business', 'EU AI regulation for companies', 'AI transparency customers', 'AI literacy'],
    immagine_cover: '/blog/ai-act-foto.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 9,
    data_pubblicazione: '2026-09-07T14:00:00.000Z',
    fonti: [
      { titolo: 'Regulation (EU) 2024/1689, the AI Act', url: 'https://eur-lex.europa.eu/eli/reg/2024/1689/oj', nota: 'The official text on EUR-Lex. Literacy in Article 4, prohibited practices in Article 5, transparency in Article 50, penalties in Article 99.' },
      { titolo: 'European Commission, the regulatory framework on artificial intelligence', url: 'https://digital-strategy.ec.europa.eu/en/policies/regulatory-framework-ai', nota: 'The institutional page carrying the application calendar.' },
      { titolo: 'Italian Data Protection Authority', url: 'https://www.garanteprivacy.it/', nota: 'The competent Italian authority when AI processes personal data.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'AI Act and GDPR consulting', nota: 'Delivered by Studio Legale BCS, with Avv. Vincenzo Sapone.' },
      { href: '/en/method', label: 'How we work', nota: 'What we produce with AI assistance and who answers for the choices.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/ai-act-obligations-small-business`,
  },
  {
    slug: 'business-social-video-how-to-do-it-well',
    slugIt: 'video-social-aziendali-come-farli-bene',
    meta_title: 'Business social video: what makes the difference | SWA',
    meta_description:
      'Where the quality of a business video is really lost: light, audio and stability matter more than the camera. Why it pays to shoot in blocks, not one at a time.',
    h1: 'Video for social: what changes with professional equipment',
    intro:
      'A recent phone shoots excellent video, and that is not where things are lost. The difference is made by the equipment around the camera — controlled lighting, dedicated microphones, stabilisation, lenses — and by people who know how to use it. That is professional equipment, and it is the reason two videos shot in the same place look as if they came from two different companies.',
    sezioni: [
      {
        h2: 'The equipment that makes the difference',
        paragrafi: [
          'Light comes first. A ceiling strip light creates hard shadows under the eyes and flattens everything else; a window behind the subject turns people into dark silhouettes. No app corrects bad lighting after the shoot: you can only reshoot.',
          'Audio is second, and it is the most underrated. A phone microphone picks up everything: the room’s reverb, the air conditioning, the street. People forgive a mediocre image, but they stop watching a video that sounds bad within seconds.',
          'Third is stability, together with framing. A handheld camera, a crooked horizon and an off-centre subject all communicate haste. Which is a shame, because the work you are showing is usually done with care.',
        ],
        lista_punti: [
          'Light: soft and in front of the subject, never behind',
          'Audio: a dedicated microphone, away from reverb and noise',
          'Stability: tripod or gimbal, a level horizon',
          'Vertical 9:16: shoot for the format it will be watched in',
        ],
      },
      {
        h2: 'Shoot in blocks, not one video at a time',
        paragrafi: [
          'The most common organisational mistake is producing a video when one is needed. That means setting up lights, audio and equipment every single time for one piece of content, and it ends with nothing being shot at all.',
          'People who work well do the opposite: they concentrate the filming into one session and come away with weeks of material. The same lights, set up once, serve ten scenes, and the cost per piece collapses.',
          'This does require the editorial plan to exist before the shoot. You have to know what you will publish in the following weeks, otherwise you shoot generic material that turns out to be useless.',
        ],
      },
      {
        h2: 'Does somebody need to be in front of the camera?',
        paragrafi: [
          'It depends, and there is no single answer. Content with a face creates more familiarity: the viewer associates a face with the business and remembers it. Content without a face — hands at work, details, before and after — works very well when the trade is visual, and does not require anybody to be comfortable on camera.',
          'The point is sustainability. If the owner is not comfortable, it shows, and after two videos they stop. Better a faceless format done consistently than a talking format abandoned after three weeks.',
          'There are three options: the owner appears, somebody from the staff appears, or you bring in a professional presenter. The choice between a man and a woman is made by looking at who your service speaks to, not at personal preference.',
        ],
      },
      {
        h2: 'What to prepare before the shooting day',
        paragrafi: [
          'An improvised shooting day produces little and tires everybody. A prepared one produces weeks of content and finishes early.',
          'You need to know which scenes are needed and for which messages, which spaces can be used and at what hours the natural light helps, who appears and at what times you can shoot without stopping the work. And the spaces need to be tidy: a detail out of place in shot shows far more on video than in the room.',
        ],
        lista_punti: [
          'A list of scenes, tied to the editorial plan for the coming months',
          'A site visit covering spaces, natural light and noise',
          'The time bands in which you can shoot without blocking the business',
          'Who appears, and in what role',
          'Tidy spaces: on camera everything shows',
        ],
      },
      {
        h2: 'Shooting is not enough: editing and consistency count',
        paragrafi: [
          'Most of the footage never gets used, and that is normal. The value comes from the selection: which seconds to keep, where to cut, what goes in the first three seconds, which are the ones that decide whether anybody stays.',
          'Subtitles are not an accessory: a large share of social video is watched without sound. A video with no on-screen text loses a substantial slice of the audience before it even starts.',
          'And then there is consistency. One good video now and again counts for far less than regular content done decently. Consistency is what the algorithms reward and what an audience recognises.',
        ],
      },
    ],
    faq: [
      { domanda: 'Can you make professional video with a high-end phone?', risposta: 'Yes, the camera is not the limit: plenty of professional content is shot on recent phones. What is needed around it is controlled light, clean audio, direction of the scene and the time to do it. Those are the things that are missing, not megapixels.' },
      { domanda: 'How much content comes out of one shooting day?', risposta: 'It depends on the number of scenes and locations, but shooting in blocks a session normally covers several weeks of publishing. That is why it pays to concentrate the filming instead of producing one video at a time.' },
      { domanda: 'Do I have to appear in the videos?', risposta: 'No. Somebody from the staff can appear, you can use a professional presenter, or you can build faceless content around hands, details and the work itself. Sustainability over time matters more than the choice itself.' },
      { domanda: 'Do we have to close the business to shoot?', risposta: 'Normally no, and it is often counterproductive: footage shot while you work is the most credible. The time bands are agreed during the site visit so as to stay out of the busiest moments.' },
      { domanda: 'Is video useful if I already publish photos?', risposta: 'The two do not exclude each other. Video holds distribution better on most platforms, but a plan made only of video is hard to sustain: a combination of formats is almost always more solid.' },
    ],
    cta_finale: 'If material is the bottleneck, we come and shoot it: a photographer, the equipment and a presenter if needed, with editing and publishing already inside the social plan.',
    keywords_target: ['video for business social', 'how to make instagram video for business', 'corporate video shooting', 'professional reels small business', 'video marketing small business'],
    immagine_cover: '/blog/video-produzione-foto.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 8,
    data_pubblicazione: '2026-09-07T16:00:00.000Z',
    fonti: [
      { titolo: 'Google Search Central, video best practices', url: 'https://developers.google.com/search/docs/appearance/video', nota: 'How to make a video understandable and indexable.' },
      { titolo: 'Instagram, professional accounts and tools for businesses', url: 'https://help.instagram.com/1038071743007909', nota: 'The formats and tools the platform makes available to businesses.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'On-site video shooting', nota: 'A photographer, lights and lenses, filmed where you work.' },
      { href: '/en/pricing', label: 'Video packages', nota: 'From 5 to 20 videos a month, monthly fee.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/business-social-video-how-to-do-it-well`,
  },
  {
    slug: 'b2b-prospect-list-how-to-build-it',
    slugIt: 'ricerca-clienti-b2b-come-costruire-lista',
    meta_title: 'B2B prospecting: build a list that works | SWA',
    meta_description:
      'Why bought databases do not work, how to define your ideal client, which public signals to verify, and what the GDPR says about B2B contact.',
    h1: 'B2B prospecting: how to build a list that actually works',
    intro:
      'Buying a database of companies is the most tempting shortcut and the most disappointing one. Not because the data is false, but because it answers the wrong question: it tells you which companies exist, not which ones have a reason to listen to you now. The difference between a directory and a working list lies entirely there.',
    sezioni: [
      {
        h2: 'Why bought lists return so little',
        paragrafi: [
          'A database sold to anybody has already been contacted by everybody. The companies in it have received the same email from dozens of suppliers, and they have learned to ignore it.',
          'There is also a problem of fit. The filters available — sector, size, area — are crude compared with what you actually need. Two companies with the same industry code and the same headcount can have opposite needs.',
          'Finally the data ages. People change roles, companies close sites, addresses stop working. A list frozen a year ago contains a proportion of noise that nobody declares to you.',
        ],
      },
      {
        h2: 'Start from the ideal client, not from the market',
        paragrafi: [
          'The right question is not “how many companies can I contact”, but “which companies am I already useful to”. The answer is found by looking at the clients you have: which are the most profitable, which come back, which cause the fewest problems.',
          'From there the real criteria emerge, and they almost never coincide with a database’s filters. They might be the organisational model, whether or not there is a dedicated person in-house, or the stage the company is at.',
          'Exclusion criteria matter just as much: who you do not want as a client. Defining them in advance stops the list filling up with companies that would waste your time.',
        ],
        lista_punti: [
          'Look at your best current clients, not at the market in the abstract',
          'Look for the real criteria, not the ones the database offers',
          'Write down who to exclude, and why',
          'Define what makes a company worth contacting now',
        ],
      },
      {
        h2: 'The public signals that actually say something',
        paragrafi: [
          'What distinguishes a useful list is the presence of a reason. It is not enough that the company exists and is in the right sector: you need a signal that explains why it makes sense to talk to them now.',
          'Useful signals are public and verifiable: a website recently rebuilt or untouched for years, a new site opening, a job advert that reveals a direction, presence or absence on a channel that matters in that market.',
          'The working rule is simple: every entry on the list has to carry the source it came from. If a row has no source anybody can check, it is not information but supposition, and it shows on a phone call.',
        ],
      },
      {
        h2: 'What a well-made list looks like',
        paragrafi: [
          'A useful list is short and ordered. Thirty verified companies are worth more than three thousand rows nobody will ever look at, because thirty can genuinely be worked.',
          'Every entry should carry three things: who the company is, why it fits your ideal client, and where the information came from. With those three, whoever picks up the phone already knows what to say.',
          'Duplicates, off-target companies and those whose data is not solid enough have to be removed. A clean list is shorter, and that is fine.',
        ],
        lista_punti: [
          'A few verified companies instead of many raw rows',
          'For each one: the reason and a source anybody can check',
          'Duplicates and off-target profiles removed',
          'A priority order, not a flat directory',
        ],
      },
      {
        h2: 'Making contact: what the rules say',
        paragrafi: [
          'The fact that an address is public does not automatically make it usable for any purpose. In business-to-business commercial contact there is some room, but it has to be assessed case by case, together with the lawful basis you are relying on.',
          'In practice: inform whoever you contact, make objecting easy, and do not reuse the data for purposes other than those you declared. And keep a record of where the data was gathered, which is useful to you before it is useful to any authority.',
          'For that reason research and contact should be kept separate. Building a qualified list is analytical work; contacting it is a separate activity that has to be set up carefully.',
        ],
      },
    ],
    faq: [
      { domanda: 'Why not simply buy a database?', risposta: 'Because it answers the wrong question: it tells you which companies exist, not which ones have a reason to listen to you now. It has also been sold to your competitors, and the data ages quickly.' },
      { domanda: 'How many companies do you need to start?', risposta: 'A few worked properly return more than many ignored. A first cycle on around thirty verified companies lets you see whether the client profile is the right one before widening.' },
      { domanda: 'Does the research include sending the messages?', risposta: 'They are two different activities. The research produces a qualified list with sources and reasons; making contact has its own rules, including regulatory ones, and has to be set up separately.' },
      { domanda: 'Can appointments be guaranteed?', risposta: 'No. What can be guaranteed is the agreed research and verification work. Appointments also depend on the offer, the message and the sales process, none of which are in the hands of whoever builds the list.' },
      { domanda: 'How do you check the data is reliable?', risposta: 'By carrying, for every entry, the public source it came from, so it can be checked. A row without a source anybody can consult should be treated as a supposition, not as information.' },
    ],
    cta_finale: 'If you want to start from clear criteria instead of a bought directory, the B2B prospecting Pilot analyses up to thirty matching companies and delivers a list with sources and priorities.',
    keywords_target: ['B2B prospecting', 'target company list', 'B2B lead generation', 'ideal client profile', 'company database'],
    immagine_cover: '/blog/ricerca-b2b-foto.webp',
    autore: 'Marco Dibenedetto',
    tempo_lettura_min: 8,
    data_pubblicazione: '2026-09-07T17:30:00.000Z',
    fonti: [
      { titolo: 'Regulation (EU) 2016/679, GDPR', url: 'https://eur-lex.europa.eu/eli/reg/2016/679/oj', nota: 'The official text on EUR-Lex: legitimate interest, the privacy notice and the right to object.' },
      { titolo: 'Italian public opt-out register for marketing calls', url: 'https://www.registrodelleopposizioni.it/', nota: 'To be checked before any promotional phone contact in Italy.' },
      { titolo: 'Italian Data Protection Authority', url: 'https://www.garanteprivacy.it/', nota: 'The authority that supervises unsolicited commercial contact.' },
    ],
    collegamenti: [
      { href: '/en/services', label: 'B2B prospecting', nota: 'The Pilot: up to 30 verified companies, with sources and priorities.' },
      { href: '/en/settori/imprese-di-pulizia', label: 'Cleaning companies', nota: 'A sector where the list is built by area and by type of building.' },
    ],
    url_pubblicato: `${SITE_URL}/en/blog/b2b-prospect-list-how-to-build-it`,
  },
]

export function getSwaBlogArticleEn(slug: string): BlogArticleEn | undefined {
  return SWA_BLOG_ARTICLES_EN.find(article => article.slug === slug)
}
