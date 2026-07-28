import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const alt = 'Social Automation: gestione social, siti, SEO e GEO per PMI e professionisti'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function OpenGraphImage() {
  const logo = await readFile(join(process.cwd(), 'public/brand/swa-logo-official.png'))
  const logoDataUrl = `data:image/png;base64,${logo.toString('base64')}`

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: '#133b32',
          color: '#f8f6ee',
          padding: '64px 72px',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 28 }}>
          {/* The dimensions preserve the official 958:438 aspect ratio. */}
          <img src={logoDataUrl} width="192" height="88" alt="" />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 34, fontWeight: 700 }}>Social Automation</span>
            <span style={{ marginTop: 8, color: '#dbe7df', fontSize: 22 }}>Servizio digitale gestito</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', maxWidth: 1030 }}>
          <span style={{ fontSize: 68, lineHeight: 1.08, fontWeight: 700 }}>
            La tua presenza digitale, gestita con metodo.
          </span>
          <span style={{ marginTop: 28, color: '#dbe7df', fontSize: 30, lineHeight: 1.3 }}>
            Social multicanale · Siti ed e-commerce · SEO + GEO
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ color: '#f2c12e', fontSize: 24, fontWeight: 700 }}>
            Approvazione umana prima della pubblicazione
          </span>
          <span style={{ color: '#dbe7df', fontSize: 22 }}>socialautomation.app</span>
        </div>
      </div>
    ),
    size,
  )
}
