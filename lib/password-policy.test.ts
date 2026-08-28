import assert from 'node:assert/strict'
import { test } from 'playwright/test'

import { PASSWORD_MAX_LEN, PASSWORD_MIN_LEN, passwordProblem } from './password-policy'

test('accepts a password that meets the policy', () => {
  assert.equal(passwordProblem('unaPasswordLunga'), null)
})

test('rejects an empty or too short password', () => {
  assert.match(String(passwordProblem('')), /obbligatoria/i)
  assert.match(String(passwordProblem('a'.repeat(PASSWORD_MIN_LEN - 1))), /almeno 8 caratteri/i)
  assert.equal(passwordProblem('a'.repeat(PASSWORD_MIN_LEN)), null)
})

test('rejects a password past the bcrypt-driven upper bound', () => {
  assert.equal(passwordProblem('a'.repeat(PASSWORD_MAX_LEN)), null)
  assert.match(String(passwordProblem('a'.repeat(PASSWORD_MAX_LEN + 1))), /troppo lunga/i)
})

test('on a change, the new password must differ from the current one', () => {
  // Il secondo argomento è passato solo dal cambio password: la registrazione
  // non deve mai inciampare in questo controllo.
  assert.match(String(passwordProblem('stessaPassword1', 'stessaPassword1')), /diversa/i)
  assert.equal(passwordProblem('nuovaPassword1', 'vecchiaPassword1'), null)
  assert.equal(passwordProblem('unaPasswordLunga'), null)
})
