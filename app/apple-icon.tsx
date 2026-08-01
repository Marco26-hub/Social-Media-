import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// Icona per "Aggiungi a schermata Home" su iOS. Il blocco metadata.icons era stato
// rimosso dal root layout, quindi l'apple-touch-icon era sparito da tutto il sito e
// iOS ripiegava su uno screenshot della pagina. Stessa grafica di app/icon.tsx,
// nella misura che iOS si aspetta (180x180).
export const size = {
  width: 180,
  height: 180,
}

export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function AppleIcon() {
  const logo = await readFile(join(process.cwd(), 'public/brand/swa-logo-official.png'))
  const logoDataUrl = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f6b4f',
          padding: '30px 18px',
        }}
      >
        <img src={logoDataUrl} width="144" height="66" alt="" />
      </div>
    ),
    size,
  )
}
