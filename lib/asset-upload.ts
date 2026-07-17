import { readApiError } from '@/lib/ai-client'

// Upload media lato client. DROP-IN sul vecchio `fetch('/api/assets/upload', {body: form})`:
// stessa FormData (cliente_id + files), stesso shape di ritorno ({assets, skipped, storage}).
//
// Percorso nuovo: chiede al server dei presigned URL e carica i file DIRETTAMENTE
// su Supabase Storage dal browser → aggira il limite ~4.5MB del body delle
// serverless function di Vercel (che bloccava i video/MP4 con 413
// FUNCTION_PAYLOAD_TOO_LARGE). Se lo storage non è configurato (dev locale)
// ripiega sull'upload multipart classico.

export type UploadedAsset = {
  name: string
  url: string
  path?: string
  mime?: string
  kind?: 'image' | 'video'
  size?: number
  source: 'upload'
  storage: 'storage' | 'local'
}
export type UploadResult = { assets: UploadedAsset[]; skipped: { name: string; motivo: string }[]; storage: 'storage' | 'local' }

type PresignItem =
  | { name: string; ok: true; uploadUrl: string; url: string; path: string; key: string; mime: string; kind: 'image' | 'video' }
  | { name: string; ok: false; motivo: string }

export async function uploadAssets(form: FormData): Promise<UploadResult> {
  const clienteId = String(form.get('cliente_id') || '')
  const files = form.getAll('files').filter((f): f is File => f instanceof File)
  if (!clienteId) throw new Error('Cliente non selezionato')
  if (!files.length) throw new Error('Nessun file')

  // 1) chiedi i presigned URL (payload minuscolo: solo nome/mime/size, niente byte)
  const presignRes = await fetch('/api/assets/presign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ cliente_id: clienteId, files: files.map(f => ({ name: f.name, mime: f.type, size: f.size })) }),
  })
  if (!presignRes.ok) throw new Error(await readApiError(presignRes, 'Preparazione upload fallita'))
  const presign = await presignRes.json() as { fallback?: boolean; items?: PresignItem[] }

  // storage non configurato (dev locale) → upload multipart classico su disco
  if (presign?.fallback) return multipartUpload(form)

  const items = Array.isArray(presign.items) ? presign.items : []
  const assets: UploadedAsset[] = []
  const skipped: { name: string; motivo: string }[] = []

  // 2) PUT diretto browser→Storage, in parallelo. items[] allineati per indice a files[].
  await Promise.all(items.map(async (item, i) => {
    if (!item.ok) { skipped.push({ name: item.name, motivo: item.motivo }); return }
    const file = files[i]
    try {
      const put = await fetch(item.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': item.mime || file.type || 'application/octet-stream' },
      })
      if (!put.ok) { skipped.push({ name: item.name, motivo: `upload storage fallito (HTTP ${put.status})` }); return }
      assets.push({ name: item.name, url: item.url, path: item.path, mime: item.mime, kind: item.kind, size: file?.size, source: 'upload', storage: 'storage' })
    } catch (e) {
      skipped.push({ name: item.name, motivo: `upload interrotto: ${(e as Error).message}` })
    }
  }))

  if (!assets.length) {
    throw new Error(`Nessun file caricato. ${skipped.map(s => `${s.name}: ${s.motivo}`).join(' · ')}`)
  }
  return { assets, skipped, storage: 'storage' }
}

async function multipartUpload(form: FormData): Promise<UploadResult> {
  const res = await fetch('/api/assets/upload', { method: 'POST', body: form })
  if (!res.ok) throw new Error(await readApiError(res, 'Upload media fallito'))
  const data = await res.json() as { assets?: UploadedAsset[]; skipped?: { name: string; motivo: string }[]; storage?: 'storage' | 'local' }
  return { assets: data.assets || [], skipped: data.skipped || [], storage: data.storage || 'local' }
}
