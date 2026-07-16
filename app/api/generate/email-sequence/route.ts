import { NextResponse } from 'next/server'
import { apiError } from '@/lib/api-error'
import { callAI, extractJSON } from '@/lib/ai'
import { requireAuth } from '@/lib/auth-utils'
import { resolveContentQuality, getQualityTokenBudget } from '@/lib/content-quality'
import { getClientGenerationContext, mergeBrandIdentity } from '@/lib/client-context'
import { buildEmailSequencePrompt, EMAIL_SEQUENCE_CATALOG, type EmailSequenceType } from '@/lib/marketing/frameworks'

export const dynamic = 'force-dynamic'

// Manuale, on-demand, qualsiasi tipo di sequenza. Non persiste (come il manuale
// ads/route.ts): l'utente genera, rivede, e se vuole la salva a mano. L'AGENTE
// (lib/agents/email-sequence.ts) è quello che persiste automaticamente in AUTO.
export async function POST(request: Request) {
  try {
    await requireAuth()
    const { cliente_id, tipo, obiettivo_extra, model, openrouter_key, gemini_key, opencode_key, quality, quality_level } = await request.json()
    const tipoNorm = String(tipo || '') as EmailSequenceType
    if (!EMAIL_SEQUENCE_CATALOG[tipoNorm]) {
      return NextResponse.json({ error: `tipo richiesto, uno tra: ${Object.keys(EMAIL_SEQUENCE_CATALOG).join(', ')}` }, { status: 400 })
    }

    const ctx = await getClientGenerationContext(cliente_id)
    const identity = mergeBrandIdentity(ctx)
    const contentQuality = resolveContentQuality({ requestedQuality: quality ?? quality_level, piano: (ctx.cliente as Record<string, unknown> | null)?.piano })

    const userPrompt = buildEmailSequencePrompt({
      tipo: tipoNorm,
      brandBlock: JSON.stringify(identity, null, 2),
      prodottiBlock: JSON.stringify(ctx.prodotti.slice(0, 8), null, 2),
      obiettivoExtra: obiettivo_extra,
    })

    const aiRes = await callAI({
      model: model || 'gemini-2.5-flash',
      systemPrompt: 'Sei un email marketing strategist senior. Italiano impeccabile: mai parole attaccate, accenti/apostrofi corretti. Rispondi SOLO con JSON valido. Non inventare sconti/codici/prezzi non forniti.',
      userPrompt,
      openrouterKey: openrouter_key, geminiKey: gemini_key, opencodeKey: opencode_key,
      maxTokens: getQualityTokenBudget(contentQuality),
      meta: { clienteId: ctx.clienteId || undefined, tipo: 'email_sequence', agentName: 'email' },
    })

    const parsed = extractJSON(aiRes) as Record<string, unknown>
    return NextResponse.json({ ok: true, cliente_id: ctx.clienteId, brand_source: ctx.source, ...parsed })
  } catch (e) {
    return apiError(e)
  }
}
