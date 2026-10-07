export { getSwaTools } from './catalog'
export type { SwaTool } from './catalog'
export { SITE_URL as SWA_URL } from '@/lib/site-config'
export { toolSlug, toolHref } from './paths'
export const contactHref = (topic: string) => 'https://wa.me/393477196603?text=' + encodeURIComponent('Ciao SWA, vorrei ' + topic)
