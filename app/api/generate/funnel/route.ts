import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { getClientGenerationContext, mergeBrandIdentity } from '@/lib/client-context'
import { buildFunnelPlanPrompt } from '@/lib/marketing/frameworks'

export const dynamic = 'force-dynamic'

// Piano di ottimizzazione funnel (TOFU/MOFU/BOFU/retention) grounded sulle tattiche
// reali della skill market-funnel (lift atteso onesto, non inventato dall'AI).
export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, obiettivo, dati_funnel, model, openrouter_key, gemini_key, opencode_key } = await request.json()

    const ctx = await getClientGenerationContext(cliente_id)
    const identity = mergeBrandIdentity(ctx)

    const userPrompt = buildFunnelPlanPrompt({
      brandBlock: JSON.stringify(identity, null, 2),
      obiettivo,
      datiFunnel: dati_funnel ? JSON.stringify(dati_funnel, null, 2) : undefined,
    })

    const aiRes = await callAI({
      model: model || 'gemini-2.5-flash',
      systemPrompt: 'Sei un funnel strategist senior. Rispondi SOLO con JSON valido, italiano impeccabile. Usa SOLO i lift attesi forniti nel prompt, non inventarne altri.',
      userPrompt,
      openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key,
      maxTokens: 4000,
      meta: { clienteId: ctx.clienteId || undefined, tipo: 'funnel_plan', agentName: 'funnel' },
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>
    return NextResponse.json({ ok: true, cliente_id: ctx.clienteId, brand_source: ctx.source, ...parsed })
  } catch (e) {
    return apiError(e)
  }
}
