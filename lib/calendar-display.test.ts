import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { calendarDisplayStatus, remoteCalendarTime } from './calendar-display'
import { uniquePublishCopy, repairQueuedText } from './publish-copy'
import { matchesPublishedProof } from './blotato-published-match'

test('scheduled is queued in every view, not published even after its date', () => {
  assert.equal(calendarDisplayStatus({ status: 'PUBBLICATO', blotato_status: 'scheduled' }), 'IN_CODA')
  assert.equal(calendarDisplayStatus({ status: 'PUBBLICATO', blotato_status: 'in-progress' }), 'IN_CODA')
  assert.equal(calendarDisplayStatus({ status: 'PUBBLICATO', blotato_status: 'published' }), 'PUBBLICATO')
  assert.equal(calendarDisplayStatus({ status: 'PUBBLICATO', blotato_status: 'failed' }), 'ERRORE')
  assert.equal(calendarDisplayStatus({ status: 'DA_APPROVARE' }), 'DA_APPROVARE')
})
test('remote schedule is converted to Rome including midnight and daylight saving', () => {
  assert.deepEqual(remoteCalendarTime('2026-10-05T20:00:00Z', 'Europe/Rome'), { day: '2026-10-05', time: '22:00', iso: '2026-10-05T20:00:00.000Z' })
  assert.equal(remoteCalendarTime('2026-10-05T23:00:00Z', 'Europe/Rome')?.day, '2026-10-06')
  assert.equal(remoteCalendarTime('2026-10-26T19:00:00Z', 'Europe/Rome')?.time, '20:00')
  for (const value of ['', '2026-10-05T20:00:00', 'bad']) assert.equal(remoteCalendarTime(value, 'Europe/Rome'), null)
})
test('Oct 6 Facebook opening and Instagram CTA occur only once', () => {
  const hook = 'Contenuti isolati consumano tempo senza creare direzione.'
  assert.equal(uniquePublishCopy(hook, `${hook} SWA coordina il mese.`, 'Condividilo con chi gestisce i social').caption, 'SWA coordina il mese.')
  assert.equal(uniquePublishCopy('Non ti serve un altro post.', 'SWA unisce strategia e visual. Condividilo con chi gestisce i tuoi social.', 'Condividilo con chi gestisce i social').cta, '')
  assert.equal(uniquePublishCopy('Un hook.', 'Un concetto diverso.', 'Scrivi PROVA').cta, 'Scrivi PROVA')
})

test('publication proof never matches another account, platform, month or media', () => {
  const row = { canale: 'instagram', platform_account_id: 'swa', hook: 'Un mese.', link_media_1: 'https://swa/video.mp4' }
  const proof = { createdAt: '2026-10-05T20:00:00Z', platform: 'instagram', content: 'Un mese. Sei mosse.', mediaUrls: ['https://swa/video.mp4'], rawPost: { accountId: 'swa', content: { platform: 'instagram', text: 'Un mese. Sei mosse.', mediaUrls: ['https://swa/video.mp4'] } } }
  const match = (p: Record<string, unknown>) => matchesPublishedProof(row, p, '2026-10-01', '2026-11-01')
  assert.equal(match(proof), true)
  assert.equal(match({ ...proof, rawPost: null }), false)
  assert.equal(match({ ...proof, createdAt: '2026-09-05T20:00:00Z' }), false)
  assert.equal(match({ ...proof, platform: 'facebook' }), false)
  assert.equal(match({ ...proof, mediaUrls: ['https://cdn.blotato/video-copy.mp4'] }), true)
  assert.equal(match({ ...proof, rawPost: { ...proof.rawPost, content: { ...proof.rawPost.content, mediaUrls: ['https://other/video.mp4'] } } }), false)
  assert.equal(match({ ...proof, rawPost: { ...proof.rawPost, accountId: 'other' } }), false)
})

test('queued correction preserves the rest of the published payload text', () => {
  const hook = 'Contenuti isolati consumano tempo senza creare direzione.'
  const text = `${hook}\n\n${hook} SWA coordina il mese.\n\nCondividilo con chi gestisce i social\n\n#SWA`
  assert.equal(repairQueuedText(text, hook, ''), `${hook}\n\nSWA coordina il mese.\n\nCondividilo con chi gestisce i social\n\n#SWA`)
  const ig = 'Un hook.\n\nUna regia. Condividilo con chi gestisce i tuoi social.\n\nCondividilo con chi gestisce i social'
  assert.equal(repairQueuedText(ig, 'Un hook.', 'Condividilo con chi gestisce i social'), 'Un hook.\n\nUna regia. Condividilo con chi gestisce i tuoi social.')
  assert.equal(repairQueuedText('Un testo senza doppioni.', 'Un hook.', 'Scrivi PROVA'), 'Un testo senza doppioni.')
})
