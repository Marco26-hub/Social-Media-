import { q } from '@/lib/db'

type TelegramConfig = {
  bot_token: string
  chat_id: string
}

async function getTelegramConfig(clienteId: string): Promise<TelegramConfig | null> {
  try {
    const rows = await q(
      `SELECT chiave, valore FROM settings WHERE cliente_id = $1 AND chiave IN ('telegram_bot_token', 'telegram_chat_id')`,
      [clienteId],
    ) as Array<{ chiave: string; valore: string }>
    const botToken = rows.find(r => r.chiave === 'telegram_bot_token')?.valore
    const chatId = rows.find(r => r.chiave === 'telegram_chat_id')?.valore
    if (botToken && chatId) return { bot_token: botToken, chat_id: chatId }
    return null
  } catch {
    return null
  }
}

async function sendTelegram(config: TelegramConfig, text: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${config.bot_token}/sendMessage`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chat_id,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    })
    return res.ok
  } catch {
    return false
  }
}

type NotifyEvent =
  | { type: 'approvazione'; id_contenuto: string; canale: string; formato: string; hook?: string }
  | { type: 'pubblicato'; id_contenuto: string; canale: string; formato: string; blotato_post_id?: string }
  | { type: 'errore'; id_contenuto: string; canale: string; errore: string }
  | { type: 'richiesta_modifica'; id_contenuto: string; canale: string; formato: string; note?: string }

function formatMessage(event: NotifyEvent): string {
  const id = event.id_contenuto
  switch (event.type) {
    case 'approvazione':
      return [
        `📋 <b>Contenuto da approvare</b>`,
        `🆔 ${id} — ${event.canale} · ${event.formato}`,
        event.hook ? `💬 ${event.hook}` : '',
        `⏳ <i>Azione: approva o rifiuta</i>`,
      ].filter(Boolean).join('\n')

    case 'pubblicato':
      return [
        `✅ <b>Pubblicato!</b>`,
        `🆔 ${id} — ${event.canale} · ${event.formato}`,
        event.blotato_post_id ? `🔗 Blotato ID: ${event.blotato_post_id}` : '',
      ].filter(Boolean).join('\n')

    case 'errore':
      return [
        `🚨 <b>Errore pubblicazione</b>`,
        `🆔 ${id} — ${event.canale}`,
        `⚠️ ${event.errore.slice(0, 300)}`,
      ].join('\n')

    case 'richiesta_modifica':
      return [
        `✏️ <b>Richiesta modifica</b>`,
        `🆔 ${id} — ${event.canale} · ${event.formato}`,
        event.note ? `📝 ${event.note}` : '',
      ].filter(Boolean).join('\n')
  }
}

export async function notifyCliente(clienteId: string, event: NotifyEvent): Promise<boolean> {
  const config = await getTelegramConfig(clienteId)
  if (!config) return false

  const text = formatMessage(event)
  return sendTelegram(config, text)
}

export async function notifyAgency(event: NotifyEvent): Promise<boolean> {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID
  if (!botToken || !chatId) return false

  const text = formatMessage(event)
  return sendTelegram({ bot_token: botToken, chat_id: chatId }, text)
}
