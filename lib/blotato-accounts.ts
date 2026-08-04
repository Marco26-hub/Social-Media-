// Resolver account Blotato: mappa un canale interno (instagram, x, ...) all'accountId
// reale del workspace Blotato dell'utente, più i campi extra che la piattaforma
// richiede (Facebook pageId, Pinterest boardId, ecc.).
//
// Perché serve: /v2/posts richiede OBBLIGATORIAMENTE accountId — identifica SU
// QUALE account social pubblicare. Prima nessuno lo popolava, quindi ogni
// pubblicazione falliva con "Account Blotato non collegato". Qui lo risolviamo
// una volta dagli account collegati in Blotato (blotato_list_accounts → GET /v2/users/me/accounts).
// NOTA STORICA: GET /v2/accounts sembrava l'endpoint giusto ma risponde 404 (verificato
// con chiave reale valida) — il path corretto, verificato 200 dal vivo, è /v2/users/me/accounts.
//
// NIENTE fallback silenzioso: se un canale non ha un account Blotato collegato,
// l'errore è esplicito e dice cosa collegare, non pubblica a caso.
//
// MULTI-CLIENTE: lo stesso workspace Blotato ospita gli account di clienti diversi
// (e di altri sistemi che non tocchiamo). Scegliere "il primo della piattaforma"
// pubblicherebbe sull'account di un altro cliente. Quindi la scelta è ESPLICITA e
// salvata per cliente in settings (blotato_account_<canale>), e quando è ambigua
// si fallisce chiusi invece di indovinare.

import { q } from '@/lib/db'
import { CANALE_TO_BLOTATO } from '@/lib/publish/blotato-map'

const BLOTATO_API_BASE = process.env.BLOTATO_API_URL || 'https://backend.blotato.com'

export type BlotatoSubaccount = { id: string; name?: string; type?: string }
export type BlotatoAccount = {
  id: string
  platform: string
  username?: string
  name?: string
  subaccounts: BlotatoSubaccount[]
  // Se il fetch delle sotto-destinazioni (Page/board) per QUESTO account è fallito,
  // il motivo va qui. subaccounts resta [] ma NON vuol dire "nessuna Page collegata":
  // vuol dire "non siamo riusciti a verificarlo". pickSubaccount deve distinguere i
  // due casi, altrimenti un errore di rete si traveste da "account senza Page".
  subaccountsError?: string
}

// Piattaforme per cui esistono sotto-destinazioni (Facebook Page, board Pinterest,
// Company Page LinkedIn) e per cui quindi vale la pena chiamare l'endpoint
// /subaccounts per-account. Le altre (youtube, instagram, threads, tiktok, twitter)
// rispondono comunque {items:[]} ma chiamarle sarebbe traffico sprecato.
const SUBACCOUNT_PLATFORMS = new Set(['facebook', 'pinterest', 'linkedin'])

// Cache per-key con TTL breve: una "Sincronizza" tocca N contenuti; senza cache
// faremmo N chiamate identiche a /v2/users/me/accounts (+ una per /subaccounts
// per ogni account facebook/pinterest/linkedin). 60s copre l'intero batch.
const accountsCache = new Map<string, { at: number; accounts: BlotatoAccount[] }>()
const ACCOUNTS_TTL_MS = 60_000

function normalizeAccount(raw: unknown): BlotatoAccount | null {
  if (!raw || typeof raw !== 'object') return null
  const o = raw as Record<string, unknown>
  const id = String(o.id ?? o.accountId ?? o.account_id ?? '').trim()
  const platform = String(o.platform ?? o.type ?? o.network ?? '').trim().toLowerCase()
  if (!id || !platform) return null
  // La risposta reale di /v2/users/me/accounts NON include sotto-destinazioni inline
  // (niente subaccounts/pages/boards nell'oggetto account): vanno recuperate a parte
  // con fetchSubaccounts, popolate dopo in listBlotatoAccounts.
  return {
    id,
    platform,
    username: o.username ? String(o.username) : undefined,
    // Ordine: name/displayName (se mai presenti) prima, poi fullname (il campo che i
    // dati reali usano davvero — spesso vuoto per account non-Page tipo instagram/tiktok).
    name: o.name ? String(o.name)
      : o.displayName ? String(o.displayName)
      : o.fullname ? String(o.fullname)
      : undefined,
    subaccounts: [],
  }
}

// Recupera le sotto-destinazioni (Page/board) di UN account. Endpoint verificato dal
// vivo (200, chiave reale): GET /v2/users/me/accounts/{accountId}/subaccounts, schema
// { items: [{ id, name, accountId }] }. Non lancia mai: un fallimento qui non deve far
// saltare l'intera lista account, diventa `subaccountsError` sul singolo account.
async function fetchSubaccounts(key: string, accountId: string): Promise<{ subs: BlotatoSubaccount[]; error?: string }> {
  try {
    const res = await fetch(`${BLOTATO_API_BASE}/v2/users/me/accounts/${accountId}/subaccounts`, {
      headers: { Authorization: `Bearer ${key}`, 'blotato-api-key': key },
    })
    if (!res.ok) {
      const body = await res.text().catch(() => '')
      return { subs: [], error: `Blotato subaccounts ${res.status}: ${body.slice(0, 160) || 'errore lista sotto-destinazioni'}` }
    }
    const data = await res.json().catch(() => null) as unknown
    const arr = Array.isArray(data) ? data
      : (data && typeof data === 'object' ? (data as Record<string, unknown>).items : null)
    if (!Array.isArray(arr)) return { subs: [], error: 'Blotato: risposta sotto-destinazioni inattesa (nessun array)' }
    const subs = arr
      .map((s): BlotatoSubaccount | null => {
        if (!s || typeof s !== 'object') return null
        const so = s as Record<string, unknown>
        const sid = String(so.id ?? '').trim()
        if (!sid) return null
        return { id: sid, name: so.name ? String(so.name) : undefined }
      })
      .filter((s): s is BlotatoSubaccount => s !== null)
    return { subs }
  } catch (e) {
    return { subs: [], error: `Blotato subaccounts: errore di rete (${(e as Error).message})` }
  }
}

export async function listBlotatoAccounts(key: string, force = false): Promise<BlotatoAccount[]> {
  const cached = accountsCache.get(key)
  if (!force && cached && Date.now() - cached.at < ACCOUNTS_TTL_MS) return cached.accounts

  const res = await fetch(`${BLOTATO_API_BASE}/v2/users/me/accounts`, {
    headers: { Authorization: `Bearer ${key}`, 'blotato-api-key': key },
  })
  if (!res.ok) {
    const body = await res.text().catch(() => '')
    throw new Error(`Blotato accounts ${res.status}: ${body.slice(0, 160) || 'errore lista account'}`)
  }
  const data = await res.json().catch(() => null) as unknown
  // Blotato può rispondere come array nudo o wrappato ({items|accounts|data:[...]}).
  const arr = Array.isArray(data) ? data
    : (data && typeof data === 'object'
        ? ((data as Record<string, unknown>).items
          ?? (data as Record<string, unknown>).accounts
          ?? (data as Record<string, unknown>).data)
        : null)
  if (!Array.isArray(arr)) throw new Error('Blotato: risposta account inattesa (nessun array)')
  const accounts = arr.map(normalizeAccount).filter((a): a is BlotatoAccount => a !== null)

  // Sotto-destinazioni: solo per le piattaforme che ne hanno bisogno (facebook/pinterest/
  // linkedin), una chiamata per account, in parallelo. Un fallimento su UN account non
  // deve inquinare gli altri: fetchSubaccounts non lancia mai, ritorna subaccountsError.
  const withSubs = await Promise.all(accounts.map(async (a) => {
    if (!SUBACCOUNT_PLATFORMS.has(a.platform)) return a
    const { subs, error } = await fetchSubaccounts(key, a.id)
    return { ...a, subaccounts: subs, subaccountsError: error }
  }))

  accountsCache.set(key, { at: Date.now(), accounts: withSubs })
  return withSubs
}

// Prefisso della chiave in `settings` che fissa l'account Blotato scelto per un cliente
// su un canale: settings(cliente_id, 'blotato_account_instagram') = '<accountId>'.
export const ACCOUNT_SETTING_PREFIX = 'blotato_account_'
// Pagina/bacheca dentro l'account (Facebook Page, board Pinterest, Company Page LinkedIn).
export const SUBACCOUNT_SETTING_PREFIX = 'blotato_subaccount_'

// Etichetta leggibile di un account: negli errori e nella UI l'id nudo non dice nulla,
// mentre nome/@username fanno capire subito di quale cliente è l'account.
function accountLabel(a: BlotatoAccount): string {
  const nome = (a.name || '').trim()
  const user = (a.username || '').trim()
  if (nome && user && nome.toLowerCase() !== user.toLowerCase()) return `${nome} (@${user})`
  if (nome) return nome
  if (user) return `@${user}`
  // Né fullname né username (capita nei dati reali, es. account facebook/instagram non-Page):
  // mai una label vuota, altrimenti due account della stessa piattaforma sono indistinguibili
  // nella UI di scelta e nei messaggi di errore fail-closed.
  return `${a.platform} #${a.id.slice(-6)}`
}

// Legge l'account fissato per (cliente, canale). Ritorna '' se non configurato e non
// lancia mai: è un dato opzionale, un errore DB non deve far saltare la pubblicazione
// (a valle la scelta ambigua viene comunque bloccata da pickAccount).
export async function getPinnedAccountId(clienteId: string | undefined, canale: string): Promise<string> {
  if (!clienteId || !canale) return ''
  try {
    const rows = await q(
      'SELECT valore FROM settings WHERE cliente_id = $1 AND chiave = $2 LIMIT 1',
      [clienteId, `${ACCOUNT_SETTING_PREFIX}${canale}`],
    )
    return (rows[0] as { valore?: string } | undefined)?.valore?.trim() || ''
  } catch {
    return ''
  }
}

// Come sopra per la pagina/bacheca dentro l'account.
export async function getPinnedSubaccountId(clienteId: string | undefined, canale: string): Promise<string> {
  if (!clienteId || !canale) return ''
  try {
    const rows = await q(
      'SELECT valore FROM settings WHERE cliente_id = $1 AND chiave = $2 LIMIT 1',
      [clienteId, `${SUBACCOUNT_SETTING_PREFIX}${canale}`],
    )
    return (rows[0] as { valore?: string } | undefined)?.valore?.trim() || ''
  } catch {
    return ''
  }
}

// Tutti i pin del cliente in una query sola: la scheda cliente pianifica ~8 canali
// insieme, e 8 round-trip per leggere 8 righe della stessa tabella sono sprecati.
async function getPinnedMap(clienteId: string, prefix: string): Promise<Record<string, string>> {
  if (!clienteId) return {}
  try {
    const rows = await q(
      'SELECT chiave, valore FROM settings WHERE cliente_id = $1 AND chiave LIKE $2',
      [clienteId, `${prefix}%`],
    )
    const map: Record<string, string> = {}
    for (const r of rows as { chiave?: string; valore?: string }[]) {
      const canale = String(r.chiave || '').slice(prefix.length)
      const val = String(r.valore || '').trim()
      if (canale && val) map[canale] = val
    }
    return map
  } catch {
    return {}
  }
}

// Esito della scelta account: o un account solo e certo, o il motivo per cui non si può
// scegliere. Stessa funzione per il sync e per la UI, così l'anteprima nella scheda
// cliente mostra esattamente l'errore che si vedrebbe in pubblicazione.
type AccountPick =
  | { ok: true; account: BlotatoAccount }
  | { ok: false; stato: 'da_scegliere' | 'mancante'; motivo: string }

// CUORE DELLA SICUREZZA MULTI-CLIENTE: non sceglie MAI implicitamente tra più account
// della stessa piattaforma. Un `find()` sul primo pubblicherebbe sull'account di un
// altro cliente al primo test live, quindi in caso di ambiguità si fallisce chiusi.
function pickAccount(platform: string, accounts: BlotatoAccount[], pinnedAccountId?: string): AccountPick {
  const candidati = accounts.filter(a => a.platform === platform)
  if (!candidati.length) {
    const collegati = accounts.map(a => a.platform).join(', ') || 'nessuno'
    return {
      ok: false,
      stato: 'mancante',
      motivo: `Nessun account ${platform} collegato in Blotato (collegati: ${collegati}). Collega l'account nel workspace Blotato.`,
    }
  }

  const elenco = candidati.map(accountLabel).join(', ')
  const pin = (pinnedAccountId || '').trim()
  if (pin) {
    const scelto = candidati.find(a => a.id === pin)
    if (scelto) return { ok: true, account: scelto }
    // Pin che non risolve = account scollegato o spostato: mai ripiegare su un altro,
    // sarebbe proprio la pubblicazione sull'account sbagliato che vogliamo impedire.
    return {
      ok: false,
      stato: 'da_scegliere',
      motivo: `L'account ${platform} fissato per questo cliente non è più collegato in Blotato. Disponibili ora: ${elenco}. Riscegli l'account nella scheda cliente.`,
    }
  }

  // Un solo candidato → nessuna ambiguità possibile: comportamento storico, sicuro.
  if (candidati.length === 1) return { ok: true, account: candidati[0] }

  return {
    ok: false,
    stato: 'da_scegliere',
    motivo: `In Blotato ci sono ${candidati.length} account ${platform} (${elenco}): scegli quello del cliente nella scheda cliente prima di pubblicare.`,
  }
}

// Stessa regola di pickAccount un livello più in basso. Un account Facebook può avere
// più Pages e un account Pinterest più board: prendere subaccounts[0] pubblicherebbe
// sulla pagina/bacheca sbagliata pur avendo azzeccato l'account, che per un workspace
// con più clienti è lo stesso disastro. Ambiguo = si ferma e chiede.
function pickSubaccount(
  account: BlotatoAccount,
  cosa: string,
  pinnedSubaccountId: string | undefined,
  obbligatorio: boolean,
): BlotatoSubaccount {
  const subs = account.subaccounts
  const pin = (pinnedSubaccountId || '').trim()
  if (pin) {
    const scelto = subs.find(s => s.id === pin)
    if (scelto) return scelto
    throw new Error(`La ${cosa} fissata per questo cliente non è più collegata in Blotato. Disponibili: ${subs.map(s => s.name || s.id).join(', ') || 'nessuna'}. Riscegli nella scheda cliente.`)
  }
  if (!subs.length) {
    // Zero risultati per errore di rete/API != zero Page collegate: dirlo "nessuna
    // collegata" quando in realtà non siamo riusciti a verificarlo manderebbe l'utente
    // a scollegare/ricollegare una Page che esiste già. Mai inventare un fallback silenzioso.
    if (account.subaccountsError) {
      throw new Error(`Impossibile verificare le ${cosa} dell'account ${accountLabel(account)}: ${account.subaccountsError}. Riprova; se persiste, inserisci l'ID della ${cosa} a mano.`)
    }
    if (!obbligatorio) throw new Error(`Nessuna ${cosa} collegata`)
    throw new Error(`Nessuna ${cosa} collegata in Blotato per l'account ${accountLabel(account)}: collegala nel workspace Blotato.`)
  }
  if (subs.length === 1) return subs[0]
  throw new Error(`L'account ${accountLabel(account)} ha ${subs.length} ${cosa} (${subs.map(s => s.name || s.id).join(', ')}): scegli quella del cliente nella scheda cliente prima di pubblicare.`)
}

export type ResolvedTarget = {
  accountId: string
  // target da mettere nel payload /v2/posts: { targetType, + campi per-piattaforma }.
  target: Record<string, unknown>
}

// Risolve accountId + target per un canale. Lancia un errore ESPLICITO e azionabile
// se manca l'account, se è ambiguo (più account della stessa piattaforma senza scelta
// salvata) o se manca un campo obbligatorio della piattaforma (es. Pinterest board).
export async function resolveBlotatoTarget(
  key: string,
  canale: string,
  row: Record<string, unknown>,
  pinnedAccountId?: string,
  pinnedSubaccountId?: string,
): Promise<ResolvedTarget> {
  const platform = CANALE_TO_BLOTATO[canale]
  if (!platform) throw new Error(`Canale '${canale}' non pubblicabile via Blotato`)

  const accounts = await listBlotatoAccounts(key)
  const scelta = pickAccount(platform, accounts, pinnedAccountId)
  if (!scelta.ok) throw new Error(scelta.motivo)
  const account = scelta.account

  const target: Record<string, unknown> = { targetType: platform }
  const str = (v: unknown) => (typeof v === 'string' ? v.trim() : '')

  // Campi obbligatori/consigliati per piattaforma (schema blotato_create_post).
  if (platform === 'facebook') {
    // Facebook pubblica su una Page, non sul profilo: pageId da subaccount.
    target.pageId = pickSubaccount(account, 'Page Facebook', pinnedSubaccountId, true).id
  } else if (platform === 'pinterest') {
    target.boardId = pickSubaccount(account, 'board Pinterest', pinnedSubaccountId, true).id
    target.title = (str(row.hook) || str(row.nome_prodotto) || 'Nuovo pin').slice(0, 100)
  } else if (platform === 'linkedin') {
    // Se il fetch delle Company Page è fallito, NON trattarlo come "nessuna Company Page
    // collegata": pubblicherebbe silenziosamente sul profilo personale mentre magari
    // esiste (ed è pinnata) una Company Page che non siamo riusciti a vedere.
    if (account.subaccountsError) {
      throw new Error(`Impossibile verificare le Company Page LinkedIn dell'account ${accountLabel(account)}: ${account.subaccountsError}. Riprova prima di pubblicare.`)
    }
    // Se c'è una Company Page collegata la usiamo; altrimenti profilo personale.
    const page = account.subaccounts.length ? pickSubaccount(account, 'Company Page LinkedIn', pinnedSubaccountId, false) : null
    if (page) target.pageId = page.id
  } else if (platform === 'tiktok') {
    // TikTok richiede TUTTI questi campi (contratto v2). Default sicuri per
    // pubblicazione pubblica; l'utente può raffinarli poi.
    target.privacyLevel = 'PUBLIC_TO_EVERYONE'
    target.disabledComments = false
    target.disabledDuet = false
    target.disabledStitch = false
    target.isBrandedContent = false
    target.isYourBrand = false
    // Dichiarazione "contenuto generato da IA" mostrata da TikTok sul post: va
    // detta solo quando è vera, cioè quando il MEDIA è stato generato dall'AI.
    // Era fissa a true, quindi bollava così anche foto e video del cliente.
    // `fonte_media` vale 'upload_cliente' per i media caricati e '<provider>_ai'
    // (es. 'openrouter_ai') per quelli generati.
    target.isAiGenerated = String(row.fonte_media || '').endsWith('_ai')
  } else if (platform === 'youtube') {
    target.title = (str(row.hook) || str(row.nome_prodotto) || 'Video').slice(0, 90)
    target.privacyStatus = 'public'
    target.shouldNotifySubscribers = false
  }

  return { accountId: account.id, target }
}

// Riga di anteprima per la scheda cliente: dove finirebbe un post su questo canale.
// `stato` guida la UI: 'ok' = risolto, 'da_scegliere' = serve una scelta (opzioni piene),
// 'mancante' = nessun account di quella piattaforma nel workspace.
export type Destination = {
  canale: string
  platform: string
  stato: 'ok' | 'da_scegliere' | 'mancante'
  accountId: string
  label: string
  opzioni: { id: string; label: string }[]
  // Pagine/bacheche dentro l'account, quando sono più di una e va scelta.
  sottoOpzioni?: { id: string; label: string }[]
  motivo?: string
}

// Anteprima SOLA LETTURA (nessuna scrittura, nessuna pubblicazione) delle destinazioni:
// mostra prima del test live su quale account finirebbe ogni canale, usando la stessa
// pickAccount del sync. Un canale problematico non lancia: diventa una riga con stato
// diverso da 'ok', altrimenti un solo canale rotto oscurerebbe tutti gli altri.
export async function planDestinations(key: string, clienteId: string, canali: string[]): Promise<Destination[]> {
  const accounts = await listBlotatoAccounts(key)
  const pins = await getPinnedMap(clienteId, ACCOUNT_SETTING_PREFIX)
  const subPins = await getPinnedMap(clienteId, SUBACCOUNT_SETTING_PREFIX)

  return canali.map((canale): Destination => {
    const platform = CANALE_TO_BLOTATO[canale] || ''
    if (!platform) {
      return {
        canale, platform: '', stato: 'mancante', accountId: '', label: '', opzioni: [],
        motivo: `Canale '${canale}' non pubblicabile via Blotato`,
      }
    }

    const opzioni = accounts
      .filter(a => a.platform === platform)
      .map(a => ({ id: a.id, label: accountLabel(a) }))

    const scelta = pickAccount(platform, accounts, pins[canale])
    if (!scelta.ok) {
      return { canale, platform, stato: scelta.stato, accountId: '', label: '', opzioni, motivo: scelta.motivo }
    }

    // L'anteprima deve dire 'ok' solo se il post partirebbe davvero: un account
    // corretto ma con più Pages/board si blocca comunque in pubblicazione, e
    // mostrarlo verde qui darebbe una falsa sicurezza proprio prima del test live.
    const account = scelta.account
    const base = { canale, platform, accountId: account.id, label: accountLabel(account), opzioni }
    if (platform === 'facebook' || platform === 'pinterest' || (platform === 'linkedin' && (account.subaccounts.length || account.subaccountsError))) {
      try {
        const sub = pickSubaccount(
          account,
          platform === 'facebook' ? 'Page Facebook' : platform === 'pinterest' ? 'board Pinterest' : 'Company Page LinkedIn',
          subPins[canale],
          platform !== 'linkedin',
        )
        return { ...base, stato: 'ok', label: `${base.label} → ${sub.name || sub.id}` }
      } catch (e) {
        return { ...base, stato: 'da_scegliere', motivo: (e as Error).message, sottoOpzioni: account.subaccounts.map(s => ({ id: s.id, label: s.name || s.id })) }
      }
    }
    return { ...base, stato: 'ok' }
  })
}
