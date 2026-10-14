import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { buildChromeIntentUrl, cleanPageUrl, detectInAppBrowser } from './in-app-browser'

// ATTENZIONE: questi user-agent sono ricostruiti dalla forma pubblica degli UA di
// Instagram e Facebook, NON catturati da un dispositivo reale. Dopo il lancio vanno
// confrontati con uno user-agent vero del titolare (Instagram e Facebook, su iPhone
// e su Android): le versioni cambiano di continuo, ma i marcatori che il modulo
// cerca (Instagram, FBAN, FBAV, FB_IAB) devono restare quelli.
const UA = {
  instagramIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 Instagram 340.0.0.18.109 (iPhone14,5; iOS 17_5; it_IT; it-IT; scale=3.00; 1170x2532; 604214221)',
  instagramAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36 Instagram 340.0.0.36.109 Android (34/14; 420dpi; 1080x2340; samsung; SM-S911B; dm1q; qcom; it_IT; 618421339)',
  facebookIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/FBIOS;FBAV/470.0.0.37.109;FBBV/615423890;FBDV/iPhone14,5;FBMD/iPhone;FBSN/iOS;FBSV/17.5;FBSS/3;FBID/phone;FBLC/it_IT;FBOP/5]',
  facebookAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B Build/UP1A.231005.007; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/125.0.6422.165 Mobile Safari/537.36 [FB_IAB/FB4A;FBAV/470.0.0.46.109;]',
  messengerIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/21F90 [FBAN/MessengerForiOS;FBAV/468.0.0.34.113]',
  safariIos: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.5 Mobile/15E148 Safari/604.1',
  chromeAndroid: 'Mozilla/5.0 (Linux; Android 14; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.6422.165 Mobile Safari/537.36',
  chromeDesktop: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
}

test('detectInAppBrowser: Instagram e Facebook, iOS e Android', () => {
  assert.deepEqual(detectInAppBrowser(UA.instagramIos), { app: 'instagram', os: 'ios' })
  assert.deepEqual(detectInAppBrowser(UA.instagramAndroid), { app: 'instagram', os: 'android' })
  assert.deepEqual(detectInAppBrowser(UA.facebookIos), { app: 'facebook', os: 'ios' })
  assert.deepEqual(detectInAppBrowser(UA.facebookAndroid), { app: 'facebook', os: 'android' })
  assert.deepEqual(detectInAppBrowser(UA.messengerIos), { app: 'facebook', os: 'ios' })
})

test('detectInAppBrowser: i browser veri non scattano', () => {
  assert.deepEqual(detectInAppBrowser(UA.safariIos), { app: null, os: 'ios' })
  assert.deepEqual(detectInAppBrowser(UA.chromeAndroid), { app: null, os: 'android' })
  assert.deepEqual(detectInAppBrowser(UA.chromeDesktop), { app: null, os: 'other' })
  for (const none of [null, undefined, '']) assert.deepEqual(detectInAppBrowser(none), { app: null, os: 'other' })
})

test('detectInAppBrowser: Instagram vince se compaiono anche i marcatori di Facebook', () => {
  // UA inventato apposta: se un giorno un'app mescolasse i due, vale l'ordine dichiarato.
  const both = `${UA.instagramIos} [FBAN/FBIOS;FBAV/470.0.0.37.109]`
  assert.deepEqual(detectInAppBrowser(both), { app: 'instagram', os: 'ios' })
})

test('detectInAppBrowser: un input che non è una stringa non scatta e non lancia', () => {
  // Il tipo ammette solo string, null e undefined, ma il valore arriva da un header.
  // L'array e l'oggetto con toString sono i casi insidiosi: RegExp.test li convertirebbe
  // in stringa e troverebbe "Instagram" anche se lo user-agent non è una stringa.
  const notStrings = [42, true, {}, ['Instagram 340.0.0.18.109'], { toString: () => 'Instagram 340.0.0.18.109' }]
  for (const bad of notStrings) assert.deepEqual(detectInAppBrowser(bad as unknown as string), { app: null, os: 'other' })
})

test('cleanPageUrl toglie query e hash', () => {
  assert.equal(cleanPageUrl('https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn?fbclid=abc#x'), 'https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn')
  assert.equal(cleanPageUrl('http://x.it/a'), null)
  assert.equal(cleanPageUrl('non un url'), null)
})

test('cleanPageUrl non lascia uscire le credenziali dell’URL', () => {
  const clean = cleanPageUrl('https://utente:segreto@www.socialautomation.app/download/k7f3q9xzm2p4v8wn?fbclid=abc#x')
  assert.equal(clean, 'https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn')
  for (const leak of ['utente', 'segreto', '@']) assert.ok(!clean?.includes(leak), leak)
})

test('cleanPageUrl tiene la porta, ma non quella di default', () => {
  assert.equal(cleanPageUrl('https://localhost:3000/download/k7f3q9xzm2p4v8wn?x=1'), 'https://localhost:3000/download/k7f3q9xzm2p4v8wn')
  // Il parser toglie da solo la 443: non deve ricomparire.
  assert.equal(cleanPageUrl('https://www.socialautomation.app:443/a'), 'https://www.socialautomation.app/a')
})

test('buildChromeIntentUrl: intent verso Chrome con ripiego https, senza query', () => {
  assert.equal(
    buildChromeIntentUrl('https://www.socialautomation.app/download/k7f3q9xzm2p4v8wn?fbclid=abc'),
    'intent://www.socialautomation.app/download/k7f3q9xzm2p4v8wn#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fwww.socialautomation.app%2Fdownload%2Fk7f3q9xzm2p4v8wn;end',
  )
  assert.equal(buildChromeIntentUrl('http://x.it/a'), null)
  assert.equal(buildChromeIntentUrl('non un url'), null)
})

test('buildChromeIntentUrl: con la porta host e porta restano uniti, anche nel ripiego', () => {
  assert.equal(
    buildChromeIntentUrl('https://localhost:3000/download/k7f3q9xzm2p4v8wn?fbclid=abc#x'),
    'intent://localhost:3000/download/k7f3q9xzm2p4v8wn#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Flocalhost%3A3000%2Fdownload%2Fk7f3q9xzm2p4v8wn;end',
  )
})

test('buildChromeIntentUrl non lascia uscire le credenziali dell’URL', () => {
  const intent = buildChromeIntentUrl('https://utente:segreto@www.socialautomation.app/download/k7f3q9xzm2p4v8wn')
  assert.equal(
    intent,
    'intent://www.socialautomation.app/download/k7f3q9xzm2p4v8wn#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=https%3A%2F%2Fwww.socialautomation.app%2Fdownload%2Fk7f3q9xzm2p4v8wn;end',
  )
  for (const leak of ['utente', 'segreto', '@', '%40']) assert.ok(!intent?.includes(leak), leak)
})

test('cleanPageUrl e buildChromeIntentUrl: un input che non è una stringa dà null', () => {
  // L'array con un URL dentro è il caso insidioso: `new URL([...])` lo converte in
  // stringa e lo accetta, quindi serve il controllo di tipo esplicito.
  const notStrings = [null, undefined, 42, {}, ['https://x.it/a'], { toString: () => 'https://x.it/a' }]
  for (const bad of notStrings) {
    assert.equal(cleanPageUrl(bad as unknown as string), null)
    assert.equal(buildChromeIntentUrl(bad as unknown as string), null)
  }
})

test('cleanPageUrl e buildChromeIntentUrl: solo https assoluto, mai altri schemi né percorsi relativi', () => {
  // Il risultato finisce in un href: javascript:, data: e intent: dati in ingresso non devono passare.
  const rejected = ['javascript:alert(1)', 'data:text/html,x', 'ftp://x.it/a', 'intent://x.it/a#Intent;end', '//x.it/a', '/download/k7f3q9xzm2p4v8wn', '', ' ']
  for (const bad of rejected) {
    assert.equal(cleanPageUrl(bad), null, bad)
    assert.equal(buildChromeIntentUrl(bad), null, bad)
  }
})
