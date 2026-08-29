import { packageContentCount, packageMixForPeriod, type PackageSpec } from '@/lib/packages'

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
//   • reel / short                       → 1 MP4 se c'è, ALTRIMENTI 5 immagini
//     Le immagini vengono assegnate come scene e trasformate in un MP4 prima
//     della pubblicazione tramite il template visuale Blotato.
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
export type MediaTag = 'auto' | 'carosello' | 'reel' | 'story' | 'post'

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
  // Video brevi: 1 MP4 se c'è; altrimenti fino a 5 immagini diventano scene.
  reel: { immagini: 5, video: 1, min: 1, max: 5 },
  short: { immagini: 5, video: 1, min: 1, max: 5 },
  video: { immagini: 5, video: 1, min: 1, max: 5 },
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
  if (v === 'story' || v === 'stories' || v === 'storia' || v === 'storie') return 'story'
  if (v === 'post' || v === 'pin') return 'post'
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
  stories?: number
  reelVideo?: number
  conVideo: boolean
}): Requisiti {
  const { post: postCaroselli, reel: reelBrevi } = normalizzaMix(input.contenuti, input.postCaroselli, input.reelBrevi)
  const caroselli = Math.floor(postCaroselli / CAROSELLI_OGNI)
  const postSingoli = postCaroselli - caroselli
  const stories = Math.min(reelBrevi, Math.max(0, Math.round(input.stories ?? 0)))
  const reelVideo = Math.min(reelBrevi - stories, Math.max(0, Math.round(input.reelVideo ?? (reelBrevi - stories))))

  const perPost = MEDIA_PER_FORMATO.post.immagini
  const perCarosello = MEDIA_PER_FORMATO.carousel.immagini
  const perReelImmagini = MEDIA_PER_FORMATO.reel.immagini
  const perReelVideo = MEDIA_PER_FORMATO.reel.video

  const immaginiPost = postSingoli * perPost
  const immaginiStory = stories * MEDIA_PER_FORMATO.story.immagini
  const immaginiCaroselli = caroselli * perCarosello
  const immaginiReel = input.conVideo ? 0 : reelVideo * perReelImmagini
  const video = input.conVideo ? reelVideo * perReelVideo : 0

  const immagini = immaginiPost + immaginiStory + immaginiCaroselli + immaginiReel
  const dettaglio: string[] = []
  if (postSingoli > 0) {
    dettaglio.push(`${postSingoli} post/pin x ${perPost} immagine = ${immaginiPost} ${plur(immaginiPost, 'immagine', 'immagini')}`)
  }
  if (stories > 0) {
    dettaglio.push(`${stories} ${plur(stories, 'Story', 'Story')} x 1 immagine 9:16 = ${immaginiStory} ${plur(immaginiStory, 'immagine', 'immagini')}`)
  }
  if (caroselli > 0) {
    dettaglio.push(
      `${caroselli} ${plur(caroselli, 'carosello', 'caroselli')} x ${perCarosello} immagini = ${immaginiCaroselli} immagini (minimo ${MEDIA_PER_FORMATO.carousel.min} e massimo ${MEDIA_PER_FORMATO.carousel.max} per carosello)`,
    )
  }
  if (reelVideo > 0) {
    dettaglio.push(
      input.conVideo
        ? `${reelVideo} reel/short x 1 MP4 = ${video} MP4 (in alternativa ${perReelImmagini} immagini per Reel, montate automaticamente)`
        : `${reelVideo} reel/short x ${perReelImmagini} immagini = ${immaginiReel} immagini, oppure ${reelVideo} MP4`,
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
/**
 * Fabbisogno media del pacchetto.
 *
 * `social` = su quanti canali viene adattato ogni concept. Il pacchetto conta i
 * CONCEPT (Crescita: 24 al mese), ma ogni concept diventa una pubblicazione per
 * social, ciascuna con i propri media: due social significano il doppio delle
 * foto. Senza questo fattore il pannello chiedeva 44 immagini quando ne
 * servivano 88, e chi seguiva l'indicazione caricava meta materiale.
 * Default 1 per non cambiare i chiamanti che non lo passano.
 */
export function requisitiDaPacchetto(
  pkg: PackageSpec | null,
  quotaMensile: number | null,
  periodo: 'settimanale' | 'mensile',
  social = 1,
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
  const contenuti = pkg ? packageContentCount(pkg, periodo, quotaMensile) : Math.ceil(mensile / divisore)
  const mix = pkg ? packageMixForPeriod(pkg, periodo, quotaMensile) : null
  const postCaroselli = mix?.postCaroselli ?? 0
  const reelBrevi = mix?.reelBrevi ?? 0

  // conVideo = true: si ipotizza che i reel siano coperti da MP4 (lo scenario
  // "senza MP4" resta scritto nella riga di dettaglio del reel, così l'utente
  // vede subito quante immagini in più gli servirebbero).
  const req = requisitiMedia({
    contenuti,
    postCaroselli,
    reelBrevi,
    stories: mix?.stories,
    reelVideo: mix?.reelVideo,
    conVideo: true,
  })
  const canali = Math.max(1, Math.round(social))
  const intestazione = pkg
    ? `Piano ${periodo} del pacchetto ${pkg.nome}: ${contenuti} contenuti${canali > 1 ? ` × ${canali} social = ${contenuti * canali} pubblicazioni` : ''}`
    : `Piano ${periodo}: ${contenuti} contenuti calcolati dalla quota cliente${canali > 1 ? ` × ${canali} social` : ''}`

  if (canali === 1) return { ...req, dettaglio: [intestazione, ...req.dettaglio] }

  // Ogni social ha i suoi media: il fabbisogno si moltiplica.
  return {
    ...req,
    immagini: req.immagini * canali,
    video: req.video * canali,
    dettaglio: [
      intestazione,
      `Ogni concept viene adattato su ${canali} social e ognuno richiede i propri media: fabbisogno moltiplicato per ${canali}.`,
      ...req.dettaglio,
    ],
  }
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
    const immaginiExtra = Math.max(0, immagini.length - serveImmagini)
    const reelCopertiDaFoto = Math.min(diff, Math.floor(immaginiExtra / MEDIA_PER_FORMATO.reel.immagini))
    const reelScoperti = diff - reelCopertiDaFoto
    if (reelScoperti > 0) {
      const coperturaFoto = reelCopertiDaFoto > 0
        ? ` ${reelCopertiDaFoto} Reel ${plur(reelCopertiDaFoto, 'è già coperto', 'sono già coperti')} dalle foto caricate.`
        : ''
      mancanti.push(
        `${plur(reelScoperti, 'Manca', 'Mancano')} ${reelScoperti} MP4 oppure ${reelScoperti * MEDIA_PER_FORMATO.reel.immagini} foto Reel 9:16.${coperturaFoto}`,
      )
    }
  }

  // Marcature incoerenti col tipo di file: non bloccano il piano ma vanno dette,
  // altrimenti l'utente non capisce perché quel media non compare da nessuna parte.
  const videoMarcatiStatici = video.filter(m => {
    const tag = normalizeMediaTag(m.tag)
    return tag === 'post' || tag === 'story' || tag === 'carosello'
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
  if (!video.length && serveVideo > 0 && immagini.length >= serveImmagini + serveVideo * MEDIA_PER_FORMATO.reel.immagini) {
    avvisi.push('Nessun MP4 caricato: i reel del piano verranno montati dalle immagini.')
  }
  const nonMarcati = lista.filter(m => normalizeMediaTag(m.tag) === 'auto').length
  if (nonMarcati > 0 && nonMarcati < lista.length) {
    avvisi.push(`${nonMarcati} media senza marcatura: ${plur(nonMarcati, 'verrà assegnato', 'verranno assegnati')} dall'AI al contenuto più adatto.`)
  }

  return { ok: mancanti.length === 0, mancanti, avvisi }
}
