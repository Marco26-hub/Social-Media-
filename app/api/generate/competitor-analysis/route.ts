import { NextResponse } from 'next/server'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'

const PROMPT = `Sei un social media analyst senior. Analizza i profili social di un competitor e produci un report dettagliato.

BRAND CLIENTE:
{{BRAND}}

COMPETITOR:
Nome: {{COMPETITOR_NOME}}
Sito: {{COMPETITOR_SITO}}
Social: {{COMPETITOR_SOCIAL}}

Analizza:
1. Content strategy: tipo di contenuti, temi, stile visivo, tono di voce
2. Post frequency: frequenza per piattaforma, giorni/orari migliori
3. Engagement: stima engagement rate, tipo di interazioni, crescita
4. Hashtag strategy: hashtag usati, branded vs generali
5. Punti di forza: cosa fanno bene, cosa li differenzia
6. Punti deboli: gap, opportunità per superare
7. Miglioramenti per il cliente: 5 azioni concrete per battere questo competitor

Output SOLO JSON valido:
{
  "competitor_nome":"",
  "data_analisi":"YYYY-MM-DD",
  "content_strategy":{"tipo":"","temi":[],"stile_visivo":"","tono_voce":""},
  "frequenza":{"instagram":"","facebook":"","tiktok":"","pinterest":"","migliori_ore":[]},
  "engagement":{"rate_stimato":"","tipo_interazioni":[],"crescita":"","note":""},
  "hashtag_strategy":{"principali":[],"branded":[],"note":""},
  "punti_forti":[],
  "punti_deboli":[],
  "miglioramenti_per_cliente":[{"azione":"","impatto":"","effort":"","canale":""}],
  "score_competitor":0,
  "gap_analysis":"Come il cliente può differenziarsi",
  "contenuti_suggeriti":[{"tema":"","formato":"","canale":"","perche":""}]
}`

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, competitor_nome, competitor_sito, competitor_social, model, openrouter_key } = await request.json()
    if (!cliente_id || !competitor_nome) {
      return NextResponse.json({ error: 'cliente_id e competitor_nome richiesti' }, { status: 400 })
    }
    await requireClienteAccess(cliente_id)

    const { q } = await import('@/lib/db')
    const brandRows = await q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cliente_id])
    const brand = brandRows[0] ?? null

    const userPrompt = PROMPT
      .replace('{{BRAND}}', JSON.stringify(brand || {}, null, 2))
      .replace('{{COMPETITOR_NOME}}', competitor_nome)
      .replace('{{COMPETITOR_SITO}}', competitor_sito || 'non disponibile')
      .replace('{{COMPETITOR_SOCIAL}}', Array.isArray(competitor_social) ? competitor_social.join(', ') : (competitor_social || 'non disponibile'))

    const aiRes = await callAI({
      model: model || 'claude-sonnet-4-6',
      systemPrompt: 'Sei un social media analyst senior. Rispondi SOLO con JSON valido.',
      userPrompt,
      openrouterKey: openrouter_key,
      maxTokens: 4000,
    })

    const parsed = extractJSON(aiRes)
    return NextResponse.json(parsed)
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore analisi competitor'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
