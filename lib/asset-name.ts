import { randomUUID } from 'crypto'
import path from 'path'

// Nome file sicuro + ad alta entropia. Il nome è parte della "capability URL" con
// cui /api/assets/file serve l'asset senza login (Blotato e i link preview pubblici
// devono poterlo leggere). Un suffisso corto sarebbe indovinabile; qui il token
// (80 bit) + il clienteId (UUID) rendono l'URL di fatto non enumerabile.
// Condiviso tra l'upload multipart e il presign (stessa chiave, stesse regole).
export function safeFilename(name: string): string {
  const ext = path.extname(name).toLowerCase() || '.jpg'
  const base = path.basename(name, ext)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48) || 'asset'
  const token = randomUUID().replace(/-/g, '').slice(0, 20)
  return `${base}-${token}${ext}`
}
