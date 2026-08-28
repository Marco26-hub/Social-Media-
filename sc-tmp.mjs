import path from 'node:path'
import { selectComposition } from '@remotion/renderer'
try {
  const c = await selectComposition({ serveUrl: path.join(process.cwd(),'.remotion-bundle'), id:'SwaSocialVideo',
    inputProps:{ mediaUrls:[], durationInFrames:240, keepOriginalAudio:true, motionPreset:'premium' }, logLevel:'error' })
  console.log('OK senza .map ->', c.id, c.width+'x'+c.height, c.durationInFrames+'f')
} catch(e){ console.log('FALLITO senza .map ->', String(e.message).slice(0,200)) }
