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
Qualità pacchetto: {{QUALITY}}
Audience: {{AUDIENCE}}
Funnel: {{FUNNEL}}
Angolo: {{ANGLE}}
Messaggio chiave: {{PRIMARY_MESSAGE}}
Brief creativo: {{CREATIVE_BRIEF}}
KPI target: {{KPI_TARGET}}
Note produzione/compliance: {{OPS_NOTES}}

Criteri di valutazione:
1. hook_strength (0-100): Quanto attira l'attenzione nei primi 2 secondi? È scroll-stopping?
2. copy_quality (0-100): Grammatica, fluidità, emoji, formattazione, leggibilità
3. brand_fit (0-100): Quanto è coerente con tono di voce, target, promessa brand?
4. cta_effectiveness (0-100): La call to action è chiara, desiderabile, cliccabile?
5. hashtag_relevance (0-100): Gli hashtag sono pertinenti, mix di ampi e nicchia, branded?
6. seo_potential (0-100): Contiene keyword ricercabili? Buono per discoverability?
7. platform_native_fit (0-100): Rispetta formato, linguaggio e best practice della piattaforma?
8. creative_clarity (0-100): Il brief visual/produzione è chiaro, eseguibile e specifico?
9. conversion_path (0-100): Funnel, KPI, CTA e prossima azione sono coerenti?
10. accessibility (0-100): Alt text, leggibilità, safe-zone/sottotitoli quando necessari?
11. compliance (0-100): Rispetta regole piattaforma, nessun claim rischioso, lunghezze ok?

Output SOLO JSON valido:
{
  "score_globale": 0,
  "hook_strength": 0,
  "copy_quality": 0,
  "brand_fit": 0,
  "cta_effectiveness": 0,
  "hashtag_relevance": 0,
  "seo_potential": 0,
  "platform_native_fit": 0,
  "creative_clarity": 0,
  "conversion_path": 0,
  "accessibility": 0,
  "compliance": 0,
  "giudizio": "OTTIMO|BUONO|MEDIOCRE|SCARSO",
  "punti_forti": ["",""],
  "punti_deboli": ["",""],
  "suggerimenti": ["azione concreta 1","azione concreta 2"]
}`

export async function POST(request: Request) {
  try {
    await requireAuth()
    const {
      canale,
      formato,
      hook,
      caption,
      hashtag,
      cta,
      visual,
      model,
      openrouter_key,
      quality_level,
      audience_segment,
      funnel_stage,
      angle,
      primary_message,
      creative_brief,
      kpi_target,
      production_notes,
      compliance_notes,
    } = await request.json()
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
      .replace('{{QUALITY}}', quality_level || 'non indicata')
      .replace('{{AUDIENCE}}', audience_segment || '(non indicata)')
      .replace('{{FUNNEL}}', funnel_stage || '(non indicato)')
      .replace('{{ANGLE}}', angle || '(non indicato)')
      .replace('{{PRIMARY_MESSAGE}}', primary_message || '(non indicato)')
      .replace('{{CREATIVE_BRIEF}}', creative_brief || '(non indicato)')
      .replace('{{KPI_TARGET}}', kpi_target || '(non indicato)')
      .replace('{{OPS_NOTES}}', [production_notes, compliance_notes].filter(Boolean).join('\n') || '(non indicate)')

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
