import { afterEach, expect, it, vi } from 'vitest'
import type { Request } from 'express'
import { createDatabase } from 'server/database'
import type { Context } from 'server/schema/builder'
import type { ConceptRecord } from '../../../KBConcept'
import type { OrderProductRecord } from '../interfaces'
import type { UserRecord } from '../../../User/interfaces'
import { llmClient } from 'server/llm/client'
import {
  recommendOrderProducts,
  selectRecommendations,
  parseRecommendationQueries,
} from './recommendations'

const product = (
  id: number,
  price: number | null,
  extra: Partial<ConceptRecord> = {},
): ConceptRecord => ({
  id: String(id),
  price,
  name: 'Шар',
  type: 'old:page:31:modDocument',
  createdAt: new Date(),
  updatedAt: new Date(),
  uri: '/ball',
  description: null,
  intro: null,
  hast: null,
  tv: null,
  contentMode: 'default',
  searchable: true,
  content: null,
  image: null,
  packCount: null,
  size: null,
  available: true,
  createdById: 'visitor',
  code: null,
  parentId: null,
  rootId: null,
  path: null,
  quality: 0,
  visibility: 'public',
  data: null,
  lat: null,
  lng: null,
  ...extra,
})
const item: OrderProductRecord = {
  id: 'line',
  orderId: 'cart',
  productId: '10',
  name: 'Main product',
  image: null,
  uri: '/main',
  price: 100050,
  oldPrice: null,
  quantity: 3,
}

afterEach(() => {
  vi.restoreAllMocks()
})

it('selects unique available products in the 20–50 percent unit price range', () => {
  const rows = [
    product(1, 200.1),
    product(2, 200.09),
    product(3, 500.25),
    product(4, 500.26),
    product(1, 200.1),
    product(10, 300),
    product(6, 400, { available: false }),
  ]
  expect(
    selectRecommendations(rows, [item], item.price).map(({ id }) => id),
  ).toEqual(['1', '3'])
  expect(
    selectRecommendations(
      Array.from({ length: 20 }, (_, i) => product(100 + i, 300)),
      [item],
      item.price,
    ),
  ).toHaveLength(10)
})
it('accepts only a list of search phrases', () => {
  expect(
    parseRecommendationQueries('["качели", " качели ", "кольца"]'),
  ).toEqual(['качели', 'кольца'])
  for (const value of [
    'not JSON',
    '{}',
    '[1]',
    '[" "]',
    '```json\n["качели"]\n```',
  ]) {
    expect(parseRecommendationQueries(value)).toEqual([])
  }
})

it('rejects another user’s cart before starting the agent', async () => {
  const db = createDatabase()
  const error = vi.spyOn(console, 'error').mockImplementation(() => undefined)
  const run = vi.spyOn(llmClient, 'complete')
  try {
    const [user] = await db<UserRecord>('User')
      .insert({ id: 'visitor', status: 'newbie' })
      .returning('*')
    const ctx: Context = {
      db,
      currentUser: user,
      knex: undefined,
      req: {} as Request,
    }
    await expect(
      recommendOrderProducts(ctx, 'someone-elses-cart', 'line'),
    ).resolves.toEqual([])
    expect(error).toHaveBeenCalledWith(expect.any(String), {
      orderId: 'someone-elses-cart',
    })
    expect(run).not.toHaveBeenCalled()
  } finally {
    await db.destroy()
  }
})

it('asks the model once without tools and stops if no query list is returned', async () => {
  const db = createDatabase()
  const run = vi
    .spyOn(llmClient, 'complete')
    .mockImplementation(async (request) => {
      expect(request.tools).toBeUndefined()
      expect(JSON.parse(String(request.messages[1].content))).toMatchObject({
        addedProduct: '10',
        unitPrice: 1000.5,
        cart: [
          { productId: '10', quantity: 3 },
          { productId: '20', quantity: 1 },
        ],
      })
      return new Response(
        JSON.stringify({ choices: [{ message: { content: 'No list' } }] }),
      )
    })
  try {
    const [user] = await db<UserRecord>('User')
      .insert({ id: 'visitor', status: 'newbie' })
      .returning('*')
    await db('Order').insert({
      id: 'cart',
      userId: user.id,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    await db('OrderProduct').insert([
      item,
      { ...item, id: 'line2', productId: '20', quantity: 1 },
    ])
    const ctx: Context = {
      db,
      currentUser: user,
      knex: db,
      req: {
        socket: { localPort: 3000 },
        get: () => 'Bearer user-token',
      } as unknown as Request,
    }
    expect(await recommendOrderProducts(ctx, 'cart', 'line')).toEqual([])
    expect(run).toHaveBeenCalledOnce()
  } finally {
    await db.destroy()
  }
})
