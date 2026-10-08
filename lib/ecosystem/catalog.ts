import 'server-only'
import { cache } from 'react'

export type ToolCopy = {
  name: string; category: string; summary: string; headline: string; intro: string;
  audience: string; icon: string; action: string;
  benefits: [string, string][]; steps: [string, string][]; faq: [string, string][];
}
export type SwaTool = {
  id: string; is_internal: boolean; is_coming_soon: boolean; cta_href: string | null; copy: ToolCopy;
}
export type PublicCourse = {
  id: string; slug: string; title: string; subtitle: string | null; description: string;
  imageUrl: string | null; priceCents: number; currency: string; level: string;
  category: string | null; updatedAt: string;
  modules: { title: string; lessons: { id: string; title: string; durationMin: number | null; isFreePreview: boolean }[] }[];
}

async function publicCatalog<T>(origin: string | undefined, prefix: string, key: string): Promise<T[]> {
  if (!origin) {
    console.error(`[ecosystem] SWA_${key === 'tools' ? 'MARKETPLACE' : 'ACADEMY'}_ORIGIN non configurata`)
    throw new Error(`Catalogo ${key} non configurato`)
  }
  const url = new URL(`${prefix}/api/public/catalog`, origin)
  const headers = origin === process.env.SWA_MARKETPLACE_ORIGIN && process.env.SWA_MARKETPLACE_BYPASS_SECRET
    ? { 'x-vercel-protection-bypass': process.env.SWA_MARKETPLACE_BYPASS_SECRET }
    : undefined
  const response = await fetch(url, { headers, next: { revalidate: 60 }, signal: AbortSignal.timeout(8000) })
  if (!response.ok) throw new Error(`Catalogo ${key} temporaneamente non disponibile`)
  const payload = await response.json()
  if (!Array.isArray(payload[key])) throw new Error(`Risposta catalogo ${key} non valida`)
  return payload[key]
}
export const getSwaTools = cache(() => publicCatalog<SwaTool>(process.env.SWA_MARKETPLACE_ORIGIN, '/tools', 'tools'))
export const getPublicCourses = cache(() => publicCatalog<PublicCourse>(process.env.SWA_ACADEMY_ORIGIN, '/academy', 'courses'))
