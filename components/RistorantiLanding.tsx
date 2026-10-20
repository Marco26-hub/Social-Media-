import { UtensilsCrossed } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from './MarketingDetailPage'
import { prezzoMinimoSettore, settoreBySlug } from '@/lib/settori'
import { settoreEnBySlug } from '@/lib/settori.en'
import { GIORNI_PROVA, PIANI_SALA } from '@/lib/ristoranti-listino'
import { richiestaDemoRistoranti } from '@/lib/ristoranti-contatti'

type ProductCopy = Pick<MarketingDetailConfig,
  'serviceName' | 'promise' | 'signals' | 'outcomes' | 'deliverablesTitle' |
  'deliverablesIntro' | 'deliverables' | 'process' | 'faq'>

// The product page describes configuration and modules; the sector page
// describes the venue's needs. Only the actual price list is shared.
const PRODUCT_COPY: Record<'it' | 'en', ProductCopy> = {
  it: {
    serviceName: 'Tavolo: gestionale con menu QR, ordini e prenotazioni',
    promise: 'Scegli il modulo che serve al locale: prenotazioni, ordini e pagamenti oppure entrambi. Configuriamo menu, tavoli, accessi e conto di incasso prima della prova.',
    signals: ['Moduli acquistabili separatamente', 'Menu aggiornabile dal pannello', 'Accessi distinti per titolare, sala e cucina'],
    outcomes: [
      { title: 'Un modulo per ogni flusso', text: 'Le prenotazioni gestiscono disponibilità e conferme; gli ordini collegano il menu del tavolo al conto. Puoi partire dal flusso che vuoi digitalizzare.' },
      { title: 'Dati inseriti una volta', text: 'Carichiamo piatti, varianti e prezzi dal file del locale. Le successive modifiche si fanno dal pannello e vengono mostrate dal QR già stampato.' },
      { title: 'Pagamenti sul tuo conto', text: 'Il circuito di pagamento resta intestato al locale. Canone del software, attivazione e commissioni del fornitore sono voci distinte.' },
    ],
    deliverablesTitle: 'Moduli, configurazione e accessi del gestionale.',
    deliverablesIntro: 'La scelta parte dal processo da gestire. Queste sono le funzioni e le impostazioni da verificare prima di attivare Tavolo nel tuo locale.',
    deliverables: [
      { title: 'Modulo prenotazioni', text: 'Pagina pubblica per ricevere prenotazioni dal sito e dai social, controllo della capienza, promemoria e collegamento per disdire.' },
      { title: 'Modulo ordini e conto', text: 'Il QR identifica il tavolo e apre il menu nel browser. Piatti, note e varianti arrivano nel pannello; ogni ospite può pagare i propri piatti.' },
      { title: 'Caricamento del menu', text: 'Importazione da CSV o TSV; il collegamento alla cassa Tilby richiede l’adesione al relativo programma per sviluppatori. Prezzi e disponibilità si aggiornano dal pannello.' },
      { title: 'Configurazione dei tavoli', text: 'Prepariamo un codice per ciascun tavolo. I QR restano gli stessi quando cambi un piatto, un prezzo o la disponibilità del menu.' },
      { title: 'Ruoli del personale', text: 'Gli accessi distinguono titolare, responsabile, sala e cucina. Prima della prova controlliamo quali operazioni sono disponibili per ciascun ruolo.' },
      { title: 'Incassi e documenti', text: 'Colleghiamo il conto del locale al fornitore scelto. La trasmissione delle fatture richiede un intermediario SDI accreditato; il registratore telematico resta distinto.' },
      { title: 'Configurazioni di servizio', text: 'Per il banco sono disponibili numeri di ritiro. Per le formule a prezzo fisso si configurano prezzo a persona, pranzo e cena e ordinazioni a ondate.' },
      { title: 'Identità del locale', text: 'Logo, colori e dati del ristorante vengono riportati nelle pagine di menu, prenotazione e pagamento. Sito e produzione di contenuti sono servizi separati.' },
    ],
    process: [
      { number: '01', title: 'Scegliere i moduli', text: 'Ricostruiamo il percorso attuale di prenotazione, ordine e incasso e individuiamo il modulo da provare.' },
      { number: '02', title: 'Preparare i dati', text: 'Raccogliamo menu, prezzi, tavoli, dati del locale e informazioni del conto di incasso. Verifichiamo gli eventuali collegamenti esterni.' },
      { number: '03', title: 'Collaudare un tavolo', text: `Carichiamo il menu e proviamo il giro completo con il personale. La prova dura ${GIORNI_PROVA} giorni senza carta.` },
      { number: '04', title: 'Gestire gli aggiornamenti', text: 'Il locale aggiorna menu e disponibilità dal pannello e controlla le operazioni con gli accessi assegnati a ciascun ruolo.' },
    ],
    faq: [
      { q: 'Quale modulo devo scegliere?', a: 'Solo prenotazioni serve a raccogliere richieste e gestire la capienza. Ordini e pagamenti aggiunge il menu QR e il conto al tavolo. La formula completa unisce i due flussi.' },
      { q: 'Quali sono canone e attivazione?', a: `${PIANI_SALA.map(p => `${p.nome}: ${p.canoneCents / 100} € al mese, attivazione ${p.attivazioneCents / 100} € una tantum`).join('; ')}. Prezzi IVA esclusa. Le commissioni del circuito di pagamento restano separate.` },
      { q: 'Come preparo il menu da importare?', a: 'Il menu può essere caricato da CSV o TSV. Prima dell’importazione verifichiamo piatti, prezzi, varianti e allergeni; per il collegamento a Tilby va verificato anche l’accesso al loro programma per sviluppatori.' },
      { q: 'Che cosa devo ristampare quando cambia il menu?', a: 'Il QR identifica il tavolo e apre il menu aggiornato. Le modifiche a piatti, disponibilità e prezzi si fanno nel pannello e non richiedono la ristampa dei codici.' },
      { q: 'Che cosa serve per la fatturazione elettronica?', a: 'Serve un intermediario SDI accreditato da collegare al sistema. La funzione di fatturazione non sostituisce il registratore telematico né gli altri obblighi fiscali del locale.' },
      { q: 'Come posso vedere una demo del gestionale?', a: 'Contatta SWA tramite il pulsante “Richiedi una demo”: concordiamo la presentazione di menu QR, ordini, pagamenti e prenotazioni. Per valutare il funzionamento nel tuo locale, definiamo insieme anche la configurazione della prova.' },
    ],
  },
  en: {
    serviceName: 'Tavolo: QR menu, ordering and booking software',
    promise: 'Choose the module your venue needs: bookings, ordering and payments, or both. We configure the menu, tables, staff access and payment account before the trial.',
    signals: ['Modules available separately', 'Menu updates from the dashboard', 'Separate owner, floor and kitchen access'],
    outcomes: [
      { title: 'A module for each workflow', text: 'Bookings manage availability and confirmations; ordering connects the table menu to the bill. Start with the workflow you need to digitise.' },
      { title: 'Enter menu data once', text: 'We load dishes, options and prices from the venue’s file. Later changes are made in the dashboard and appear through the existing printed QR.' },
      { title: 'Payments to your account', text: 'The payment account remains in the venue’s name. Software fees, setup and payment provider charges are separate items.' },
    ],
    deliverablesTitle: 'Software modules, setup and staff access.',
    deliverablesIntro: 'The choice starts with the process you need to manage. These functions and settings are checked before Tavolo is activated at your venue.',
    deliverables: [
      { title: 'Booking module', text: 'A public booking page for your website and social profiles, capacity checks, reminders and a cancellation link.' },
      { title: 'Ordering and billing module', text: 'The QR identifies the table and opens the menu in the browser. Dishes, notes and options reach the dashboard; each guest can pay for their own dishes.' },
      { title: 'Menu import', text: 'Import from CSV or TSV; connecting a Tilby till requires access to their developer programme. Prices and availability are edited from the dashboard.' },
      { title: 'Table configuration', text: 'We prepare a code for each table. The QR stays the same when a dish, price or menu availability changes.' },
      { title: 'Staff roles', text: 'Access distinguishes the owner, manager, floor and kitchen. Before the trial we check the operations available to each role.' },
      { title: 'Payments and documents', text: 'We connect the venue’s account to the chosen provider. Sending electronic invoices requires an accredited SDI intermediary; the fiscal register remains separate.' },
      { title: 'Service settings', text: 'Counter service can use collection numbers. Fixed-price formats configure the per-person price, lunch and dinner and ordering in waves.' },
      { title: 'Venue identity', text: 'The restaurant’s logo, colours and details appear on menu, booking and payment pages. Website and content production are separate services.' },
    ],
    process: [
      { number: '01', title: 'Choose the modules', text: 'We map the current booking, ordering and payment flow and identify the module to try.' },
      { number: '02', title: 'Prepare the data', text: 'We collect the menu, prices, tables, venue details and payment account information, and check any external connections.' },
      { number: '03', title: 'Test one table', text: `We load the menu and test the complete flow with staff. The trial lasts ${GIORNI_PROVA} days with no card required.` },
      { number: '04', title: 'Manage updates', text: 'The venue updates the menu and availability in the dashboard and checks operations through the access assigned to each role.' },
    ],
    faq: [
      { q: 'Which module should I choose?', a: 'Bookings handles reservations and capacity. Ordering and payments provides the QR menu and table bill. The complete plan combines the two workflows.' },
      { q: 'What are the monthly and setup fees?', a: `${PIANI_SALA.map(p => `${({ prenotazioni: 'Bookings', ordini: 'Ordering and payments', completo: 'Complete' } as Record<string, string>)[p.chiave]}: €${p.canoneCents / 100} per month, €${p.attivazioneCents / 100} one-off setup`).join('; ')}. Prices exclude VAT. Payment provider charges remain separate.` },
      { q: 'How do I prepare the menu for import?', a: 'The menu can be loaded from CSV or TSV. We check dishes, prices, options and allergens before import; a Tilby connection also requires access to their developer programme.' },
      { q: 'What needs reprinting when the menu changes?', a: 'The QR identifies the table and opens the updated menu. Dishes, availability and prices are changed in the dashboard without reprinting codes.' },
      { q: 'What is required for electronic invoicing?', a: 'An accredited SDI intermediary must be connected. The invoicing function does not replace the fiscal register or the venue’s other fiscal obligations.' },
      { q: 'How can I see a demo of the system?', a: 'Contact SWA using “Request a demo” to arrange a presentation of QR menus, ordering, payments and bookings. To assess the system at your venue, we also agree on the trial setup together.' },
    ],
  },
}

/**
 * Landing commerciale del prodotto Tavolo dentro il sito SWA.
 *
 * Il gestionale continua a vivere nella sua applicazione: qui teniamo la
 * presentazione, il percorso SEO e i collegamenti alle prove reali. In questo
 * modo non duplichiamo nel sito marketing il codice operativo della sala.
 */
export default function RistorantiLanding({ locale = 'it' }: { locale?: 'it' | 'en' }) {
  const inglese = locale === 'en'
  const settore = inglese ? settoreEnBySlug('ristoranti-e-bar')! : settoreBySlug('ristoranti-e-bar')!
  const path = inglese ? '/en/services/restaurant-management-system' : '/servizi/gestionale-ristoranti'

  const config: MarketingDetailConfig = {
    path,
    locale,
    breadcrumbParent: inglese ? { label: 'Services', href: '/en/services' } : { label: 'Servizi', href: '/servizi' },
    eyebrow: inglese ? 'Tavolo · Restaurant management system' : 'Tavolo · Gestionale per ristoranti',
    title: inglese
      ? 'Orders, payments and bookings. One system for the whole room.'
      : 'Ordini, pagamenti e prenotazioni. Tutta la sala in un solo sistema.',
    lead: inglese
      ? 'Guests scan the table QR code, order and pay from their phone. The team sees orders, tables and bookings live, with no percentage retained from sales.'
      : 'Il cliente inquadra il QR del tavolo, ordina e paga dal telefono. Il personale vede ordini, tavoli e prenotazioni in tempo reale, senza percentuali trattenute sull’incassato.',
    entityName: inglese ? 'Tavolo' : 'Tavolo',
    serviceType: settore.tipoServizio,
    startingPrice: settore.prezzoPrincipale?.valore ?? prezzoMinimoSettore(settore),
    priceLabel: settore.prezzoPrincipale?.label,
    priceCadence: settore.prezzoPrincipale?.cadenza,
    priceNote: settore.notaPrezzi,
    primaryCtaLabel: inglese ? 'Request a demo' : 'Richiedi una demo',
    primaryCtaHref: richiestaDemoRistoranti(locale),
    secondaryCtaLabel: inglese ? 'Contact SWA' : 'Contatta SWA',
    secondaryCtaHref: inglese ? '/en/contact' : '/contatti',
    icon: UtensilsCrossed,
    ...PRODUCT_COPY[locale],
    related: [
      { href: inglese ? '/en/settori/ristoranti-e-bar' : '/settori/ristoranti-e-bar', label: inglese ? 'Solutions for restaurants and bars' : 'Soluzioni per ristoranti, pizzerie e bar' },
      { href: inglese ? '/en/pricing' : '/pacchetti', label: inglese ? 'Packages and pricing' : 'Pacchetti e prezzi' },
    ],
    visualTheme: 'settore',
    heroImage: '/images/settori/ristoranti-e-bar-cinematica.webp',
    demo: 'sala',
  }

  return <MarketingDetailPage config={config} />
}
