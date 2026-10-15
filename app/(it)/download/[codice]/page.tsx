import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { cache } from 'react'
import { anteprimaOg } from '@/lib/anteprima'
import { normalizeAccessCode } from '@/lib/download-area'
import { getActiveCode, getPageTextsOrDefault, listItems, type DownloadItem } from '@/lib/download-area-db'
import { detectInAppBrowser } from '@/lib/in-app-browser'
import GiftPage from './GiftPage'

// Il codice nell'URL decide cosa si vede: niente cache, la pagina si calcola a ogni richiesta.
export const dynamic = 'force-dynamic'

type Params = { params: Promise<{ codice: string }> }

// Pagina riservata a chi ha il link: fuori da motori di ricerca, cache e archivi.
const ROBOTS: Metadata['robots'] = {
  index: false,
  follow: false,
  noarchive: true,
  nocache: true,
  googleBot: { index: false, follow: false },
}

// Per un codice sbagliato, vecchio o inventato: un titolo che non dice cosa c'era.
const NEUTRAL_METADATA: Metadata = {
  title: 'Pagina non trovata | Social Web Automation',
  robots: ROBOTS,
}

const GIFT_TITLE = 'I tuoi regali | Social Web Automation'
const GIFT_DESCRIPTION = 'Materiali gratuiti per chi ci segue: si aprono subito, senza registrazione.'

// L'immagine di anteprima è quella fissa di /regali, mai una costruita sul percorso
// della pagina: il percorso contiene il codice e finirebbe nell'URL dell'immagine.
// Niente openGraph.url per lo stesso motivo.
const GIFT_METADATA: Metadata = {
  title: GIFT_TITLE,
  robots: ROBOTS,
  openGraph: {
    title: GIFT_TITLE,
    description: GIFT_DESCRIPTION,
    type: 'website',
    siteName: 'Social Web Automation',
    locale: 'it_IT',
    images: anteprimaOg('/regali'),
  },
  twitter: {
    card: 'summary_large_image',
    title: GIFT_TITLE,
    description: GIFT_DESCRIPTION,
    images: anteprimaOg('/regali'),
  },
}

// Qualunque motivo per cui le schede non si possono mostrare (codice sbagliato,
// schema mancante, database spento) restituisce null: la pagina risponde 404 e
// non rivela che esiste.
async function loadItems(code: string): Promise<DownloadItem[] | null> {
  try {
    if ((await getActiveCode()) !== code) return null
    return await listItems({ includeHidden: false })
  } catch (e) {
    console.error('[download-area] lettura della pagina pubblica non riuscita:', e instanceof Error ? e.message : e)
    return null
  }
}

// I metadata e la pagina chiedono le stesse schede: cache() le legge una volta sola
// per richiesta e dà a entrambi lo stesso risultato.
const getGifts = cache(loadItems)

// Metadata calcolati e non fissi: Next applica i metadata della pagina anche quando
// risponde con notFound(), e un titolo fisso sui regali comparirebbe nella scheda
// della 404 pubblica per ogni codice sbagliato. Qui un codice non valido o non
// attivo riceve metadata neutri. Mai notFound() in questa funzione: decide la pagina.
export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { codice } = await params
  // Formato errato: metadata neutri senza toccare il database.
  const code = normalizeAccessCode(codice)
  if (!code) return NEUTRAL_METADATA
  return (await getGifts(code)) ? GIFT_METADATA : NEUTRAL_METADATA
}

export default async function DownloadPage({ params }: Params) {
  const { codice } = await params
  // Formato errato: 404 subito, senza toccare il database.
  const code = normalizeAccessCode(codice)
  if (!code) notFound()

  // I testi non sono mai fatali: senza database o senza tabella si usano quelli standard.
  const [items, texts] = await Promise.all([getGifts(code), getPageTextsOrDefault()])
  if (!items) notFound()

  const inApp = detectInAppBrowser((await headers()).get('user-agent'))
  return <GiftPage code={code} items={items} texts={texts} inApp={inApp} />
}
