// Helper centrale per demo mode.
// Demo = quando NEXT_PUBLIC_SUPABASE_URL non e un Supabase reale (placeholder, test, missing).
// Anche flag esplicito NEXT_PUBLIC_DEMO_MODE=true forza demo.

const FAKE_URL_PATTERNS = [
  'placeholder',
  'test-project',
  'xxxx',
  'your-project',
  'example.com',
  'localhost',
]

export function isDemo(): boolean {
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!url) return true

  const lower = url.toLowerCase()
  return FAKE_URL_PATTERNS.some(pattern => lower.includes(pattern))
}
