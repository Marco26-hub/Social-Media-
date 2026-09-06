import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Anteprima social dedicata a questa pagina.
//
// Senza, ogni indirizzo del sito condiviso su WhatsApp o LinkedIn mostrava la
// stessa immagine generica: chi la riceve non capisce di quale servizio si
// parla prima di aprire. Qui l'anteprima porta la foto e il titolo della
// pagina, quindi il link si riconosce senza cliccarlo.

export const alt = 'Segretaria telefonica AI e agenda intelligente — Social Web Automation'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function OpenGraphImage() {
  const [logo, foto] = await Promise.all([
    readFile(join(process.cwd(), 'public/brand/swa-logo-official.png')),
    readFile(join(process.cwd(), 'public/og-segretaria.jpg')),
  ])

  return new ImageResponse(
    (
      <div style={{ width: '100%', height: '100%', display: 'flex', background: '#133b32' }}>
        <div
          style={{
            width: '58%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '58px 20px 52px 64px',
            color: '#fffdf7',
            fontFamily: 'Arial, sans-serif',
          }}
        >
          <img src={`data:image/png;base64,${logo.toString('base64')}`} width={168} alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontSize: 19, letterSpacing: 3, color: '#e2b023', marginBottom: 18 }}>
              SEGRETARIA TELEFONICA E AGENDA
            </div>
            <div style={{ display: 'flex', fontSize: 52, lineHeight: 1.08, fontWeight: 700, letterSpacing: -1 }}>
              Risponde al telefono. Fissa appuntamenti. Riempie l’agenda.
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <div style={{ display: 'flex', width: 42, height: 9, background: '#e86244' }} />
            <div style={{ display: 'flex', width: 42, height: 9, background: '#e2b023', marginLeft: 8 }} />
            <div style={{ display: 'flex', fontSize: 20, color: 'rgba(255,253,247,0.66)', marginLeft: 22 }}>
              socialautomation.app
            </div>
          </div>
        </div>
        <div style={{ width: '42%', display: 'flex', position: 'relative' }}>
          <img
            src={`data:image/jpeg;base64,${foto.toString('base64')}`}
            width={504}
            height={630}
            style={{ objectFit: 'cover' }}
            alt=""
          />
        </div>
      </div>
    ),
    size,
  )
}
