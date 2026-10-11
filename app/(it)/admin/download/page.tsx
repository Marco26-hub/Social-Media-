import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { isDemo } from '@/lib/demo'
import { requireDownloadAdmin } from '@/lib/download-area-guard'
import DownloadAdmin from './DownloadAdmin'

// Dipende dalla sessione: mai prerenderizzata.
export const dynamic = 'force-dynamic'

// Pannello interno: fuori da motori di ricerca, cache e archivi.
export const metadata: Metadata = {
  title: 'Area download | Pannello SWA',
  robots: { index: false, follow: false, noarchive: true, nocache: true },
}

// Pagina autonoma (non sta nel layout della dashboard): sfondo chiaro fisso,
// così resta leggibile anche con il tema scuro del sito.
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main id="main-content" className="min-h-screen bg-gray-50 text-gray-900 [color-scheme:light]">
      <div className="p-4 md:p-8 max-w-4xl mx-auto">{children}</div>
    </main>
  )
}

function Unavailable({ message }: { message: string }) {
  return (
    <Shell>
      <h1 className="text-xl md:text-3xl font-bold tracking-tight">Area download</h1>
      <p role="alert" className="card p-4 mt-4 text-sm text-amber-800 bg-amber-50 border-amber-200">
        {message}
      </p>
    </Shell>
  )
}

export default async function AdminDownloadPage() {
  // In demo il guard rifiuta sempre, ma il login demo entra da solo e riporta
  // qui: reindirizzare creerebbe un ciclo infinito. Si spiega invece il limite.
  if (isDemo()) {
    return <Unavailable message="Area download non disponibile in modalità demo: serve il database reale." />
  }
  try {
    await requireDownloadAdmin()
  } catch (e) {
    // Senza database non c'è sessione da verificare: reindirizzare al login non
    // servirebbe, quindi si spiega cosa manca. Ogni altro errore vale come "non ammesso".
    if (e instanceof Error && e.message === 'Database non disponibile') {
      return <Unavailable message="Database non disponibile: configura DATABASE_URL e ricarica." />
    }
    redirect('/login?callbackUrl=/admin/download')
  }

  return (
    <Shell>
      <DownloadAdmin />
    </Shell>
  )
}
