import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { campaignToday, isCalendarDate, moveCampaignDates, validateCampaignStart } from './campaign-start-date'
import { publicationTime, readyCampaignWithStart, validateReadyCampaign } from './ready-campaign'

const now = new Date('2026-10-09T23:30:00Z')
test('start date validates real dates and the client calendar, not the server UTC day', () => {
  assert.equal(campaignToday('Europe/Rome', now), '2026-10-10')
  assert.equal(campaignToday('America/New_York', now), '2026-10-09')
  assert.equal(validateCampaignStart('', 'Europe/Rome', now), undefined)
  assert.equal(validateCampaignStart('2026-10-10', 'Europe/Rome', now), '2026-10-10')
  assert.throws(() => validateCampaignStart('2026-10-09', 'Europe/Rome', now), /passato/)
  for (const invalid of ['2026-02-30', '2026-13-01', '10/10/2026', 123, '2026-1-01']) {
    assert.equal(isCalendarDate(invalid), false)
    assert.throws(() => validateCampaignStart(invalid, 'Europe/Rome', now), /non valida/)
  }
  assert.equal(isCalendarDate('2028-02-29'), true)
})

test('start date translates all offsets across DST and month boundaries without changing content', () => {
  const contents = [{ date: '2026-10-01', order: 1, week: 1, media: ['final.mp4'] },
    { date: '2026-10-04', order: 2, week: 1, media: ['cover.png'] },
    { date: '2026-10-28', order: 3, week: 4, media: ['final2.mp4'] }]
  const shifted = moveCampaignDates(contents, '2026-10-24')
  assert.deepEqual(shifted.map(c => c.date), ['2026-10-24', '2026-10-27', '2026-11-20'])
  assert.equal(contents[0].date, '2026-10-01')
  assert.equal(shifted[0].media, contents[0].media)
  assert.deepEqual(shifted.map(c => [c.order, c.week]), contents.map(c => [c.order, c.week]))
  assert.deepEqual(moveCampaignDates(contents.slice(0, 2), '2026-12-30').map(c => c.date), ['2026-12-30', '2027-01-02'])
  assert.deepEqual(moveCampaignDates(contents.slice(0, 2), '2028-02-28').map(c => c.date), ['2028-02-28', '2028-03-02'])
})

test('ready import keeps two social adaptations, originals and hours; rejects impossible manifest dates', () => {
  const input = { campaign_cycle_id: 'campaign', expected_contents: 2, expected_publications: 4,
    contents: [1, 2].map(order => ({ order, content_key: `post_0${order}`, week: 1, date: `2026-10-0${order}`, format: 'post',
      copy: { instagram: { hook: 'IG hook', caption: 'IG caption' }, facebook: { hook: 'FB hook', caption: 'FB caption' } } })) }
  const original = validateReadyCampaign(input).manifest!
  assert.ok(original)
  assert.equal(readyCampaignWithStart(original), original)
  const shifted = readyCampaignWithStart(original, '2026-10-31')
  assert.deepEqual(shifted.contents.map(c => c.date), ['2026-10-31', '2026-11-01'])
  assert.equal(shifted.contents[0].copy, original.contents[0].copy)
  assert.equal(shifted.campaign_cycle_id, original.campaign_cycle_id)
  assert.equal(shifted.expected_publications, 4)
  assert.equal(publicationTime('instagram', 'post'), '19:00')
  assert.equal(publicationTime('facebook', 'post'), '20:00')
  assert.ok(validateReadyCampaign({ ...input, contents: [{ ...input.contents[0], date: '2026-02-30' }] }).errors.some(e => /date non valida/.test(e)))
})
