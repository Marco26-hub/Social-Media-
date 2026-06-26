import { NextResponse } from 'next/server'
import { callAI, extractJSON } from '@/lib/ai'
import { dbReady, q } from '@/lib/db'
import { requireAuth, requireClienteAccess } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

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

export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, sito_url, periodo, model, openrouter_key } = await request.json()
    if (!cliente_id || !sito_url) {
      return NextResponse.json({ error: 'cliente_id e sito_url richiesti' }, { status: 400 })
    }
    await requireClienteAccess(cliente_id)
    if (isDemo() || !dbReady()) {
      return NextResponse.json({
        ok: true,
        demo: true,
        score_globale: 82,
        riepilogo: `Fallback demo: audit SEO/GEO simulato per ${sito_url}. Configura Neon per salvare audit reali.`,
        miglioramenti: [
          { area: 'SEO contenuti', azione: 'Creare pagine pillar e FAQ per query commerciali', impatto: 'alto', effort: 'medio' },
          { area: 'GEO/AI search', azione: 'Aggiungere risposte dirette e dati strutturati nei contenuti', impatto: 'alto', effort: 'medio' },
        ],
      })
    }

    const [brandRows, calendario, logs] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cliente_id]),
      q('SELECT * FROM calendario WHERE cliente_id = $1 ORDER BY data_pubblicazione DESC LIMIT 30', [cliente_id]),
      q('SELECT * FROM log_pubblicazioni WHERE cliente_id = $1 ORDER BY timestamp DESC LIMIT 30', [cliente_id]),
    ])
    const brand = brandRows[0] ?? null

    const p = periodo || 'settimanale'
    const userPrompt = PROMPT
      .replace('{{BRAND}}', JSON.stringify({ ...brand, sito_url }, null, 2))
      .replace('{{PERIODO}}', p)
      .replace('{{CONTENUTI}}', JSON.stringify(calendario || [], null, 2))
      .replace('{{LOG}}', JSON.stringify(logs || [], null, 2))

    const aiRes = await callAI({
      model: model || 'claude-sonnet-4-6',
      systemPrompt: 'Sei un auditor SEO/GEO senior. Rispondi con JSON valido, nessun altro testo.',
      userPrompt,
      openrouterKey: openrouter_key,
      maxTokens: 4000,
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>
    const scores = (parsed.scores || {}) as Record<string, unknown>

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
        cliente_id,
        new Date().toISOString().split('T')[0],
        p,
        (parsed.score_globale as number) || 0,
        (parsed.score_seo_tecnico || scores.seo_tecnico || 0) as number,
        (parsed.score_seo_contenuti || scores.seo_contenuti || 0) as number,
        (parsed.score_geo_ai_search || scores.geo_ai_search || 0) as number,
        (parsed.score_social_coerenza || scores.social_coerenza || 0) as number,
        (parsed.score_eeat || scores.eeat || 0) as number,
        (parsed.score_performance_social || scores.performance_social || 0) as number,
        (parsed.riepilogo as string) || '',
        (parsed.punti_forti || []) as string[],
        (parsed.punti_critici || []) as string[],
        JSON.stringify(parsed.miglioramenti || parsed.miglioramenti_prioritari || []),
        JSON.stringify(parsed.kpi_da_monitorare || []),
        JSON.stringify(parsed.contenuti_suggeriti || []),
        (model as string) || 'claude-sonnet-4-6',
      ],
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore audit'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
