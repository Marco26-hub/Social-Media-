import { ImageResponse } from 'next/og'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

export const size = {
  width: 512,
  height: 512,
}

export const contentType = 'image/png'
export const runtime = 'nodejs'

export default async function Icon() {
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
          padding: '84px 52px',
        }}
      >
        <img src={logoDataUrl} width="408" height="187" alt="" />
      </div>
    ),
    size,
  )
}
