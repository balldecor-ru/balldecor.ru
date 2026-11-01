import type { Knex } from 'knex'
import type { ConceptRecord } from '../../../KBConcept'
import { conceptSearchType } from '../../../KBConcept/search/client'
import { conceptSearchImage } from '../../../KBConcept/search/image'
import type { ProductSnapshot } from '../interfaces'

export async function readProduct(
  db: Knex,
  productId: string,
): Promise<ProductSnapshot> {
  const product = await db<ConceptRecord>('KBConcept')
    .where({ id: productId, type: conceptSearchType, visibility: 'public' })
    .where(function () {
      this.where('available', true).orWhereNull('available')
    })
    .first()
  if (!product) {
    throw new Error('Товар недоступен')
  }
  const price = Math.round(Number(product.price) * 100)
  if (product.price === null || !Number.isSafeInteger(price) || price <= 0) {
    throw new Error('Некорректная цена товара')
  }
  const route = product.uri
    ? null
    : await db<{ path: string }>('SiteRoute')
        .where('kBConceptId', product.id)
        .first()
  return {
    productId,
    price,
    oldPrice: null,
    name: product.name,
    image: conceptSearchImage(product),
    uri: product.uri || route?.path || `/concepts/${product.id}`,
  }
}
