import { expect, it } from 'vitest'
import { ask, dialogue, readPage } from './helpers'

it('льготная доставка — применяет опубликованное исключение для посёлка', async () => {
  const turn = await ask(
    dialogue(),
    'Заказ на 3000 рублей. Сколько стоит доставка в посёлок совхоза имени Ленина?',
  )
  readPage(turn, '/delivery-test.html')
  expect(turn.answer).toMatch(/бесплатн|0\s*(?:руб|₽)/i)
  expect(turn.calls.some((call) => call.name === 'web_search')).toBe(false)
})
