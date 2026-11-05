import { expect, it } from 'vitest'
import { ask, dialogue, readPage } from './helpers'

it('сброс шаров — использует описание механизма и минимум услуги', async () => {
  const turn = await ask(
    dialogue(),
    'Как происходит сброс шаров из сетки? Какое минимальное количество?',
  )
  readPage(turn, '/drop-test.html')
  expect(turn.answer).toMatch(/300/)
  expect(turn.answer).toMatch(/вручную|ручн|чек[ау]/i)
})
