import React from 'react'
import { Composition, registerRoot } from 'remotion'
import { SwaSocialVideo, type SwaSocialVideoProps } from './SwaSocialVideo'

const defaultProps: SwaSocialVideoProps = {
  mediaUrls: [],
  durationInFrames: 240,
  keepOriginalAudio: true,
  motionPreset: 'premium',
  hook: '',
  cta: '',
  logoUrl: '',
  brandName: '',
}

function RemotionRoot() {
  return (
    <Composition
      id="SwaSocialVideo"
      component={SwaSocialVideo}
      width={1080}
      height={1920}
      fps={30}
      durationInFrames={240}
      defaultProps={defaultProps}
      calculateMetadata={({ props }) => ({
        durationInFrames: Math.max(30, Math.round(props.durationInFrames || 240)),
      })}
    />
  )
}

registerRoot(RemotionRoot)
