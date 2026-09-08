import { Globe2, Megaphone, Newspaper, ScanSearch, type LucideIcon } from 'lucide-react'
import { BLOG_SERVICE } from '@/lib/blog-service'
import { CANONE_A_CARICO_CLIENTE_EN } from '@/lib/canone-incluso'
import { EN_PRICES } from '@/lib/settori.en'
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
]

export function servizioEn(slug: string): ServizioEn | undefined {
  return SERVIZI_EN.find(s => s.slug === slug)
}
