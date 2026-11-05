import { expect, it } from 'vitest'
import { ask, dialogue, skill } from './helpers'
import { chatStorage } from '../../../server/chat/storage'
import { sendEmail } from '../../../server/schema/types/ChatMessage/helpers/sendEmail'

it('срочное обращение — сохраняет контакт и детали с подтверждённым статусом', async () => {
  const session = dialogue()
  const turn = await ask(
    session,
    'Свяжитесь со мной в MAX по +7 999 000 11 22. Хочу 30 шаров и цифру 18, Развилка дом 38, сегодня к 18:00. Передайте это менеджеру.',
  )
  skill(turn, 'balldecor-order-contact')
  expect(
    turn.calls.some((call) => call.name === 'register_contact_request'),
    turn.answer,
  ).toBe(true)
  const receipt = turn.messages
    .filter((entry) => entry.role === 'tool')
    .map(
      (entry) =>
        (
          JSON.parse(entry.content) as {
            result: { id?: string; status?: string }
          }
        ).result,
    )
    .find((result) => result.status === 'saved')
  const receiptId = receipt?.id
  if (!receiptId || !session.token) {
    throw new Error('Требуется подтверждение сохранения обращения')
  }
  const stored = await chatStorage.read(receiptId)
  expect(stored).toHaveLength(1)
  expect(stored[0].content).toMatch(/30/)
  expect(stored[0].content).toMatch(/38/)
  expect(stored[0].content).toMatch(/18/)
  expect(stored[0].content).toMatch(/999/)
  expect(stored[0].content).toContain(session.token.split('.')[0])
  expect(turn.answer).toContain(receiptId)
  expect(turn.answer).toMatch(/сохран|зарегистр/i)
  expect(turn.answer).not.toMatch(
    /менеджер (?:уже )?(?:видит|прочитал)|через 10.?15/i,
  )
  expect(sendEmail).toHaveBeenCalled()
})
