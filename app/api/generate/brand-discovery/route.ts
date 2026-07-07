import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { fetchSiteContent } from '@/lib/brand-scrape'

// ANTI-ALLUCINAZIONE: l'AI NON analizza mai l'URL nudo. Lavora SOLO sul contenuto
// reale estratto dal sito (fetch server-side + estrazione title/meta/og/headings/
// testo). Se un campo non è determinabile dal contenuto reale, l'AI deve scrivere
// "non rilevabile" invece di inventare. Se il sito non è leggibile, la route
// restituisce errore esplicito (niente profilo fantasma).
const DISCOVERY_PROMPT = `Sei un brand strategist senior. Analizza il contenuto REALE del sito qui sotto (estratto dal vivo) e restituisci un profilo brand.

REGOLA FONDAMENTALE — ANTI ALLUCINAZIONE:
- Usa ESCLUSIVAMENTE le informazioni presenti nel contenuto fornito.
- NON inventare settore, target, colori o parole basandoti sul dominio o su conoscenze pregresse.
- Se un campo NON è determinabile dal contenuto reale, scrivi "non rilevabile" per quel campo.
- È meglio un campo "non rilevabile" che un dato inventato.

--- INIZIO CONTENUTO REALE DEL SITO ---

TITOLO PAGINA: {{TITLE}}

META DESCRIPTION: {{DESCRIPTION}}

OPEN GRAPH:
- titolo: {{OG_TITLE}}
- descrizione: {{OG_DESCRIPTION}}
- nome sito: {{OG_SITE_NAME}}

HEADINGS (h1/h2 trovati nella pagina):
{{HEADINGS}}

CAMPIONE DI TESTO VISIBILE:
{{TEXT_SAMPLE}}

--- FINE CONTENUTO REALE ---

URL del sito: {{URL}}

Analizza dal contenuto reale sopra:
1. Settore/nicchia di mercato (dal testo e dai prodotti citati)
2. Tono di voce (elegante, casual, ironico, professionale, emozionale, tecnico, luxury, friendly, sostenibile)
3. Target audience (età, genere, interessi, stile di vita) — solo se desumibile dal contenuto
4. Brand promise / value proposition (dal testo, non inventata)
5. Palette colori dominante (solo se menzionata o chiara dal contesto testuale; altrimenti "non rilevabile")
6. Parole chiave e frasi ricorrenti trovate nel testo (copiale, non inventarli)
7. Parole/frasi da EVITARE (competitor citati, o ovvie da non usare)
8. Emoji policy (inferred dal tono, con cautela)
9. Hashtag strategici (brand + settore, dal contenuto)
10. CTA efficaci per il pubblico (dal contenuto o dal tono)
11. Prodotti principali / categorie (dai prodotti citati nella pagina)
12. Stagionalità (se menzionata nel testo, altrimenti "non rilevabile")

Output SOLO JSON valido, nessun altro testo:
{
  "settore": "",
  "brand_name": "",
  "tono_voce": "",
  "target": "",
  "promessa_brand": "",
  "colori_brand": "",
  "parole_da_usare": "",
  "parole_da_evitare": "",
  "emoji_policy": "",
  "hashtag_base": "",
  "cta_base": "",
  "categorie_prodotti": "",
  "stagionalita": "",
  "note_osservazioni": ""
}`

function fill(template: string, ctx: Record<string, string>): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, k) => ctx[k] ?? 'non rilevabile')
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { url, model, openrouter_key, gemini_key, opencode_key } = await request.json()
    if (!url) {
      return NextResponse.json({ error: 'url richiesto' }, { status: 400 })
    }

    // 1) Fetch reale del sito. Senza contenuto reale l'AI inventa tutto.
    const scraped = await fetchSiteContent(url, { timeoutMs: 12000 })
    if (!scraped.ok) {
      // Sito illeggibile: NON passare all'AI un URL nudo (produrrebbe un profilo
      // fantasma). Restituisci errore azionabile.
      return NextResponse.json(
        { error: scraped.error || 'Sito non analizzabile', url, hint: 'Verifica che il sito sia online e accessibile, oppure inserisci i dati del brand manualmente.' },
        { status: 502 },
      )
    }

    // 2) Costruisci il prompt con il contenuto REALE estratto.
    const userPrompt = fill(DISCOVERY_PROMPT, {
      URL: url,
      TITLE: scraped.title || 'non rilevabile',
      DESCRIPTION: scraped.description || 'non rilevabile',
      OG_TITLE: scraped.ogTitle || 'non rilevabile',
      OG_DESCRIPTION: scraped.ogDescription || 'non rilevabile',
      OG_SITE_NAME: scraped.ogSiteName || 'non rilevabile',
      HEADINGS: scraped.headings.length ? scraped.headings.join('\n- ') : 'non rilevabile',
      TEXT_SAMPLE: scraped.textSample || 'non rilevabile',
    })

    const aiRes = await callAI({
      model: model || 'meta-llama/llama-3.3-70b-instruct:free',
      systemPrompt: 'Sei un brand strategist senior. Analisi SOLO sul contenuto reale fornito. È severamente vietato inventare dati: se un’informazione non è nel contenuto, scrivi "non rilevabile". Rispondi SOLO con JSON valido.',
      userPrompt,
      openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key || undefined,
      maxTokens: 2000,
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>

    // 3) Rileva profilo fantasma: se TUTTI i campi sono "non rilevabile", il
    // contenuto era insufficiente. Segnalalo invece di restituire un profilo vuoto.
    const fields = ['settore', 'tono_voce', 'target', 'promessa_brand', 'categorie_prodotti']
    const nonRilevabili = fields.filter(f => {
      const v = String(parsed[f] ?? '').trim().toLowerCase()
      return v === '' || v.includes('non rilevabile') || v.includes('non rilev')
    })
    if (nonRilevabili.length === fields.length) {
      return NextResponse.json(
        { error: 'Il contenuto del sito è troppo scarno per determinare un profilo brand affidabile. Inserisci i dati manualmente.', url, partial: parsed },
        { status: 422 },
      )
    }

    // 4) Allega metadati di provenance: l'UI può mostrare da quale contenuto reale
    // è derivato il profilo (trasparenza anti-allucinazione).
    return NextResponse.json({
      ...parsed,
      _source: {
        url: scraped.finalUrl || scraped.url,
        title: scraped.title,
        bytesFetched: scraped.bytesFetched,
        headingsFound: scraped.headings.length,
      },
    })
  } catch (e) {
    return apiError(e)
  }
}
