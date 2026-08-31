// Quota storage per cliente. Il valore resta configurabile per piano senza
// spargere numeri diversi fra UI e API; 1 GB e il default storico del servizio.
export const DEFAULT_STORAGE_QUOTA_MB = 1024

function configuredQuotaMb(): number {
  const raw = Number(process.env.STORAGE_QUOTA_MB)
  if (!Number.isFinite(raw) || raw <= 0) return DEFAULT_STORAGE_QUOTA_MB
  return Math.min(Math.max(Math.round(raw), 1), 10240)
}

export function storageQuotaMb(): number {
  return configuredQuotaMb()
}

export function storageQuotaBytes(): number {
  return storageQuotaMb() * 1024 * 1024
}

export function bytesToMb(bytes: number): number {
  return Math.round((Math.max(0, bytes) / 1024 / 1024) * 10) / 10
}
