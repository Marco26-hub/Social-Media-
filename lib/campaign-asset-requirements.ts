export type CampaignFormatCounts = {
  posts: number
  stories: number
  carousels: number
  reels: number
}

export type CampaignAssetOptions = {
  platformCount?: number
  storyFrames?: number
  carouselSlides?: number
  carouselSlideCounts?: number[]
  reelScenes?: number
  reelVideos?: number
  includeStoryAudio?: boolean
  includeReelAudio?: boolean
}

export type CampaignAssetRequirements = {
  concepts: number
  uniqueImageMasters: number
  folderImageFiles: number
  suppliedMp4: number
  folderMp4Files: number
  renderedVerticalVideos: number
  uniqueAudioAssignments: number
  folderAudioFiles: number
  breakdown: {
    postImages: number
    storyImages: number
    carouselImages: number
    reelImages: number
  }
}

function count(value: number): number {
  return Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0
}

export function calculateCampaignAssetRequirements(
  formats: CampaignFormatCounts,
  options: CampaignAssetOptions = {},
): CampaignAssetRequirements {
  const posts = count(formats.posts)
  const stories = count(formats.stories)
  const carousels = count(formats.carousels)
  const reels = count(formats.reels)
  const platformCount = Math.max(1, count(options.platformCount ?? 1))
  const storyFrames = Math.max(1, count(options.storyFrames ?? 3))
  const reelScenes = Math.max(1, count(options.reelScenes ?? 5))
  const suppliedMp4 = Math.min(reels, count(options.reelVideos ?? 0))
  const photoReels = reels - suppliedMp4

  let carouselImages = carousels * Math.max(3, count(options.carouselSlides ?? 5))
  if (options.carouselSlideCounts) {
    if (options.carouselSlideCounts.length !== carousels) {
      throw new Error(`Servono ${carousels} conteggi slide, ricevuti ${options.carouselSlideCounts.length}`)
    }
    carouselImages = options.carouselSlideCounts.reduce((sum, slides) => {
      const normalized = count(slides)
      if (normalized < 3 || normalized > 10) throw new Error(`Un carosello deve avere 3-10 slide, ricevute ${slides}`)
      return sum + normalized
    }, 0)
  }

  const breakdown = {
    postImages: posts,
    storyImages: stories * storyFrames,
    carouselImages,
    reelImages: photoReels * reelScenes,
  }
  const uniqueImageMasters = Object.values(breakdown).reduce((sum, value) => sum + value, 0)
  const uniqueAudioAssignments = (options.includeStoryAudio === false ? 0 : stories)
    + (options.includeReelAudio === false ? 0 : reels)

  return {
    concepts: posts + stories + carousels + reels,
    uniqueImageMasters,
    folderImageFiles: uniqueImageMasters * platformCount,
    suppliedMp4,
    folderMp4Files: suppliedMp4 * platformCount,
    renderedVerticalVideos: (stories + photoReels) * platformCount,
    uniqueAudioAssignments,
    folderAudioFiles: uniqueAudioAssignments * platformCount,
    breakdown,
  }
}
