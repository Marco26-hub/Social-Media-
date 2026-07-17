import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { getClientGenerationContext, mergeBrandIdentity } from '@/lib/client-context'
import { fetchSiteContent } from '@/lib/brand-scrape'
import { buildLandingCroPrompt } from '@/lib/marketing/frameworks'

export const dynamic = 'force-dynamic'

// Audit CRO con framework a 7 sezioni pesato (lib/marketing/frameworks.ts). Accetta
// "url" (fetch sicuro anti-SSRF via brand-scrape, stesso helper della brand
// discovery) oppure "content" (testo/HTML già estratto). Non persiste: è
// un'analisi puntuale, l'utente agisce sui fix suggeriti a mano.
export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, url, content, page_type, model, openrouter_key, gemini_key, opencode_key, agnes_key } = await request.json()

    let pageContent = typeof content === 'string' ? content : ''
    let sourceUrl: string | undefined = typeof url === 'string' ? url : undefined

    if (!pageContent && sourceUrl) {
      const scraped = await fetchSiteContent(sourceUrl)
      if (!scraped.ok) return NextResponse.json({ error: scraped.error || 'Impossibile leggere la pagina' }, { status: 422 })
      pageContent = [
        scraped.title ? `TITLE: ${scraped.title}` : '',
        scraped.description ? `META DESCRIPTION: ${scraped.description}` : '',
        scraped.headings.length ? `HEADINGS:\n${scraped.headings.join('\n')}` : '',
        `TESTO:\n${scraped.textSample}`,
      ].filter(Boolean).join('\n\n')
      sourceUrl = scraped.finalUrl || sourceUrl
    }

    if (!pageContent) {
      return NextResponse.json({ error: 'Fornisci "url" (pagina pubblica da leggere) oppure "content" (testo/HTML già estratto)' }, { status: 400 })
    }

    const ctx = await getClientGenerationContext(cliente_id).catch(() => null)
    const identity = ctx ? mergeBrandIdentity(ctx) : {}

    const userPrompt = buildLandingCroPrompt({
      brandBlock: JSON.stringify(identity, null, 2),
      pageContent,
      pageType: page_type,
      url: sourceUrl,
    })

    const aiRes = await callAI({
      model: model || 'gemini-2.5-flash',
      systemPrompt: 'Sei un CRO specialist senior. Rispondi SOLO con JSON valido, italiano impeccabile. Applica SOLO la rubrica fornita, non inventare criteri diversi.',
      userPrompt,
      openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key, agnesKey: agnes_key,
      maxTokens: 4500,
      meta: { clienteId: ctx?.clienteId || undefined, tipo: 'landing_cro', agentName: 'landing' },
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>
    return NextResponse.json({ ok: true, cliente_id: ctx?.clienteId, url: sourceUrl, ...parsed })
  } catch (e) {
    return apiError(e)
  }
}
