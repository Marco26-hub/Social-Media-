import type { PackageSpec } from '@/lib/packages'

// ─────────────────────────────────────────────────────────────────────────
// FABBISOGNO MEDIA DEL PIANO EDITORIALE
//
// Problema che questo modulo risolve: l'utente carica foto e MP4 "a occhio" in
// un pool unico e scopre SOLO a piano generato che il materiale non bastava
// (post senza foto, caroselli con 1 sola slide, reel montati con una foto).
// Nessuno gli diceva PRIMA quanti media servivano davvero per il pacchetto che
// ha comprato.
//
// Qui il fabbisogno diventa un numero calcolabile a monte, da tre regole
// decise con il committente:
//   • post / story / pin / video singolo → 1 media
//   • carosello                          → 5 media (minimo 3, massimo 10)
//   • reel / short                       → 1 MP4 se c'è, ALTRIMENTI 1 immagine
//     ATTENZIONE: il sistema NON monta video dalle foto. Senza MP4 il reel resta
//     con una sola immagine di copertina e il video va prodotto a parte: promettere
//     "5 immagini per montare le slide" faceva chiedere materiale che nessuno usa
//     (il backend ne assegna comunque 1 sola).
//
// Il modulo governa anche la MARCATURA MANUALE (MediaTag): l'utente può dire
// "questa foto è del carosello, questo MP4 è del reel" e l'assegnazione in
// app/api/generate/plan/route.ts la rispetta come vincolo, non come consiglio.
//
// Modulo PURO: nessun accesso a DB/rete, nessun Math.random → a parità di
// input l'output è identico (calcolo riproducibile e testabile).
// ─────────────────────────────────────────────────────────────────────────

// Natura del file caricato. L'unico formato video accettato dall'upload è
// l'MP4 (vedi ALLOWED_VIDEO_MIME in app/api/assets/presign/route.ts).
export type MediaKind = 'immagine' | 'video'

// Marcatura manuale scelta dall'utente sul singolo media. 'auto' (o assente) =
// comportamento storico, decide l'AI. Gli altri valori sono VINCOLI: un media
// marcato non può finire su un formato di un altro gruppo.
export type MediaTag = 'auto' | 'carosello' | 'reel' | 'post'

// Fabbisogno per formato.
//  - `immagini`: quante IMMAGINI servono se non c'è un MP4 disponibile
//  - `video`   : quanti MP4 servono quando disponibili (0 = il formato non
//                accetta video: un MP4 su un post/carosello è un errore)
//  - `min`/`max`: numero totale di media accettabili per quel formato
export const MEDIA_PER_FORMATO: Record<string, { immagini: number; video: number; min?: number; max?: number }> = {
  // Statici: una sola immagine, mai un MP4.
  post: { immagini: 1, video: 0, min: 1, max: 1 },
  story: { immagini: 1, video: 0, min: 1, max: 1 },
  pin: { immagini: 1, video: 0, min: 1, max: 1 },
  articolo: { immagini: 1, video: 0, min: 0, max: 1 },
  // Carosello: 5 slide è il target, sotto 3 non è un carosello, sopra 10 non lo
  // accetta Instagram.
  carousel: { immagini: 5, video: 0, min: 3, max: 10 },
  carosello: { immagini: 5, video: 0, min: 3, max: 10 },
  // Video brevi: 1 MP4 se c'è. Senza MP4 resta 1 sola immagine di copertina:
  // il video va prodotto fuori dal sistema e caricato.
  reel: { immagini: 1, video: 1, min: 1, max: 1 },
  short: { immagini: 1, video: 1, min: 1, max: 1 },
  // Video singolo: 1 media (l'MP4; senza MP4 resta 1 immagine di copertura).
  video: { immagini: 1, video: 1, min: 1, max: 1 },
}

// Formato sconosciuto → trattato come post (1 immagine, niente video): è il
// caso peggiore più sicuro, non assegna mai un MP4 dove non deve stare.
const FALLBACK_FORMATO = MEDIA_PER_FORMATO.post

export function mediaPerFormato(formato: string): { immagini: number; video: number; min?: number; max?: number } {
  const key = String(formato || '').toLowerCase().trim()
  return MEDIA_PER_FORMATO[key] ?? FALLBACK_FORMATO
}

// Quota reel/short quando il mix non è noto: i pacchetti reali stanno a 4/16 e
// 6/24, cioè un quarto dei contenuti.
const QUOTA_REEL = 0.25
// Un carosello ogni N contenuti "post/carosello": il pacchetto vende la voce
// aggregata "post + caroselli", quindi il fabbisogno va stimato con un mix.
// Tenerlo esplicito rende il conto leggibile all'utente ("8 post + 4 caroselli").
const CAROSELLI_OGNI = 3
// Settimane medie in un mese: 52/12. Serve a passare dal fabbisogno mensile
// del pacchetto a quello di un piano settimanale.
const SETTIMANE_PER_MESE = 4.33

const VIDEO_EXT = new Set(['mp4'])

// Estensione del file, ignorando query string e frammento (gli URL firmati di
// Supabase Storage hanno sempre `?token=...` in coda).
function estensione(url: string): string {
  const path = String(url || '').split('?')[0].split('#')[0]
  const dot = path.lastIndexOf('.')
  return dot === -1 ? '' : path.slice(dot + 1).toLowerCase()
}

export function isVideoMedia(url: string): boolean {
  return VIDEO_EXT.has(estensione(url))
}

export function mediaKind(url: string): MediaKind {
  return isVideoMedia(url) ? 'video' : 'immagine'
}

// Marcatura dal body della richiesta: tollerante (maiuscole, spazi, sinonimi),
// e in caso di dubbio ripiega su 'auto' — mai su un vincolo inventato.
export function normalizeMediaTag(value: unknown): MediaTag {
  if (typeof value !== 'string') return 'auto'
  const v = value.trim().toLowerCase()
  if (v === 'carosello' || v === 'carousel') return 'carosello'
  if (v === 'reel' || v === 'short' || v === 'video') return 'reel'
  if (v === 'post' || v === 'story' || v === 'pin') return 'post'
  return 'auto'
}

type Requisiti = { immagini: number; video: number; dettaglio: string[] }

// I testi finiscono davanti all'utente: "1 caroselli" o "1 immagini marcate"
// fanno sembrare rotto il conteggio. Piccolo helper di accordo singolare/plurale.
function plur(n: number, uno: string, molti: string): string {
  return n === 1 ? uno : molti
}

// Riconcilia il mix con il totale: la quota del cliente (clienti.contenuti_mese)
// può divergere da quella del pacchetto, quindi post/caroselli e reel vanno
// riscalati sul totale davvero pagato invece di sommare a un numero diverso.
function normalizzaMix(contenuti: number, postCaroselli: number, reelBrevi: number): { post: number; reel: number } {
  const totale = Math.max(0, Math.round(contenuti || 0))
  let post = Math.max(0, Math.round(postCaroselli || 0))
  let reel = Math.max(0, Math.round(reelBrevi || 0))
  const somma = post + reel
  if (!totale) return { post, reel }               // nessun totale: il mix è già la verità
  if (!somma) {                                     // solo il totale: mix di default 75/25
    reel = Math.round(totale * QUOTA_REEL)
    post = totale - reel
    return { post, reel }
  }
  if (somma !== totale) {                           // riscala mantenendo le proporzioni
    reel = Math.min(totale, Math.round((reel / somma) * totale))
    post = totale - reel
  }
  return { post, reel }
}

// Fabbisogno di un piano: quante immagini e quanti MP4 servono davvero, con una
// riga di spiegazione per voce (è il testo che l'utente legge prima di caricare).
// `conVideo` = l'utente ha (o caricherà) gli MP4: se false i reel vengono
// conteggiati come 5 immagini ciascuno, perché vanno montati dalle foto.
export function requisitiMedia(input: {
  contenuti: number
  postCaroselli: number
  reelBrevi: number
  conVideo: boolean
}): Requisiti {
  const { post: postCaroselli, reel: reelBrevi } = normalizzaMix(input.contenuti, input.postCaroselli, input.reelBrevi)
  const caroselli = Math.floor(postCaroselli / CAROSELLI_OGNI)
  const postSingoli = postCaroselli - caroselli

  const perPost = MEDIA_PER_FORMATO.post.immagini
  const perCarosello = MEDIA_PER_FORMATO.carousel.immagini
  const perReelImmagini = MEDIA_PER_FORMATO.reel.immagini
  const perReelVideo = MEDIA_PER_FORMATO.reel.video

  const immaginiPost = postSingoli * perPost
  const immaginiCaroselli = caroselli * perCarosello
  const immaginiReel = input.conVideo ? 0 : reelBrevi * perReelImmagini
  const video = input.conVideo ? reelBrevi * perReelVideo : 0

  const immagini = immaginiPost + immaginiCaroselli + immaginiReel
  const dettaglio: string[] = []
  if (postSingoli > 0) {
    dettaglio.push(`${postSingoli} post/story/pin x ${perPost} immagine = ${immaginiPost} ${plur(immaginiPost, 'immagine', 'immagini')}`)
  }
  if (caroselli > 0) {
    dettaglio.push(
      `${caroselli} ${plur(caroselli, 'carosello', 'caroselli')} x ${perCarosello} immagini = ${immaginiCaroselli} immagini (minimo ${MEDIA_PER_FORMATO.carousel.min} e massimo ${MEDIA_PER_FORMATO.carousel.max} per carosello)`,
    )
  }
  if (reelBrevi > 0) {
    dettaglio.push(
      input.conVideo
        ? `${reelBrevi} reel/short x 1 MP4 = ${video} MP4 (senza MP4 restano con la sola immagine di copertina: il video va caricato)`
        : `${reelBrevi} reel/short x ${perReelImmagini} immagini = ${immaginiReel} immagini, oppure ${reelBrevi} MP4`,
    )
  }
  if (!dettaglio.length) {
    dettaglio.push('Nessun contenuto previsto: nessun media necessario.')
  } else {
    dettaglio.push(`Totale: ${immagini} immagini${video > 0 ? ` + ${video} MP4` : ''}`)
  }
  return { immagini, video, dettaglio }
}

// Fabbisogno del periodo a partire dal pacchetto acquistato (o dalla sola quota
// manuale del cliente, che l'admin può sovrascrivere su clienti.contenuti_mese).
// Il piano settimanale prende il mensile diviso 4.33, arrotondato per ECCESSO:
// meglio chiedere un media in più che far partire un piano a corto di materiale.
export function requisitiDaPacchetto(
  pkg: PackageSpec | null,
  quotaMensile: number | null,
  periodo: 'settimanale' | 'mensile',
): Requisiti {
  const mensile = quotaMensile && quotaMensile > 0 ? Math.round(quotaMensile) : (pkg?.contenutiMese ?? 0)
  if (!mensile) {
    return {
      immagini: 0,
      video: 0,
      dettaglio: ['Nessun pacchetto attivo e nessuna quota mensile impostata: fabbisogno non calcolabile.'],
    }
  }
  const divisore = periodo === 'settimanale' ? SETTIMANE_PER_MESE : 1
  const contenuti = Math.ceil(mensile / divisore)
  const postCaroselli = pkg ? Math.ceil(pkg.postCaroselli / divisore) : 0
  const reelBrevi = pkg ? Math.ceil(pkg.reelBrevi / divisore) : 0

  // conVideo = true: si ipotizza che i reel siano coperti da MP4 (lo scenario
  // "senza MP4" resta scritto nella riga di dettaglio del reel, così l'utente
  // vede subito quante immagini in più gli servirebbero).
  const req = requisitiMedia({ contenuti, postCaroselli, reelBrevi, conVideo: true })
  const intestazione = pkg
    ? `Pacchetto ${pkg.nome}: ${mensile} contenuti/mese → ${contenuti} contenuti in questo piano ${periodo}`
    : `Quota cliente: ${mensile} contenuti/mese → ${contenuti} contenuti in questo piano ${periodo}`
  return { ...req, dettaglio: [intestazione, ...req.dettaglio] }
}

// Confronto tra il materiale caricato e il fabbisogno: dice in italiano cosa
// manca (bloccante) e cosa non torna (avviso). Le immagini possono sostituire
// gli MP4 mancanti (5 per reel), quindi il video mancante viene sempre spiegato
// con la sua alternativa invece che come un muro.
export function verificaMedia(
  caricati: { url: string; tag?: MediaTag }[],
  req: { immagini: number; video: number },
): { ok: boolean; mancanti: string[]; avvisi: string[] } {
  const lista = Array.isArray(caricati) ? caricati.filter(m => m && typeof m.url === 'string' && m.url.trim()) : []
  const immagini = lista.filter(m => mediaKind(m.url) === 'immagine')
  const video = lista.filter(m => mediaKind(m.url) === 'video')
  const serveImmagini = Math.max(0, Math.round(req?.immagini || 0))
  const serveVideo = Math.max(0, Math.round(req?.video || 0))

  const mancanti: string[] = []
  const avvisi: string[] = []

  if (!lista.length) {
    mancanti.push(
      serveImmagini || serveVideo
        ? `Nessun media caricato: servono ${serveImmagini} immagini${serveVideo ? ` e ${serveVideo} MP4` : ''}.`
        : 'Nessun media caricato.',
    )
    return { ok: false, mancanti, avvisi }
  }

  if (immagini.length < serveImmagini) {
    const diff = serveImmagini - immagini.length
    mancanti.push(
      `${plur(diff, 'Manca', 'Mancano')} ${diff} ${plur(diff, 'immagine', 'immagini')}: ne servono ${serveImmagini}, ne hai caricate ${immagini.length}.`,
    )
  }
  if (video.length < serveVideo) {
    const diff = serveVideo - video.length
    mancanti.push(
      `${plur(diff, 'Manca', 'Mancano')} ${diff} MP4: ne servono ${serveVideo}, ne hai caricati ${video.length}. In alternativa carica ${diff * MEDIA_PER_FORMATO.reel.immagini} immagini in più: i reel scoperti verranno montati come slide.`,
    )
  }

  // Marcature incoerenti col tipo di file: non bloccano il piano ma vanno dette,
  // altrimenti l'utente non capisce perché quel media non compare da nessuna parte.
  const videoMarcatiStatici = video.filter(m => {
    const tag = normalizeMediaTag(m.tag)
    return tag === 'post' || tag === 'carosello'
  })
  if (videoMarcatiStatici.length) {
    const n = videoMarcatiStatici.length
    mancanti.push(
      `${n} MP4 ${plur(n, 'marcato', 'marcati')} per post/carosello non ${plur(n, 'verrà usato', 'verranno usati')}: un MP4 può andare solo su reel, short o video. Cambia marcatura o carica un'immagine al suo posto.`,
    )
  }
  const immaginiMarcateReel = immagini.filter(m => normalizeMediaTag(m.tag) === 'reel').length
  if (immaginiMarcateReel) {
    avvisi.push(
      `${immaginiMarcateReel} ${plur(immaginiMarcateReel, 'immagine marcata', 'immagini marcate')} "reel": ${plur(immaginiMarcateReel, 'verrà usata', 'verranno usate')} come slide (servono ${MEDIA_PER_FORMATO.reel.immagini} immagini per ogni reel senza MP4).`,
    )
  }
  const marcateCarosello = lista.filter(m => normalizeMediaTag(m.tag) === 'carosello').length
  const minCarosello = MEDIA_PER_FORMATO.carousel.min ?? 3
  if (marcateCarosello > 0 && marcateCarosello < minCarosello) {
    avvisi.push(`Solo ${marcateCarosello} media ${plur(marcateCarosello, 'marcato', 'marcati')} "carosello": un carosello ne richiede almeno ${minCarosello}.`)
  }
  if (!video.length && serveVideo > 0) {
    avvisi.push('Nessun MP4 caricato: i reel del piano verranno montati dalle immagini.')
  }
  const nonMarcati = lista.filter(m => normalizeMediaTag(m.tag) === 'auto').length
  if (nonMarcati > 0 && nonMarcati < lista.length) {
    avvisi.push(`${nonMarcati} media senza marcatura: ${plur(nonMarcati, 'verrà assegnato', 'verranno assegnati')} dall'AI al contenuto più adatto.`)
  }

  return { ok: mancanti.length === 0, mancanti, avvisi }
}
