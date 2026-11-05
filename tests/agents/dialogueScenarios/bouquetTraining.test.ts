import { expect, it } from 'vitest'
import { ask, dialogue } from './helpers'

it('состав фонтана — различает пожелание покупателя и обучающий пример', async () => {
  const session = dialogue()
  await ask(
    session,
    'Хочу фонтан из 15 латексных шаров чёрного, белого и золотого цветов.',
  )
  const turn = await ask(
    session,
    'А теперь обсудим обучение: стандартный фонтан компании состоит из 9 цветных, 3 прозрачных с конфетти и 3 фольгированных. Это пример для будущих консультаций.',
  )
  expect(turn.answer).toMatch(
    /правил|пример|предлож|соглас|подтвержд|владел|обуч/i,
  )
  expect(turn.answer).not.toMatch(
    /оставьте.{0,30}контакт|обновил[аи]?.{0,20}заказ|добавил[аи]?.{0,20}заказ/i,
  )
  expect(
    turn.calls.some((call) => call.name === 'register_contact_request'),
  ).toBe(false)
})
