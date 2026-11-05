import { expect, it } from 'vitest'
import { ask, dialogue, readPage } from './helpers'

it('самовывоз — читает адрес, ориентир и порядок предварительного звонка', async () => {
  const turn = await ask(dialogue(), 'Откуда забрать шары и как найти вход?')
  readPage(turn, '/contacts.html')
  expect(turn.answer).toMatch(/Развилк/)
  expect(turn.answer).toMatch(/46/)
  expect(turn.answer).toMatch(/Дикси|цокол|козыр/i)
  expect(turn.answer).toMatch(/звон|позвон/i)
})
