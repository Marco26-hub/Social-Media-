import { UtensilsCrossed } from 'lucide-react'
import MarketingDetailPage, { type MarketingDetailConfig } from './MarketingDetailPage'
import { prezzoMinimoSettore, settoreBySlug } from '@/lib/settori'
import { settoreEnBySlug } from '@/lib/settori.en'

const DEMO_MENU = 'https://ristoranti-guest.vercel.app/m/trattoria-da-luca'
const DEMO_PRENOTAZIONI = 'https://ristoranti-guest.vercel.app/p/trattoria-da-luca'
const GESTIONALE = 'https://ristoranti-dashboard.vercel.app/'

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
    serviceName: settore.servizio,
    entityName: inglese ? 'Tavolo' : 'Tavolo',
    serviceType: settore.tipoServizio,
    promise: settore.promessa,
    startingPrice: settore.prezzoPrincipale?.valore ?? prezzoMinimoSettore(settore),
    priceLabel: settore.prezzoPrincipale?.label,
    priceCadence: settore.prezzoPrincipale?.cadenza,
    priceNote: settore.notaPrezzi,
    primaryCtaLabel: inglese ? 'Try the real menu' : 'Prova il menu reale',
    primaryCtaHref: DEMO_MENU,
    icon: UtensilsCrossed,
    signals: settore.segnali,
    outcomes: settore.risultati,
    deliverablesTitle: settore.cosaTitolo,
    deliverablesIntro: settore.cosaIntro,
    deliverables: settore.cosaFacciamo,
    process: settore.ciclo,
    faq: settore.faq,
    related: [
      { href: DEMO_PRENOTAZIONI, label: inglese ? 'Try the booking page' : 'Prova la pagina prenotazioni' },
      { href: GESTIONALE, label: inglese ? 'Open the management system' : 'Apri il gestionale di sala' },
      { href: inglese ? '/en/settori/ristoranti-e-bar' : '/settori/ristoranti-e-bar', label: inglese ? 'Solutions for restaurants and bars' : 'Soluzioni per ristoranti, pizzerie e bar' },
    ],
    visualTheme: 'settore',
    heroImage: '/images/settori/ristoranti-e-bar-cinematica.webp',
    demo: 'sala',
  }

  return <MarketingDetailPage config={config} />
}
