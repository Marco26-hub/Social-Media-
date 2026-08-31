import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const sourceDir = '/Users/md/.codex/generated_images/01a04a74-09bf-7fa1-9a67-4a7ab89f5b41';
const outputDir = '/Users/md/Documents/SWA/CASO_STUDIO_BOWLING_VISUALS/REEL';
const logoPath = '/Users/md/SWA/Social-Media-/public/brand/swa-logo-official.png';

const sources = [
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

await Promise.all(sources.map(async (source, index) => {
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
  const inputPath = path.join(sourceDir, sources[(index + 5) % sources.length]);
  const outputPath = path.join(storyDir, `CASO_STUDIO_BOWLING_STORY_${String(index + 1).padStart(2, '0')}.png`);
  await sharp(inputPath)
    .resize(1080, 1920, { fit: 'cover', position: 'centre' })
    .composite([{ input: overlaySvg(content), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

await Promise.all(postCopy.map(async (content, index) => {
  const inputPath = path.join(sourceDir, sources[(index + 1) % sources.length]);
  const outputPath = path.join(postDir, `CASO_STUDIO_BOWLING_POST_${String(index + 1).padStart(2, '0')}.png`);
  await sharp(inputPath)
    .resize(1080, 1080, { fit: 'cover', position: 'centre' })
    .composite([{ input: squareOverlaySvg(content, 'CASO STUDIO BOWLING'), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

await Promise.all(carouselCopy.map(async (content, index) => {
  const inputPath = path.join(sourceDir, sources[(index + 3) % sources.length]);
  const outputPath = path.join(carouselDir, `CASO_STUDIO_BOWLING_CAROUSEL_${String(index + 1).padStart(2, '0')}_COVER.png`);
  await sharp(inputPath)
    .resize(1080, 1080, { fit: 'cover', position: 'centre' })
    .composite([{ input: squareOverlaySvg(content, 'CAROSELLO SWA'), blend: 'over' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath);
}));

console.log(`Generated ${sources.length} Reel, ${storyCopy.length} Story, ${postCopy.length} post and ${carouselCopy.length} carousel cover visuals in ${path.dirname(outputDir)}`);
