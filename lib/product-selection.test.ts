import assert from 'node:assert/strict'
import { test } from 'playwright/test'
import { resolveGenerationProduct } from './product-selection'

const products = [
  { product_id: 'P001', nome_prodotto: 'Blazer', link_prodotto: '/blazer' },
  { product_id: 'P002', nome_prodotto: 'Camicia Riva', link_prodotto: '/camicia' },
]

test('uses the exact selected catalog product instead of the first product', () => {
  const result = resolveGenerationProduct(products, 'P002', 'Camicia Riva')
  assert.equal(result.product.link_prodotto, '/camicia')
  assert.equal(result.missingRequestedId, false)
})

test('a manually typed unknown name never inherits another product link', () => {
  const result = resolveGenerationProduct(products, undefined, 'Prodotto esterno')
  assert.deepEqual(result.product, {})
})

test('reports an invalid explicit product id without substituting it', () => {
  const result = resolveGenerationProduct(products, 'P404', undefined)
  assert.deepEqual(result.product, {})
  assert.equal(result.missingRequestedId, true)
})
