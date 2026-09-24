import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import {
  buildReadyCampaignPublications,
  parseReadyCampaignManifest,
  validateReadyCampaignManifest,
  type ReadyCampaignManifest,
} from './ready-campaign'

function manifest(): ReadyCampaignManifest {
  return {
    schema_version: 1,
    mode: 'ready_campaign',
    package: 'libero',
    campaign_id: 'campagna-swa',
    campaign_cycle_id: 'swa-2026-10',
    brand: 'SWA',
    month: 'Ottobre 2026',
    strategy: 'Il tuo profilo decide prima di te',
    audience: 'PMI e professionisti',
    cta_keyword: 'PROVA',
    expected_contents: 1,
    expected_publications: 2,
    platforms: ['instagram', 'facebook'],
    mix: { post: 1, carousel: 0, reel: 0, story: 0 },
    contents: [{
      order: 1,
      source_id: 'POST_01_TEST',
      content_key: 'post_01',
      week: 1,
      date: '2026-10-01',
      format: 'post',
      phase: 'ATTENZIONE',
      objective: 'Awareness',
      intent: 'Far conoscere SWA',
      visual_brief: 'Ritratto editoriale cinematografico',
      media_count: 1,
      audio: null,
      copy: {
        instagram: { hook: 'Hook Instagram', caption: 'Caption Instagram', cta: 'Scrivi PROVA', hashtags: ['#swa'] },
        facebook: { hook: 'Hook Facebook', caption: 'Caption Facebook', cta: 'Contattaci', hashtags: [] },
      },
    }],
  }
}

test('normalizza e valida un manifesto pronto', () => {
  const parsed = parseReadyCampaignManifest(JSON.stringify(manifest()))
  assert.equal(parsed.package, 'libero')
  assert.equal(validateReadyCampaignManifest(parsed).ok, true)
})

test('blocca un manifesto senza hook', () => {
  const value = manifest()
  value.contents[0].copy.instagram.hook = ''
  const result = validateReadyCampaignManifest(value)
  assert.equal(result.ok, false)
  assert.match(result.errors.join('\n'), /hook mancante/)
})

test('abbina i media alla piattaforma e crea id deterministici', () => {
  const value = manifest()
  const assets = [
    { url: 'https://cdn.test/ig.png', platform: 'instagram' as const, content_key: 'post_01', sequence: 1 },
    { url: 'https://cdn.test/fb.png', platform: 'facebook' as const, content_key: 'post_01', sequence: 1 },
  ]
  const first = buildReadyCampaignPublications(value, assets)
  const second = buildReadyCampaignPublications(value, assets)
  assert.equal(first.validation.ok, true)
  assert.equal(first.publications.length, 2)
  assert.match(first.publications[0].media[0].url, /ig\.png/)
  assert.match(first.publications[1].media[0].url, /fb\.png/)
  assert.deepEqual(first.publications.map(item => item.id_contenuto), second.publications.map(item => item.id_contenuto))
})

test('blocca l import quando manca anche un solo media', () => {
  const result = buildReadyCampaignPublications(manifest(), [
    { url: 'https://cdn.test/ig.png', platform: 'instagram', content_key: 'post_01', sequence: 1 },
  ])
  assert.equal(result.validation.ok, false)
  assert.match(result.validation.errors.join('\n'), /facebook: 0 media trovati, 1 attesi/)
})

test('lega un solo audio a ogni Reel usando content_key e piattaforma', () => {
  const value = manifest()
  value.mix = { post: 0, carousel: 0, reel: 1, story: 0 }
  value.contents[0] = {
    ...value.contents[0],
    source_id: 'REEL_01_TEST',
    content_key: 'reel_01',
    format: 'reel',
    audio: {
      title: 'Inspiring Corporate Music — JonasBlakewood',
      source_url: 'https://pixabay.com/music/corporate-inspiring-corporate-music-562847/',
      license: 'Pixabay Content License',
    },
  }
  const assets = [
    { url: 'https://cdn.test/ig.png', kind: 'image' as const, platform: 'instagram' as const, content_key: 'reel_01', sequence: 1 },
    { url: 'https://cdn.test/fb.png', kind: 'image' as const, platform: 'facebook' as const, content_key: 'reel_01', sequence: 1 },
    { url: 'https://cdn.test/ig.mp3', kind: 'audio' as const, platform: 'instagram' as const, content_key: 'reel_01' },
    { url: 'https://cdn.test/fb.mp3', kind: 'audio' as const, platform: 'facebook' as const, content_key: 'reel_01' },
  ]
  const result = buildReadyCampaignPublications(value, assets)
  assert.equal(result.validation.ok, true)
  assert.equal(result.publications[0].audio?.url, 'https://cdn.test/ig.mp3')
  assert.equal(result.publications[1].audio?.url, 'https://cdn.test/fb.mp3')
  assert.equal(result.publications[0].audio_source_url, value.contents[0].audio?.source_url)
})

test('blocca Reel e Story senza audio assegnato', () => {
  const value = manifest()
  value.mix = { post: 0, carousel: 0, reel: 1, story: 0 }
  value.contents[0] = {
    ...value.contents[0],
    source_id: 'REEL_01_TEST',
    content_key: 'reel_01',
    format: 'reel',
    audio: {
      title: 'Traccia test',
      source_url: 'https://pixabay.com/music/example/',
      license: 'Pixabay Content License',
    },
  }
  const result = buildReadyCampaignPublications(value, [
    { url: 'https://cdn.test/ig.png', platform: 'instagram', content_key: 'reel_01', sequence: 1 },
    { url: 'https://cdn.test/fb.png', platform: 'facebook', content_key: 'reel_01', sequence: 1 },
  ])
  assert.equal(result.validation.ok, false)
  assert.match(result.validation.errors.join('\n'), /0 audio trovati, 1 atteso/)
})
