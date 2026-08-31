import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { auditPianoCiclo, finestraCiclo } from './plan-audit'
import { PACKAGES } from './packages'

const OGGI = '2026-09-01'

// Contenuto "sano": copy completo, un media, fase dichiarata, nessuna nota REVISE.
function contenuto(over: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id_contenuto: 'C1',
    data_pubblicazione: '2026-09-01',
    canale: 'instagram',
    formato: 'post',
    status: 'DA_APPROVARE',
    hook: 'Hook unico numero uno',
    caption: 'Caption completa del contenuto',
    funnel_stage: 'ATTENZIONE',
    link_media_1: 'https://cdn.test/1.jpg',
    ...over,
  }
}

// Ciclo completo e corretto: 24 contenuti distribuiti sulle 4 settimane, hook
// tutti diversi, arco che va da attenzione ad azione.
function cicloCompleto(): Record<string, unknown>[] {
  const fasi = ['ATTENZIONE', 'FIDUCIA', 'SCELTA', 'AZIONE']
  return Array.from({ length: 24 }, (_, i) => {
    const settimana = Math.floor(i / 6)
    return contenuto({
      id_contenuto: `C${i + 1}`,
      data_pubblicazione: `2026-09-${String(1 + settimana * 7 + (i % 6)).padStart(2, '0')}`,
      hook: `Hook distinto numero ${i + 1} con parole tutte sue ${i + 1}`,
      caption: `Caption distinta numero ${i + 1} che parla di argomenti diversi ${i + 1}`,
      funnel_stage: fasi[settimana],
      formato: i % 6 === 5 ? 'reel' : i % 3 === 0 ? 'carousel' : 'post',
      link_media_1: 'https://cdn.test/a.jpg',
      link_media_2: 'https://cdn.test/b.jpg',
      link_media_3: 'https://cdn.test/c.jpg',
    })
  })
}

function checkById(report: ReturnType<typeof auditPianoCiclo>, id: string) {
  const found = report.checks.find(c => c.id === id)
  assert.ok(found, `check "${id}" assente dal referto`)
  return found
}

test('the audit window follows the 28-day cycle, not the calendar month', () => {
  // Il piano parte da OGGI: un ciclo iniziato il 28 agosto vive quasi tutto a
  // settembre. Con una finestra per mese solare risulterebbe dimezzato.
  const rows = [
    contenuto({ data_pubblicazione: '2026-08-28' }),
    contenuto({ data_pubblicazione: '2026-09-20' }),
  ]
  const finestra = finestraCiclo(rows, '2026-09-01')
  assert.equal(finestra.dal, '2026-08-28')
  assert.equal(finestra.al, '2026-09-24')
})

test('a complete cycle passes every blocking check', () => {
  const report = auditPianoCiclo({ rows: cicloCompleto(), quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  assert.equal(report.pianificati, 24)
  assert.equal(report.settimanePiene, 4)
  assert.equal(report.bloccanti, 0, `bloccanti inattesi: ${report.checks.filter(c => c.stato === 'blocco').map(c => `${c.id}=${c.dettaglio}`).join(' | ')}`)
  assert.equal(report.pronto, true)
})

test('generating only phase 1-2 is reported as a missing half, not as a healthy plan', () => {
  // È il caso vero: settimane 1-2 generate, 3-4 mai fatte. Prima nessun
  // controllo lo diceva: il calendario mostrava solo dei contenuti.
  const soloFase1 = cicloCompleto().filter(row => String(row.data_pubblicazione) < '2026-09-15')
  const report = auditPianoCiclo({ rows: soloFase1, quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  assert.equal(report.pronto, false)
  assert.equal(checkById(report, 'settimane').stato, 'blocco')
  assert.match(checkById(report, 'settimane').dettaglio, /Settimana 3 e 4/)
  assert.equal(checkById(report, 'copertura').stato, 'blocco')
  assert.match(checkById(report, 'copertura').dettaglio, /mancano 12/)
})

test('weeks 3-4 that never close the funnel are flagged', () => {
  // Il difetto dei piani generati prima della correzione della fase: la fase 2
  // ripeteva ATTENZIONE/FIDUCIA invece di portare a scelta e azione.
  const rows = cicloCompleto().map(row => ({
    ...row,
    funnel_stage: String(row.data_pubblicazione) < '2026-09-15' ? 'ATTENZIONE' : 'FIDUCIA',
  }))
  const report = auditPianoCiclo({ rows, quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  assert.equal(checkById(report, 'arco').stato, 'attenzione')
  assert.match(checkById(report, 'arco').dettaglio, /non chiudono il funnel/)
})

test('a carousel with a single slide is blocking, a reel with one MP4 is not', () => {
  const rows = cicloCompleto()
  rows[0] = contenuto({ id_contenuto: 'CAR1', formato: 'carousel', data_pubblicazione: '2026-09-02', hook: 'Hook carosello con una sola slide caricata', link_media_1: 'https://cdn.test/solo.jpg' })
  rows[1] = contenuto({ id_contenuto: 'REEL1', formato: 'reel', data_pubblicazione: '2026-09-03', hook: 'Hook reel con un solo file video montato', link_media_1: 'https://cdn.test/clip.mp4' })
  const report = auditPianoCiclo({ rows, quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  const media = checkById(report, 'media')
  assert.equal(media.stato, 'blocco')
  assert.deepEqual(media.contenuti, ['CAR1'])
})

test('coordinated variants of one concept on two socials are not duplicates', () => {
  // Instagram + Facebook dello stesso concept sono il prodotto venduto, non una
  // ripetizione: segnalarli renderebbe il referto rumore puro.
  const rows = [
    contenuto({ id_contenuto: 'IG1', canale: 'instagram', content_key: 'reel-01', hook: 'Stesso hook coordinato sui due social' }),
    contenuto({ id_contenuto: 'FB1', canale: 'facebook', content_key: 'reel-01', hook: 'Stesso hook coordinato sui due social', data_pubblicazione: '2026-09-02' }),
  ]
  const report = auditPianoCiclo({ rows, quota: 0, pkg: null, oggi: OGGI })
  assert.equal(checkById(report, 'duplicati').stato, 'ok')
  assert.equal(checkById(report, 'adattamenti-canale').stato, 'attenzione')
})

test('the same hook reused on the same channel is reported', () => {
  const rows = [
    contenuto({ id_contenuto: 'A1', hook: 'Il bowling non si vende da solo mai' }),
    contenuto({ id_contenuto: 'A2', data_pubblicazione: '2026-09-09', hook: 'Il bowling non si vende da solo mai' }),
  ]
  const report = auditPianoCiclo({ rows, quota: 0, pkg: null, oggi: OGGI })
  assert.equal(checkById(report, 'duplicati').stato, 'attenzione')
  assert.deepEqual(checkById(report, 'duplicati').contenuti, ['A2'])
})

test('leftover generation slots and self-declared REVISE gates surface', () => {
  const rows = cicloCompleto()
  rows[2] = contenuto({ id_contenuto: 'ROTTO', data_pubblicazione: '2026-09-04', status: 'ERRORE_MANUALE', note: '[GENERATION_FALLBACK] blocco non completato', hook: 'Slot rimasto da completare nel calendario' })
  rows[3] = contenuto({ id_contenuto: 'REVISE1', data_pubblicazione: '2026-09-05', hook: 'Contenuto che il modello stesso vuole rivedere', production_notes: 'PROFILE_COHERENCE: REVISE tre cover uguali' })
  const report = auditPianoCiclo({ rows, quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  assert.equal(checkById(report, 'slot').stato, 'blocco')
  assert.deepEqual(checkById(report, 'slot').contenuti, ['ROTTO'])
  assert.equal(checkById(report, 'gate').stato, 'attenzione')
  assert.deepEqual(checkById(report, 'gate').contenuti, ['REVISE1'])
})

test('rejected content does not count towards the sold quota', () => {
  const rows = cicloCompleto()
  rows[0] = { ...rows[0], status: 'NON_APPROVATO' }
  const report = auditPianoCiclo({ rows, quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  assert.equal(report.pianificati, 23)
  assert.equal(checkById(report, 'copertura').stato, 'blocco')
})

test('the blog article stays outside the social quota', () => {
  const rows = [...cicloCompleto(), contenuto({ id_contenuto: 'BLOG', canale: 'blog', formato: 'articolo', data_pubblicazione: '2026-09-10' })]
  const report = auditPianoCiclo({ rows, quota: 24, pkg: PACKAGES.crescita, oggi: OGGI })
  assert.equal(report.pianificati, 24)
  assert.equal(checkById(report, 'copertura').stato, 'ok')
})

test('placeholder themes left by a failed generation are blocking', () => {
  const rows = [contenuto({ id_contenuto: 'PLACEHOLDER', tema: 'Slot del piano da completare' })]
  const report = auditPianoCiclo({ rows, quota: 0, pkg: null, oggi: OGGI })

  assert.equal(checkById(report, 'segnaposto').stato, 'blocco')
  assert.deepEqual(checkById(report, 'segnaposto').contenuti, ['PLACEHOLDER'])
})

test('the same media file on different concepts is reported but a coordinated cross-post is allowed', () => {
  const rows = [
    contenuto({ id_contenuto: 'IG1', campaign_content_key: 'post_01', canale: 'instagram', link_media_1: 'https://cdn.test/shared.jpg' }),
    contenuto({ id_contenuto: 'FB1', campaign_content_key: 'post_01', canale: 'facebook', data_pubblicazione: '2026-09-02', link_media_1: 'https://cdn.test/shared.jpg' }),
    contenuto({ id_contenuto: 'OTHER', campaign_content_key: 'post_02', canale: 'instagram', data_pubblicazione: '2026-09-03', link_media_1: 'https://cdn.test/shared.jpg' }),
  ]
  const report = auditPianoCiclo({ rows, quota: 0, pkg: null, oggi: OGGI })

  assert.equal(checkById(report, 'media-duplicati').stato, 'attenzione')
  assert.deepEqual(checkById(report, 'media-duplicati').contenuti, ['OTHER', 'IG1', 'FB1'])
})
