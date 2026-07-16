import { NextResponse } from 'next/server'
import { callAI, extractJSONChecked } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { getClientGenerationContext, brandField, mergeBrandIdentity } from '@/lib/client-context'
import { buildMetaTags, validateMeta, renderMetaHtml, metaOptimizePrompt, SERP_LIMITS } from '@/lib/seo/meta-tags'

export const dynamic = 'force-dynamic'

type Row = Record<string, unknown>

// Genera title/description ottimizzate (AI, grounded sul brand) + varianti A/B,
// poi valida DETERMINISTICAMENTE lunghezze e keyword prima di restituire. L'AI
// propone, il codice verifica — niente meta "a occhio" che poi Google tronca.
export async function POST(request: Request) {
  try {
    await requireAuth()
    const body = await request.json()
    const {
      cliente_id, content, title, description, url, image_url, primary_keyword,
      secondary_keywords, generate_variants, model, openrouter_key, gemini_key, opencode_key,
    } = body

    if (!content && !(title && description)) {
      return NextResponse.json({ error: 'Fornisci "content" (per generare) oppure "title"+"description" (per validare)' }, { status: 400 })
    }

    const ctx = await getClientGenerationContext(cliente_id).catch(() => null)
    const brand = ctx?.brand as Row | null
    const nomeBrand = brand ? brandField(brand, 'brand_name', brandField(brand, 'nome', '')) : ''

    let finalTitle = typeof title === 'string' ? title : ''
    let finalDescription = typeof description === 'string' ? description : ''
    let variants: unknown = undefined

    // Modalità GENERA: niente title/description forniti → l'AI propone dal contenuto.
    if ((!finalTitle || !finalDescription || generate_variants) && content) {
      const identity = ctx ? mergeBrandIdentity(ctx) : {}
      const raw = await callAI({
        model: model || 'gemini-2.5-flash',
        systemPrompt: 'Sei un SEO copywriter senior. Rispondi SOLO con JSON valido, italiano impeccabile, rispetta ESATTAMENTE i limiti di caratteri richiesti.',
        userPrompt: metaOptimizePrompt({
          brandBlock: JSON.stringify(identity, null, 2),
          content: String(content),
          primaryKeyword: primary_keyword,
          secondaryKeywords: Array.isArray(secondary_keywords) ? secondary_keywords : undefined,
          url,
        }),
        openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key,
        maxTokens: 1600,
        meta: { clienteId: ctx?.clienteId || undefined, tipo: 'meta_tags', agentName: 'seo' },
      })
      const { data } = extractJSONChecked(raw)
      const parsed = (data as Row) || {}
      const rec = (parsed.recommended as Row) || {}
      finalTitle = finalTitle || (rec.title as string) || ((parsed.titles as Row[])?.[0]?.text as string) || ''
      finalDescription = finalDescription || (rec.description as string) || ((parsed.descriptions as Row[])?.[0]?.text as string) || ''
      variants = { titles: parsed.titles || [], descriptions: parsed.descriptions || [] }
    }

    if (!finalTitle || !finalDescription) {
      return NextResponse.json({ error: 'Generazione AI non ha prodotto title/description utilizzabili' }, { status: 502 })
    }

    const tags = buildMetaTags({
      title: finalTitle,
      description: finalDescription,
      url,
      imageUrl: image_url,
      siteName: nomeBrand || undefined,
      type: 'article',
    })
    const validation = validateMeta(tags, primary_keyword)

    return NextResponse.json({
      ok: true,
      meta: tags,
      html: renderMetaHtml(tags),
      validation,
      limits: SERP_LIMITS,
      ...(variants ? { variants } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione meta tag'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
