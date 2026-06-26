import { NextResponse } from 'next/server'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'

const SCORING_PROMPT = `Sei un social media quality auditor. Valuta questo contenuto e assegna un punteggio 0-100 per ogni dimensione.

CONTESTO BRAND:
{{BRAND}}

CONTENUTO DA VALUTARE:
Canale: {{CANALE}}
Formato: {{FORMATO}}
Hook: {{HOOK}}
Caption: {{CAPTION}}
Hashtag: {{HASHTAG}}
CTA: {{CTA}}
Visual desc: {{VISUAL}}

Criteri di valutazione:
1. hook_strength (0-100): Quanto attira l'attenzione nei primi 2 secondi? È scroll-stopping?
2. copy_quality (0-100): Grammatica, fluidità, emoji, formattazione, leggibilità
3. brand_fit (0-100): Quanto è coerente con tono di voce, target, promessa brand?
4. cta_effectiveness (0-100): La call to action è chiara, desiderabile, cliccabile?
5. hashtag_relevance (0-100): Gli hashtag sono pertinenti, mix di ampi e nicchia, branded?
6. seo_potential (0-100): Contiene keyword ricercabili? Buono per discoverability?
7. compliance (0-100): Rispetta regole piattaforma, nessun claim rischioso, lunghezze ok?

Output SOLO JSON valido:
{
  "score_globale": 0,
  "hook_strength": 0,
  "copy_quality": 0,
  "brand_fit": 0,
  "cta_effectiveness": 0,
  "hashtag_relevance": 0,
  "seo_potential": 0,
  "compliance": 0,
  "giudizio": "OTTIMO|BUONO|MEDIOCRE|SCARSO",
  "punti_forti": ["",""],
  "punti_deboli": ["",""],
  "suggerimenti": ["azione concreta 1","azione concreta 2"]
}`

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { canale, formato, hook, caption, hashtag, cta, visual, model, openrouter_key } = await request.json()
    if (!canale || !formato) {
      return NextResponse.json({ error: 'canale e formato richiesti' }, { status: 400 })
    }

    const userPrompt = SCORING_PROMPT
      .replace('{{BRAND}}', 'Nessun profilo brand configurato (valutazione generica)')
      .replace('{{CANALE}}', canale)
      .replace('{{FORMATO}}', formato)
      .replace('{{HOOK}}', hook || '(nessun hook)')
      .replace('{{CAPTION}}', caption || '(nessuna caption)')
      .replace('{{HASHTAG}}', hashtag || '(nessun hashtag)')
      .replace('{{CTA}}', cta || '(nessuna CTA)')
      .replace('{{VISUAL}}', visual || '(nessuna descrizione visual)')

    const aiRes = await callAI({
      model: model || 'claude-sonnet-4-6',
      systemPrompt: 'Sei un social media quality auditor. Valuta contenuti in modo oggettivo. Rispondi SOLO con JSON valido.',
      userPrompt,
      openrouterKey: openrouter_key || undefined,
      maxTokens: 1000,
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>
    return NextResponse.json(parsed)
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
