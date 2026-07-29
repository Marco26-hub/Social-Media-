const siteUrl = 'https://www.socialautomation.app'
const key = '7733113c911856fd13b528aa0a548168'
const paths = [
  '/',
  '/servizi',
  '/chi-siamo',
  '/consulenza',
  '/privacy',
  '/cookie-policy',
  '/termini',
  '/trasparenza-ai',
  '/llms.txt',
]

const payload = {
  host: new URL(siteUrl).host,
  key,
  keyLocation: `${siteUrl}/${key}.txt`,
  urlList: paths.map(path => `${siteUrl}${path}`),
}

const response = await fetch('https://api.indexnow.org/indexnow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(payload),
})

if (!response.ok) {
  const body = await response.text()
  throw new Error(`IndexNow ${response.status}: ${body.slice(0, 300)}`)
}

console.log(`IndexNow: inviate ${payload.urlList.length} URL (${response.status}).`)
