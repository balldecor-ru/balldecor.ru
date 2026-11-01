import { afterAll, beforeAll, expect, it } from 'vitest'
import Database from 'better-sqlite3'
import type { Request } from 'express'
import { db } from 'server/database'
import type { Context } from 'server/schema/builder'
import type { UserRecord } from 'server/schema/types/User/interfaces'
import { addProduct } from 'server/schema/types/Custom/Order/helpers/service'
import { recommendCategoryProducts } from 'server/schema/types/Custom/Order/helpers/categoryRecommendations'
import type { OrderProductRecord } from 'server/schema/types/Custom/Order/interfaces'

let ctx: Context
beforeAll(async () => {
  for (const name of ['CHAT_API_BASE_URL', 'CHAT_API_KEY', 'CHAT_MODEL']) {
    if (!process.env[name]) {
      throw new Error(`${name} is required for live recommendation tests`)
    }
  }
  expect(process.env.DATABASE_FILENAME).toBe(':memory:')
  const catalog = new Database(
    process.env.RECOMMENDATION_CATALOG_FILENAME ||
      'server/database/data/database.sqlite',
    { readonly: true },
  )
  try {
    const rows = catalog
      .prepare(
        "SELECT * FROM KBConcept WHERE type = 'old:page:31:modDocument' AND visibility = 'public' AND searchable = 1 AND price > 0",
      )
      .all() as {
      id: string
      createdById: string
      parentId: string | null
      rootId: string | null
    }[]
    expect(rows.length).toBeGreaterThan(0)
    for (const id of new Set(rows.map((row) => row.createdById))) {
      await db('User').insert({ id }).onConflict('id').ignore()
    }
    for (const row of rows) {
      await db('KBConcept').insert({ ...row, parentId: null, rootId: null })
    }
  } finally {
    catalog.close()
  }
  const [user] = await db<UserRecord>('User')
    .insert({ id: 'recommendation-visitor', status: 'newbie' })
    .returning('*')
  ctx = { db, currentUser: user, req: { headers: {} } as Request }
})
afterAll(async () => {
  await db.destroy()
})

it('подбирает дополнения к двум товарам импортированного каталога BallDecor', async () => {
  const sources = await db<{ id: string }>('KBConcept as product')
    .select('product.id')
    .where(function () {
      this.where('product.available', true).orWhereNull('product.available')
    })
    .whereExists(
      db('KBConcept as candidate')
        .select('candidate.id')
        .whereRaw(
          'round(candidate.price * 100) BETWEEN ceil(product.price * 100 / 5) AND floor(product.price * 100 / 2)',
        )
        .where(function () {
          this.where('candidate.available', true).orWhereNull(
            'candidate.available',
          )
        }),
    )
    .orderBy('product.price', 'desc')
    .orderBy('product.id')
    .limit(2)
  expect(sources).toHaveLength(2)
  for (const { id: productId } of sources) {
    const order = await addProduct(ctx, { productId, quantity: 2 })
    const added = await db<OrderProductRecord>('OrderProduct')
      .where({ orderId: order.id })
      .first()
    if (!added) {
      throw new Error('Missing cart product')
    }
    const products = await recommendCategoryProducts(ctx, order.id, added.id)
    const logs = await db('SearchLog').where({ productId })
    process.stdout.write(
      JSON.stringify(
        {
          productId,
          name: added.name,
          price: added.price / 100,
          searches: logs.map((log) => ({
            query: log.query,
            results: JSON.parse(log.results),
            error: log.error,
          })),
          recommended: products.map((item) => ({
            id: item.id,
            name: item.name,
            price: item.price,
          })),
        },
        null,
        2,
      ) + '\n',
    )
    expect(logs.length).toBeGreaterThan(0)
    for (const log of logs) {
      expect(log.error).toBeNull()
      expect(log.type).toBe('RECOMMENDATIONS')
      const parameters = JSON.parse(log.parameters)
      expect(parameters.query).toBe(log.query)
      expect(parameters.candidateCount).toBeGreaterThan(0)
      expect(parameters.candidateCount).toBeLessThanOrEqual(100)
      expect(JSON.parse(log.results).products.length).toBeLessThanOrEqual(10)
      expect(JSON.parse(log.results).categories).toEqual([])
    }
    expect(products.length).toBeLessThanOrEqual(10)
    expect(new Set(products.map(({ id }) => id)).size).toBe(products.length)
    for (const product of products) {
      expect(product.id).not.toBe(productId)
      expect(product.available).not.toBe(false)
      expect(product.visibility).toBe('public')
      expect(product.searchable).toBe(true)
      expect(Math.round((product.price ?? 0) * 100)).toBeGreaterThanOrEqual(
        Math.ceil(added.price / 5),
      )
      expect(Math.round((product.price ?? 0) * 100)).toBeLessThanOrEqual(
        Math.floor(added.price / 2),
      )
    }
  }
})
