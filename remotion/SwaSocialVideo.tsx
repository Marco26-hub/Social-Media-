import React from 'react'
import {
  AbsoluteFill,
  Audio,
  Img,
  interpolate,
  OffthreadVideo,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from 'remotion'

export type SwaSocialVideoProps = {
  mediaUrls: string[]
  sourceVideoUrl?: string
  audioUrl?: string
  durationInFrames: number
  keepOriginalAudio?: boolean
  musicVolume?: number
  motionPreset?: 'trending' | 'premium' | 'minimal' | 'classico'
  hook?: string
  cta?: string
  logoUrl?: string
  brandName?: string
}

const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const

function fitCopy(value: string | undefined, maxLength: number): string {
  const clean = String(value || '').replace(/\s+/g, ' ').trim()
  if (clean.length <= maxLength) return clean
  const shortened = clean.slice(0, maxLength + 1)
  const lastSpace = shortened.lastIndexOf(' ')
  return `${shortened.slice(0, lastSpace > maxLength * 0.65 ? lastSpace : maxLength).trim()}...`
}

function StillLayer({ src, opacity, progress, direction, motionPreset }: {
  src: string
  opacity: number
  progress: number
  direction: number
  motionPreset: NonNullable<SwaSocialVideoProps['motionPreset']>
}) {
  const scaleRange = motionPreset === 'trending' ? [1.08, 1.18] : motionPreset === 'minimal' ? [1.08, 1.1] : [1.09, 1.14]
  const travel = motionPreset === 'trending' ? 18 : motionPreset === 'minimal' ? 4 : 10
  const backgroundScale = interpolate(progress, [0, 1], scaleRange, clamp)
  const translateX = interpolate(progress, [0, 1], [direction * -travel, direction * travel], clamp)
  const artworkScale = interpolate(
    progress,
    [0, 1],
    motionPreset === 'trending' ? [1.01, 1.065] : motionPreset === 'minimal' ? [1, 1.018] : [1.005, 1.045],
    clamp,
  )
  const artworkTranslateY = interpolate(progress, [0, 1], motionPreset === 'trending' ? [18, -18] : [9, -9], clamp)
  const artworkTranslateX = interpolate(progress, [0, 1], [direction * -10, direction * 10], clamp)

  return (
    <AbsoluteFill style={{ opacity, overflow: 'hidden', backgroundColor: '#f4f2ee' }}>
      <Img
        src={src}
        style={{
          position: 'absolute',
          inset: -70,
          width: 'calc(100% + 140px)',
          height: 'calc(100% + 140px)',
          objectFit: 'cover',
          filter: 'blur(34px) saturate(0.9) brightness(0.72)',
          transform: `scale(${backgroundScale}) translateX(${translateX * 0.35}px)`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: 'rgba(8, 10, 14, 0.12)' }} />
      <AbsoluteFill style={{ padding: '72px 54px', boxSizing: 'border-box' }}>
        <Img
          src={src}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            transform: `translate(${artworkTranslateX}px, ${artworkTranslateY}px) scale(${artworkScale})`,
            filter: 'drop-shadow(0 22px 42px rgba(0,0,0,0.28))',
          }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  )
}

function EditorialOverlay({ hook, cta, logoUrl, brandName }: {
  hook?: string
  cta?: string
  logoUrl?: string
  brandName?: string
}) {
  const frame = useCurrentFrame()
  const { durationInFrames, fps } = useVideoConfig()
  const hookIn = spring({ frame, fps, config: { damping: 16, stiffness: 130 }, durationInFrames: 22 })
  const hookOut = interpolate(frame, [Math.min(78, durationInFrames * 0.32), Math.min(96, durationInFrames * 0.4)], [1, 0], clamp)
  const hookOpacity = Math.min(hookIn, hookOut)
  const ctaStart = Math.max(0, durationInFrames - Math.round(fps * 3.1))
  const ctaIn = spring({ frame: frame - ctaStart, fps, config: { damping: 18, stiffness: 120 }, durationInFrames: 24 })
  const hookCopy = fitCopy(hook, 96)
  const ctaCopy = fitCopy(cta, 84)
  const hookFontSize = hookCopy.length > 72 ? 46 : hookCopy.length > 48 ? 54 : 64
  const ctaFontSize = ctaCopy.length > 64 ? 46 : ctaCopy.length > 42 ? 54 : 64

  return (
    <AbsoluteFill style={{ pointerEvents: 'none', fontFamily: 'Arial, Helvetica, sans-serif' }}>
      {(logoUrl || brandName) && (
        <div style={{ position: 'absolute', top: 88, left: 72, display: 'flex', alignItems: 'center', gap: 18 }}>
          {logoUrl && <Img src={logoUrl} style={{ width: 154, maxHeight: 76, objectFit: 'contain' }} />}
          {!logoUrl && brandName && (
            <span style={{ color: '#fff', fontSize: 34, fontWeight: 800, textShadow: '0 2px 16px rgba(0,0,0,0.7)' }}>{brandName}</span>
          )}
        </div>
      )}
      {hookCopy && (
        <div style={{
          position: 'absolute',
          bottom: 285,
          left: 72,
          width: 820,
          opacity: hookOpacity,
          transform: `translateY(${interpolate(hookIn, [0, 1], [32, 0], clamp)}px)`,
        }}>
          <div style={{ width: 82, height: 8, backgroundColor: '#ff3d6e', marginBottom: 24 }} />
          <div style={{ color: '#fff', fontSize: hookFontSize, lineHeight: 1.06, fontWeight: 900, letterSpacing: 0, overflowWrap: 'anywhere', textShadow: '0 4px 24px rgba(0,0,0,0.82)' }}>
            {hookCopy}
          </div>
        </div>
      )}
      {ctaCopy && frame >= ctaStart && (
        <>
          <AbsoluteFill style={{ background: 'linear-gradient(to top, rgba(4,7,12,0.88), rgba(4,7,12,0) 45%)', opacity: ctaIn }} />
          <div style={{
            position: 'absolute',
            left: 72,
            right: 72,
            bottom: 170,
            opacity: ctaIn,
            transform: `translateY(${interpolate(ctaIn, [0, 1], [40, 0], clamp)}px)`,
          }}>
            <div style={{ color: '#ff4f7b', fontSize: 30, lineHeight: 1, fontWeight: 900, marginBottom: 18 }}>TOCCA A TE</div>
            <div style={{ color: '#fff', fontSize: ctaFontSize, lineHeight: 1.08, fontWeight: 900, letterSpacing: 0, overflowWrap: 'anywhere', textShadow: '0 4px 24px rgba(0,0,0,0.82)' }}>
              {ctaCopy}
            </div>
          </div>
        </>
      )}
    </AbsoluteFill>
  )
}

function StillSequence({ mediaUrls, motionPreset }: {
  mediaUrls: string[]
  motionPreset: NonNullable<SwaSocialVideoProps['motionPreset']>
}) {
  const frame = useCurrentFrame()
  const { durationInFrames } = useVideoConfig()
  const count = Math.max(1, mediaUrls.length)
  const framesPerSlide = durationInFrames / count
  const currentIndex = Math.min(count - 1, Math.floor(frame / framesPerSlide))
  const nextIndex = Math.min(count - 1, currentIndex + 1)
  const localProgress = (frame - currentIndex * framesPerSlide) / framesPerSlide
  const transitionStart = motionPreset === 'trending' ? 0.76 : motionPreset === 'minimal' ? 0.9 : 0.82
  const crossfade = interpolate(localProgress, [transitionStart, 1], [0, 1], clamp)
  const exposureFlash = motionPreset === 'trending'
    ? interpolate(localProgress, [0.76, 0.83, 0.9], [0, 0.1, 0], clamp)
    : 0

  return (
    <AbsoluteFill style={{ backgroundColor: '#f4f2ee' }}>
      <StillLayer
        src={mediaUrls[currentIndex]}
        opacity={1}
        progress={localProgress}
        direction={currentIndex % 2 === 0 ? 1 : -1}
        motionPreset={motionPreset}
      />
      {nextIndex !== currentIndex && (
        <StillLayer
          src={mediaUrls[nextIndex]}
          opacity={crossfade}
          progress={Math.max(0, (localProgress - transitionStart) / (1 - transitionStart))}
          direction={nextIndex % 2 === 0 ? 1 : -1}
          motionPreset={motionPreset}
        />
      )}
      {exposureFlash > 0 && <AbsoluteFill style={{ backgroundColor: `rgba(255,255,255,${exposureFlash})` }} />}
    </AbsoluteFill>
  )
}

export function SwaSocialVideo({
  mediaUrls,
  sourceVideoUrl,
  audioUrl,
  durationInFrames,
  keepOriginalAudio = true,
  musicVolume,
  motionPreset = 'premium',
  hook,
  cta,
  logoUrl,
  brandName,
}: SwaSocialVideoProps) {
  const frame = useCurrentFrame()
  const { fps } = useVideoConfig()
  const baseMusicVolume = musicVolume ?? (sourceVideoUrl ? 0.24 : 0.7)
  const fadeFrames = Math.max(1, Math.round(fps * 0.65))
  const fadeIn = interpolate(frame, [0, fadeFrames], [0, baseMusicVolume], clamp)
  const fadeOut = interpolate(
    frame,
    [Math.max(0, durationInFrames - fadeFrames), Math.max(1, durationInFrames - 1)],
    [baseMusicVolume, 0],
    clamp,
  )

  return (
    <AbsoluteFill style={{ backgroundColor: '#f4f2ee' }}>
      {sourceVideoUrl ? (
        <>
          <OffthreadVideo
            src={sourceVideoUrl}
            muted
            style={{
              position: 'absolute',
              inset: -70,
              width: 'calc(100% + 140px)',
              height: 'calc(100% + 140px)',
              objectFit: 'cover',
              filter: 'blur(34px) brightness(0.7)',
            }}
          />
          <AbsoluteFill style={{ backgroundColor: 'rgba(8, 10, 14, 0.12)' }} />
          <AbsoluteFill style={{ padding: '40px 30px', boxSizing: 'border-box' }}>
            <OffthreadVideo
              src={sourceVideoUrl}
              muted={!keepOriginalAudio}
              volume={keepOriginalAudio ? 1 : 0}
              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
            />
          </AbsoluteFill>
        </>
      ) : mediaUrls.length ? (
        <StillSequence mediaUrls={mediaUrls} motionPreset={motionPreset} />
      ) : (
        <AbsoluteFill style={{ backgroundColor: '#f4f2ee' }} />
      )}
      {audioUrl && (
        <Audio
          src={audioUrl}
          endAt={durationInFrames}
          volume={() => Math.min(fadeIn, fadeOut)}
          name="SWA custom soundtrack"
        />
      )}
      <EditorialOverlay hook={hook} cta={cta} logoUrl={logoUrl} brandName={brandName} />
    </AbsoluteFill>
  )
}
