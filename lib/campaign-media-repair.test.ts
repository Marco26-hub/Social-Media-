import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { buildRepairGroups, matchRepairRows, placementFromStoredValue } from './campaign-media-repair'

const assets = Array.from({ length: 5 }, (_, index) => ({
  url: `https://cdn.test/w1-instagram-carosello_02-0${index + 1}.png`,
  week: 1,
  platform: 'instagram' as const,
  content_key: 'carosello_02',
  sequence: index + 1,
  tag: 'carosello' as const,
  kind: 'image' as const,
}))

test('raggruppa e ordina tutte le cinque slide del carosello', () => {
  const groups = buildRepairGroups([...assets].reverse())
  assert.equal(groups.length, 1)
  assert.deepEqual(groups[0].assets.map(asset => asset.sequence), [1, 2, 3, 4, 5])
})

test('riconosce la posizione canonica dal nome storage', () => {
  assert.deepEqual(placementFromStoredValue('https://cdn.test/x/w4-facebook-reel_16-03.png?token=x'), {
    week: 4,
    platform: 'facebook',
    contentKey: 'reel_16',
  })
})

test('riallinea una vecchia card dal primo URL senza cambiare il copy', () => {
  const [group] = buildRepairGroups(assets)
  const matches = matchRepairRows([{
    id: 'row-1',
    canale: 'instagram',
    formato: 'carousel',
    link_media_1: 'https://cdn.test/w1-instagram-carosello_02-01.png',
    link_media_2: 'https://cdn.test/w1-instagram-carosello_02-02.png',
    data_pubblicazione: '2026-10-03',
    ora_pubblicazione: '11:30',
  }], [group])
  assert.equal(matches.length, 1)
  assert.equal(matches[0].method, 'filename')
  assert.equal(matches[0].group.assets.length, 5)
})

test('blocca la sovrascrittura di un contenuto gia schedulato', () => {
  const [group] = buildRepairGroups(assets)
  const [match] = matchRepairRows([{
    id: 'row-1',
    canale: 'instagram',
    formato: 'carousel',
    campaign_content_key: 'carosello_02',
    campaign_week: 1,
    blotato_post_id: 'remote-1',
  }], [group])
  assert.equal(match.locked, true)
})
