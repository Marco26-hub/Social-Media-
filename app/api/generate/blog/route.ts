import { NextResponse } from 'next/server'
import { dbReady, q } from '@/lib/db'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { resolveContentQuality, summarizeQualityForPrompt } from '@/lib/content-quality'

const PROMPT = `Sei un content writer SEO senior per brand fashion e-commerce.
Scrivi articolo blog 800-1200 parole in italiano, ottimizzato per SEO e GEO (AI search).

BRAND:
{{BRAND}}

TEMA:
{{TEMA}}

PRODOTTI CORRELATI:
{{PRODOTTI}}

Regole SEO:
- H1 50-60 char con keyword principale
- Meta description 140-160 char
- Slug URL-friendly con keyword
- 3-5 H2 con keyword secondarie
- 800-1200 parole totali
- Keyword density 1-2%

Regole GEO (AI citability):
- Apri con risposta diretta alla query
- Liste numerate e bulleted
- FAQ section 3-5 domande/risposte
- Dati concreti, numeri, percentuali
- Tono E-E-A-T (esperienza, competenza, autorevolezza)

QUALITÀ OPERATIVA:
{{QUALITY_CONTEXT}}

Campi strategici obbligatori nel JSON:
- angle_editoriale: tesi o angolo dell'articolo
- search_intent: intento principale e secondario
- audience_segment: pubblico specifico
- proof_points: prove, dati o elementi verificabili da usare senza inventare fonti
- conversion_path: come l'articolo porta a prodotto/lead
- content_checklist: controlli SEO/GEO/accessibilità
- missing_inputs: dati mancanti da chiedere al cliente

Output SOLO JSON valido:
{"slug":"","meta_title":"50-60 char","meta_description":"140-160 char","h1":"","intro":"","sezioni":[{"h2":"","paragrafi":[],"lista_punti":[]}],"faq":[{"domanda":"","risposta":""}],"cta_finale":"","keywords_target":[],"prodotti_linkati":[],"immagine_cover":"","tempo_lettura_min":5,"angle_editoriale":"","search_intent":"","audience_segment":"","proof_points":[],"conversion_path":"","content_checklist":[],"missing_inputs":[],"status":"DA_APPROVARE"}`

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, model, openrouter_key, tema, prodotti_linkati, quality, quality_level, post_quality, qualita } = await request.json()
    if (!cliente_id) {
      return NextResponse.json({ error: 'cliente_id richiesto' }, { status: 400 })
    }
    await requireClienteAccess(cliente_id)
    if (isDemo() || !dbReady()) {
      const demoQuality = resolveContentQuality({ requestedQuality: quality ?? quality_level ?? post_quality ?? qualita })
      return NextResponse.json({
        ok: true,
        demo: true,
        quality_level: demoQuality,
        slug: `demo-${String(tema || 'articolo').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'articolo'}`,
        warning: 'Fallback demo: DATABASE_URL non configurato, articolo non persistito su Neon.',
      })
    }

    const [brandRows, products, clientRows] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cliente_id]),
      q('SELECT * FROM prodotti WHERE cliente_id = $1', [cliente_id]),
      q('SELECT * FROM clienti WHERE id = $1 LIMIT 1', [cliente_id]),
    ])
    const brand = brandRows[0] ?? null
    const client = (clientRows[0] ?? null) as Record<string, unknown> | null
    const contentQuality = resolveContentQuality({ requestedQuality: quality ?? quality_level ?? post_quality ?? qualita, piano: client?.piano })

    const userPrompt = PROMPT
      .replace('{{BRAND}}', JSON.stringify(brand || {}, null, 2))
      .replace('{{TEMA}}', tema || 'Guida prodotto')
      .replace('{{PRODOTTI}}', JSON.stringify(products || [], null, 2))
      .replace('{{QUALITY_CONTEXT}}', summarizeQualityForPrompt(contentQuality))

    const aiRes = await callAI({
      model: model || 'claude-sonnet-4-6',
      systemPrompt: `Sei un content writer SEO/GEO senior. Livello qualità: ${contentQuality}. Rispondi SOLO con JSON valido. Non inventare dati o fonti esterne: segnala missing_inputs quando servono prove.`,
      userPrompt,
      openrouterKey: openrouter_key,
      maxTokens: contentQuality === 'high' ? 6500 : contentQuality === 'medium' ? 5200 : 4000,
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>

    await q(
      `INSERT INTO blog_articoli (
        cliente_id, slug, meta_title, meta_description, h1, intro, sezioni, faq,
        cta_finale, keywords_target, prodotti_linkati, tempo_lettura_min, immagine_cover, autore, status
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)`,
      [
        cliente_id,
        (parsed.slug as string) || `articolo-${Date.now()}`,
        (parsed.meta_title as string) || '',
        (parsed.meta_description as string) || null,
        (parsed.h1 as string) || '',
        (parsed.intro as string) || null,
        JSON.stringify(parsed.sezioni || []),
        JSON.stringify(parsed.faq || []),
        (parsed.cta_finale as string) || null,
        JSON.stringify(parsed.keywords_target || []),
        JSON.stringify(parsed.prodotti_linkati || prodotti_linkati || []),
        (parsed.tempo_lettura_min as number) || null,
        (parsed.immagine_cover as string) || null,
        'Brand Editorial',
        (parsed.status as string) || 'DA_APPROVARE',
      ],
    )

    return NextResponse.json({ ok: true, slug: parsed.slug })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione blog'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
