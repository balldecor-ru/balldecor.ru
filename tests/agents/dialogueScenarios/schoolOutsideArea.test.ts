import { expect, it } from 'vitest'
import { ask, dialogue, readPage } from './helpers'

it('школа вне зоны — проверяет адрес и предлагает подходящий следующий шаг', async () => {
  const turn = await ask(
    dialogue(),
    'Нужно оформить школу в Крылатском на последний звонок.',
  )
  readPage(turn, '/school-test.html')
  expect(turn.answer).toMatch(/местн|район|Крылатск/i)
  expect(turn.answer).toMatch(/друг|обрат|местн|вне|зон|территор/i)
})
