import { expect, it } from 'vitest'
import { ask, dialogue, readPage } from './helpers'

it('печать 2+0 — различает таблицы и объясняет число цветов и сторон', async () => {
  const turn = await ask(
    dialogue(),
    'Хочу печать 2+0 на 100 шаров. Что это значит и сколько стоит?',
  )
  readPage(turn, '/pechat-na-sharah.html')
  expect(turn.answer).toMatch(/3[\s\u00a0]*500/)
  expect(turn.answer).toMatch(/дв[аух].*цвет|2.*цвет/i)
  expect(turn.answer).toMatch(/одн.*сторон/i)
})
