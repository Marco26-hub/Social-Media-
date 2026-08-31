import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = '/Users/md/.codex/generated_images/01a04a74-09bf-7fa1-9a67-4a7ab89f5b41';
const outputDir = '/Users/md/Documents/SWA/CASO_STUDIO_BOWLING_VISUALS/REEL';
const logoPath = '/Users/md/SWA/Social-Media-/public/brand/swa-logo-official.png';

// Carica tutti i master fotografici disponibili: limitarsi a 10 faceva
// ricomparire le stesse scene mentre il kit Bowling ne contiene di più.
const sources = fs.readdirSync(sourceDir)
  .filter((file) => /\.(?:png|jpe?g|webp)$/i.test(file))
  .sort((left, right) => left.localeCompare(right, 'en'));
if (sources.length < 5) {
  throw new Error(`Servono almeno 5 master fotografici, trovati ${sources.length} in ${sourceDir}`);
}

const copy = [
  ['GESTORE DI BOWLING?', 'IL PROBLEMA NON SONO LE FOTO.', 'SCOPRI LA REGIA SWA'],
  ['HO ANALIZZATO UNA SERATA.', 'ECCO 5 CONTENUTI.', 'SALVA IL METODO'],
  ['PUBBLICHI QUANDO CAPITA?', 'STAI PERDENDO REGIA.', 'SCRIVI BOWLING'],
  ['3 SEGNALI CHE', 'IL TUO PIANO NON FUNZIONA.', 'RICONOSCI IL PROBLEMA'],
  ['UNA PISTA.', '5 CONTENUTI. ZERO IMPROVVISAZIONE.', 'SCOPRI IL METODO SWA'],
  ['IL CALENDARIO CHE', 'IL CLIENTE NON VEDE.', 'PIANIFICA CON SWA'],
  ['PRIMA E DOPO:', 'DA ASSET A SISTEMA.', 'VEDI COME CI ARRIVIAMO'],
  ['HAI GIA FOTO?', 'ECCO COSA MANCA.', 'SCRIVI BOWLING'],
  ['CHECKLIST:', '5 PASSI PRIMA DI PUBBLICARE.', 'SALVA LA CHECKLIST'],
  ['LE STORIE CI SONO.', 'MANCA IL SISTEMA.', 'COSTRUIAMO IL SISTEMA'],
];

const storyCopy = [
  ['QUAL E IL PUNTO PIU', 'DIFFICILE DEL TUO PIANO?', 'SCRIVI BOWLING'],
  ['QUALE CONTENUTO MANCA', 'OGGI AL TUO BOWLING?', 'RISPONDI IN DM'],
  ['QUALE PARTE VORRESTI', 'DELEGARE A SWA?', 'SCRIVI BOWLING'],
  ['VUOI VEDERE IL PIANO', 'DEL TUO BOWLING?', 'SCRIVI BOWLING'],
];

const postCopy = [
  ['UNA SERATA PUO', 'DIVENTARE UN MESE.', 'SCOPRI IL METODO SWA'],
  ['IL CONTENUTO NON E', 'SOLO IL FILE.', 'SCOPRI LA REGIA SWA'],
  ['STRATEGIA, APPROVAZIONE,', 'PUBBLICAZIONE.', 'PARLIAMONE'],
  ['SWA TIENE INSIEME', 'IL PROCESSO.', 'SCRIVI BOWLING'],
];

const carouselCopy = [
  ['5 SEGNALI CHE MANCA', 'UN PIANO.', 'SALVA LA CHECKLIST'],
  ['BRIEF, IDEA, STORYBOARD,', 'PRODUZIONE.', 'SCOPRI IL METODO'],
  ['REEL, CAROSELLO O POST?', 'SCEGLI IN BASE ALL OBIETTIVO.', 'SALVA IL METODO'],
  ['COSA COMPRENDE', 'UNA GESTIONE SOCIAL?', 'SCOPRI SWA'],
  ['CHECKLIST PRIMA DI', 'PUBBLICARE.', 'SALVA LA CHECKLIST'],
  ['DAL PRIMO AUDIT', 'AL CALENDARIO.', 'SCRIVI BOWLING'],
];

const logo = `data:image/png;base64,${fs.readFileSync(logoPath).toString('base64')}`;

function escapeXml(value) {
  return value.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;');
}

function overlaySvg([lineOne, lineTwo, cta]) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1920" viewBox="0 0 1080 1920">
      <defs>
        <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#10120e" stop-opacity="0.84"/>
          <stop offset="1" stop-color="#10120e" stop-opacity="0.16"/>
        </linearGradient>
        <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#10120e" stop-opacity="0"/>
          <stop offset="1" stop-color="#10120e" stop-opacity="0.76"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="620" fill="url(#top)"/>
      <rect y="1450" width="1080" height="470" fill="url(#bottom)"/>
      <image href="${logo}" x="68" y="55" width="132" height="60" preserveAspectRatio="xMidYMid meet"/>
      <text x="68" y="164" fill="#d6a839" font-family="Arial, sans-serif" font-size="25" font-weight="700" letter-spacing="4">CASO STUDIO BOWLING</text>
      <rect x="68" y="192" width="72" height="5" fill="#a8532d"/>
      <text x="68" y="300" fill="#fffaf0" font-family="Arial, sans-serif" font-size="62" font-weight="800">${escapeXml(lineOne)}</text>
      <text x="68" y="382" fill="#fffaf0" font-family="Arial, sans-serif" font-size="62" font-weight="800">${escapeXml(lineTwo)}</text>
      <rect x="68" y="1680" width="500" height="70" rx="0" fill="#d6a839"/>
      <text x="94" y="1725" fill="#10120e" font-family="Arial, sans-serif" font-size="25" font-weight="800" letter-spacing="1">${escapeXml(cta)}</text>
      <text x="68" y="1848" fill="#fffaf0" fill-opacity="0.88" font-family="Arial, sans-serif" font-size="24" font-weight="700" letter-spacing="2">@SOCIALWEBAUTOMATION</text>
    </svg>
  `);
}

function squareOverlaySvg([lineOne, lineTwo, cta], label) {
  return Buffer.from(`
    <svg xmlns="http://www.w3.org/2000/svg" width="1080" height="1080" viewBox="0 0 1080 1080">
      <defs>
        <linearGradient id="top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#10120e" stop-opacity="0.92"/>
          <stop offset="1" stop-color="#10120e" stop-opacity="0.16"/>
        </linearGradient>
        <linearGradient id="bottom" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#10120e" stop-opacity="0"/>
          <stop offset="1" stop-color="#10120e" stop-opacity="0.82"/>
        </linearGradient>
      </defs>
      <rect width="1080" height="520" fill="url(#top)"/>
      <rect y="760" width="1080" height="320" fill="url(#bottom)"/>
      <image href="${logo}" x="58" y="50" width="112" height="51" preserveAspectRatio="xMidYMid meet"/>
      <text x="58" y="140" fill="#d6a839" font-family="Arial, sans-serif" font-size="22" font-weight="700" letter-spacing="3">${escapeXml(label)}</text>
      <rect x="58" y="164" width="66" height="5" fill="#a8532d"/>
      <text x="58" y="270" fill="#fffaf0" font-family="Arial, sans-serif" font-size="49" font-weight="800">${escapeXml(lineOne)}</text>
      <text x="58" y="338" fill="#fffaf0" font-family="Arial, sans-serif" font-size="49" font-weight="800">${escapeXml(lineTwo)}</text>
      <rect x="58" y="890" width="430" height="60" fill="#d6a839"/>
      <text x="80" y="929" fill="#10120e" font-family="Arial, sans-serif" font-size="22" font-weight="800" letter-spacing="1">${escapeXml(cta)}</text>
      <text x="58" y="1016" fill="#fffaf0" fill-opacity="0.9" font-family="Arial, sans-serif" font-size="21" font-weight="700" letter-spacing="2">@SOCIALWEBAUTOMATION</text>
    </svg>
  `);
}

await fs.promises.mkdir(outputDir, { recursive: true });

const reelSources = Array.from({ length: 10 }, (_, index) => sources[(index * 5) % sources.length]);
await Promise.all(reelSources.map(async (source, index) => {
  const inputPath = path.join(sourceDir, source);
  const outputPath = path.join(outputDir, `CASO_STUDIO_BOWLING_REEL_${String(index + 1).padStart(2, '0')}.png`);
  await sharp(inputPath)
    .resize(1080, 1920, { fit: 'cover', position: 'centre' })
    .composite([{ input: overlaySvg(copy[index]), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

const storyDir = path.join(path.dirname(outputDir), 'STORY');
const postDir = path.join(path.dirname(outputDir), 'POST');
const carouselDir = path.join(path.dirname(outputDir), 'CAROSELLI');
await Promise.all([storyDir, postDir, carouselDir].map((dir) => fs.promises.mkdir(dir, { recursive: true })));

await Promise.all(storyCopy.map(async (content, index) => {
  const inputPath = path.join(sourceDir, sources[(index * 3 + 7) % sources.length]);
  const outputPath = path.join(storyDir, `CASO_STUDIO_BOWLING_STORY_${String(index + 1).padStart(2, '0')}.png`);
  await sharp(inputPath)
    .resize(1080, 1920, { fit: 'cover', position: 'centre' })
    .composite([{ input: overlaySvg(content), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

await Promise.all(postCopy.map(async (content, index) => {
  const inputPath = path.join(sourceDir, sources[(index * 5 + 11) % sources.length]);
  const outputPath = path.join(postDir, `CASO_STUDIO_BOWLING_POST_${String(index + 1).padStart(2, '0')}.png`);
  await sharp(inputPath)
    .resize(1080, 1080, { fit: 'cover', position: 'centre' })
    .composite([{ input: squareOverlaySvg(content, 'CASO STUDIO BOWLING'), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

await Promise.all(carouselCopy.map(async (content, index) => {
  const inputPath = path.join(sourceDir, sources[(index * 5 + 13) % sources.length]);
  const outputPath = path.join(carouselDir, `CASO_STUDIO_BOWLING_CAROUSEL_${String(index + 1).padStart(2, '0')}_COVER.png`);
  await sharp(inputPath)
    .resize(1080, 1080, { fit: 'cover', position: 'centre' })
    .composite([{ input: squareOverlaySvg(content, 'CAROSELLO SWA'), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

console.log(`Generated ${reelSources.length} Reel, ${storyCopy.length} Story, ${postCopy.length} post and ${carouselCopy.length} carousel cover visuals in ${path.dirname(outputDir)}`);
