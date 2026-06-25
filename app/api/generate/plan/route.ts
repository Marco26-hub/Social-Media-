import { NextResponse } from 'next/server'
import { callAI, extractJSONArray } from '@/lib/ai'
import { q } from '@/lib/db'

const PROMPT_WEEKLY = `Agisci come Social Media Manager senior per brand abbigliamento e-commerce.
Crea piano editoriale SETTIMANALE (7 giorni) per {{PIATTAFORME}}.
Genera 7-10 contenuti.

BRAND:
{{BRAND}}

PRODOTTI:
{{PRODOTTI}}

Distribuzione: alterna mattina (9-11) e sera (18-21).
Lunedi/giovedi = inspiration, venerdi = vendita/promo, weekend = community/lifestyle.
Non concentrare prodotti in pochi giorni.
Tono moderno fashion coerente con brand.

Output SOLO JSON array valido:
[{"data_pubblicazione":"YYYY-MM-DD","ora_pubblicazione":"HH:MM","canale":"instagram|facebook|tiktok|pinterest|youtube_shorts","formato":"post|carousel|reel|story|pin|short|video","obiettivo":"vendita|awareness|community|educazione|ispirazione|trending","product_id":"","nome_prodotto":"","tema":"","hook":"","caption":"","hashtag":"","cta":""}]`

const PROMPT_MONTHLY = `Agisci come Social Media Manager senior per brand abbigliamento e-commerce.
Crea piano editoriale MENSILE (30 giorni) per {{PIATTAFORME}}.
Genera 25-35 contenuti.

BRAND:
{{BRAND}}

PRODOTTI:
{{PRODOTTI}}

Distribuzione: 4-5 post Instagram/sett, 2-3 carousel/mese, 4-6 reel/mese, 2-3 post Facebook/sett, 5-8 pin Pinterest, 2-4 YouTube Shorts/mese.
Alterna mattina (9-11) e sera (18-21).
Lunedi/giovedi = inspiration, venerdi = vendita/promo, weekend = community/lifestyle.
Non concentrare prodotti in pochi giorni.
Tono moderno fashion coerente con brand.

Output SOLO JSON array valido:
[{"data_pubblicazione":"YYYY-MM-DD","ora_pubblicazione":"HH:MM","canale":"instagram|facebook|tiktok|pinterest|youtube_shorts","formato":"post|carousel|reel|story|pin|short|video","obiettivo":"vendita|awareness|community|educazione|ispirazione|trending","product_id":"","nome_prodotto":"","tema":"","hook":"","caption":"","hashtag":"","cta":""}]`

export async function POST(request: Request) {
  try {
    const { cliente_id, piattaforme, obiettivo, model, openrouter_key, periodo } = await request.json()
    if (!cliente_id || !piattaforme?.length) {
      return NextResponse.json({ error: 'cliente_id e piattaforme richiesti' }, { status: 400 })
    }

    const [brandRows, products] = await Promise.all([
      q('SELECT * FROM brand WHERE cliente_id = $1 LIMIT 1', [cliente_id]),
      q('SELECT * FROM prodotti WHERE cliente_id = $1', [cliente_id]),
    ])
    const brand = brandRows[0] ?? null

    const promptTemplate = periodo === 'mensile' ? PROMPT_MONTHLY : PROMPT_WEEKLY
    const piattaformeStr = piattaforme.join(', ')

    const userPrompt = promptTemplate
      .replace('{{PIATTAFORME}}', `/ ${piattaformeStr} /`)
      .replace('{{BRAND}}', JSON.stringify(brand || {}, null, 2))
      .replace('{{PRODOTTI}}', JSON.stringify(products || [], null, 2))

    const aiRes = await callAI({
      model: model || 'claude-sonnet-4-6',
      systemPrompt: `Sei un social media manager senior. Obiettivo: ${obiettivo || 'mix'}. Rispondi con JSON array valido, nessun altro testo.`,
      userPrompt,
      openrouterKey: openrouter_key,
      maxTokens: 8000,
    })

    const items = extractJSONArray(aiRes) as Record<string, unknown>[]
    const inseriti: { id_contenuto: string; canale: string; data_pubblicazione: string }[] = []

    for (const item of items) {
      const id_contenuto = `C${Date.now().toString(36).toUpperCase()}_${inseriti.length}`
      await q(
        `INSERT INTO calendario (
          cliente_id, id_contenuto, data_pubblicazione, ora_pubblicazione,
          canale, formato, obiettivo, product_id, nome_prodotto,
          tema, hook, caption, hashtag, cta, status
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8,
          $9, $10, $11, $12, $13, $14, $15
        )`,
        [
          cliente_id,
          id_contenuto,
          item.data_pubblicazione || null,
          item.ora_pubblicazione || '10:00',
          item.canale || 'instagram',
          item.formato || 'post',
          item.obiettivo || obiettivo || 'mix',
          item.product_id || null,
          item.nome_prodotto || null,
          item.tema || null,
          item.hook || null,
          item.caption || null,
          item.hashtag || null,
          item.cta || null,
          'BOZZA',
        ],
      )
      inseriti.push({ id_contenuto, canale: item.canale as string, data_pubblicazione: item.data_pubblicazione as string })
    }

    return NextResponse.json({ ok: true, count: inseriti.length })
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Errore generazione piano'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
