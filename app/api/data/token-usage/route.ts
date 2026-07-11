import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { dbReady, q } from '@/lib/db'
import { requireAdmin } from '@/lib/auth-utils'
import { isDemo } from '@/lib/demo'

export const dynamic = 'force-dynamic'

const DEMO = {
  totale: { prompt_tokens: 128400, completion_tokens: 96200, total_tokens: 224600, chiamate: 84 },
  per_provider: [
    { provider: 'gemini', total_tokens: 150200, chiamate: 61 },
    { provider: 'openrouter', total_tokens: 74400, chiamate: 23 },
  ],
  per_model: [
    { model: 'gemini-2.5-flash', total_tokens: 150200, chiamate: 61 },
    { model: 'meta-llama/llama-3.3-70b-instruct:free', total_tokens: 74400, chiamate: 23 },
  ],
  per_agente: [
    { agent_name: 'agente_auto', total_tokens: 88000, chiamate: 30 },
    { agent_name: null, total_tokens: 136600, chiamate: 54 },
  ],
  per_giorno: [],
  demo: true,
}

// Consumo token AI aggregato (ultimi 30 giorni). Solo admin. Fase 1: globale
// (cliente_id/agent_name possono essere NULL). Consumato da /dashboard/consumi.
export async function GET() {
  try {
    await requireAdmin()
    if (isDemo() || !dbReady()) return NextResponse.json(DEMO)

    const since = `now() - interval '30 days'`
    const [tot, prov, mod, ag, day] = await Promise.all([
      q(`SELECT COALESCE(sum(prompt_tokens),0)::int prompt_tokens, COALESCE(sum(completion_tokens),0)::int completion_tokens, COALESCE(sum(total_tokens),0)::int total_tokens, count(*)::int chiamate FROM token_usage WHERE created_at >= ${since}`),
      q(`SELECT provider, sum(total_tokens)::int total_tokens, count(*)::int chiamate FROM token_usage WHERE created_at >= ${since} GROUP BY provider ORDER BY total_tokens DESC`),
      q(`SELECT model, sum(total_tokens)::int total_tokens, count(*)::int chiamate FROM token_usage WHERE created_at >= ${since} GROUP BY model ORDER BY total_tokens DESC LIMIT 12`),
      q(`SELECT agent_name, sum(total_tokens)::int total_tokens, count(*)::int chiamate FROM token_usage WHERE created_at >= ${since} GROUP BY agent_name ORDER BY total_tokens DESC`),
      q(`SELECT to_char(date_trunc('day', created_at), 'YYYY-MM-DD') giorno, sum(total_tokens)::int total_tokens FROM token_usage WHERE created_at >= ${since} GROUP BY 1 ORDER BY 1`),
    ])

    return NextResponse.json({
      totale: tot[0] || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0, chiamate: 0 },
      per_provider: prov,
      per_model: mod,
      per_agente: ag,
      per_giorno: day,
    })
  } catch (e) {
    return apiError(e)
  }
}
