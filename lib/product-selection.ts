type ProductRow = Record<string, unknown>

export function resolveGenerationProduct(
  products: ProductRow[],
  requestedProductId: unknown,
  requestedProductName: unknown,
): { product: ProductRow; missingRequestedId: boolean } {
  const productId = typeof requestedProductId === 'string' ? requestedProductId.trim() : ''
  const productName = typeof requestedProductName === 'string'
    ? requestedProductName.trim().toLocaleLowerCase('it')
    : ''

  if (productId) {
    const match = products.find(product => String(product.product_id || '').trim() === productId)
    return { product: match || {}, missingRequestedId: !match }
  }

  if (productName) {
    const match = products.find(product => (
      String(product.nome_prodotto || '').trim().toLocaleLowerCase('it') === productName
    ))
    return { product: match || {}, missingRequestedId: false }
  }

  return { product: products[0] || {}, missingRequestedId: false }
}
