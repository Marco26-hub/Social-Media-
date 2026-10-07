export function ecosystemRewrites(env = process.env) {
  const zones = [['/academy', env.SWA_ACADEMY_ORIGIN], ['/tools', env.SWA_MARKETPLACE_ORIGIN]]
  return zones.filter(([, origin]) => Boolean(origin)).map(([prefix, origin]) => {
    const url = new URL(origin)
    if (!['http:', 'https:'].includes(url.protocol) || url.pathname !== '/' || url.username || url.password) {
      throw new Error(`Invalid internal origin for ${prefix}`)
    }
    return { source: `${prefix}/:path*`, destination: `${url.origin}${prefix}/:path*` }
  })
}
