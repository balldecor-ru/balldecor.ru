import { expect, it } from 'vitest'
import { ask, dialogue } from './helpers'

it('MAX — предлагает его как отдельный канал связи', async () => {
  const turn = await ask(
    dialogue(),
    'Мне удобно общаться в MAX. Как оставить вам заявку?',
  )
  expect(turn.answer).toMatch(/MAX|Макс/i)
  expect(turn.answer).toMatch(/контакт|номер|телефон|ник|сообщ/i)
  expect(turn.answer).not.toMatch(
    /(?:MAX|Макс)\s*\(Telegram\)|(?:MAX|Макс).{0,12}не (?:мессенджер|существует)/i,
  )
})
