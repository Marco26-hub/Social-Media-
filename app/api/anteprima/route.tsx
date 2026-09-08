import { ImageResponse } from 'next/og'
import { contenutoAnteprima, type Tinta } from '@/lib/anteprima'
import { SITE_URL } from '@/lib/site-config'

// L'immagine di anteprima, disegnata su richiesta.
//
// Una sola rotta invece di settantasei file: le pagine passano il proprio
// percorso, il testo lo decide lib/anteprima.ts. Il percorso e' l'unico
// parametro accettato ed e' sempre risolto contro l'elenco dei percorsi noti:
// se accettasse il titolo come parametro, chiunque potrebbe far scrivere quello
// che vuole dentro un'immagine con il nostro logo e il nostro dominio.

export const runtime = 'nodejs'

// 1200x630 e' il formato che WhatsApp, LinkedIn, X e Facebook mostrano intero.
// Non e' esportato come `size`: in una route handler Next.js accetta solo i
// suoi export riservati, e `size` non e' uno di quelli.
const MISURA = { width: 1200, height: 630 }

// Il fondo resta sempre il verde del brand: cambiare colore di sfondo per area
// avrebbe reso le anteprime diverse fra loro ma non piu' riconoscibili come
// nostre. A cambiare e' l'accento — occhiello, filetto e alone — che basta a
// distinguere un settore da un servizio anche in miniatura.
const TINTE: Record<Tinta, string> = {
  verde: '#4ade9a',
  oro: '#e8c25a',
  terra: '#f0946a',
  notte: '#6bb6e8',
}

// Il logo ufficiale, mai ridisegnato. Viene letto dal sito stesso e tenuto in
// memoria: e' lo stesso file per ogni immagine, e riscaricarlo a ogni richiesta
// sarebbe una chiamata di rete per niente. Se non arriva, l'immagine esce senza
// marchio invece di non uscire: un'anteprima senza logo e' meglio di un 500.
let logo: string | null | undefined

async function logoBase64(): Promise<string | null> {
  if (logo !== undefined) return logo
  try {
    const risposta = await fetch(`${SITE_URL}/brand/swa-logo-official.png`)
    if (!risposta.ok) throw new Error(String(risposta.status))
    const buffer = Buffer.from(await risposta.arrayBuffer())
    logo = `data:image/png;base64,${buffer.toString('base64')}`
  } catch {
    logo = null
  }
  return logo
}

export async function GET(richiesta: Request) {
  const percorso = new URL(richiesta.url).searchParams.get('p') || '/'
  const { occhiello, titolo, sottotitolo, tinta } = contenutoAnteprima(percorso)
  const accento = TINTE[tinta]
  const marchio = await logoBase64()

  // Il titolo cambia corpo con la lunghezza: un titolo lungo a 66px esce dal
  // riquadro, uno corto a 46px lascia mezza immagine vuota. Le tre soglie
  // coprono tutti i titoli scritti in lib/anteprima.ts.
  const corpoTitolo = titolo.length > 62 ? 52 : titolo.length > 40 ? 60 : 70

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '64px 72px',
          background: 'linear-gradient(135deg, #06180f 0%, #0a2b1f 52%, #061711 100%)',
          color: '#fdfbf4',
          position: 'relative',
        }}
      >
        {/* Un alone sfumato in basso a destra: da' profondita' senza aggiungere
            niente da leggere. Sfumato e non un cerchio pieno, che a bordo netto
            si legge come un errore di composizione. */}
        <div
          style={{
            position: 'absolute',
            right: -260,
            bottom: -320,
            width: 900,
            height: 900,
            display: 'flex',
            background: `radial-gradient(circle at 50% 50%, ${accento}3d 0%, ${accento}14 42%, rgba(0,0,0,0) 68%)`,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {marchio ? (
            <img src={marchio} width={104} height={48} alt="" style={{ objectFit: 'contain' }} />
          ) : null}
          <span style={{ fontSize: 27, letterSpacing: 0.3, opacity: 0.92 }}>Social Web Automation</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 940 }}>
          <span
            style={{
              fontSize: 22,
              letterSpacing: 3.4,
              textTransform: 'uppercase',
              color: accento,
              marginBottom: 18,
            }}
          >
            {occhiello}
          </span>
          <span style={{ fontSize: corpoTitolo, lineHeight: 1.12, letterSpacing: -0.8 }}>{titolo}</span>
          <span style={{ fontSize: 28, lineHeight: 1.45, marginTop: 22, opacity: 0.82, maxWidth: 880 }}>
            {sottotitolo}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
          <div style={{ width: 74, height: 4, background: accento, display: 'flex' }} />
          <span style={{ fontSize: 23, opacity: 0.72, letterSpacing: 0.6 }}>socialautomation.app</span>
        </div>
      </div>
    ),
    {
      ...MISURA,
      headers: {
        // I crawler la scaricano una volta e la tengono: un giorno di cache al
        // bordo, poi si rigenera in background senza far aspettare nessuno.
        'cache-control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
      },
    },
  )
}
