import { expect, it } from 'vitest'
import { ask, dialogue } from './helpers'

it('смена заказа — уточняет связь нового события с текущей заявкой', async () => {
  const session = dialogue()
  await ask(
    session,
    'Хочу 30 шаров и цифру 18 на день рождения сегодня, Развилка 38.',
  )
  const turn = await ask(session, 'Теперь нужны шары на последний звонок.')
  expect(turn.answer).toMatch(/\?/)
  expect(turn.answer).toMatch(
    /отдельн|нов(?:ый|ому|ое|ая)|тот же|предыдущ|текущ|друг/i,
  )
  expect(
    turn.calls.some((call) => call.name === 'register_contact_request'),
  ).toBe(false)
})
