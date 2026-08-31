import assert from 'node:assert/strict'
import test from 'node:test'
import { calculateCampaignAssetRequirements } from './campaign-asset-requirements'

test('calculates the exact Bowling case-study production and folder totals', () => {
  const result = calculateCampaignAssetRequirements(
    { reels: 10, carousels: 6, stories: 4, posts: 4 },
    { platformCount: 2, reelScenes: 5, storyFrames: 3, carouselSlideCounts: [7, 5, 5, 5, 5, 5] },
  )
  assert.equal(result.concepts, 24)
  assert.deepEqual(result.breakdown, { postImages: 4, storyImages: 12, carouselImages: 32, reelImages: 50 })
  assert.equal(result.uniqueImageMasters, 98)
  assert.equal(result.folderImageFiles, 196)
  assert.equal(result.renderedVerticalVideos, 28)
  assert.equal(result.folderAudioFiles, 28)
})

test('an uploaded MP4 replaces five generated Reel images', () => {
  const result = calculateCampaignAssetRequirements(
    { reels: 4, carousels: 0, stories: 0, posts: 0 },
    { platformCount: 2, reelVideos: 1 },
  )
  assert.equal(result.uniqueImageMasters, 15)
  assert.equal(result.folderImageFiles, 30)
  assert.equal(result.folderMp4Files, 2)
})

test('rejects a carousel count that does not match the editorial plan', () => {
  assert.throws(() => calculateCampaignAssetRequirements(
    { reels: 0, carousels: 2, stories: 0, posts: 0 },
    { carouselSlideCounts: [5] },
  ), /Servono 2 conteggi slide/)
})
