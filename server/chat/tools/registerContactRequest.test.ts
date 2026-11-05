import { afterEach, expect, it, vi } from 'vitest'
import type { Request } from 'express'
import { createDatabase } from '../../database'
import { ChatStorage } from '../storage'
import { createFeedback } from '../../schema/types/ChatMessage/helpers/feedback'
import { registerContactRequestTool } from './registerContactRequest'
import { createToolContext } from '../testing/context'

const databases: ReturnType<typeof createDatabase>[] = []
afterEach(async () => {
  await Promise.all(databases.splice(0).map((db) => db.destroy()))
})

it('связывает обращение с исходным чатом и сохраняет один результат при повторах', async () => {
  const database = createDatabase()
  databases.push(database)
  const storage = new ChatStorage(database)
  const chatId = (await storage.issue()).split('.')[0]
  const send = vi.fn().mockResolvedValue(undefined)
  let feedback = createFeedback(send, Date.now, storage)
  const req = {
    get: () => 'https://balldecor.ru',
    socket: { remoteAddress: '127.0.0.1' },
  } as unknown as Request
  const context = createToolContext({
    storage,
    chatId,
    registerContactRequest: async (input, current) => {
      const token = await storage.issueContactRequest(
        current.chatId,
        input.contacts,
        input.message,
      )
      await feedback.submit(
        {
          ...input,
          token,
          message: 'Диалог: ' + current.chatId + '\n\n' + input.message,
        },
        req,
      )
      return { id: token.split('.')[0], status: 'saved' }
    },
  })
  const tool = registerContactRequestTool.prepare({
    reasoning: 'Сохраняю',
    contacts: '@visitor',
    message: '30 шаров сегодня',
  })
  const [a, b] = await Promise.all([
    tool.execute(context),
    tool.execute(context),
  ])
  expect(a).toBe(b)
  feedback = createFeedback(send, Date.now, new ChatStorage(database))
  expect(await tool.execute(context)).toBe(a)
  const receipt = JSON.parse(a) as { id: string; status: string }
  expect(receipt.status).toBe('saved')
  expect(await storage.read(receipt.id)).toMatchObject([
    { content: expect.stringContaining(chatId) },
  ])
  expect(await storage.read(receipt.id)).toHaveLength(1)
  expect(send).toHaveBeenCalledTimes(1)
  const otherChatId = (await storage.issue()).split('.')[0]
  const otherToken = await storage.issueContactRequest(
    otherChatId,
    '@visitor',
    '30 шаров сегодня',
  )
  expect(otherToken.split('.')[0]).not.toBe(receipt.id)
})
