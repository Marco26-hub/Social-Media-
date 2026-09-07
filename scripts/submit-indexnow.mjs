// Su Vercel gira anche per le anteprime di ramo: li' l'invio segnalerebbe le
// URL di produzione a ogni push, senza che sia cambiato nulla di pubblicato.
if (process.env.VERCEL_ENV && process.env.VERCEL_ENV !== 'production') {
  console.log(`IndexNow: saltato, ambiente ${process.env.VERCEL_ENV}.`)
  process.exit(0)
}

const siteUrl = 'https://www.socialautomation.app'
const key = '7733113c911856fd13b528aa0a548168'
// Le URL arrivano dalla sitemap, non da una lista scritta a mano: quella
// precedente si era fermata a nove pagine mentre il sito ne ha quarantasei.
// Da riga di comando si possono passare percorsi singoli per un avviso mirato.
const daRiga = process.argv.slice(2).map(p => (p.startsWith('/') ? p : '/' + p))
const paths = daRiga.length
  ? daRiga
  : [...(await (await fetch(`${siteUrl}/sitemap.xml`)).text()).matchAll(/<loc>([^<]+)<\/loc>/g)]
      .map(x => x[1].replace(siteUrl, ''))
      .concat(['/llms.txt', '/llms-full.txt'])

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
