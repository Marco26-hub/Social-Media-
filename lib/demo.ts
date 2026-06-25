export function isDemo(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true
  if (typeof window !== 'undefined') return false
  if (!process.env.DATABASE_URL) return true
  return false
}
