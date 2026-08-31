import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import sharp from 'sharp';

const sourceDir = '/Users/md/Documents/SWA/CASO_STUDIO_BOWLING_MASTER_98';
// Usa tutti i master disponibili. La precedente lista fissa di 10 file faceva
// ricomparire le stesse scene ogni pochi contenuti, anche se nella cartella
// generata erano presenti altri master fotografici validi.
const sourceFiles = fs.readdirSync(sourceDir)
  .filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file))
  .sort((left, right) => left.localeCompare(right, 'en'));
if (sourceFiles.length < 5) {
  throw new Error(`Servono almeno 5 master fotografici, trovati ${sourceFiles.length} in ${sourceDir}`);
}
const logoPath = '/Users/md/SWA/Social-Media-/public/brand/swa-logo-official.png';
const audioSourceDir = '/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_Bowling/04_Sorgenti/audio';
const audioFiles = fs.readdirSync(audioSourceDir).filter((file) => file.endsWith('.mp3')).sort();
const outputRoot = '/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA';
const strategyRoot = path.join(outputRoot, '04_CRESCITA_Per_Strategia');
const leadMapPdfPath = '/Users/md/SWA/Social-Media-/output/pdf/Mappa-Regia-Bowling-SWA.pdf';

const reels = [
  { id: 1, folder: 'REEL_01_REGIA_NON_FOTO', hook: ['IL TUO BOWLING NON HA', 'UN PROBLEMA DI FOTO.'], cta: 'SEGUI IL CASO STUDIO', scenes: ['Hai già momenti che meritano attenzione.', 'Pubblicati a caso restano file isolati.', 'SWA assegna un ruolo a ogni contenuto.', 'Il risultato è una storia riconoscibile.'] },
  { id: 2, folder: 'REEL_02_SERATA_UN_MESE', hook: ['IL TUO BOWLING HA GIÀ LE STORIE.', 'SWA LE TRASFORMA IN UN PIANO.'], cta: 'SCRIVI BOWLING', scenes: ['Partiamo dai momenti reali.', 'Scegliamo gli angoli che interessano.', 'Diamo a ogni formato un obiettivo.', 'Costruiamo una sequenza che porta avanti.'] },
  { id: 3, folder: 'REEL_03_PUBBLICHI_QUANDO_CAPITA', hook: ['PUBBLICARE A CASO', 'COSTA PIÙ DI QUANTO PENSI.'], cta: 'CONTROLLA IL CALENDARIO', scenes: ['Ogni post parte da zero.', 'Il pubblico non riconosce una promessa.', 'I dati non spiegano cosa migliorare.', 'Una regia rende ogni uscita misurabile.'] },
  { id: 5, folder: 'REEL_05_COSTO_SENZA_DIREZIONE', hook: ['IL COSTO INVISIBILE', 'DI PUBBLICARE SENZA DIREZIONE.'], cta: 'MISURA PRIMA DI RIPETERE', scenes: ['Ogni uscita riparte da zero.', 'Il team consuma tempo senza una priorita.', 'Le offerte non ereditano fiducia.', 'La regia trasforma lo sforzo in apprendimento.'] },
  { id: 7, folder: 'REEL_07_PISTA_5_CONTENUTI', hook: ['UNA SOLA SERATA.', 'CINQUE ANGOLI EDITORIALI.'], cta: 'SCOPRI LA MAPPA SWA', scenes: ["Atmosfera: fa desiderare l'esperienza.", "Gesto: trattiene l'attenzione.", 'Persone: costruiscono fiducia.', 'Offerta: arriva dopo aver creato valore.'] },
  { id: 8, folder: 'REEL_08_CALENDARIO_INVISIBILE', hook: ['QUELLO CHE IL CLIENTE VEDE', 'PARTE DA CIÒ CHE NON VEDE.'], cta: 'SALVA IL PROCESSO', scenes: ["Brief: decidiamo l'obiettivo.", 'Produzione: creiamo asset coerenti.', "Approvazione: controlli prima dell'uscita.", 'Pubblicazione: ogni contenuto ha il suo posto.'] },
  { id: 13, folder: 'REEL_13_PRIMA_E_DOPO_ASSET', hook: ['PRIMA: FOTO ISOLATE.', 'DOPO: UNA CAMPAGNA RICONOSCIBILE.'], cta: 'VEDI LA TRASFORMAZIONE', scenes: ['Selezioniamo solo gli asset utili.', 'Costruiamo una promessa mensile.', 'Ordiniamo formati e messaggi.', 'Misuriamo cosa porta avanti il pubblico.'] },
  { id: 17, folder: 'REEL_17_HAI_GIA_FOTO', hook: ['HAI GIÀ LE FOTO?', 'ALLORA NON RIPARTIRE DA ZERO.'], cta: 'RICEVI LA MAPPA SWA', scenes: ['Facciamo audit del materiale.', 'Scartiamo ciò che non sostiene il messaggio.', 'Completiamo solo gli scatti mancanti.', 'Scrivi BOWLING per ricevere la regia.'] },
  { id: 19, folder: 'REEL_19_CHECKLIST_PUBBLICARE', hook: ['PRIMA DI PUBBLICARE', 'CONTROLLA QUESTE 4 COSE.'], cta: 'SALVA LA CHECKLIST', scenes: ['Un obiettivo verificabile.', 'Un pubblico preciso.', 'Un formato coerente.', 'Una CTA con destinazione reale.'] },
  { id: 22, folder: 'REEL_22_DAL_BRIEF_ALLA_PUBBLICAZIONE', hook: ['DAL BRIEF ALLA PUBBLICAZIONE.', 'ECCO DOVE LAVORA LA REGIA SWA.'], cta: 'VEDI IL FLUSSO COMPLETO', scenes: ['Il brief fissa una priorita commerciale.', 'La shot list traduce la priorita in scene.', 'Il controllo collega copy, asset e canale.', 'Il calendario consegna ogni uscita al suo momento.'] },
];

const stories = [
  { id: 10, folder: 'STORY_10_PUNTO_DIFFICILE', frames: [['QUAL È IL PUNTO PIÙ', 'DIFFICILE DEL TUO PIANO?', 'SCRIVI BOWLING'], ['MATERIALE, IDEE O COSTANZA?', 'IL PROBLEMA SI PUÒ MAPPARE.', 'RISPONDI IN DM'], ['NON SERVE PUBBLICARE DI PIÙ.', 'SERVE PUBBLICARE MEGLIO.', 'SCRIVI BOWLING']] },
  { id: 11, folder: 'STORY_11_DELEGA_PRODUZIONE', frames: [['QUALE CONTENUTO MANCA', 'OGGI AL TUO BOWLING?', 'RISPONDI IN DM'], ['HAI GIÀ FOTO?', 'TRASFORMIAMOLE IN UNA REGIA.', 'SCRIVI BOWLING'], ['UNA SERATA PUÒ GENERARE', 'PIÙ DI UN SOLO POST.', 'SCOPRI SWA']] },
  { id: 15, folder: 'STORY_15_PARTE_DA_DELEGARE', frames: [['QUALE PARTE VORRESTI', 'DELEGARE A SWA?', 'SCRIVI BOWLING'], ['BRIEF, PRODUZIONE O REPORT?', 'OGNI FASE HA UN RUOLO.', 'RISPONDI IN DM'], ['IL METODO PARTE', 'DAL TUO OBIETTIVO.', 'SCOPRI SWA']] },
  { id: 21, folder: 'STORY_21_PIANO_BOWLING', frames: [['VUOI VEDERE LA REGIA', 'DEL TUO BOWLING?', 'SCRIVI BOWLING'], ['5 DOMANDE.', 'UNA MAPPA PERSONALIZZATA.', 'RICEVI LA MAPPA SWA'], ['VEDI LA DIREZIONE.', 'POI DECIDI SE ATTIVARLA.', 'SCRIVI BOWLING IN DM']] },
];

const posts = [
  { id: 6, folder: 'POST_06_DOMANDA_PRIMA_DEL_CONTENUTO', lines: ['PRIMA DEL CONTENUTO', 'VIENE LA DOMANDA:', 'COSA DEVE OTTENERE?'], cta: 'SCOPRI LA REGIA SWA' },
  { id: 12, folder: 'POST_12_FOTO_CON_DECISIONE', lines: ['UNA FOTO FUNZIONA', 'QUANDO HA UN RUOLO', 'NEL PERCORSO.'], cta: 'SALVA IL PRINCIPIO' },
  { id: 18, folder: 'POST_18_CONTENUTO_E_SCELTA', lines: ['IL CONTENUTO NON È IL FILE.', 'È LA DECISIONE', 'CHE VIENE PRIMA.'], cta: 'SCOPRI IL METODO SWA' },
  { id: 24, folder: 'POST_24_PROSSIMO_MESE_CON_REGIA', lines: ['IL PROSSIMO MESE', 'NON DEVE RIPARTIRE DA ZERO.', 'DEVE PARTIRE DA UNA DIREZIONE.'], cta: 'SCRIVI BOWLING' },
];

const carousels = [
  {
    id: 4, folder: 'CAROSELLO_04_CINQUE_SEGNALI', slides: [
      ['5 SEGNALI CHE', 'IL TUO BOWLING', 'NON HA UN PIANO.'],
      ['PUBBLICHI', 'QUANDO CAPITA.', ''],
      ['OGNI CONTENUTO', 'PARLA A CASO.', ''],
      ['HAI FOTO BELLE,', 'MA NESSUN MESSAGGIO.', ''],
      ['NON ESISTE', 'UN CALENDARIO.', ''],
      ['NON LEGGI', 'COSA FUNZIONA.', ''],
      ['RICONOSCI ALMENO 2 SEGNALI?', 'SCRIVI BOWLING', 'RICEVI LA MAPPA REGIA.'],
    ],
  },
  {
    id: 9, folder: 'CAROSELLO_09_SERATA_UN_MESE', slides: [
      ['UNA SERATA.', 'PIÙ CONTENUTI.', ''], ['AMBIENTE', 'La pista apre la storia.', ''], ['GESTO', 'Il movimento crea attenzione.', ''], ['REAZIONE', 'Il gruppo rende tutto umano.', ''], ['METODO', 'SWA organizza il mese.', 'SCRIVI BOWLING'],
    ],
  },
  {
    id: 14, folder: 'CAROSELLO_14_FORMATO_OBIETTIVO', slides: [
      ['REEL, CAROSELLO', 'O POST?', "SCEGLI L'OBIETTIVO."], ['REEL', 'Scoperta e attenzione.', ''], ['CAROSELLO', 'Metodo e salvataggi.', ''], ['POST', 'Posizionamento e fiducia.', ''], ['SWA', 'Un sistema, non file isolati.', 'SCRIVI BOWLING'],
    ],
  },
  {
    id: 16, folder: 'CAROSELLO_16_GESTIONE_SOCIAL', slides: [
      ['COSA COMPRENDE', 'UNA GESTIONE', 'SOCIAL ORGANIZZATA?'], ['BRIEF', 'Partiamo dal tuo obiettivo.', ''], ['PRODUZIONE', 'Trasformiamo idee in asset.', ''], ['APPROVAZIONE', 'Tu controlli prima di pubblicare.', ''], ['PUBBLICAZIONE', 'SWA tiene insieme il processo.', 'SCOPRI SWA'],
    ],
  },
  {
    id: 20, folder: 'CAROSELLO_20_CHECKLIST_PUBBLICAZIONE', slides: [
      ['CHECKLIST PRIMA', 'DI PUBBLICARE', ''], ['OBIETTIVO', 'Deve essere chiaro.', ''], ['PUBBLICO', 'Deve essere definito.', ''], ['FORMATO', 'Deve essere coerente.', ''], ['CTA', 'Deve essere concreta.', 'SALVA LA CHECKLIST'],
    ],
  },
  {
    id: 23, folder: 'CAROSELLO_23_AUDIT_CALENDARIO', slides: [
      ['DAL PRIMO AUDIT', 'AL CALENDARIO.', ''], ['AUDIT', 'Cosa sta gia funzionando?', ''], ['STRATEGIA', 'Cosa deve cambiare?', ''], ['CALENDARIO', 'Cosa pubblichiamo e quando?', ''], ['SWA', 'Ricevi la Mappa Regia.', 'SCRIVI BOWLING'],
    ],
  },
];

const phaseFor = (id) => id <= 6 ? '01_ATTENZIONE' : id <= 12 ? '02_FIDUCIA' : id <= 18 ? '03_SCELTA' : '04_AZIONE';
const funnelStageFor = (id) => id <= 6 ? 'DIAGNOSI' : id <= 12 ? 'PROVA_METODO' : id <= 18 ? 'CONSIDERAZIONE' : 'CONVERSIONE';
const conversionActionFor = (id) => id <= 6
  ? 'Riconoscere il problema e salvare il contenuto'
  : id <= 12
    ? 'Interagire e comprendere il metodo SWA'
    : id <= 18
      ? 'Valutare il servizio e la sua regia'
      : 'Scrivere BOWLING in DM per ricevere la Mappa Regia e accedere alla call';
const leadFunnel = {
  keyword: 'BOWLING',
  promise: 'Mappa Regia Bowling SWA personalizzata',
  qualification_questions: ['Nome e citta', 'Profilo social o sito', 'Obiettivo prioritario', 'Servizio o evento da spingere', 'Materiale disponibile'],
  delivery: ['Diagnosi sintetica', 'Tre priorita editoriali', 'Percorso di conversione consigliato', 'Prossimo passo'],
  conversion_step: 'Call di regia e proposta del piano completo SWA',
};
// 24 uscite distribuite su 4 settimane: i giorni senza pubblicazione sono
// checkpoint di lettura, community e ottimizzazione, non buchi del piano.
const publicationDayFor = (id) => [
  1, 2, 3, 4, 5, 6,
  8, 9, 10, 11, 12, 13,
  15, 16, 17, 18, 19, 20,
  22, 23, 24, 25, 26, 27,
][id - 1];
const editorialMeta = {
  1: { intent: 'Far riconoscere il problema di regia', visualRole: 'diagnosi', visualBrief: 'Gestore del bowling davanti a foto e calendario disordinati; tensione controllata, nessun sorriso in posa.' },
  2: { intent: 'Rendere desiderabile una trasformazione editoriale', visualRole: 'open-loop', visualBrief: 'Momenti reali della serata collegati a una mappa editoriale; telefono, pista e persone in azione.' },
  3: { intent: 'Mostrare il costo dell’improvvisazione', visualRole: 'contrasto', visualBrief: 'Calendario frammentato contrapposto a una sequenza ordinata, senza interfacce inventate o dati falsi.' },
  4: { intent: 'Autodiagnosi salvabile', visualRole: 'checklist', visualBrief: 'Cinque scene diverse di comunicazione incoerente, una per segnale; cover pulita e CTA conclusiva.' },
  5: { intent: 'Quantificare il costo operativo dell’improvvisazione', visualRole: 'costo-invisibile', visualBrief: 'Quattro scene distinte mostrano ripartenza da zero, tempo disperso, offerta senza fiducia e apprendimento strutturato.' },
  6: { intent: 'Insegnare il principio obiettivo-prima-del-formato', visualRole: 'tesi', visualBrief: 'Direttore creativo SWA che definisce un obiettivo prima di scegliere il contenuto.' },
  7: { intent: 'Dimostrare la moltiplicazione degli angoli', visualRole: 'metodo', visualBrief: 'Quattro momenti unici della stessa serata: atmosfera, gesto, persone e proposta commerciale.' },
  8: { intent: 'Far percepire il processo agenzia', visualRole: 'backstage', visualBrief: 'Brief, produzione, approvazione e pubblicazione rappresentati da scene di lavoro reali e diverse.' },
  9: { intent: 'Spiegare come un evento alimenta il mese', visualRole: 'mappa', visualBrief: 'Cinque angoli editoriali coerenti ma fotograficamente distinti, collegati da una progressione.' },
  10: { intent: 'Aprire una conversazione sul blocco principale', visualRole: 'domanda', visualBrief: 'Tre frame: dubbio del gestore, mappa del problema, primo passo concreto.' },
  11: { intent: 'Far emergere il bisogno di delega', visualRole: 'scelta', visualBrief: 'Tre frame con carico operativo, selezione degli asset e regia SWA.' },
  12: { intent: 'Consolidare il valore strategico delle immagini', visualRole: 'principio', visualBrief: 'Singolo scatto premium con soggetto e gesto leggibili; testo ridotto e fotografia dominante.' },
  13: { intent: 'Mostrare il prima/dopo del servizio', visualRole: 'trasformazione', visualBrief: 'Asset isolati che diventano campagna; continuità di soggetto e luce tra prima, processo e risultato.' },
  14: { intent: 'Collegare formato e obiettivo', visualRole: 'educazione', visualBrief: 'Reel, carosello e post mostrati tramite risultati e comportamenti, non finte schermate social.' },
  15: { intent: 'Identificare la fase da delegare', visualRole: 'qualifica', visualBrief: 'Tre frame con brief, produzione/report e risposta SWA, senza sticker non supportati.' },
  16: { intent: 'Rendere concreta la gestione SWA', visualRole: 'servizio', visualBrief: 'Cinque passaggi del servizio, ciascuno in ambiente e gesto distinto ma con art direction coerente.' },
  17: { intent: 'Sciogliere l’obiezione “ho già le foto”', visualRole: 'obiezione', visualBrief: 'Archivio esistente, selezione, integrazione degli scatti mancanti e calendario finale.' },
  18: { intent: 'Posizionare SWA come regia, non produzione file', visualRole: 'posizionamento', visualBrief: 'Strategist davanti a storyboard fisico, fotografia protagonista e gerarchia editoriale sobria.' },
  19: { intent: 'Fornire un controllo operativo salvabile', visualRole: 'checklist', visualBrief: 'Obiettivo, pubblico, formato e CTA mostrati con quattro scene reali e raccordate.' },
  20: { intent: 'Trasformare la checklist in strumento', visualRole: 'strumento', visualBrief: 'Cinque slide essenziali, una verifica per slide, visual differenti e recap finale.' },
  21: { intent: 'Far desiderare il piano personalizzato', visualRole: 'anteprima', visualBrief: 'Tre frame: audit, calendario e beneficio per il team; chiusura con DM reale.' },
  22: { intent: 'Rendere visibile il flusso operativo SWA', visualRole: 'workflow', visualBrief: 'Brief, shot list, controllo e calendario come sequenza cinematografica continua con passaggi verificabili.' },
  23: { intent: 'Mostrare il percorso di ingresso', visualRole: 'processo', visualBrief: 'Dal primo audit al calendario con prove di lavoro, niente dashboard finte o risultati inventati.' },
  24: { intent: 'Convertire il caso studio in richiesta qualificata', visualRole: 'prossimo-passo', visualBrief: 'Gestore sereno davanti alla direzione del mese successivo, bowling vivo sullo sfondo e CTA BOWLING pulita.' },
};
const sourceAt = (index) => {
  if (!sourceFiles[index]) throw new Error(`Master visuale ${index + 1} mancante.`);
  return path.join(sourceDir, sourceFiles[index]);
};
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const logo = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

function svgOverlay({ width, height, label, lines, cta, scene = false, variant = 0 }) {
  const scale = width / 1080;
  const vertical = height / width > 1.5;
  const topHeight = height * 0.42;
  const baseFont = scene ? 38 : (width === 1080 ? 58 : 52);
  const longestLine = Math.max(...lines.map((line) => String(line).length), 1);
  const fittedFont = (width / scale - 170) / (longestLine * 0.62);
  const font = Math.min(baseFont, Math.max(scene ? 28 : 38, fittedFont)) * scale;
  const logoW = 132 * scale;
  const logoH = 60 * scale;
  // Nei formati 9:16 lasciamo libera l'area superiore usata dall'handle del
  // social e quella inferiore occupata da caption e controlli nativi.
  const lineY = vertical ? 520 * scale : scene ? 300 * scale : 285 * scale;
  const lineGap = Math.max(scene ? 50 : 62, (font / scale) * 1.28) * scale;
  const text = lines.map((line, index) => `<text x="${58 * scale}" y="${lineY + index * lineGap}" fill="#fffaf0" font-family="Arial, sans-serif" font-size="${font}" font-weight="800">${esc(line)}</text>`).join('');
  const ctaWidth = Math.min(width * 0.58, 570 * scale);
  const ctaY = vertical ? height - 430 * scale : height - 225 * scale;
  const style = Number(variant) % 5;
  const hookAccent = [
    `<rect x="${58 * scale}" y="${(vertical ? 435 : 170) * scale}" width="${70 * scale}" height="${5 * scale}" fill="#a8532d"/>`,
    `<rect x="${42 * scale}" y="${lineY - 48 * scale}" width="${7 * scale}" height="${Math.max(76, lines.length * lineGap) * scale}" fill="#d6a839"/>`,
    `<path d="M ${58 * scale} ${(vertical ? 442 : 177) * scale} H ${178 * scale}" stroke="#d6a839" stroke-width="${3 * scale}"/><circle cx="${190 * scale}" cy="${(vertical ? 442 : 177) * scale}" r="${5 * scale}" fill="#a8532d"/>`,
    `<rect x="${58 * scale}" y="${lineY - 58 * scale}" width="${Math.min(width * 0.72, 730 * scale)}" height="${Math.max(94, lines.length * lineGap + 26) * scale}" fill="#10120e" fill-opacity="0.50"/><rect x="${58 * scale}" y="${lineY - 58 * scale}" width="${7 * scale}" height="${Math.max(94, lines.length * lineGap + 26) * scale}" fill="#a8532d"/>`,
    `<path d="M ${58 * scale} ${(vertical ? 440 : 175) * scale} H ${112 * scale} M ${124 * scale} ${(vertical ? 440 : 175) * scale} H ${214 * scale}" stroke="#d6a839" stroke-width="${5 * scale}"/>`,
  ][style];
  const ctaMarkup = cta ? [
    `<rect x="${58 * scale}" y="${ctaY}" width="${ctaWidth}" height="${60 * scale}" fill="#d6a839"/><text x="${80 * scale}" y="${ctaY + 39 * scale}" fill="#10120e" font-family="Arial, sans-serif" font-size="${22 * scale}" font-weight="800">${esc(cta)}</text>`,
    `<rect x="${58 * scale}" y="${ctaY}" width="${ctaWidth}" height="${60 * scale}" rx="${30 * scale}" fill="#10120e" fill-opacity="0.62" stroke="#fffaf0" stroke-width="${2 * scale}"/><text x="${84 * scale}" y="${ctaY + 39 * scale}" fill="#fffaf0" font-family="Arial, sans-serif" font-size="${22 * scale}" font-weight="800">${esc(cta)}</text><path d="M ${ctaWidth + 22 * scale} ${ctaY + 23 * scale} l ${12 * scale} ${7 * scale} l -${12 * scale} ${7 * scale}" fill="none" stroke="#d6a839" stroke-width="${3 * scale}"/>`,
    `<rect x="${58 * scale}" y="${ctaY}" width="${6 * scale}" height="${60 * scale}" fill="#a8532d"/><text x="${84 * scale}" y="${ctaY + 39 * scale}" fill="#fffaf0" font-family="Arial, sans-serif" font-size="${22 * scale}" font-weight="800">${esc(cta)}</text>`,
    `<path d="M ${58 * scale} ${ctaY} H ${ctaWidth + 58 * scale}" stroke="#d6a839" stroke-width="${3 * scale}"/><text x="${58 * scale}" y="${ctaY + 43 * scale}" fill="#fffaf0" font-family="Arial, sans-serif" font-size="${22 * scale}" font-weight="800">${esc(cta)}</text><circle cx="${ctaWidth + 42 * scale}" cy="${ctaY + 34 * scale}" r="${13 * scale}" fill="none" stroke="#d6a839" stroke-width="${2 * scale}"/><path d="M ${ctaWidth + 36 * scale} ${ctaY + 34 * scale} h ${12 * scale} m -${5 * scale} -${5 * scale} l ${5 * scale} ${5 * scale} l -${5 * scale} ${5 * scale}" fill="none" stroke="#d6a839" stroke-width="${2 * scale}"/>`,
    `<path d="M ${58 * scale} ${ctaY + 9 * scale} V ${ctaY} H ${ctaWidth + 58 * scale} V ${ctaY + 9 * scale} M ${58 * scale} ${ctaY + 51 * scale} V ${ctaY + 60 * scale} H ${ctaWidth + 58 * scale} V ${ctaY + 51 * scale}" fill="none" stroke="#d6a839" stroke-width="${2 * scale}"/><text x="${80 * scale}" y="${ctaY + 39 * scale}" fill="#fffaf0" font-family="Arial, sans-serif" font-size="${22 * scale}" font-weight="800">${esc(cta)}</text>`,
  ][style] : '';
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10120e" stop-opacity="0.92"/><stop offset="1" stop-color="#10120e" stop-opacity="0.08"/></linearGradient><linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10120e" stop-opacity="0"/><stop offset="1" stop-color="#10120e" stop-opacity="0.84"/></linearGradient></defs>
    <rect width="${width}" height="${topHeight}" fill="url(#top)"/><rect y="${height * 0.70}" width="${width}" height="${height * 0.30}" fill="url(#bottom)"/>
    <image href="${logo}" x="${58 * scale}" y="${(vertical ? 300 : 45) * scale}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${58 * scale}" y="${(vertical ? 405 : 145) * scale}" fill="#d6a839" font-family="Arial, sans-serif" font-size="${24 * scale}" font-weight="700" letter-spacing="${3 * scale}">${esc(label)}</text>
    ${hookAccent}
    ${text}
    ${ctaMarkup}
    <text x="${58 * scale}" y="${vertical ? height - 315 * scale : height - 65 * scale}" fill="#fffaf0" fill-opacity="0.92" font-family="Arial, sans-serif" font-size="${20 * scale}" font-weight="700" letter-spacing="${2 * scale}">@SOCIALWEBAUTOMATION</text>
  </svg>`);
}

async function render(input, output, width, height, overlay) {
  await sharp(input)
    .resize(width, height, { fit: 'cover', position: 'centre' })
    .composite([{ input: overlay }])
    .flatten({ background: '#10120e' })
    .png({ compressionLevel: 9, adaptiveFiltering: true, palette: true, quality: 95, effort: 10, dither: 0.8 })
    .toFile(output);
}

async function writeText(file, content) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await fs.promises.writeFile(file, content, 'utf8');
}

async function copy(file, destination) {
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.copyFile(file, destination);
}

async function createGridPreview(records, { square = false } = {}) {
  const columns = 3;
  const tileWidth = 324;
  const tileHeight = square ? 324 : 405;
  const gap = 10;
  const margin = 18;
  const rows = Math.ceil(records.length / columns);
  const width = margin * 2 + columns * tileWidth + (columns - 1) * gap;
  const height = margin * 2 + rows * tileHeight + (rows - 1) * gap;
  const composites = [];

  for (const [index, item] of records.entries()) {
    const folder = path.join(strategyRoot, 'Instagram', phaseFor(item.id), item.folder);
    const imageName = fs.readdirSync(folder).filter((file) => file.endsWith('.png')).sort()[0];
    if (!imageName) throw new Error(`Cover Instagram mancante per ${item.folder}`);
    const input = await sharp(path.join(folder, imageName))
      .resize(tileWidth, tileHeight, { fit: 'cover', position: 'centre' })
      .png({ compressionLevel: 9, palette: true, quality: 95 })
      .toBuffer();
    composites.push({
      input,
      left: margin + (index % columns) * (tileWidth + gap),
      top: margin + Math.floor(index / columns) * (tileHeight + gap),
    });
  }

  const suffix = square ? '1X1' : '3X4';
  const destination = path.join(outputRoot, '03_Anteprime', `ANTEPRIMA_GRIGLIA_INSTAGRAM_${suffix}.png`);
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await sharp({ create: { width, height, channels: 3, background: '#10120e' } })
    .composite(composites)
    .png({ compressionLevel: 9, palette: true, quality: 95 })
    .toFile(destination);
}

const platforms = ['Instagram', 'Facebook'];
const manifestContents = [];
const contentRecords = [
  ...reels.map((item) => ({ ...item, ...editorialMeta[item.id], format: 'Reel', formatDir: 'Reel_1080x1920', assets: 5, dimensions: [1080, 1920] })),
  ...stories.map((item) => ({ ...item, ...editorialMeta[item.id], format: 'Story', formatDir: 'Stories_1080x1920', assets: 3, dimensions: [1080, 1920] })),
  ...posts.map((item) => ({ ...item, ...editorialMeta[item.id], format: 'Post', formatDir: 'Post_1080x1350', assets: 1, dimensions: [1080, 1350] })),
  ...carousels.map((item) => ({ ...item, ...editorialMeta[item.id], format: 'Carosello', formatDir: 'Caroselli_1080x1350', assets: item.slides.length, dimensions: [1080, 1350] })),
].sort((a, b) => a.id - b.id);

if (contentRecords.length !== 24 || contentRecords.some((item) => !item.intent || !item.visualBrief)) {
  throw new Error('Il piano editoriale deve contenere 24 contenuti completi di obiettivo e brief visuale.');
}
const narrativeErrors = contentRecords.flatMap((item) => {
  if (item.format === 'Reel' && (!Array.isArray(item.hook) || item.hook.length !== 2 || item.scenes?.length !== 4)) return [`${item.folder}: servono cover/hook + 4 scene`];
  if (item.format === 'Story' && item.frames?.length !== 3) return [`${item.folder}: servono 3 frame`];
  if (item.format === 'Carosello' && (item.slides?.length < 5 || item.slides?.length > 10)) return [`${item.folder}: servono 5-10 slide`];
  if (item.format === 'Post' && (!Array.isArray(item.lines) || item.lines.length < 2 || !item.cta)) return [`${item.folder}: hook visuale o CTA incompleti`];
  return [];
});
if (narrativeErrors.length) throw new Error(`QA NARRATIVO bloccato: ${narrativeErrors.join('; ')}`);
if (new Set(contentRecords.map((item) => item.intent.toLowerCase())).size !== contentRecords.length) {
  throw new Error('QA STRATEGIA bloccato: due contenuti hanno la stessa funzione editoriale.');
}

const editorialPlan = contentRecords.map((item) => ({
  order: item.id,
  day: publicationDayFor(item.id),
  week: Math.ceil(item.id / 6),
  phase: phaseFor(item.id).replace(/^\d+_/, ''),
  format: item.format,
  content_id: item.folder,
  intent: item.intent,
  visual_role: item.visualRole,
  visual_brief: item.visualBrief,
  funnel_stage: funnelStageFor(item.id),
  conversion_action: conversionActionFor(item.id),
  narrative_roles: item.format === 'Reel'
    ? ['HOOK', 'TENSIONE', 'PROVA', 'PAYOFF', 'CTA_LOOP']
    : item.format === 'Story'
      ? ['APERTURA', 'SVILUPPO', 'RISOLUZIONE_CTA']
      : item.format === 'Carosello'
        ? ['COVER', 'PROBLEMA', 'SVILUPPO_PROVA', 'PAYOFF', 'CTA']
        : ['HOOK_VISIVO', 'CONTESTO_PROVA_CAPTION', 'TAKEAWAY', 'CTA'],
}));
const editorialPlanTable = editorialPlan
  .map((item) => `| ${item.order} | ${item.day} | ${item.phase} | ${item.format} | ${item.intent} | ${item.visual_role} |`)
  .join('\n');
async function writeEditorialPlanArtifacts() {
  await writeText(path.join(outputRoot, '00_Strategia', 'PIANO-EDITORIALE.md'), `# Piano editoriale - Caso Studio Bowling\n\nObiettivo commerciale: generare lead qualificati tra i gestori di bowling mostrando come SWA trasforma materiale reale in una comunicazione pianificata, riconoscibile e misurabile.\n\n| # | Giorno | Fase | Formato | Funzione | Ruolo visuale |\n|---:|---:|---|---|---|---|\n${editorialPlanTable}\n\n## Regia del mese\n\n1. ATTENZIONE: il gestore riconosce il costo della comunicazione improvvisata.\n2. FIDUCIA: SWA dimostra come estrae angoli, ordina asset e governa il calendario.\n3. SCELTA: il servizio diventa concreto, confrontabile e risolve le obiezioni.\n4. AZIONE: DM con keyword BOWLING, qualificazione, Mappa Regia e call commerciale.\n`);
  await writeText(path.join(outputRoot, '00_Strategia', 'PIANO-EDITORIALE.json'), `${JSON.stringify(editorialPlan, null, 2)}\n`);
}
// Nel build completo il piano si scrive DOPO il `rm -rf outputRoot`: scriverlo
// qui significherebbe cancellarlo subito dopo, e un errore fra le due fasi
// lascerebbe la cartella strategia vuota.
if (process.argv.includes('--plan-only')) {
  await writeEditorialPlanArtifacts();
  console.log(`Updated editorial plan at ${path.join(outputRoot, '00_Strategia')}`);
  process.exit(0);
}

const assetOffsetByContent = new Map();
let requiredVisualMasters = 0;
for (const item of contentRecords) {
  assetOffsetByContent.set(item.id, requiredVisualMasters);
  requiredVisualMasters += item.assets;
}
if (sourceFiles.length !== requiredVisualMasters) {
  throw new Error(`QA VISUAL bloccato: il piano richiede esattamente ${requiredVisualMasters} immagini sorgente uniche, ma ne esistono ${sourceFiles.length}. Correggi la cartella master prima del rendering: il builder non ricicla fotografie e non importa residui.`);
}
const visualSignatures = await Promise.all(sourceFiles.slice(0, requiredVisualMasters).map(async (file) => {
  const pixels = await sharp(path.join(sourceDir, file)).resize(16, 16, { fit: 'fill' }).grayscale().raw().toBuffer();
  return createHash('sha256').update(pixels).digest('hex');
}));
if (new Set(visualSignatures).size !== visualSignatures.length) {
  throw new Error('QA VISUAL bloccato: sono presenti immagini sorgente duplicate. Sostituiscile prima del rendering.');
}

await fs.promises.rm(outputRoot, { recursive: true, force: true });
await fs.promises.mkdir(strategyRoot, { recursive: true });
for (const platform of platforms) {
  for (const phase of ['01_ATTENZIONE', '02_FIDUCIA', '03_SCELTA', '04_AZIONE']) {
    await fs.promises.mkdir(path.join(strategyRoot, platform, phase), { recursive: true });
  }
}
await fs.promises.mkdir(path.join(outputRoot, '00_Strategia'), { recursive: true });
await fs.promises.mkdir(path.join(outputRoot, '04_Sorgenti', 'audio'), { recursive: true });
await writeEditorialPlanArtifacts();
if (!fs.existsSync(leadMapPdfPath)) throw new Error(`Mappa Regia PDF mancante: ${leadMapPdfPath}`);
await copy(leadMapPdfPath, path.join(outputRoot, '00_Strategia', 'MAPPA-REGIA-BOWLING-SWA.pdf'));
for (const file of sourceFiles.slice(0, requiredVisualMasters)) await copy(path.join(sourceDir, file), path.join(outputRoot, '04_Sorgenti', 'PHOTO_MASTER', file));
await copy(logoPath, path.join(outputRoot, '04_Sorgenti', 'SWA_LOGO_UFFICIALE.png'));
for (const file of audioFiles) {
  await copy(path.join(audioSourceDir, file), path.join(outputRoot, '04_Sorgenti', 'audio', file));
}

for (const [index, item] of contentRecords.entries()) {
  const phase = phaseFor(item.id);
  for (const platform of platforms) {
    const folder = path.join(strategyRoot, platform, phase, item.folder);
    await fs.promises.mkdir(folder, { recursive: true });
    // La stessa creatività coordinata può essere adattata a Instagram/Facebook,
    // ma due scene o slide della campagna non condividono mai lo stesso master.
    const sourceIndex = assetOffsetByContent.get(item.id);
    const audio = audioFiles[index % audioFiles.length];
    if (item.format === 'Reel') {
      await render(sourceAt(sourceIndex), path.join(folder, `REEL_${String(item.id).padStart(2, '0')}_COVER.png`), 1080, 1920, svgOverlay({ width: 1080, height: 1920, label: 'CASO STUDIO BOWLING', lines: item.hook, cta: item.cta, variant: item.id }));
      for (let scene = 0; scene < 4; scene += 1) {
        await render(sourceAt(sourceIndex + scene + 1), path.join(folder, `REEL_${String(item.id).padStart(2, '0')}_SCENA_0${scene + 1}.png`), 1080, 1920, svgOverlay({ width: 1080, height: 1920, label: 'CASO STUDIO BOWLING', lines: [item.scenes[scene] || item.cta], cta: scene === 3 ? item.cta : '', scene: true, variant: item.id }));
      }
      await copy(path.join(audioSourceDir, audio), path.join(folder, `AUDIO_REEL_${String(item.id).padStart(2, '0')}_${path.basename(audio, '.mp3').toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_')}.mp3`));
      await writeText(path.join(outputRoot, '05_Script_Reel', item.folder, 'SCRIPT.md'), `# ${item.folder}\n\nHook: ${item.hook.join(' ')}\n\nScene: ${item.scenes.join(' | ')}\n\nCTA: ${item.cta}\n\nFormato: Reel 1080x1920.\n`);
    } else if (item.format === 'Story') {
      for (const [frameIndex, frame] of item.frames.entries()) await render(sourceAt(sourceIndex + frameIndex), path.join(folder, `STORY_${String(item.id).padStart(2, '0')}_FRAME_0${frameIndex + 1}.png`), 1080, 1920, svgOverlay({ width: 1080, height: 1920, label: 'CASO STUDIO BOWLING', lines: frame.slice(0, 2), cta: frame[2], variant: item.id }));
      await copy(path.join(audioSourceDir, audio), path.join(folder, `AUDIO_STORY_${String(item.id).padStart(2, '0')}_${path.basename(audio, '.mp3').toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_')}.mp3`));
    } else if (item.format === 'Post') {
      await render(sourceAt(sourceIndex), path.join(folder, `POST_${String(item.id).padStart(2, '0')}.png`), 1080, 1350, svgOverlay({ width: 1080, height: 1350, label: 'CASO STUDIO BOWLING', lines: item.lines, cta: item.cta, variant: item.id }));
    } else {
      for (const [slideIndex, slide] of item.slides.entries()) {
        const isLastSlide = slideIndex === item.slides.length - 1;
        await render(sourceAt(sourceIndex + slideIndex), path.join(folder, `CAROSELLO_${String(item.id).padStart(2, '0')}_SLIDE_${String(slideIndex + 1).padStart(2, '0')}.png`), 1080, 1350, svgOverlay({ width: 1080, height: 1350, label: 'CASO STUDIO BOWLING', lines: isLastSlide ? slide.slice(0, 2) : slide.slice(0, 3), cta: isLastSlide ? slide[2] : '', variant: item.id }));
      }
    }
  }
  manifestContents.push({ order: item.id, id: item.folder, format: item.format, format_dir: item.formatDir, folder: item.folder, phase: phase.replace(/^\d+_/, ''), week: Math.ceil(item.id / 6), day: publicationDayFor(item.id), assets: item.assets, dimensions: item.dimensions, intent: item.intent, visual_role: item.visualRole, visual_brief: item.visualBrief, funnel_stage: funnelStageFor(item.id), conversion_action: conversionActionFor(item.id) });
  await writeText(path.join(outputRoot, '06_Copy', item.folder, 'COPY.md'), `# ${item.folder}\n\nFormato: ${item.format}\nFase: ${phase}\nObiettivo: ${item.intent}\nRuolo visuale: ${item.visualRole}\nBrief visuale: ${item.visualBrief}\nFunnel: ${funnelStageFor(item.id)}\nAzione attesa: ${conversionActionFor(item.id)}\n\nContenuto creato per la strategia SWA Caso Studio Bowling.\n`);
}

await createGridPreview(contentRecords);
await createGridPreview(contentRecords, { square: true });

const manifest = {
  schema_version: 2,
  campaign_id: 'swa-crescita-caso-studio-bowling-m04-v2',
  brand: 'Social Web Automation',
  month: 'Mese 04',
  niche: 'Bowling',
  strategy: 'Caso Studio Bowling',
  package: 'crescita',
  platforms,
  import_root: '04_CRESCITA_Per_Strategia',
  platform_dirs: { Instagram: 'Instagram', Facebook: 'Facebook' },
  phases: ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'],
  contents: manifestContents.sort((a, b) => a.order - b.order),
  expected_contents: 24,
  expected_assets_per_platform: manifestContents.reduce((sum, item) => sum + item.assets, 0),
  month_days: 30,
  optimization_days: [7, 14, 21, 28, 29, 30],
  rules: { logo_on_every_final: true, visible_slide_numbers: false, profile_crop: '3:4', reel_safe_area_y: [320, 1450], story_safe_area_y: [320, 1450], no_fake_interactions: true, narrative_gate: true, unique_visual_per_asset: true },
  lead_funnel: leadFunnel,
  editorial_plan: editorialPlan,
  grid_preview: '03_Anteprime/ANTEPRIMA_GRIGLIA_INSTAGRAM_3X4.png',
};
await writeText(path.join(outputRoot, 'campaign_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'STRATEGIA-MESE.md'), `# Caso Studio Bowling - Crescita SWA\n\nObiettivo: far conoscere SWA a titolari e gestori di bowling usando il bowling come caso studio.\n\nMix: 10 Reel, 6 caroselli, 4 Story, 4 post. Totale: 24 contenuti.\n\nFasi: ATTENZIONE (giorni 1-6), FIDUCIA (8-13), SCELTA (15-20), AZIONE (22-27).\n\nGiorni 7, 14, 21, 28: checkpoint editoriali per leggere salvataggi, condivisioni, completamenti e DM. Giorni 29-30: ottimizzazione e brief del ciclo successivo.\n\nLa sequenza non è una ripetizione di 24 file: ogni settimana cambia la domanda, il formato e l'angolo. I Reel fanno scoprire SWA; caroselli e post spiegano il metodo; le Story aprono la conversazione.\n\nCTA principale: Scrivi BOWLING per ricevere la Mappa Regia Bowling SWA e accedere alla call di regia.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'LINEA-EDITORIALE.md'), `# Linea editoriale\n\n## Tesi\n\nUn bowling non ha bisogno di pubblicare piu file: ha bisogno di una regia che trasformi momenti reali, offerta e persone in un percorso riconoscibile.\n\n## Pubblico\n\nTitolari e gestori di bowling che possiedono materiale foto/video ma non un sistema continuativo per selezionarlo, produrlo, approvarlo, pubblicarlo e misurarlo.\n\n## Promessa\n\nSWA organizza il materiale esistente, completa cio che manca e costruisce un mese di contenuti con un ruolo preciso per ogni formato.\n\n## Voce\n\nCompetente, concreta, premium e leggibile. Niente promesse di viralita, interazioni simulate o risultati inventati.\n\n## Conversione\n\nI contenuti accompagnano da diagnosi a fiducia, poi alla richiesta della Mappa Regia tramite la keyword BOWLING e alla call commerciale.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'GRID-BLUEPRINT.md'), `# Grid blueprint Instagram\n\nOrdine reale di pubblicazione, da sinistra a destra e dall'alto in basso. Ogni cover usa un master distinto; il visual role evita sequenze monotone.\n\n| # | Giorno | Contenuto | Formato | Ruolo visuale |\n|---:|---:|---|---|---|\n${editorialPlan.map((item) => `| ${item.order} | ${item.day} | ${item.content_id} | ${item.format} | ${item.visual_role} |`).join('\n')}\n\nAnteprime: 03_Anteprime/ANTEPRIMA_GRIGLIA_INSTAGRAM_3X4.png e 03_Anteprime/ANTEPRIMA_GRIGLIA_INSTAGRAM_1X1.png.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'SOCIAL-CALENDAR.md'), `# Social calendar - 30 giorni\n\n| # | Giorno | Fase | Formato | Funzione | Azione attesa |\n|---:|---:|---|---|---|---|\n${editorialPlan.map((item) => `| ${item.order} | ${item.day} | ${item.phase} | ${item.format} | ${item.intent} | ${item.conversion_action} |`).join('\n')}\n\nGiorni 7, 14, 21 e 28: lettura dati e community. Giorni 29-30: ottimizzazione e brief del ciclo successivo.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'TREND-REFRESH-2026-08-31.md'), `# Trend refresh - 2026-08-31\n\nControllo eseguito prima della consegna.\n\n- Reel e Story: creativita verticali 9:16, audio e messaggi principali nella safe area.\n- Post e caroselli: 4:5 per massimizzare la presenza nel feed senza cambiare formato durante l'import.\n- Reel: hook immediato, sviluppo per scene, payoff e CTA reale; nessuna interazione finta.\n- Audio: verificare sempre licenza commerciale e disponibilita del brano per l'account business.\n- Metodo: testare hook e CTA sui dati del cliente; non promettere viralita.\n\nFonti ufficiali verificate:\n- https://www.facebook.com/business/ads/facebook-instagram-reels-ads\n- https://www.facebook.com/help/instagram/402084904469945\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'DESIGN-SYSTEM.md'), `# Design system SWA\n\nForest #223F2C\nInk #10120E\nGold #D6A839\nRust #A8532D\nCream #FFFAF0\n\nFotografia professionale, editoriale e cinematografica. Hook breve nel primo frame, safe area protetta, CTA grafica senza interazioni simulate, logo ufficiale SWA non alterato.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'CONTEGGIO-ASSET.md'), `# Conteggio asset\n\n10 Reel x 5 file = 50 asset\n6 caroselli = ${carousels.reduce((sum, item) => sum + item.slides.length, 0)} slide\n4 Story x 3 frame = 12 asset\n4 post x 1 file = 4 asset\n\nTotale per piattaforma: ${manifest.expected_assets_per_platform} asset.\nPiattaforme: Instagram e Facebook.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'ISTRUZIONI-SCHEDULAZIONE.md'), `# Istruzioni\n\nCaricare la cartella 04_CRESCITA_Per_Strategia. Instagram e Facebook sono separati. Non caricare 00_Strategia, 04_Sorgenti, 05_Script_Reel, 06_Copy o 08_QA come media. Verificare audio e CTA prima della sincronizzazione.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'FUNNEL-LEAD.md'), `# Funnel lead premium - keyword BOWLING\n\n## Promessa\n\nMappa Regia Bowling SWA personalizzata: diagnosi, tre priorita editoriali, percorso di conversione e prossimo passo.\n\n## Risposta iniziale DM\n\nGrazie per aver scritto BOWLING. Per preparare una mappa utile sul tuo caso ci servono 5 informazioni: nome e citta del bowling, profilo social o sito, obiettivo commerciale prioritario, servizio o evento da spingere e materiale foto/video gia disponibile.\n\n## Conversione\n\nDopo la consegna proporre una call di regia per validare le priorita e presentare il piano mensile completo SWA. La produzione dei contenuti resta parte del servizio a pagamento.\n`);
await writeText(path.join(outputRoot, '08_QA', 'QA-REPORT.md'), `# QA report\n\nGenerazione completata. Asset separati per piattaforma e contenuto. Formati: Reel/Story 1080x1920; Post/Carosello 1080x1350. Hook, CTA e logo applicati graficamente.\n\nQA visuale: ${requiredVisualMasters}/${requiredVisualMasters} master unici assegnati. Nessuna fotografia viene riciclata tra scene, slide o contenuti; Instagram e Facebook condividono soltanto la variante coordinata dello stesso concept.\n\nControllo manuale richiesto prima del caricamento: anteprima, audio, licenza e coerenza delle cover dal giorno 1 al giorno 30.\n`);
await writeText(path.join(outputRoot, '08_QA', 'VALIDATION.json'), `${JSON.stringify({ status: 'READY_FOR_IMPORT_REVIEW', expected_contents: 24, assets_per_platform: manifest.expected_assets_per_platform, platforms, notes: ['Carosello 04 contiene 7 slide: cover + 5 segnali + CTA.', 'Audio copiato nelle cartelle dei contenuti Reel/Story.', 'Confermare licenze audio prima della pubblicazione.'] }, null, 2)}\n`);
await writeText(path.join(outputRoot, 'README.md'), `# Caso Studio Bowling - Pacchetto Crescita SWA\n\nCartella completa pronta per revisione e import.\n\n- 04_CRESCITA_Per_Strategia: media separati per Instagram/Facebook e per fase\n- 00_Strategia: strategia e direzione visiva\n- 04_Sorgenti: master fotografici, logo e audio originali\n- 05_Script_Reel: script dei Reel\n- 06_Copy: schede copy\n- 07_Audio: usare le copie audio nelle cartelle dei contenuti\n- 08_QA: report e manifest di controllo\n\nMix: 10 Reel, 6 caroselli, 4 Story, 4 post.\n`);

const validation = spawnSync(process.execPath, [path.join('/Users/md/SWA/Social-Media-', 'scripts', 'validate-case-study-bowling-package.mjs'), outputRoot], { stdio: 'inherit' });
if (validation.status !== 0) throw new Error('Il pacchetto non ha superato il validatore SWA dedicato.');

console.log(`Created complete package at ${outputRoot}`);
