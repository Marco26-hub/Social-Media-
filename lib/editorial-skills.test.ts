import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { PACKAGES, packageMixForPeriod } from './packages'
import {
  buildEditorialSkillContext,
  resolveEditorialSkill,
} from './editorial-skills'

test('editorial skill is selected automatically from the active package', () => {
  assert.equal(resolveEditorialSkill(null), 'standard')
  assert.equal(resolveEditorialSkill(PACKAGES.presenza), 'swa-package-visual')
  assert.equal(resolveEditorialSkill(PACKAGES.crescita), 'swa-package-visual')
})

test('Presenza skill injects strategy, grid and image requirements', () => {
  const pkg = PACKAGES.presenza
  const context = buildEditorialSkillContext({
    skill: 'swa-package-visual',
    pkg,
    piano: packageMixForPeriod(pkg, 'mensile'),
    periodo: 'mensile',
    chunkIndex: 0,
    totalChunks: 4,
    target: 4,
  })

  assert.match(context, /ATTENZIONE/)
  assert.match(context, /griglia Instagram/i)
  assert.match(context, /5 scene/)
  assert.match(context, /PRESENZA/)
  assert.match(context, /GRID_ROLE/)
  assert.match(context, /TREND_EFFECT/)
  assert.match(context, /TREND_CHECK/)
  assert.match(context, /animazione scena per scena/)
  assert.match(context, /catena di conversione completa/)
  assert.match(context, /performance_hypothesis/)
  assert.match(context, /vendite attribuite/)
  assert.match(context, /PROFILE_COHERENCE/)
  assert.match(context, /cornice visiva mensile/)
  assert.match(context, /PROCESSO AGENZIA SWA/)
  assert.match(context, /production_cycle_stage/)
})

test('Crescita skill uses the package-specific growth direction', () => {
  const pkg = PACKAGES.crescita
  const context = buildEditorialSkillContext({
    skill: 'swa-package-visual',
    pkg,
    piano: packageMixForPeriod(pkg, 'mensile'),
    periodo: 'mensile',
    chunkIndex: 3,
    totalChunks: 4,
    target: 6,
  })

  assert.match(context, /AZIONE/)
  assert.match(context, /UGC credibile/)
  assert.match(context, /ipotesi creative testabili/)
  assert.match(context, /CRESCITA/)
})
