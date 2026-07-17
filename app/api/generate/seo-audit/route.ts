import { NextResponse } from 'next/server'
import { callAI, extractJSON } from '@/lib/ai'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'
import { getClientGenerationContext, mergeBrandIdentity } from '@/lib/client-context'

const PROMPT = `Sei SEO + GEO auditor senior. Analizza performance e crea audit con miglioramenti concreti.

BRAND:
{{BRAND}}

PERIODO: {{PERIODO}}

CONTENUTI:
{{CONTENUTI}}

LOG:
{{LOG}}

Aree: SEO tecnico, SEO contenuti, GEO/AI search, social coerenza, E-E-A-T, performance.

Output SOLO JSON:
{"data_audit":"YYYY-MM-DD","periodo":"","score_globale":0,"score_seo_tecnico":0,"score_seo_contenuti":0,"score_geo_ai_search":0,"score_social_coerenza":0,"score_eeat":0,"score_performance_social":0,"riepilogo":"","punti_forti":[],"punti_critici":[],"miglioramenti":[{"area":"","azione":"","impatto":"","effort":"","deadline_suggerita":""}],"kpi_da_monitorare":[{"metrica":"","valore_attuale":"","target":""}],"contenuti_suggeriti":[{"tema":"","formato":"","canale":"","priorita":""}]}`

// Usato SOLO per il ramo demo (no DB): dati dimostrativi marcati `demo:true`,
// mai persistiti. In produzione, se l'AI fallisce, si ritorna errore (niente score finti).
function fallbackAudit(sitoUrl: string, periodo: string, brand: Record<string, unknown> | null = null) {
  const brandName = typeof brand?.brand_name === 'string' ? brand.brand_name : 'brand'
  return {
    data_audit: new Date().toISOString().split('T')[0],
    periodo,
    score_globale: 74,
    score_seo_tecnico: 72,
    score_seo_contenuti: 76,
    score_geo_ai_search: 68,
    score_social_coerenza: 78,
    score_eeat: 70,
    score_performance_social: 74,
    riepilogo: `Audit dimostrativo per ${brandName} (${sitoUrl}). Modalità demo: collega un database e un modello AI per un audit reale.`,
    punti_forti: ['Presenza brand utilizzabile come base editoriale', 'Possibilità di collegare contenuti social, blog e prodotti'],
    punti_critici: ['Servono dati reali da Search Console/Analytics per priorità precise', 'GEO/AI search da rafforzare con FAQ, risposte dirette e proof verificabili'],
    miglioramenti: [
      { area: 'Piano editoriale', azione: 'Trasformare i contenuti suggeriti in piano settimanale collegato a prodotti e keyword', impatto: 'alto', effort: 'medio', deadline_suggerita: '7 giorni' },
      { area: 'GEO/AI search', azione: 'Aggiungere FAQ, risposta breve iniziale e sezioni citabili nei blog', impatto: 'alto', effort: 'medio', deadline_suggerita: '14 giorni' },
      { area: 'SEO contenuti', azione: 'Creare cluster keyword per categorie/prodotti e link interni verso pagine commerciali', impatto: 'medio', effort: 'medio', deadline_suggerita: '14 giorni' },
    ],
    kpi_da_monitorare: [
      { metrica: 'Impression organiche', valore_attuale: 'da collegare', target: '+15% mese su mese' },
      { metrica: 'CTR organico', valore_attuale: 'da collegare', target: '>= 2.5%' },
      { metrica: 'Contenuti citabili AI', valore_attuale: '0 baseline', target: '5 asset/mese' },
    ],
    contenuti_suggeriti: [
      { tema: `Guida completa ${brandName}: scelta prodotto e stile`, formato: 'articolo', canale: 'blog', priorita: 'alta' },
      { tema: 'FAQ prodotto con risposte dirette per AI search', formato: 'carousel', canale: 'instagram', priorita: 'alta' },
      { tema: 'Checklist acquisto e benefici verificabili', formato: 'post', canale: 'facebook', priorita: 'media' },
    ],
  }
}

// Parser score robusto: accetta numero o stringa ("72", "72/100", "72 su 100") →
// 72. Ritorna null se davvero assente/non interpretabile (così NON salviamo uno 0
// finto indistinguibile da un punteggio reale che vale 0).
function toScore(...candidates: unknown[]): number | null {
  for (const c of candidates) {
    if (typeof c === 'number' && Number.isFinite(c)) return c
    if (typeof c === 'string') {
      const m = c.match(/\d+(?:[.,]\d+)?/)
      if (m) return Number(m[0].replace(',', '.'))
    }
  }
  return null
}

// Ritorna l'elenco dei campi score mancanti (per esporli: audit parziale, non finto).
async function saveAudit(clienteId: string, periodo: string, parsed: Record<string, unknown>, model: string): Promise<string[]> {
  const scores = (parsed.scores || {}) as Record<string, unknown>
  const scoreFields: Array<[string, unknown, unknown]> = [
    ['score_globale', parsed.score_globale, scores.globale],
    ['score_seo_tecnico', parsed.score_seo_tecnico, scores.seo_tecnico],
    ['score_seo_contenuti', parsed.score_seo_contenuti, scores.seo_contenuti],
    ['score_geo_ai_search', parsed.score_geo_ai_search, scores.geo_ai_search],
    ['score_social_coerenza', parsed.score_social_coerenza, scores.social_coerenza],
    ['score_eeat', parsed.score_eeat, scores.eeat],
    ['score_performance_social', parsed.score_performance_social, scores.performance_social],
  ]
  const values = new Map<string, number | null>()
  const missing: string[] = []
  for (const [name, a, b] of scoreFields) {
    const v = toScore(a, b)
    if (v === null) missing.push(name)
    values.set(name, v)
  }

  await q(
    `INSERT INTO seo_audit (
      cliente_id, data_audit, periodo, score_globale,
      score_seo_tecnico, score_seo_contenuti, score_geo_ai_search,
      score_social_coerenza, score_eeat, score_performance_social,
      riepilogo, punti_forti, punti_critici, miglioramenti,
      kpi_da_monitorare, contenuti_suggeriti, generato_da
    ) VALUES (
      $1, $2, $3, $4, $5, $6, $7, $8, $9,
      $10, $11, $12, $13, $14::jsonb, $15::jsonb, $16::jsonb, $17
    )`,
    [
      clienteId,
      (parsed.data_audit as string) || new Date().toISOString().split('T')[0],
      periodo,
      // null → 0 nel DB, ma il campo è segnalato in `missing` così l'utente sa che è stimato/assente.
      values.get('score_globale') ?? 0,
      values.get('score_seo_tecnico') ?? 0,
      values.get('score_seo_contenuti') ?? 0,
      values.get('score_geo_ai_search') ?? 0,
      values.get('score_social_coerenza') ?? 0,
      values.get('score_eeat') ?? 0,
      values.get('score_performance_social') ?? 0,
      (parsed.riepilogo as string) || '',
      (parsed.punti_forti || []) as string[],
      (parsed.punti_critici || []) as string[],
      JSON.stringify(parsed.miglioramenti || parsed.miglioramenti_prioritari || []),
      JSON.stringify(parsed.kpi_da_monitorare || []),
      JSON.stringify(parsed.contenuti_suggeriti || []),
      model,
    ],
  )
  return missing
}

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, sito_url, periodo, model, openrouter_key, gemini_key, opencode_key, agnes_key } = await request.json()
    if (!sito_url) {
      return NextResponse.json({ error: 'sito_url richiesto' }, { status: 400 })
    }
    const clientContext = await getClientGenerationContext(cliente_id)
    const effectiveClienteId = clientContext.clienteId
    if (!effectiveClienteId) return NextResponse.json({ error: 'Nessun cliente selezionato' }, { status: 400 })
    await requireClienteAccess(effectiveClienteId)
    const p = periodo || 'settimanale'
    const brandIdentity = mergeBrandIdentity(clientContext, { sito_url })
    if (isDemo() || !dbReady()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        ...fallbackAudit(sito_url, p, brandIdentity),
      })
    }

    const [brandRows, calendario, logs] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [effectiveClienteId]),
      q('SELECT * FROM calendario WHERE cliente_id = $1 ORDER BY data_pubblicazione DESC LIMIT 30', [effectiveClienteId]),
      q('SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT 30', [effectiveClienteId]),
    ])
    const brand = brandRows[0] ?? null

    const userPrompt = PROMPT
      .replace('{{BRAND}}', JSON.stringify({ ...brand, sito_url }, null, 2))
      .replace('{{PERIODO}}', p)
      .replace('{{CONTENUTI}}', JSON.stringify(calendario || [], null, 2))
      .replace('{{LOG}}', JSON.stringify(logs || [], null, 2))

    // NIENTE punteggi finti: se l'AI fallisce, errore pulito (come content/plan/ads).
    // Un audit SEO con score inventati salvato nel DB inquina la cronologia e
    // viola "tutto reale". L'utente riprova o aggiunge una key affidabile.
    const aiRes = await callAI({
      model: model || 'gemini-2.5-flash',
      systemPrompt: 'Sei un auditor SEO/GEO senior. Rispondi con JSON valido, nessun altro testo.',
      userPrompt,
      openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key, agnesKey: agnes_key,
      maxTokens: 4000,
    })
    const parsed = extractJSON(aiRes) as Record<string, unknown>

    const scoreMancanti = await saveAudit(effectiveClienteId, p, parsed, (model as string) || 'ai')

    return NextResponse.json({
      ok: true,
      fallback: false,
      ...parsed,
      // Score non prodotti dall'AI: salvati come 0 ma segnalati (non spacciarli per reali).
      ...(scoreMancanti.length ? { score_mancanti: scoreMancanti, warning: `Alcuni punteggi non generati dall'AI (${scoreMancanti.length}): considerali stimati/assenti, non reali.` } : {}),
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore audit'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
