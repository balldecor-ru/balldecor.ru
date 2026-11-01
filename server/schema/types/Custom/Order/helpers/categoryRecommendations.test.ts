import { afterEach, expect, it, vi } from 'vitest'
import { llmClient } from 'server/llm/client'
import {
  chooseAccessoryIds,
  parseRecommendationIds,
} from './categoryRecommendations'
import type { OrderProductRecord } from '../interfaces'

const added: OrderProductRecord = {
  id: 'line',
  orderId: 'cart',
  productId: 'old:page:10',
  name: 'Playground',
  quantity: 2,
  price: 1000000,
  oldPrice: null,
  image: null,
  uri: '/playground',
}
afterEach(() => vi.restoreAllMocks())

it('accepts only JSON string IDs and removes duplicates', () => {
  expect(
    parseRecommendationIds('["old:page:42","old:page:17","old:page:42"]'),
  ).toEqual(['old:page:42', 'old:page:17'])
  for (const input of [
    '',
    '[]',
    '[42,17]',
    'IDs: 42,17',
    '42,',
    '0',
    '-1',
    '1.2',
    '9007199254740992',
  ]) {
    expect(parseRecommendationIds(input)).toEqual([])
  }
})

it('sends the complete candidate list and cart without tools; ignores IDs outside the list', async () => {
  const candidates = [
    { id: 'old:page:42', name: 'Swing', price: 3000 },
    { id: 'old:page:17', name: 'Rings', price: 500 },
    { id: 'old:page:60', name: 'Climbing wall', price: 12000 },
  ]
  const complete = vi
    .spyOn(llmClient, 'complete')
    .mockResolvedValue(
      new Response(
        JSON.stringify({
          choices: [
            {
              message: {
                content:
                  '["old:page:42","old:page:999","old:page:42","old:page:17"]',
              },
            },
          ],
        }),
      ),
    )
  expect(
    await chooseAccessoryIds(
      added,
      [added],
      candidates,
      new AbortController().signal,
    ),
  ).toEqual({
    ids: ['old:page:42', 'old:page:17'],
    response: '["old:page:42","old:page:999","old:page:42","old:page:17"]',
  })
  expect(complete).toHaveBeenCalledOnce()
  const request = complete.mock.calls[0][0]
  expect(request.tools).toBeUndefined()
  expect(JSON.parse(String(request.messages[1].content))).toEqual({
    addedProduct: {
      id: 'old:page:10',
      name: 'Playground',
      unitPrice: 10000,
    },
    minPrice: 2000,
    maxPrice: 5000,
    cart: [
      {
        id: 'old:page:10',
        name: 'Playground',
        quantity: 2,
        unitPrice: 10000,
      },
    ],
    candidates: candidates.map(({ id, name, price }) => ({
      id,
      name,
      price,
    })),
  })
})
