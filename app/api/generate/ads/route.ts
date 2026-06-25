import { NextResponse } from 'next/server'
import { callAI, extractJSON } from '@/lib/ai'

const PROMPTS: Record<string, string> = {
  google: `Sei un Google Ads specialist senior. Crea una campagna pubblicitaria completa per questo brand.

BRAND: {{BRAND}}
PRODOTTO: {{PRODOTTO}}
OBIETTIVO: {{OBIETTIVO}}
BUDGET: {{BUDGET}}

Crea:
1. Campaign structure: nome campagna, tipo (Search/Display/Performance Max), reti
2. 3-5 Ad groups con keyword tematiche
3. Per ogni ad group: 3 headline (30 char max), 2 description (90 char max)
4. Sitelink extension (4-6, 25 char max ciascuno)
5. Callout extension (4-6, 25 char max)
6. Negative keywords suggeriti
7. Landing page consigliata per prodotto

Output SOLO JSON valido:
{
  "campagna": {"nome":"","tipo":"","reti":"","budget_giornaliero":""},
  "ad_groups": [{"nome":"","keyword":[],"headlines":[],"descriptions":[]}],
  "sitelinks": [],
  "callouts": [],
  "negative_keywords": [],
  "landing_page": ""
}`,

  facebook: `Sei un Facebook/Instagram Ads specialist senior. Crea una campagna pubblicitaria completa.

BRAND: {{BRAND}}
PRODOTTO: {{PRODOTTO}}
OBIETTIVO: {{OBIETTIVO}}
BUDGET: {{BUDGET}}

Crea:
1. Campaign: nome, obiettivo (awareness/traffic/conversion), buying type
2. 3 audience: interesse, lookalike, retargeting con dettagli
3. Per ogni audience: primary text (125 char), headline (40 char), description (30 char)
4. Creative format consigliato (immagine/video/carousel) + aspect ratio
5. CTA consigliato per ogni creativo
6. Placement consigliati (Feeds/Stories/Reels/Explore)

Output SOLO JSON valido:
{
  "campagna": {"nome":"","obiettivo":"","buying_type":""},
  "audience": [{"nome":"","tipo":"","dettaglio":"","eta":"","interessi":""}],
  "ad_copy": [{"audience":"","primary_text":"","headline":"","description":"","cta":"","formato_creativo":"","aspect_ratio":""}],
  "placement_consigliati": [],
  "note_strategia": ""
}`,

  tiktok: `Sei un TikTok Ads specialist senior. Crea una campagna pubblicitaria completa.

BRAND: {{BRAND}}
PRODOTTO: {{PRODOTTO}}
OBIETTIVO: {{OBIETTIVO}}
BUDGET: {{BUDGET}}

Crea:
1. Campaign: nome, obiettivo (reach/traffic/conversion), budget
2. 2-3 ad group con targeting
3. Per ogni ad group: video script 15-30s, hook (testo overlay 3-5 parole), caption, CTA
4. Trend audio suggerito (mood/genere, non nome specifico)
5. Hashtag strategy (3-5 branded, 3-5 trending)
6. Creative format e durata consigliata
7. Targeting: età, interessi, comportamenti

Output SOLO JSON valido:
{
  "campagna": {"nome":"","obiettivo":"","budget":""},
  "ad_groups": [{"nome":"","targeting_eta":"","interessi":[],"video_script":"","hook":"","caption":"","cta":"","durata_secondi":0}],
  "trend_audio_mood": "",
  "hashtag": {"branded":[],"trending":[]},
  "note_creative": "",
  "landing_page": ""
}`,
}

export async function POST(request: Request) {
  try {
    const { platform, brand, product, obiettivo, budget, model, openrouter_key } = await request.json()
    if (!platform || !brand) {
      return NextResponse.json({ error: 'platform e brand richiesti' }, { status: 400 })
    }

    const prompt = PROMPTS[platform]
    if (!prompt) return NextResponse.json({ error: `Platform ${platform} non supportata` }, { status: 400 })

    const userPrompt = prompt
      .replace('{{BRAND}}', JSON.stringify(brand, null, 2))
      .replace('{{PRODOTTO}}', product || 'Prodotto principale')
      .replace('{{OBIETTIVO}}', obiettivo || 'conversion')
      .replace('{{BUDGET}}', budget || 'Da definire')

    const systemPrompts: Record<string, string> = {
      google: 'Sei un Google Ads specialist senior. Crea campagne Search/Display performanti. Rispondi SOLO con JSON valido.',
      facebook: 'Sei un Meta Ads specialist senior. Crea campagne Facebook/Instagram ad alto CTR. Rispondi SOLO con JSON valido.',
      tiktok: 'Sei un TikTok Ads specialist senior. Crea campagne video creative e performanti. Rispondi SOLO con JSON valido.',
    }

    const aiRes = await callAI({
      model: model || 'claude-sonnet-4-6',
      systemPrompt: systemPrompts[platform] || 'Sei un ads specialist. Rispondi SOLO con JSON valido.',
      userPrompt,
      openrouterKey: openrouter_key || undefined,
      maxTokens: 3000,
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>
    return NextResponse.json({ platform, ...parsed })
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 500 })
  }
}
