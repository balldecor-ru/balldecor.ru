import { expect, it } from 'vitest'
import { ask, dialogue, readPage, skill } from './helpers'

it('печать 1+0 — читает прайс и называет цену выбранного тиража', async () => {
  const turn = await ask(
    dialogue(),
    'Сколько стоит печать 1+0 на 100 шарах и когда будет готово?',
  )
  readPage(turn, '/pechat-na-sharah.html')
  skill(turn, 'balldecor-printing')
  expect(turn.answer).toMatch(/2[\s\u00a0]*200/)
  expect(turn.answer).toMatch(/дат|срок|когда|готов/i)
})
