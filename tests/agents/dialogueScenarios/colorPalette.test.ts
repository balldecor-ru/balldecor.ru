import { expect, it } from 'vitest'
import { ask, dialogue } from './helpers'

it('палитра — даёт совет по цветам и завершает консультацию', async () => {
  const turn = await ask(
    dialogue(),
    'Какие цвета шаров сочетаются для 18-летия парня?',
  )
  expect(turn.answer).toMatch(/ч[её]рн|син|серебр|золот|бел/i)
  expect(turn.answer).not.toMatch(
    /оставьте.{0,40}(?:контакт|телефон)|ваш (?:Telegram|WhatsApp|email)/i,
  )
  expect(
    turn.calls.some((call) => call.name === 'register_contact_request'),
  ).toBe(false)
})
