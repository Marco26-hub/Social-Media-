import { Clapperboard, ClipboardCheck, Globe2, Megaphone, Newspaper, ScanSearch, Target, Workflow } from 'lucide-react'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { CANONE_A_CARICO_CLIENTE_EN } from '@/lib/canone-incluso'
import { EN_PRICES } from '@/lib/settori.en'
import { STANDALONE_SERVICES } from '@/lib/standalone-services'
import { VIDEO_PACCHETTI } from '@/lib/video-listino'
import { metodoServizioEn } from '@/lib/metodo.en'
import type { MarketingDetailConfig } from '@/components/MarketingDetailPage'

// Le schede di servizio in inglese.
//
// In inglese i dieci servizi vivevano tutti dentro /en/services, una
// panoramica. Due conseguenze, tutte e due visibili: chi leggeva
// /servizi/seo-geo e cliccava EN finiva su un elenco generico invece che sulla
// scheda, e la sitemap dichiarava dieci pagine italiane come equivalenti della
// stessa pagina inglese — un hreflang che nessuno ricambiava, quindi scartato.
//
// Lo slug inglese e' inglese: /en/services/social-media-management si cerca,
// /en/services/gestione-social-media no. `slugIt` tiene il legame con
// l'originale, come fa gia' il Journal.
//
// I prezzi arrivano dalle sorgenti uniche. Nessuna cifra e' riscritta a mano.

export type ServizioEn = {
  slug: string
  slugIt: string
  title: string
  description: string
  config: Omit<MarketingDetailConfig, 'path' | 'locale'>
}

const LEAD_PILOT = STANDALONE_SERVICES.find(s => s.slug === 'lead-pilot')!

const CTA = 'Book a call'
const CTA_HREF = 'https://wa.me/393477196603?text=' + encodeURIComponent('Hello! I would like to talk about Social Web Automation services.')

export const SERVIZI_EN: ServizioEn[] = [
  {
    slug: 'websites-ecommerce',
    slugIt: '/servizi/siti-e-commerce',
    title: 'Websites and e-commerce for SMEs | SWA',
    description:
      'Mobile-first websites, landing pages and online stores built to turn attention into enquiries. From €19.90 per month, and yours after 12 months.',
    config: {
      eyebrow: 'Web design and digital presence',
      title: 'Websites that carry people from discovery to action.',
      lead: 'We design mobile-first experiences connected to content, social and campaigns. Every page has one job: to explain, to reassure, to collect a contact or to prepare a sale.',
      serviceName: 'Websites',
      serviceType: 'Design and development of landing pages, company websites and e-commerce, quoted on request',
      promise: 'A credible destination that turns attention and traffic into opportunities.',
      startingPrice: '19.90',
      priceCadence: '/month',
      offerHighlight: 'After 12 months of subscription, the website is yours.',
      priceNote: `The fee from €19.90 per month covers a simple landing page or a basic website. Multi-page sites, e-commerce, content, domain, integrations and advanced features are quoted before we start. ${CANONE_A_CARICO_CLIENTE_EN}`,
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      icon: Globe2,
      signals: ['Landing pages from €19.90 per month', 'You own the website after 12 months', 'Mobile-first experience'],
      outcomes: [
        { title: 'Clarity', text: 'A value proposition and journeys anyone can follow in a few steps.' },
        { title: 'Conversion', text: 'Calls to action, forms and content built to turn a visit into an enquiry.' },
        { title: 'Integration', text: 'Social, campaigns, analytics and content working inside the same system.' },
      ],
      deliverablesTitle: 'Strategy, interface and measurement in the same project.',
      deliverablesIntro: 'We do not start from a graphic theme. First we define objectives, information and expected actions, then we build the experience and the tools it needs.',
      deliverables: [
        { title: 'Architecture and messages', text: 'We define pages, hierarchy, value proposition and journeys based on audience, offer and objectives.' },
        { title: 'UX and responsive design', text: 'Sober, readable, fast interfaces, designed for small screens first and extended to desktop after.' },
        { title: 'Conversion landing pages', text: 'Pages focused on a campaign, a service or a lead magnet, with a persuasive and measurable sequence.' },
        { title: 'E-commerce, quoted separately', text: 'Catalogue, variants, payments, orders and communications are designed and quoted as their own project.' },
        { title: 'Technical SEO and content', text: 'Metadata, sitemap, schema, performance, service pages and internal links are set up from the start.' },
        { title: 'Analytics and integrations', text: 'Events, forms, CRM, social and campaigns are connected so you read the journey, not only the visits.' },
      ],
      process: metodoServizioEn('siti-e-commerce'),
      faq: [
        { q: 'What does the fee from €19.90 per month include?', a: `It is the starting technology fee for a simple landing page or a basic website, VAT excluded, and it covers hosting, maintenance of the base project, responsive design and essential technical SEO. ${CANONE_A_CARICO_CLIENTE_EN} Multi-page sites, e-commerce, content, catalogues and advanced features are defined and quoted before we start, never charged afterwards.` },
        { q: 'Does €19.90 per month include an online shop?', a: 'No, and it is worth saying plainly: that figure covers the website only, and it corresponds to a simple landing page. An online shop has a catalogue, payments, order handling and returns, so it is its own project, quoted after we have seen how many products you have and how you want to run them.' },
        { q: 'After 12 months is the website really mine?', a: 'Yes. After 12 months of subscription ownership passes to you: it is written in the offer, it is not an advertising phrase. What stays separate are the recurring costs that do not depend on us — domain, licences, external services — which are stated before we start and continue to exist whichever supplier you choose afterwards.' },
        { q: 'Will the site be fast and readable on a phone?', a: 'Yes, and the design starts from the small screen, because that is where traffic from social and campaigns arrives. We check readability, tap sizes, forms, buttons and image weight on a phone before the desktop: a page that opens slowly at a traffic light does not convert, however beautiful it is.' },
        { q: 'Are SEO and analytics included in the base fee?', a: 'The base fee includes essential technical SEO and the connection to forms, analytics and content. Audits, intent maps, advanced structured data and article production are separate work, inside the SEO + GEO and Blog services. We say so first, because listing five technical items next to a low price is the fastest way to disappoint.' },
        { q: 'Can you connect the site to social and campaigns?', a: 'Yes, and the base fee covers forms, journey analytics and content. Connections to a CRM, advertising platforms or management systems are integrations we quote on the project, after seeing which interfaces they expose: promising a connection without having verified it is the best way to have it break in production.' },
        { q: 'How long does it take to put a site online?', a: 'It depends almost entirely on one thing: how quickly copy, images and decisions arrive. A simple landing page takes a few working days once the material exists; a multi-page site needs more approval rounds. We set the date together at the start, along with who delivers what.' },
        { q: 'Do I need a new domain or can I use mine?', a: 'You can use yours, and that is what we recommend: the domain is your asset and it keeps the history you have already built with search engines. If you do not have one you register it in your own name, with our help. The domain cost stays separate from the fee and remains yours even if one day you change supplier.' },
      ],
      related: [
        { href: '/en/services/social-media-management', label: 'Managed social media' },
        { href: '/en/services/seo-geo', label: 'SEO + GEO' },
        { href: '/en/pricing', label: 'Packages and pricing' },
      ],
      passo: {
        n: 1,
        titolo: 'The website',
        poiHref: '/en/services/social-media-management',
        poiLabel: 'the content that brings people in',
      },
    },
  },
  {
    slug: 'social-media-management',
    slugIt: '/servizi/gestione-social-media',
    title: 'Managed social media for SMEs | SWA',
    description:
      'Two social channels planned, produced and published for you. From €490 per month, setup included, nothing goes out without your approval.',
    config: {
      eyebrow: 'Managed social media for SMEs and professionals',
      title: 'Someone who thinks, writes and publishes your social media for you.',
      lead: `Managed social media starts at ${EN_PRICES.presenza} and covers 2 profiles, from planning what goes out to scheduled publication. You read and say yes; the production work stays with us.`,
      serviceName: 'Social media management',
      serviceType: 'Social media management for SMEs and professionals',
      promise: 'A profile that publishes every week, without hiring anyone and without taking hours from your own work.',
      icon: Megaphone,
      startingPrice: '490',
      priceCadence: '/month',
      signals: ['Setup included in the fee', '2 profiles, one single calendar', 'A report and a call every month'],
      outcomes: [
        { title: 'What goes out every week', text: 'On the Presence plan that is 4 times a week per profile on average: posts, carousels and Reels already written, edited and scheduled. On Growth it becomes 6, and every month an article written for people searching on Google.' },
        { title: 'How the profile is recognised', text: 'The way of writing and the visual line are decided once at the start, across the 2 profiles, and stay the same on every piece after that. Someone scrolling recognises the business before reading the name above the post.' },
        { title: 'What you stop doing', text: 'The time you get back is what you spend today inventing the evening post, hunting for the right photo and remembering to publish on 2 profiles. Over 12 months that is 384 pieces on the Presence plan you no longer have to think about.' },
      ],
      deliverablesTitle: 'From the first audit to the last post of the month.',
      deliverablesIntro: 'The fee covers the people who think, write, design and publish the content. Paid advertising, replying to comments and messages, and filming on site stay outside: they have their own prices.',
      deliverables: [
        { title: 'What we look at before starting', text: `The kick-off audit reads the offer, the audience and the profiles already running, and it is included in the fee from ${EN_PRICES.presenza}: we fix images, descriptions and contact details on the 2 channels. On Growth we also look at what competitors publish.` },
        { title: 'How the calendar is built', text: 'The editorial plan is the list of what goes out and when, closed before the month begins: recurring formats, seasonal topics and dates already assigned across the next 30 days. You see it all in advance, not the evening before.' },
        { title: 'Who writes and who designs', text: `Production is copy and design together: 12 posts or carousels and 4 Reels per profile every month on Presence, rising to 18 and 6 on Growth, the ${EN_PRICES.crescita} plan. Editing the short videos is already included.` },
        { title: 'How it adapts to each channel', text: 'Adaptation is the step where the same content changes size, framing and copy for the channel it goes out on, because on the 2 profiles a carousel and a Reel are not watched the same way. The identical file is never published twice.' },
        { title: 'When an offer gets a push', text: 'An organic campaign is 1 block a month where several pieces carry the same offer or service across both profiles. The budget paid to the platforms is €0: it works with normal publishing only.' },
        { title: 'What the report says', text: 'The report is the end-of-month summary of what went out and how it did, read together on a 30-minute call on Presence and 45 minutes on Growth. From there you decide what to keep and what to change next month.' },
      ],
      process: metodoServizioEn('gestione-social-media'),
      faq: [
        { q: 'How many social channels are included?', a: 'Both plans cover 2 social channels run from a single calendar. What changes is volume: Presence produces 16 pieces a month for each channel, up to 32 published, while Growth produces 24 per channel, up to 48, plus one SEO + GEO article. Channels are chosen on the audience and on your ability to produce useful material, not to be present everywhere: two channels looked after beat four abandoned ones.' },
        { q: 'What does managed social media cost per month?', a: 'Presence is €490 per month and Growth €990 per month, VAT excluded, with setup included in both. The difference is volume and monthly creative direction: Growth adds an article, competitor analysis, the advanced report and a 45-minute strategy call instead of 30. There are no hidden activation costs, and renewal is monthly.' },
        { q: 'Do I have to prepare the content?', a: 'No. Editorial plan, copy, graphics, carousels and short videos are produced by us according to the active plan. What you provide is the real information — services, prices, materials, approvals — and a look at the content before it goes out. If you already have photos or video we use them; if you do not, filming on site is a separate service that adds to the plan.' },
        { q: 'Is content published automatically?', a: 'No, never. Every piece passes an approval before reaching a channel, and approving is not publishing: sending is a second, explicit command. You see the content in the channel’s real format, with its date, and you can request the revisions the plan includes. Eight steps of our chain stop until a person decides.' },
        { q: 'How many revisions are included?', a: 'The Presence plan includes 2 revisions per piece, and Growth inherits them along with everything else. Revisions are requested from the portal, where every request stays recorded with its date: they do not get lost in a chain of emails. Beyond that number changes are agreed, and no work outside the plan generates a cost without your go-ahead.' },
        { q: 'Is managing comments and messages included?', a: 'No, not in the two list plans. Handling comments and direct messages requires response times and responsibilities that have to be agreed, so it falls under a custom configuration. The standard plans cover production, approval, publication and the report: what goes out is ours, what comes back stays yours.' },
        { q: 'Are paid campaigns included?', a: 'No. Presence and Growth are organic-only plans: no advertising budget is included and none is spent in your name. Campaigns fall under a custom configuration, where the management is agreed and the budget paid to the platform stays separate from the fee and under your control, on your own account.' },
        { q: 'What stays mine if I stop?', a: 'The content produced, the materials you provided and the social accounts, which were always yours: we never register profiles in our own name. Renewal is monthly and cancellation follows the terms, with no hidden minimum duration. What you buy is the work, not a tool that keeps you tied.' },
      ],
      related: [
        { href: '/en/services/seo-geo', label: 'SEO + GEO' },
        { href: '/en/services/websites-ecommerce', label: 'Websites and e-commerce' },
        { href: '/en/pricing', label: 'Monthly packages' },
      ],
      passo: {
        n: 2,
        titolo: 'The content',
        primaHref: '/en/services/websites-ecommerce',
        primaLabel: 'the website',
        poiHref: '/en/services/ai-phone-assistant',
        poiLabel: 'who answers the phone',
      },
    },
  },
  {
    slug: 'seo-geo',
    slugIt: '/servizi/seo-geo',
    title: 'SEO and GEO consulting for SMEs | SWA',
    description:
      'Organic visibility for search engines and AI answering systems: technical audit, intent map, structured data and citability scoring. No promised rankings.',
    config: {
      eyebrow: 'SEO and Generative Engine Optimisation',
      title: 'Organic visibility for search engines and AI answering systems.',
      lead: 'We make the company, its services and its expertise easier to find, to interpret and to cite. We work on technical structure, content, entities, sources and structured data, without promising impossible rankings.',
      serviceName: 'SEO and GEO',
      serviceType: 'SEO and Generative Engine Optimisation',
      promise: 'Content that is clear for people, readable for Google and usable by AI systems.',
      icon: ScanSearch,
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      signals: ['Search intent defined', 'Recognisable entities and sources', 'Measurement without promised positions'],
      outcomes: [
        { title: 'Understanding', text: 'Services and expertise described with an unambiguous structure.' },
        { title: 'Findability', text: 'Pages connected to the real queries and needs of the audience.' },
        { title: 'Citability', text: 'Information blocks, FAQs and sources that are easier to use.' },
      ],
      deliverablesTitle: 'A technical and editorial base built to last.',
      deliverablesIntro: 'SEO and GEO share quality, structure and authority, but they measure different surfaces. The work coordinates both without confusing them.',
      deliverables: [
        { title: 'Technical and editorial audit', text: 'We check indexing, metadata, hierarchy, performance, existing content and anything blocking comprehension.' },
        { title: 'Intent map', text: 'We match needs and queries to specific pages, so several URLs stop competing for the same topic.' },
        { title: 'Optimisation specifications', text: 'We define structure, priorities and operational guidance for pages and content, with direct answers and verifiable sources.' },
        { title: 'Schema and structured data', text: 'We organise Organization, Service, Article, FAQ and breadcrumb so the site’s entities are described correctly.' },
        { title: 'Sources, entities and GEO signals', text: 'We strengthen identity, relationships, attribution and citable passages that generative engines can use.' },
        { title: 'Monitoring and priorities', text: 'We watch coverage, queries, pages, mentions and opportunities to define the next piece of work.' },
      ],
      process: metodoServizioEn('seo-geo'),
      tabella: {
        occhiello: 'How we measure',
        h2: 'The five criteria we weight a block’s citability with',
        intro:
          'It is not an assessment by eye: every block of text comes back with a score and with the corrections already written. It is the same method we measure our own pages with before publishing them.',
        caption: 'Citability rubric: the weight of each criterion and what it measures',
        colonne: ['Criterion', 'Weight', 'What it measures'],
        righe: [
          ['Answer quality', '30%', 'Whether the first sentence actually answers the question instead of circling it.'],
          ['Standalone block', '25%', 'Whether the passage makes sense pulled out of the page, without the surrounding context.'],
          ['Structure', '20%', 'Headings, lists and tables an engine can read without interpreting.'],
          ['Data density', '15%', 'How many verifiable quantities there are per hundred words.'],
          ['Uniqueness', '10%', 'How far the passage differs from what everyone else already says.'],
        ],
      },
      faq: [
        { q: 'What is the difference between SEO and GEO?', a: 'SEO works on being found inside a list of results; GEO works on the probability that your content is understood and cited by an AI answering system. They are two different jobs on the same material: the first optimises pages and structure, the second measures how well a block of text answers immediately, stands on its own and carries a verifiable fact.' },
        { q: 'How is the citability of a piece of content measured?', a: 'With five weighted criteria, calculated rather than estimated by eye: answer quality 30%, standalone block 25%, structure 20%, data density 15%, uniqueness 10%. Every block comes back with its score and with the corrections already written, not with a list of good advice. It is the same method we measure our own pages with before publishing them.' },
        { q: 'Can you guarantee first position on Google?', a: 'No, and anyone promising it is selling something they do not control. No supplier can guarantee an organic position or a citation from an AI system, because both depend on third-party algorithms and on competitors. We can guarantee the work: audit, structure, intent, structured data and improvement priorities, with the checks that show what changed.' },
        { q: 'What exactly do you deliver?', a: 'A technical and editorial audit, the search intent map with one page per intent, the optimisation specifications, the structured data and the list of priorities. They are operational documents: they say what to change, on which page and in what order, so your own developer can do the work if you prefer.' },
        { q: 'Does the service include the 12 monthly articles?', a: `No, they are two separate services. SEO + GEO is the audit, structure, intent and priority work, while continuous production of 12 articles a month is the Blog SEO + GEO service, at ${EN_PRICES.blog}. They combine well — the strategy decides what to write and the blog writes it — but each can be activated on its own.` },
        { q: 'Do I need a blog to work on SEO and GEO?', a: 'Not always, but it helps a great deal. Commercial pages cover the searches of people already evaluating a purchase, while the questions people ask before that — how it works, what it costs, what the difference is — need content of their own. Without it you compete only on the most crowded searches, which are also the most expensive.' },
        { q: 'How long before something changes?', a: 'It depends on technical state, competition and domain authority, and no serious date can be promised. Technical corrections take effect in weeks, editorial coverage in months. What you see immediately is the work: corrected pages, valid structured data and measured content, all verifiable the same day.' },
        { q: 'Is my site readable by AI systems?', a: 'It gets checked, and often the answer is no. We verify that the answering systems’ crawlers are allowed in robots.txt, that a summary file for AI exists, that the structured data is valid and that content answers in the first sentence. These are concrete checks: either they are there or they are not, and they are fixed quickly.' },
      ],
      related: [
        { href: '/en/blog', label: 'SWA Journal' },
        { href: '/en/services/websites-ecommerce', label: 'Websites and e-commerce' },
        { href: '/en/method', label: 'Our method' },
      ],
    },
  },
  {
    slug: 'blog-seo-geo',
    slugIt: '/servizi/blog-seo',
    title: 'Blog SEO and GEO: 12 articles a month | SWA',
    description:
      'Blog SEO + GEO service: 12 monthly articles planned, reviewed and published, with FAQs, metadata and structured data. €149 per month.',
    config: {
      eyebrow: 'Organic editorial plan',
      title: 'Twelve articles a month that turn expertise into organic visibility.',
      lead: 'We plan and produce SEO + GEO content connected to the company’s real services. Every article is structured for people, for Google and for AI answering systems, then checked before publication.',
      serviceName: 'Blog SEO + GEO',
      serviceType: 'Production and publication of SEO and GEO blog articles',
      promise: 'A consistent, useful blog connected to the questions clients actually search for.',
      startingPrice: BLOG_SERVICE.price,
      priceCadence: '/month',
      priceNote: `VAT excluded. ${BLOG_SERVICE.trialDays} days to evaluate the service.`,
      offerHighlight: `${BLOG_SERVICE.articlesPerMonth} articles a month`,
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      icon: Newspaper,
      signals: ['A plan of 12 articles a month', 'Reviewed before publication', 'SEO, GEO and structured data included'],
      outcomes: [
        { title: 'Consistency', text: 'A regular editorial calendar, with no empty months.' },
        { title: 'Coverage', text: 'More useful questions and intents covered on the site.' },
        { title: 'Authority', text: 'Services and expertise explained with structure and clear sources.' },
      ],
      deliverablesTitle: 'From choosing the topic to a page ready to be found.',
      deliverablesIntro: 'The service coordinates planning, production and publication. No text goes online without human review.',
      deliverables: [
        { title: 'Monthly editorial plan', text: 'We select 12 topics starting from the offer, the audience, seasonality and relevant search intent.' },
        { title: 'Complete articles', text: 'Title, introduction, H2 sections, direct answers, calls to action and coherent internal links.' },
        { title: 'On-page SEO', text: 'Meta title, meta description, slug, target keyword and a structure search engines can read.' },
        { title: 'GEO and FAQs', text: 'Citable blocks, explicit entities, visible FAQs and correct structured data, with no guarantee of citation.' },
        { title: 'Human review', text: 'We check accuracy, brand tone, claims and readability before publication.' },
        { title: 'Publication or delivery', text: 'Automatic publication on the blog connected to SWA; for external CMSs we agree an integration or deliver ready HTML.' },
      ],
      process: metodoServizioEn('blog-seo'),
      faq: [
        { q: 'How many articles are included each month?', a: `The plan includes ${BLOG_SERVICE.articlesPerMonth} articles a month at ${EN_PRICES.blog}, VAT excluded, spread across an editorial calendar built on real search intent. Every article arrives complete with title tag, meta description, slug, visible FAQs and structured data: ready to publish, not a draft to fix.` },
        { q: 'How is it different from SEO + GEO consulting?', a: 'They are two different jobs: SEO + GEO defines the audit, the structure, the intent and the priorities, while Blog SEO + GEO produces the content consistently. The consulting decides where to go, the blog walks. They can be activated separately, but an editorial plan built on an intent map returns far more than the sum of the two.' },
        { q: 'Are the articles published on my site?', a: 'Yes, on the blog connected to our platform, where publication is automatic after your approval. For WordPress, Shopify or other CMSs we check the integration first: if it is not reliable we deliver ready HTML and metadata to paste, instead of promising a connection that breaks at every update.' },
        { q: 'Who decides the topics?', a: 'We propose them, starting from the questions people actually ask in your sector, and you approve them before writing. No article starts from a title invented at a desk: the list arrives ordered by search intent, so you can see at a glance which pieces answer someone who is buying and which answer someone who is still learning.' },
        { q: 'Who checks the text before publication?', a: 'Every article passes a human review before it goes out, always. AI speeds up research and the first draft, but checking accuracy, tone and consistency with what you actually do stays with a person. It is the reason we do not publish twelve pieces identical to everyone else’s in your sector.' },
        { q: 'Can you guarantee traffic or rankings?', a: 'No, and we do not write it anywhere. Frequency and quality increase search coverage and the chances of being cited, but ranking depends on third-party algorithms and on competitors. We guarantee production: 12 articles a month, with human review and a verifiable structure.' },
        { q: 'What happens in the first 14 days?', a: 'You have 14 days to evaluate the service: we define topics, editorial plan and the first cycle, so you see the method and the quality on real pieces before going further. It is not a free trial, it is a window in which you can stop having already seen the work.' },
        { q: 'Do the articles stay mine?', a: 'Yes. The content produced and published is yours and stays yours even if you stop the service. If the blog is hosted on our platform, we hand it over in a reusable format: we do not hold paid work as a guarantee on renewal.' },
      ],
      related: [
        { href: '/en/services/seo-geo', label: 'SEO + GEO' },
        { href: '/en/services/websites-ecommerce', label: 'Websites and e-commerce' },
        { href: '/en/blog', label: 'SWA Journal' },
      ],
    },
  },
  {
    slug: 'video-production',
    slugIt: '/servizi/video-produzione',
    title: 'Video filmed on your premises | SWA',
    description:
      'A photographer, lights and proper lenses come to you. Four monthly plans, from 5 to 20 vertical videos a month, edited and published inside your plan.',
    config: {
      eyebrow: 'Filming on your premises',
      title: 'Professional equipment, at your place.',
      lead: 'A recent phone films perfectly well, and that is not where quality is lost. The difference is made by what surrounds the camera: controlled lighting, dedicated microphones, stabilisation and lenses, with someone who knows how to use them. We come to you with a photographer, lights and equipment, and film several weeks of material in half a day. If you would rather not be in front of the camera, we bring a face: a man or a woman, your choice.',
      serviceName: 'Filming on site',
      serviceType: 'Video and photo production on site for social content',
      promise: 'Material filmed properly, thought for vertical and cut to the formats we publish. Filming closes the loop: we used to edit what you had, now we produce the raw material too.',
      priceNote: 'Four monthly fees, from 5 to 20 videos a month, spread across the weeks. The price includes travel inside the agreed area; tolls, parking and trips outside the area are excluded and stated first. Special set-ups or several locations are quoted after the site visit.',
      offerHighlight: 'Weeks of content in half a day',
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      icon: Clapperboard,
      startingPrice: String(VIDEO_PACCHETTI[0].prezzo),
      priceCadence: '/month',
      signals: ['Professional lighting, audio and lenses', 'A male or female presenter, your choice', 'Filmed for the vertical format'],
      outcomes: [
        { title: 'Equipment', text: 'Controlled lighting, dedicated microphones, stabilisation and lenses: the kit that changes the result for the same subject.' },
        { title: 'Volume', text: 'One session produces weeks of material: we film in blocks, not one video at a time.' },
        { title: 'Consistency', text: 'The footage enters the editorial plan and is edited and published by us, with nothing changing hands.' },
      ],
      deliverablesTitle: 'What happens on filming day.',
      deliverablesIntro: 'We do not arrive to improvise. The plan of what gets filmed exists first, because we already know what will be published in the following weeks.',
      deliverables: [
        { title: 'Shooting plan', text: 'Before the day we decide scenes, messages and formats: we arrive knowing what is needed, and avoid reshoots.' },
        { title: 'Photographer and equipment', text: 'Lenses, lights and microphones, and above all someone who knows where to put them. A light crew that comes in without stopping your work.' },
        { title: 'A presenter, if you want one', text: 'You can appear, a member of your staff can, or we bring a professional presenter, a man or a woman.' },
        { title: 'The place and the craft', text: 'The premises, the gestures, the details of the trade. This is the material that makes a profile credible even without speaking.' },
        { title: 'Photos from the same set', text: 'The same session also produces stills for posts, covers and the website, without organising a second day.' },
        { title: 'Delivery and editing', text: 'The footage enters the plan: editing, subtitles and publication are already included in the active social plan.' },
      ],
      process: metodoServizioEn('video-produzione'),
      tabella: {
        occhiello: 'Plans',
        h2: 'What filming costs, by plan',
        intro:
          'One session produces five videos: that is why the cost per video sits well below a bespoke promotional video, which in Italy starts at €800. Monthly fees, VAT excluded, travel inside the agreed area included.',
        caption: 'Monthly vertical video production plans: videos delivered, filming sessions and fee',
        colonne: ['Plan', 'Price', 'What you get'],
        righe: VIDEO_PACCHETTI.map(p => [
          p.nome,
          `€${p.prezzo} per month`,
          `${p.video} videos a month in ${p.sessioni} filming session${p.sessioni === 1 ? '' : 's'}`,
        ]),
      },
      faq: [
        { q: 'How long does a filming session take?', a: 'Half a day is almost always enough for several weeks of material, because we film in blocks instead of one piece at a time. A full day is needed when there are several locations, several people on camera or products to set up. We fix the length at the site visit, before the quote.' },
        { q: 'Do I have to appear in the videos?', a: 'No. You can appear, a member of your staff can, or we bring a professional presenter, a man or a woman. The choice follows who your service speaks to, not taste: a format without a face carried on consistently beats a talking format abandoned after three weeks.' },
        { q: 'Do we have to close the business to film?', a: 'No, and we do not recommend it: footage shot while you work is the most credible. At the site visit we choose the quieter hours and film in blocks, without stopping customers. It is why the site visit comes before the quote and not after.' },
        { q: 'Is editing included in the filming price?', a: 'Editing, subtitles and publication are part of the active social plan, not of the filming. Filming produces the raw material; the plan turns it into scheduled posts. They add up, they do not replace each other: without an active plan the footage stays material someone has to edit.' },
        { q: 'What equipment do you bring?', a: 'A photographer, lights, dedicated microphones, stabilisation and lenses. What makes the difference in a business video is not camera resolution: it is controlled light, clean audio and steady framing — exactly the three things missing when you film in a hurry with whatever is at hand.' },
        { q: 'Do we get photos as well, or only video?', a: 'The same session also produces stills, and it is one of the reasons it is worth it: images are needed for posts, covers and the website, and organising a second day with a photographer costs more than the half day where everything is done together.' },
        { q: 'What does filming cost?', a: `There are four plans, and the fee per video falls as the volume rises: ${VIDEO_PACCHETTI.map(v => `${v.nome} ${v.video} videos at €${v.prezzo}`).join(', ')}. These are monthly fees, cancelled with the notice written in the contract. A single bespoke promotional video starts at €800 on the Italian market: here we film in a batch, five videos per session instead of one at a time, and that is the reason for the difference. Prices exclude VAT, travel inside the agreed area included.` },
        { q: 'Do the videos stay mine?', a: 'Yes. The footage and photos produced are yours. You use them wherever you like — social, website, ads, presentations — even if one day you change supplier. What you pay for is material that stays, not access that expires with the subscription.' },
      ],
      related: [
        { href: '/en/services/social-media-management', label: 'Managed social media' },
        { href: '/en/pricing', label: 'Social plans' },
        { href: '/en/contact', label: 'Talk to us' },
      ],
    },
  },
  {
    slug: 'b2b-lead-research',
    slugIt: '/servizi/ricerca-clienti-b2b',
    title: 'B2B lead research and qualification | SWA',
    description:
      'We start from your ideal client and build a qualified list of up to 30 matching companies, each with its public source and a stated priority. €149 one-off.',
    config: {
      eyebrow: 'Assisted commercial research',
      title: 'Companies on target, verifiable sources and clear priorities.',
      lead: 'We start from your ideal client and build a first qualified list of matching companies. Every entry is checked against public sources and comes with the reason it deserves attention.',
      serviceName: 'B2B lead research',
      serviceType: 'Research and qualification of B2B companies',
      promise: 'A tidier commercial base for deciding who to pursue, with no automated outreach and no promise of guaranteed clients.',
      startingPrice: LEAD_PILOT.displayPrice.replace('€', ''),
      priceCadence: ' one-off',
      priceLabel: 'Price',
      priceNote: 'A one-off pilot, VAT excluded. The proprietary research engine runs on separate infrastructure; SWA handles the search criteria, the verification and the delivery.',
      offerHighlight: 'Up to 30 companies analysed',
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      icon: Target,
      signals: ['Ideal client profile agreed first', 'Traceable public sources', 'A stated priority for every company'],
      outcomes: [
        { title: 'Focus', text: 'Market, size and useful signals are defined before the research starts.' },
        { title: 'Verification', text: 'Companies come with sources you can open, not with invented data.' },
        { title: 'Priority', text: 'The list separates the closest matches from the ones to look at later.' },
      ],
      deliverablesTitle: 'A concrete pilot, with readable criteria.',
      deliverablesIntro: 'The service covers research and qualification. It does not include automated outbound campaigns, email sending, or guarantees of meetings and sales.',
      deliverables: [
        { title: 'Ideal client profile', text: 'Sector, geography, size, exclusions and commercial signals are agreed before we start.' },
        { title: 'Company research', text: 'We analyse up to 30 organisations matching the ideal client defined together.' },
        { title: 'Verifiable sources', text: 'The official website and other relevant public sources are reported so you can check.' },
        { title: 'Qualification', text: 'Every company gets a short reason and an operational priority.' },
        { title: 'Cleaning the results', text: 'We remove duplicates, off-target profiles and data that is not reliable enough.' },
        { title: 'Structured delivery', text: 'You receive a list usable for commercial assessment and for your CRM.' },
      ],
      process: metodoServizioEn('ricerca-clienti-b2b'),
      faq: [
        { q: 'How many companies does the service include?', a: 'The pilot costs €149 one-off, VAT excluded, and covers the research and qualification of up to 30 companies matching your ideal client. The actual number depends on how selective the criteria are: twenty companies genuinely on target beat thirty padded out to reach a number.' },
        { q: 'What exactly do I receive?', a: 'A list where every company carries the public source we took it from, the reason it matches you and a priority. It checks in a minute: open the source and verify. It is not a file of rows to trust, it is a list to challenge.' },
        { q: 'Are phone numbers and emails included?', a: 'No, and this is the most important difference to understand before buying. The pilot delivers company, source, reason and priority: a qualified list to work. It does not include named contact details, and anyone selling you those without explaining where they came from is creating a GDPR problem for you, not solving one.' },
        { q: 'Do you send the emails to prospects?', a: 'No. The service includes no automated sending and no cold campaigns: research and contact are distinct activities, including in regulatory terms. The list is worked by your own sales people, who talk about your product better than any automated sequence.' },
        { q: 'Do you guarantee meetings or new clients?', a: 'No, and we do not write it anywhere. We guarantee the research and qualification work agreed, not the replies, not the meetings and not the sales: those depend on how you make contact, what you offer and when you arrive.' },
        { q: 'How is this different from a bought database?', a: 'A bought database answers the wrong question: it contains who exists, not who makes sense for you, and it was sold to your competitors too. Here every entry comes from your ideal client profile and carries its source, so you can verify it today instead of discovering it is stale in six months.' },
        { q: 'How is the ideal client defined?', a: 'With an initial brief where we set the sector, the geography, the size, the exclusion criteria and the public signals that make a company interesting to you. It is the step that decides the quality of the result: vague criteria produce a vague list, and no amount of research can save it afterwards.' },
        { q: 'Can I repeat the research on another market?', a: 'Yes. The pilot is designed to be repeated on different perimeters: another geography, another sector, another company size. Each cycle starts from the brief and produces its own verifiable list, so you can test a market before putting a sales team into it.' },
      ],
      related: [
        { href: '/en/services/social-media-management', label: 'Managed social media' },
        { href: '/en/services/seo-geo', label: 'SEO + GEO' },
        { href: '/en/services/websites-ecommerce', label: 'Websites and e-commerce' },
      ],
    },
  },
  {
    slug: 'systems-automation',
    slugIt: '/servizi/automazione-gestionali',
    title: 'Systems automation and integration | SWA',
    description:
      'We connect the management system, CRM, e-commerce, forms and analytics you already use, and remove the steps repeated every day. Custom development only where needed.',
    config: {
      eyebrow: 'Automation and integrations',
      title: 'The systems you already use, connected and without manual steps.',
      lead: 'Management systems, CRM, e-commerce, forms and analytics often do not talk to each other, and the joining-up is left to people. We connect those systems and remove the steps repeated every day. When a standard tool is not enough, we build one.',
      serviceName: 'Software and systems automation',
      serviceType: 'Integration of management systems and bespoke software development',
      promise: 'Less retyping of the same data and a traceable flow between systems. Included work and costs are defined first, and anything outside the plan is approved before it generates a cost.',
      priceNote: 'A bespoke service: the quote depends on the systems involved and on how many flows are automated. It falls under a custom configuration.',
      offerHighlight: 'Work and costs defined before we start',
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      icon: Workflow,
      signals: ['Flow analysis before any code', 'Integration with existing systems', 'Custom development only where needed'],
      outcomes: [
        { title: 'Less double work', text: 'The same data stops being retyped by hand into two or three different systems.' },
        { title: 'Traceability', text: 'Every automatic step leaves a trace, so an error can be found instead of disappearing.' },
        { title: 'The right size', text: 'First we integrate what exists. We build from scratch only where standard software does not reach.' },
      ],
      deliverablesTitle: 'From mapping the flows to the tool that was missing.',
      deliverablesIntro: 'The work starts from how you work today, not from a platform to adopt. We do not replace the management system if the management system works: we connect it to the rest.',
      deliverables: [
        { title: 'Flow analysis', text: 'We map the manual steps that repeat and which systems actually hold the reference data.' },
        { title: 'Integrations', text: 'We connect the management system, CRM, e-commerce, forms and analytics through the available interfaces.' },
        { title: 'Flow automation', text: 'Recurring operations become automatic, with a log of executions and errors.' },
        { title: 'Bespoke development', text: 'When the tool does not exist, we build it: the platform we produce, approve and publish content with is developed in-house.' },
        { title: 'Human control', text: 'Operations affecting clients or publications still require an approval; they do not start on their own.' },
        { title: 'Documentation', text: 'We hand over what was connected, how to intervene and what happens when a system does not respond.' },
      ],
      process: metodoServizioEn('automazione-gestionali'),
      faq: [
        { q: 'Do you have to replace my management system?', a: 'No. If it works it stays where it is and we connect it to the other systems: replacing it is a business decision, not a technical requirement we impose. Replacing a system people know how to use costs far more than making it talk to the rest.' },
        { q: 'Do my systems need APIs?', a: 'It is the most convenient condition but not the only one. Where there is no interface we look at scheduled exports or other available hooks, and we say up front if a connection cannot be made reliably. A fragile integration that breaks at every update is worse than the manual work it replaces.' },
        { q: 'What does an automation project cost?', a: 'It is quoted, because it depends on the systems involved and on how many flows are automated. We define the work and the cost before starting, and any additional work is approved before it generates a cost: asking for more money after invoicing is the worst possible conversation with a new client.' },
        { q: 'Where do we start?', a: 'From the map of the flows, not from software. We look at which manual steps repeat every day and which system actually holds the reference data: from there it becomes clear what is worth connecting first and what is better left as it is.' },
        { q: 'What happens when an automatic step fails?', a: 'It stays in the queue with its error, instead of being skipped silently. Every execution leaves a trace — succeeded or failed — so a night-time fault is retried from the point that gave way instead of rerunning the whole chain. It is the difference between an automation you trust and one you have to check by hand.' },
        { q: 'Do operations run on their own without any check?', a: 'Not the ones touching clients or publications: those still require an approval. Automation removes the repetitive steps, not the decisions. One wrong message sent automatically to a thousand clients costs more than all the time the automation saved.' },
        { q: 'What do you hand over at the end?', a: 'What was connected, how to intervene when something does not respond and what happens in case of an error. It is operational documentation, not a manual: it exists so the system stays manageable by someone else, including another supplier.' },
        { q: 'Have you built anything of your own?', a: 'Yes: the platform we run client work on is developed in-house — content generation, human approval, scheduled publication, verification of what actually went out and data retention. We build from scratch only where the standard tool does not reach.' },
      ],
      related: [
        { href: '/en/services/ai-phone-assistant', label: 'AI phone assistant' },
        { href: '/en/services/websites-ecommerce', label: 'Websites and e-commerce' },
        { href: '/en/contact', label: 'Talk to us' },
      ],
    },
  },
  {
    slug: 'job-reporting',
    slugIt: '/servizi/gestione-lavorazioni',
    title: 'Website and job reporting for field teams | SWA',
    description:
      'Requests arrive from the website, the job closes on site: checklist, hours, photos and the client signature on the phone, with a PDF before the team leaves.',
    config: {
      eyebrow: 'Website and job reporting',
      title: 'Requests arrive from the website, the work closes on site.',
      lead: 'Whoever works away from the office fills in the report on their phone, with the service checklist, the hours, the photos and the client signature, and whoever is in the office sees it arrive, approves it or disputes it with a written reason. The website that collects the requests is part of the same project, so website, app and dashboard come from one supplier, with one point of contact.',
      serviceName: 'Website and job reporting',
      serviceType: 'Website and field application for job reports',
      promise: 'Requests arrive from the website form to the inbox you choose, the report closes on site with hours, photos and signature, and the office approves or disputes it with a written reason. We do not promise commercial results: we put in writing what the system does and what it does not.',
      priceNote: `The complete system is quoted, because it depends on the number of operators and on how many report templates have to be written for your service. The website starts at €19.90 per month for a simple landing page or a basic site, and you own it after 12 months. The phone assistant that answers calls starts at €199 per month with €590 setup. Prices exclude VAT.`,
      offerHighlight: 'Website, field app and office dashboard',
      primaryCtaLabel: CTA,
      primaryCtaHref: CTA_HREF,
      icon: ClipboardCheck,
      signals: ['A system built and tested end to end', 'Website, field app and dashboard from one supplier', 'We only write down features that actually exist'],
      outcomes: [
        { title: 'The report leaves the site', text: 'The operator closes the job on the phone: hours, checklist, photos and signature stay inside the report, instead of being described out loud back at the office.' },
        { title: 'The office sees the day', text: 'The dashboard shows today’s reports and hours, plus the totals awaiting approval and disputed, with filters by date, operator, client and status.' },
        { title: 'One system, not three', text: 'Website, team app and office dashboard are the same project and the same supplier. Website requests arrive by email: they do not enter the reports on their own.' },
      ],
      deliverablesTitle: 'From the form on the website to the signed PDF.',
      deliverablesIntro: 'Three pieces working together: the website that brings the request in, the app the team uses on site and the dashboard the office checks from. Below is what each contains, with nothing added that is not already in the product.',
      deliverables: [
        { title: 'Multilingual website', text: 'The reference site is published in seven languages, Arabic included with right-to-left layout, with the legal pages and structured data. A site like that is a quoted project, not the base fee.' },
        { title: 'Request form', text: 'A contact form for each language with name, phone, location, property type and service, plus direct WhatsApp calls from the sections of the page.' },
        { title: 'An app installed from the browser', text: 'The application installs from the browser as a full-screen icon, in portrait, without going through the stores: the operator signs in with the credentials you give them.' },
        { title: 'Report templates', text: 'The office governs the sections and the checklist items: eight sections and, in the full template, sixty-three items the operator finds ready to tick.' },
        { title: 'Hours and job data', text: 'Client, address, type, date, start, end and break: total hours are calculated automatically and the arithmetic holds even when a shift passes midnight.' },
        { title: 'Photos taken on site', text: 'Up to ten photos per report across six categories — before, after, anomaly and pre-existing damage among them — compressed on the phone before sending, each with its own note.' },
        { title: 'Coded anomalies', text: 'Anomalies are ticked from a closed list of twelve entries, plus “no anomaly”: today it is tuned to cleaning and housekeeping, and adapting it to another service is quoted work.' },
        { title: 'Signatures and report PDF', text: 'The operator signature is required, the client one optional: the A4 PDF gathers data, checklist, anomalies, photos and signatures, ready to download or print.' },
        { title: 'Sending, with a log', text: 'The report goes by email to the manager or to the company chat, with the PDF attached: every send, successful or failed, stays written at the bottom of the record.' },
        { title: 'Office dashboard', text: 'Filterable history, approval or dispute with a written reason, photo archive, client and address records, team logins and data isolated per company.' },
      ],
      process: metodoServizioEn('gestione-lavorazioni'),
      faq: [
        { q: 'How does an operator fill in the report on site?', a: 'They open the app on the phone, choose the template and find the checklist ready: they tick items as they work, enter the hours, attach the photos and sign before leaving. Every ticked item is written immediately, and the rest of the form saves itself four seconds after the last change. The report moves from draft to complete only when client, address, times and the operator signature are genuinely there: while something is missing, the app warns and does not close it.' },
        { q: 'Does the app have to be downloaded from a store?', a: 'No. It installs from the phone browser and stays as a full-screen icon, in portrait, without going through the App Store or Play Store. The operator does not register themselves: the office creates the account with a temporary password, shown once and handed over in person. From then on they sign in with email and password, and change it whenever they like from their profile.' },
        { q: 'Does it work where there is no signal?', a: 'Without a connection the job data, the notes and the anomalies stay saved on the phone, in a draft tied to that report, with a yellow bar warning that you are offline. Checklist ticks, signatures and photos do need a connection. Recovery happens by reopening the same report on the same phone and the same browser: the draft comes back and you finish from there. There is no synchronisation between different devices, and while the connection is missing the report does not move to complete.' },
        { q: 'Who checks the reports before they are used?', a: 'The office does. From the dashboard it sees completed reports, opens them one by one and decides whether to approve or dispute them with a mandatory written reason. The reason appears in a red box inside the record, so the operator reads what needs correcting. Once out of draft, the report can no longer be edited by whoever wrote it. Approval and dispute send no automatic notifications: whoever checks tells the team the usual way.' },
        { q: 'How is a problem found during the job reported?', a: 'Inside the report, by ticking one of the twelve anomalies provided — property found very dirty, items already broken, areas not accessible, not enough time and so on — where only “other” opens a free text field. The report carries it along: it ends up in the record, in the PDF and in the message reaching the manager, and it can be accompanied by a photo in the “anomaly” category. It is not a support queue: an anomaly has no priority, assignee or deadline, and the only formal response is disputing the report.' },
        { q: 'Does the end client receive the signed report?', a: 'Not automatically. The system sends the PDF to the manager’s email or to the company chat, while sharing on WhatsApp is done by a person who chooses the recipient. The client can sign on the phone at the end of the job, but the signature is optional and remains a mark on the report, with no verified identity and no certified timestamp. There is no client portal: whoever wants to send them the document downloads the PDF and forwards it.' },
        { q: 'Does the system schedule jobs and shifts?', a: 'No. The report is created when the operator opens it on site, not from a scheduled job: there is no calendar, no shifts, no reminders and no push notifications. There is no geolocation or clocking either, and the start time is prefilled from the phone, correctable by hand. If you need the diary side and messages to clients, that is a different service with its own prices.' },
        { q: 'What does it cost and what is needed to start?', a: 'The complete system is quoted, because it depends on the number of operators and on how many templates have to be written for your service. The website starts at €19.90 per month for a simple landing page or basic site, with ownership after twelve months, and the phone assistant that answers calls starts at €199 per month plus €590 setup, VAT excluded. To start you need the list of clients and addresses, the check items you use today and the inbox or chat where reports should arrive.' },
      ],
      related: [
        { href: '/en/settori/imprese-di-pulizia', label: 'Housekeeping and cleaning companies' },
        { href: '/en/settori/elettricisti-e-idraulici', label: 'Electricians and plumbers' },
        { href: '/en/services/systems-automation', label: 'Systems automation' },
        { href: '/en/services/websites-ecommerce', label: 'Websites and e-commerce' },
      ],
    },
  },
]

export function servizioEn(slug: string): ServizioEn | undefined {
  return SERVIZI_EN.find(s => s.slug === slug)
}
