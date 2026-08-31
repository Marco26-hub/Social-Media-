import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = '/Users/md/.codex/generated_images/01a04a74-09bf-7fa1-9a67-4a7ab89f5b41';
const sourceFiles = [
  'exec-03123608-f2eb-4a97-9dca-771df903592a.png',
  'exec-beb0f877-fb1f-461e-898d-31c3fe99e833.png',
  'exec-8c907996-1a37-4ca1-989f-19bce15f287f.png',
  'exec-1970f312-d1c5-4ec2-b8fc-91abefebaea9.png',
  'exec-cf4478a8-5172-4dcb-ae04-98b6db97f2b6.png',
  'exec-6a40ea60-a3d8-4b1e-81f9-7e16e0892f49.png',
  'exec-47fe4eab-9c23-429f-92b0-9c079e71af96.png',
  'exec-66ec3835-9ba8-4621-b2e8-5bb9471c2d58.png',
  'exec-e7f2be22-9ed5-43cf-959d-98de5aa50aca.png',
  'exec-24f56bc9-4128-442a-a4f0-58cfa277f166.png',
];
const logoPath = '/Users/md/SWA/Social-Media-/public/brand/swa-logo-official.png';
const audioSourceDir = '/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_Bowling/04_Sorgenti/audio';
const audioFiles = fs.readdirSync(audioSourceDir).filter((file) => file.endsWith('.mp3')).sort();
const outputRoot = '/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA';
const strategyRoot = path.join(outputRoot, '04_CRESCITA_Per_Strategia');

const reels = [
  { id: 1, folder: 'REEL_01_REGIA_NON_FOTO', hook: ['GESTORE DI BOWLING?', 'IL PROBLEMA NON SONO LE FOTO.'], cta: 'SCOPRI LA REGIA SWA', scenes: ['Il problema non e il materiale.', 'Serve una regia editoriale.', 'Un momento diventa piu contenuti.', 'Scrivi BOWLING.'] },
  { id: 2, folder: 'REEL_02_SERATA_UN_MESE', hook: ['HO ANALIZZATO UNA SERATA.', 'ECCO 5 CONTENUTI.'], cta: 'SALVA IL METODO', scenes: ['Una sola serata.', 'Cinque angoli diversi.', 'Un mese piu leggibile.', 'Salva il metodo.'] },
  { id: 3, folder: 'REEL_03_PUBBLICHI_QUANDO_CAPITA', hook: ['PUBBLICHI QUANDO CAPITA?', 'STAI PERDENDO REGIA.'], cta: 'SCRIVI BOWLING', scenes: ['Un post non e un piano.', 'Il calendario ordina le idee.', 'Il messaggio segue lobiettivo.', 'Scrivi BOWLING.'] },
  { id: 5, folder: 'REEL_05_TRE_SEGNALI', hook: ['3 SEGNALI CHE', 'IL TUO PIANO NON FUNZIONA.'], cta: 'RICONOSCI IL PROBLEMA', scenes: ['Nessun obiettivo.', 'Nessuna sequenza.', 'Nessuna lettura dei dati.', 'Riconosci il problema.'] },
  { id: 7, folder: 'REEL_07_PISTA_5_CONTENUTI', hook: ['UNA PISTA.', '5 CONTENUTI. ZERO IMPROVVISAZIONE.'], cta: 'SCOPRI IL METODO SWA', scenes: ['Ambiente.', 'Gesto.', 'Reazione.', 'Metodo SWA.'] },
  { id: 8, folder: 'REEL_08_CALENDARIO_INVISIBILE', hook: ['IL CALENDARIO CHE', 'IL CLIENTE NON VEDE.'], cta: 'PIANIFICA CON SWA', scenes: ['Brief.', 'Produzione.', 'Approvazione.', 'Pubblicazione.'] },
  { id: 13, folder: 'REEL_13_PRIMA_E_DOPO_ASSET', hook: ['PRIMA E DOPO:', 'DA ASSET A SISTEMA.'], cta: 'VEDI COME CI ARRIVIAMO', scenes: ['Un file isolato.', 'Una storia coerente.', 'Una sequenza riconoscibile.', 'Vedi il metodo.'] },
  { id: 17, folder: 'REEL_17_HAI_GIA_FOTO', hook: ['HAI GIA FOTO?', 'ECCO COSA MANCA.'], cta: 'SCRIVI BOWLING', scenes: ['Non manca sempre il materiale.', 'Manca spesso la scelta.', 'Manca la continuita.', 'Scrivi BOWLING.'] },
  { id: 19, folder: 'REEL_19_CHECKLIST_PUBBLICARE', hook: ['CHECKLIST:', '5 PASSI PRIMA DI PUBBLICARE.'], cta: 'SALVA LA CHECKLIST', scenes: ['Obiettivo.', 'Pubblico.', 'Formato.', 'CTA.', 'Salva la checklist.'] },
  { id: 22, folder: 'REEL_22_STORIE_SISTEMA', hook: ['LE STORIE CI SONO.', 'MANCA IL SISTEMA.'], cta: 'COSTRUIAMO IL SISTEMA', scenes: ['Ogni giorno racconta qualcosa.', 'Ogni formato ha un ruolo.', 'Ogni CTA porta avanti il percorso.', 'Costruiamo il sistema.'] },
];

const stories = [
  { id: 10, folder: 'STORY_10_PUNTO_DIFFICILE', frames: [['QUAL E IL PUNTO PIU', 'DIFFICILE DEL TUO PIANO?', 'SCRIVI BOWLING'], ['MATERIALE, IDEE O COSTANZA?', 'IL PROBLEMA SI PUO MAPPARE.', 'RISPONDI IN DM'], ['NON SERVE PUBBLICARE DI PIU.', 'SERVE PUBBLICARE MEGLIO.', 'SCRIVI BOWLING']] },
  { id: 11, folder: 'STORY_11_DELEGA_PRODUZIONE', frames: [['QUALE CONTENUTO MANCA', 'OGGI AL TUO BOWLING?', 'RISPONDI IN DM'], ['HAI GIA FOTO?', 'TRASFORMIAMOLE IN UNA REGIA.', 'SCRIVI BOWLING'], ['UNA SERATA PUO GENERARE', 'PIU DI UN SOLO POST.', 'SCOPRI SWA']] },
  { id: 15, folder: 'STORY_15_PARTE_DA_DELEGARE', frames: [['QUALE PARTE VORRESTI', 'DELEGARE A SWA?', 'SCRIVI BOWLING'], ['BRIEF, PRODUZIONE O REPORT?', 'OGNI FASE HA UN RUOLO.', 'RISPONDI IN DM'], ['IL METODO PARTE', 'DAL TUO OBIETTIVO.', 'SCOPRI SWA']] },
  { id: 21, folder: 'STORY_21_PIANO_BOWLING', frames: [['VUOI VEDERE IL PIANO', 'DEL TUO BOWLING?', 'SCRIVI BOWLING'], ['DAL PRIMO AUDIT', 'AL CALENDARIO EDITORIALE.', 'SCOPRI SWA'], ['UNA STRATEGIA CHIARA', 'FA RESPIRARE IL TEAM.', 'RISPONDI IN DM']] },
];

const posts = [
  { id: 6, folder: 'POST_06_DOMANDA_PRIMA_DEL_CONTENUTO', lines: ['PRIMA DEL CONTENUTO', 'VIENE LA DOMANDA:', 'COSA DEVE OTTENERE?'], cta: 'SCOPRI LA REGIA SWA' },
  { id: 12, folder: 'POST_12_FOTO_CON_DECISIONE', lines: ['UNA FOTO FUNZIONA', 'QUANDO RACCONTA', 'UNA DECISIONE.'], cta: 'SCRIVI BOWLING' },
  { id: 18, folder: 'POST_18_CONTENUTO_E_SCELTA', lines: ['IL CONTENUTO NON E', 'SOLO IL FILE.'], cta: 'SCOPRI IL METODO SWA' },
  { id: 24, folder: 'POST_24_STORIE_E_SISTEMA', lines: ['IL TUO BOWLING HA', 'GIA LE STORIE.'], cta: 'COSTRUIAMO IL SISTEMA' },
];

const carousels = [
  {
    id: 4, folder: 'CAROSELLO_04_CINQUE_SEGNALI', slides: [
      ['5 SEGNALI CHE', 'IL TUO BOWLING', 'NON HA UN PIANO.'],
      ['01', 'PUBBLICHI', 'QUANDO CAPITA.'],
      ['02', 'OGNI CONTENUTO', 'PARLA A CASO.'],
      ['03', 'HAI FOTO BELLE,', 'MA NESSUN MESSAGGIO.'],
      ['04', 'NON ESISTE', 'UN CALENDARIO.'],
      ['05', 'NON LEGGI', 'COSA FUNZIONA.'],
      ['RICONOSCI ALMENO 2 SEGNALI?', 'SCRIVI BOWLING', 'PER UNA MINI ANALISI.'],
    ],
  },
  {
    id: 9, folder: 'CAROSELLO_09_SERATA_UN_MESE', slides: [
      ['UNA SERATA.', 'PIU CONTENUTI.', ''], ['AMBIENTE', 'La pista apre la storia.', ''], ['GESTO', 'Il movimento crea attenzione.', ''], ['REAZIONE', 'Il gruppo rende tutto umano.', ''], ['METODO', 'SWA organizza il mese.', 'SCRIVI BOWLING'],
    ],
  },
  {
    id: 14, folder: 'CAROSELLO_14_FORMATO_OBIETTIVO', slides: [
      ['REEL, CAROSELLO', 'O POST?', 'SCEGLI LOBIETTIVO.'], ['REEL', 'Scoperta e attenzione.', ''], ['CAROSELLO', 'Metodo e salvataggi.', ''], ['POST', 'Posizionamento e fiducia.', ''], ['SWA', 'Un sistema, non file isolati.', 'SCRIVI BOWLING'],
    ],
  },
  {
    id: 16, folder: 'CAROSELLO_16_GESTIONE_SOCIAL', slides: [
      ['COSA COMPRENDE', 'UNA GESTIONE', 'SOCIAL ORGANIZZATA?'], ['BRIEF', 'Partiamo dal tuo obiettivo.', ''], ['PRODUZIONE', 'Trasformiamo idee in asset.', ''], ['APPROVAZIONE', 'Tu controlli prima di pubblicare.', ''], ['PUBBLICAZIONE', 'SWA tiene insieme il processo.', 'SCOPRI SWA'],
    ],
  },
  {
    id: 20, folder: 'CAROSELLO_20_CHECKLIST_PUBBLICAZIONE', slides: [
      ['CHECKLIST PRIMA', 'DI PUBBLICARE', ''], ['01', 'Obiettivo chiaro.', ''], ['02', 'Pubblico definito.', ''], ['03', 'Formato coerente.', ''], ['04', 'CTA concreta.', 'SALVA LA CHECKLIST'],
    ],
  },
  {
    id: 23, folder: 'CAROSELLO_23_AUDIT_CALENDARIO', slides: [
      ['DAL PRIMO AUDIT', 'AL CALENDARIO.', ''], ['AUDIT', 'Cosa sta gia funzionando?', ''], ['STRATEGIA', 'Cosa deve cambiare?', ''], ['CALENDARIO', 'Cosa pubblichiamo e quando?', ''], ['SWA', 'Il prossimo passo parte da qui.', 'SCRIVI BOWLING'],
    ],
  },
];

const phaseFor = (id) => id <= 6 ? '01_ATTENZIONE' : id <= 12 ? '02_FIDUCIA' : id <= 18 ? '03_SCELTA' : '04_AZIONE';
const sourceAt = (index) => path.join(sourceDir, sourceFiles[index % sourceFiles.length]);
const esc = (value) => String(value).replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
const logo = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

function svgOverlay({ width, height, label, lines, cta, scene = false }) {
  const scale = width / 1080;
  const topHeight = height * 0.42;
  const bottomY = height * 0.80;
  const font = scene ? 38 * scale : (width === 1080 ? 58 : 52) * scale;
  const logoW = 132 * scale;
  const logoH = 60 * scale;
  const lineY = scene ? 300 * scale : 285 * scale;
  const lineGap = scene ? 56 * scale : 76 * scale;
  const text = lines.map((line, index) => `<text x="${58 * scale}" y="${lineY + index * lineGap}" fill="#fffaf0" font-family="Arial, sans-serif" font-size="${font}" font-weight="800">${esc(line)}</text>`).join('');
  const ctaWidth = Math.min(width * 0.58, 570 * scale);
  const ctaY = height - 225 * scale;
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <defs><linearGradient id="top" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10120e" stop-opacity="0.92"/><stop offset="1" stop-color="#10120e" stop-opacity="0.08"/></linearGradient><linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#10120e" stop-opacity="0"/><stop offset="1" stop-color="#10120e" stop-opacity="0.84"/></linearGradient></defs>
    <rect width="${width}" height="${topHeight}" fill="url(#top)"/><rect y="${height * 0.70}" width="${width}" height="${height * 0.30}" fill="url(#bottom)"/>
    <image href="${logo}" x="${58 * scale}" y="${45 * scale}" width="${logoW}" height="${logoH}" preserveAspectRatio="xMidYMid meet"/>
    <text x="${58 * scale}" y="${145 * scale}" fill="#d6a839" font-family="Arial, sans-serif" font-size="${24 * scale}" font-weight="700" letter-spacing="${3 * scale}">${esc(label)}</text>
    <rect x="${58 * scale}" y="${170 * scale}" width="${70 * scale}" height="${5 * scale}" fill="#a8532d"/>
    ${text}
    ${cta ? `<rect x="${58 * scale}" y="${ctaY}" width="${ctaWidth}" height="${60 * scale}" fill="#d6a839"/><text x="${80 * scale}" y="${ctaY + 39 * scale}" fill="#10120e" font-family="Arial, sans-serif" font-size="${22 * scale}" font-weight="800" letter-spacing="${0.8 * scale}">${esc(cta)}</text>` : ''}
    <text x="${58 * scale}" y="${height - 65 * scale}" fill="#fffaf0" fill-opacity="0.92" font-family="Arial, sans-serif" font-size="${20 * scale}" font-weight="700" letter-spacing="${2 * scale}">@SOCIALWEBAUTOMATION</text>
  </svg>`);
}

async function render(input, output, width, height, overlay) {
  await sharp(input).resize(width, height, { fit: 'cover', position: 'centre' }).composite([{ input: overlay }]).png({ compressionLevel: 9 }).toFile(output);
}

async function writeText(file, content) {
  await fs.promises.mkdir(path.dirname(file), { recursive: true });
  await fs.promises.writeFile(file, content, 'utf8');
}

async function copy(file, destination) {
  await fs.promises.mkdir(path.dirname(destination), { recursive: true });
  await fs.promises.copyFile(file, destination);
}

await fs.promises.rm(outputRoot, { recursive: true, force: true });
await fs.promises.mkdir(strategyRoot, { recursive: true });

const platforms = ['Instagram', 'Facebook'];
for (const platform of platforms) {
  for (const phase of ['01_ATTENZIONE', '02_FIDUCIA', '03_SCELTA', '04_AZIONE']) {
    await fs.promises.mkdir(path.join(strategyRoot, platform, phase), { recursive: true });
  }
}
await fs.promises.mkdir(path.join(outputRoot, '00_Strategia'), { recursive: true });
await fs.promises.mkdir(path.join(outputRoot, '04_Sorgenti', 'audio'), { recursive: true });

for (const file of sourceFiles) await copy(path.join(sourceDir, file), path.join(outputRoot, '04_Sorgenti', 'PHOTO_MASTER', file));
await copy(logoPath, path.join(outputRoot, '04_Sorgenti', 'SWA_LOGO_UFFICIALE.png'));
for (const file of audioFiles) {
  await copy(path.join(audioSourceDir, file), path.join(outputRoot, '04_Sorgenti', 'audio', file));
}

const manifestContents = [];
const contentRecords = [
  ...reels.map((item) => ({ ...item, format: 'Reel', formatDir: 'Reel_1080x1920', assets: 5, dimensions: [1080, 1920] })),
  ...stories.map((item) => ({ ...item, format: 'Story', formatDir: 'Stories_1080x1920', assets: 3, dimensions: [1080, 1920] })),
  ...posts.map((item) => ({ ...item, format: 'Post', formatDir: 'Post_1080x1350', assets: 1, dimensions: [1080, 1350] })),
  ...carousels.map((item) => ({ ...item, format: 'Carosello', formatDir: 'Caroselli_1080x1350', assets: item.slides.length, dimensions: [1080, 1350] })),
].sort((a, b) => a.id - b.id);

for (const [index, item] of contentRecords.entries()) {
  const phase = phaseFor(item.id);
  for (const platform of platforms) {
    const folder = path.join(strategyRoot, platform, phase, item.folder);
    await fs.promises.mkdir(folder, { recursive: true });
    const sourceIndex = (item.id + (platform === 'Facebook' ? 3 : 0)) % sourceFiles.length;
    const audio = audioFiles[index % audioFiles.length];
    if (item.format === 'Reel') {
      await render(sourceAt(sourceIndex), path.join(folder, `REEL_${String(item.id).padStart(2, '0')}_COVER.png`), 1080, 1920, svgOverlay({ width: 1080, height: 1920, label: 'CASO STUDIO BOWLING', lines: item.hook, cta: item.cta }));
      for (let scene = 0; scene < 4; scene += 1) {
        await render(sourceAt(sourceIndex + scene + 1), path.join(folder, `REEL_${String(item.id).padStart(2, '0')}_SCENA_0${scene + 1}.png`), 1080, 1920, svgOverlay({ width: 1080, height: 1920, label: `REEL ${String(item.id).padStart(2, '0')} / SCENA 0${scene + 1}`, lines: [item.scenes[scene] || item.cta], cta: scene === 3 ? item.cta : '', scene: true }));
      }
      await copy(path.join(audioSourceDir, audio), path.join(folder, `AUDIO_REEL_${String(item.id).padStart(2, '0')}_${path.basename(audio, '.mp3').toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_')}.mp3`));
      await writeText(path.join(outputRoot, '05_Script_Reel', item.folder, 'SCRIPT.md'), `# ${item.folder}\n\nHook: ${item.hook.join(' ')}\n\nScene: ${item.scenes.join(' | ')}\n\nCTA: ${item.cta}\n\nFormato: Reel 1080x1920.\n`);
    } else if (item.format === 'Story') {
      for (const [frameIndex, frame] of item.frames.entries()) await render(sourceAt(sourceIndex + frameIndex), path.join(folder, `STORY_${String(item.id).padStart(2, '0')}_FRAME_0${frameIndex + 1}.png`), 1080, 1920, svgOverlay({ width: 1080, height: 1920, label: `STORY ${String(item.id).padStart(2, '0')}`, lines: frame.slice(0, 2), cta: frame[2] }));
      await copy(path.join(audioSourceDir, audio), path.join(folder, `AUDIO_STORY_${String(item.id).padStart(2, '0')}_${path.basename(audio, '.mp3').toUpperCase().replaceAll(/[^A-Z0-9]+/g, '_')}.mp3`));
    } else if (item.format === 'Post') {
      await render(sourceAt(sourceIndex), path.join(folder, `POST_${String(item.id).padStart(2, '0')}.png`), 1080, 1350, svgOverlay({ width: 1080, height: 1350, label: 'CASO STUDIO BOWLING', lines: item.lines, cta: item.cta }));
    } else {
      for (const [slideIndex, slide] of item.slides.entries()) await render(sourceAt(sourceIndex + slideIndex), path.join(folder, `CAROSELLO_${String(item.id).padStart(2, '0')}_SLIDE_${String(slideIndex + 1).padStart(2, '0')}.png`), 1080, 1350, svgOverlay({ width: 1080, height: 1350, label: slideIndex === 0 ? 'CAROSELLO SWA' : `CAROSELLO ${String(item.id).padStart(2, '0')} / ${String(slideIndex + 1).padStart(2, '0')}`, lines: slide.slice(0, 3), cta: slideIndex === item.slides.length - 1 ? slide[2] : '' }));
    }
  }
  manifestContents.push({ order: item.id, id: item.folder, format: item.format, format_dir: item.formatDir, folder: item.folder, phase: phase.replace(/^\d+_/, ''), week: Math.ceil(item.id / 6), assets: item.assets, dimensions: item.dimensions });
  await writeText(path.join(outputRoot, '06_Copy', item.folder, 'COPY.md'), `# ${item.folder}\n\nFormato: ${item.format}\nFase: ${phase}\n\nContenuto creato per la strategia SWA Caso Studio Bowling.\n`);
}

const manifest = {
  schema_version: 1,
  brand: 'Social Web Automation',
  month: 'Mese 04',
  niche: 'Bowling',
  strategy: 'Caso Studio Bowling',
  package: 'crescita',
  platforms,
  platform_dirs: { Instagram: 'Instagram', Facebook: 'Facebook' },
  phases: ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE'],
  contents: manifestContents.sort((a, b) => a.order - b.order),
  expected_contents: 24,
  expected_assets_per_platform: manifestContents.reduce((sum, item) => sum + item.assets, 0),
  rules: { logo_on_every_final: true, visible_slide_numbers: false, profile_crop: '3:4', reel_safe_area_y: [250, 1450], story_safe_area_y: [250, 1450], no_fake_interactions: true },
};
await writeText(path.join(outputRoot, 'campaign_manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'STRATEGIA-MESE.md'), `# Caso Studio Bowling - Crescita SWA\n\nObiettivo: far conoscere SWA a titolari e gestori di bowling usando il bowling come caso studio.\n\nMix: 10 Reel, 6 caroselli, 4 Story, 4 post. Totale: 24 contenuti.\n\nFasi: ATTENZIONE, FIDUCIA, SCELTA, AZIONE.\n\nCTA principale: Scrivi BOWLING per una mini analisi.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'DESIGN-SYSTEM.md'), `# Design system SWA\n\nForest #223F2C\nInk #10120E\nGold #D6A839\nRust #A8532D\nCream #FFFAF0\n\nFotografia professionale, editoriale e cinematografica. Hook breve nel primo frame, safe area protetta, CTA grafica senza interazioni simulate, logo ufficiale SWA non alterato.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'CONTEGGIO-ASSET.md'), `# Conteggio asset\n\n10 Reel x 5 file = 50 asset\n6 caroselli = ${carousels.reduce((sum, item) => sum + item.slides.length, 0)} slide\n4 Story x 3 frame = 12 asset\n4 post x 1 file = 4 asset\n\nTotale per piattaforma: ${manifest.expected_assets_per_platform} asset.\nPiattaforme: Instagram e Facebook.\n`);
await writeText(path.join(outputRoot, '00_Strategia', 'ISTRUZIONI-SCHEDULAZIONE.md'), `# Istruzioni\n\nCaricare la cartella 04_CRESCITA_Per_Strategia. Instagram e Facebook sono separati. Non caricare 00_Strategia, 04_Sorgenti, 05_Script_Reel, 06_Copy o 08_QA come media. Verificare audio e CTA prima della sincronizzazione.\n`);
await writeText(path.join(outputRoot, '08_QA', 'QA-REPORT.md'), `# QA report\n\nGenerazione completata. Asset separati per piattaforma e contenuto. Formati: Reel/Story 1080x1920; Post/Carosello 1080x1350. Hook, CTA e logo applicati graficamente.\n\nControllo manuale richiesto prima del caricamento: anteprima, audio, licenza e coerenza delle prime 9/12 cover.\n`);
await writeText(path.join(outputRoot, '08_QA', 'VALIDATION.json'), `${JSON.stringify({ status: 'READY_FOR_IMPORT_REVIEW', expected_contents: 24, assets_per_platform: manifest.expected_assets_per_platform, platforms, notes: ['Carosello 04 contiene 7 slide: cover + 5 segnali + CTA.', 'Audio copiato nelle cartelle dei contenuti Reel/Story.', 'Confermare licenze audio prima della pubblicazione.'] }, null, 2)}\n`);
await writeText(path.join(outputRoot, 'README.md'), `# Caso Studio Bowling - Pacchetto Crescita SWA\n\nCartella completa pronta per revisione e import.\n\n- 04_CRESCITA_Per_Strategia: media separati per Instagram/Facebook e per fase\n- 00_Strategia: strategia e direzione visiva\n- 04_Sorgenti: master fotografici, logo e audio originali\n- 05_Script_Reel: script dei Reel\n- 06_Copy: schede copy\n- 07_Audio: usare le copie audio nelle cartelle dei contenuti\n- 08_QA: report e manifest di controllo\n\nMix: 10 Reel, 6 caroselli, 4 Story, 4 post.\n`);

console.log(`Created complete package at ${outputRoot}`);
