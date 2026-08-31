import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

const root = path.resolve(process.argv[2] || '/Users/md/Documents/SWA/CRESCITA_Campagna_Mese_04_CASO_STUDIO_BOWLING_SWA');
const manifestPath = path.join(root, 'campaign_manifest.json');
const errors = [];

if (!fs.existsSync(manifestPath)) {
  console.error(`ERROR: manifest mancante: ${manifestPath}`);
  process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const importRoot = path.join(root, manifest.import_root || '04_CRESCITA_Per_Strategia');
const phaseDir = new Map([
  ['ATTENZIONE', '01_ATTENZIONE'],
  ['FIDUCIA', '02_FIDUCIA'],
  ['SCELTA', '03_SCELTA'],
  ['AZIONE', '04_AZIONE'],
]);
const requiredStrategyDocs = [
  'STRATEGIA-MESE.md',
  'LINEA-EDITORIALE.md',
  'DESIGN-SYSTEM.md',
  'GRID-BLUEPRINT.md',
  'SOCIAL-CALENDAR.md',
  'ISTRUZIONI-SCHEDULAZIONE.md',
  'CONTEGGIO-ASSET.md',
  'FUNNEL-LEAD.md',
  'MAPPA-REGIA-BOWLING-SWA.pdf',
];

function expectedImageNames(content) {
  const number = String(content.order).padStart(2, '0');
  if (content.format === 'Reel') {
    return [`REEL_${number}_COVER.png`, ...Array.from({ length: 4 }, (_, index) => `REEL_${number}_SCENA_${String(index + 1).padStart(2, '0')}.png`)];
  }
  if (content.format === 'Story') {
    return Array.from({ length: content.assets }, (_, index) => `STORY_${number}_FRAME_${String(index + 1).padStart(2, '0')}.png`);
  }
  if (content.format === 'Post') return [`POST_${number}.png`];
  if (content.format === 'Carosello') {
    return Array.from({ length: content.assets }, (_, index) => `CAROSELLO_${number}_SLIDE_${String(index + 1).padStart(2, '0')}.png`);
  }
  return [];
}

function listFiles(folder, extension) {
  if (!fs.existsSync(folder)) return [];
  return fs.readdirSync(folder).filter((file) => file.toLowerCase().endsWith(extension)).sort();
}

for (const name of requiredStrategyDocs) {
  if (!fs.existsSync(path.join(root, '00_Strategia', name))) errors.push(`Documento strategico mancante: ${name}`);
}
if (!fs.readdirSync(path.join(root, '00_Strategia')).some((name) => /^TREND-REFRESH-\d{4}-\d{2}-\d{2}\.md$/.test(name))) {
  errors.push('Documento TREND-REFRESH datato mancante');
}

if (manifest.expected_contents !== 24 || manifest.contents.length !== 24) errors.push('Il manifest deve contenere esattamente 24 contenuti');
const formatCounts = manifest.contents.reduce((counts, content) => ({ ...counts, [content.format]: (counts[content.format] || 0) + 1 }), {});
for (const [format, expected] of Object.entries({ Reel: 10, Carosello: 6, Story: 4, Post: 4 })) {
  if (formatCounts[format] !== expected) errors.push(`${format}: attesi ${expected} contenuti, trovati ${formatCounts[format] || 0}`);
}

const platformStats = {};
for (const platform of manifest.platforms) {
  let imageCount = 0;
  let audioCount = 0;
  const hashes = [];

  for (const content of manifest.contents) {
    const phase = phaseDir.get(content.phase);
    const folder = path.join(importRoot, platform, phase || '', content.folder);
    if (!fs.existsSync(folder)) {
      errors.push(`${platform}/${content.id}: cartella mancante`);
      continue;
    }

    const images = listFiles(folder, '.png');
    const audio = listFiles(folder, '.mp3');
    const expected = expectedImageNames(content);
    if (JSON.stringify(images) !== JSON.stringify(expected)) {
      errors.push(`${platform}/${content.id}: ordine o nomi immagini errati; attesi ${expected.join(', ')}`);
    }
    const expectedAudio = ['Reel', 'Story'].includes(content.format) ? 1 : 0;
    if (audio.length !== expectedAudio) errors.push(`${platform}/${content.id}: attesi ${expectedAudio} audio, trovati ${audio.length}`);

    for (const imageName of images) {
      const imagePath = path.join(folder, imageName);
      const metadata = await sharp(imagePath).metadata();
      if (metadata.width !== content.dimensions[0] || metadata.height !== content.dimensions[1]) {
        errors.push(`${platform}/${content.id}/${imageName}: ${metadata.width}x${metadata.height}, atteso ${content.dimensions.join('x')}`);
      }
      hashes.push(createHash('sha256').update(fs.readFileSync(imagePath)).digest('hex'));
    }
    imageCount += images.length;
    audioCount += audio.length;
  }

  if (imageCount !== manifest.expected_assets_per_platform) errors.push(`${platform}: attese ${manifest.expected_assets_per_platform} immagini, trovate ${imageCount}`);
  if (new Set(hashes).size !== hashes.length) errors.push(`${platform}: immagini finali duplicate rilevate`);
  if (audioCount !== 14) errors.push(`${platform}: attesi 14 audio Reel/Story, trovati ${audioCount}`);
  platformStats[platform] = { contents: manifest.contents.length, images: imageCount, unique_images: new Set(hashes).size, audio: audioCount };
}

const masterDir = path.join(root, '04_Sorgenti', 'PHOTO_MASTER');
const masters = listFiles(masterDir, '.png');
if (masters.length !== 98) errors.push(`Master sorgente: attesi 98 PNG, trovati ${masters.length}`);
const masterSignatures = [];
for (const master of masters) {
  const pixels = await sharp(path.join(masterDir, master)).resize(16, 16, { fit: 'fill' }).grayscale().raw().toBuffer();
  masterSignatures.push(createHash('sha256').update(pixels).digest('hex'));
}
if (new Set(masterSignatures).size !== masterSignatures.length) errors.push('Master sorgente duplicati rilevati');

for (const preview of ['ANTEPRIMA_GRIGLIA_INSTAGRAM_3X4.png', 'ANTEPRIMA_GRIGLIA_INSTAGRAM_1X1.png']) {
  if (!fs.existsSync(path.join(root, '03_Anteprime', preview))) errors.push(`Anteprima griglia mancante: ${preview}`);
}
const residualFiles = [];
for (const entry of fs.readdirSync(root, { recursive: true })) {
  const value = typeof entry === 'string' ? entry : entry.name;
  if (path.basename(value) === '.DS_Store') residualFiles.push(value);
}
if (residualFiles.length) errors.push(`File residui .DS_Store: ${residualFiles.length}`);

const report = {
  status: errors.length ? 'FAIL' : 'PASS',
  validated_at: new Date().toISOString(),
  campaign: root,
  expected_contents: 24,
  expected_assets_per_platform: 98,
  format_counts: formatCounts,
  platforms: platformStats,
  source_masters: { total: masters.length, unique: new Set(masterSignatures).size },
  dimensions: { Reel: '1080x1920', Story: '1080x1920', Post: '1080x1350', Carosello: '1080x1350' },
  errors,
};
fs.mkdirSync(path.join(root, '08_QA'), { recursive: true });
fs.writeFileSync(path.join(root, '08_QA', 'VALIDATION.json'), `${JSON.stringify(report, null, 2)}\n`);

for (const error of errors) console.error(`ERROR: ${error}`);
console.log(`${report.status}: 24 contenuti, ${Object.values(platformStats).reduce((sum, item) => sum + item.images, 0)} PNG, ${Object.values(platformStats).reduce((sum, item) => sum + item.audio, 0)} audio, ${masters.length} master.`);
process.exit(errors.length ? 1 : 0);
