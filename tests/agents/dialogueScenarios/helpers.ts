import { createRequire } from 'node:module'
import { randomBytes } from 'node:crypto'
import { createServer, type Server } from 'node:http'
import express from 'express'
import { afterAll, beforeAll, expect, vi } from 'vitest'
import type { Root, Element, Text } from 'hast'
import { schema } from '../../../server/schema'
import { db } from '../../../server/database'
import { setupChat } from '../../../server/chat'
import { chatStorage } from '../../../server/chat/storage'
import type { StoredMessage } from '../../../server/chat/storage'

vi.mock('../../../server/schema/types/ChatMessage/helpers/sendEmail', () => ({
  sendEmail: vi.fn().mockResolvedValue(undefined),
}))

const { graphql } = createRequire(import.meta.url)(
  'graphql',
) as typeof import('graphql')
let server: Server
let base: string
const text = (value: string): Text => ({ type: 'text', value })
const element = (
  tagName: string,
  ...children: Array<Element | Text>
): Element => ({ type: 'element', tagName, properties: {}, children })
const tree = (...children: Array<Element | Text>): Root => ({
  type: 'root',
  children,
})

async function page(
  uri: string,
  name: string,
  content: string | Root,
): Promise<void> {
  await db('KBConcept').insert({
    id: uri,
    uri,
    name,
    type: 'agent-test-page',
    createdById: 'agent-scenario-owner',
    visibility: 'public',
    contentMode: typeof content === 'string' ? 'default' : 'hast',
    content: typeof content === 'string' ? content : null,
    hast: typeof content === 'string' ? null : JSON.stringify(content),
  })
}

beforeAll(async () => {
  for (const name of ['CHAT_API_BASE_URL', 'CHAT_API_KEY', 'CHAT_MODEL']) {
    if (!process.env[name]?.trim()) {
      throw new Error(name + ' требуется для тестов агента')
    }
  }
  expect(process.env.DATABASE_FILENAME).toBe(':memory:')
  await db('User').insert({ id: 'agent-scenario-owner' })
  // Сценарные условия существуют в изолированной тестовой базе.
  await page(
    '/pechat-na-sharah.html',
    'Печать на шарах',
    tree(
      element('h1', text('Печать на шарах')),
      element('h2', text('1+0 — один цвет на одной стороне')),
      element(
        'table',
        element(
          'tr',
          element('th', text('Тираж')),
          element('th', text('Цена за тираж')),
        ),
        element(
          'tr',
          element('td', text('100 штук')),
          element('td', text('2200 руб.')),
        ),
        element(
          'tr',
          element('td', text('200 штук')),
          element('td', text('3700 руб.')),
        ),
      ),
      element('h2', text('2+0 — два цвета на одной стороне')),
      element(
        'table',
        element(
          'tr',
          element('th', text('Тираж')),
          element('th', text('Цена за тираж')),
        ),
        element(
          'tr',
          element('td', text('100 штук')),
          element('td', text('3500 руб.')),
        ),
      ),
      element(
        'p',
        text(
          'Цены включают печать на готовых шарах. Дату изготовления согласуем после проверки макета. Макет векторный.',
        ),
      ),
    ),
  )
  await page(
    '/delivery-test.html',
    'Доставка шаров',
    [
      'Утверждённые условия сценария.',
      'Посёлок совхоза имени Ленина и Развилка входят в зону бесплатной доставки при сумме заказа от 1000 руб.',
      'Школы обслуживаются в Развилке, Орехово-Борисово, Зябликово и Братеево.',
      'Возможность срочной доставки подтверждает менеджер.',
    ].join('\n'),
  )
  await page(
    '/school-test.html',
    'Оформление школ',
    'Школьное оформление выполняется в Развилке, Орехово-Борисово, Зябликово и Братеево. Для остальных районов подходят местные оформители.',
  )
  await page(
    '/drop-test.html',
    'Сброс шаров',
    tree(
      element('h1', text('Сброс шаров')),
      element(
        'p',
        text(
          'Минимум 300 шаров. Шары надуты воздухом. Для раскрытия сетки ответственный человек вручную вытягивает чеку. Высотный монтаж согласуется отдельно.',
        ),
      ),
    ),
  )
  await page(
    '/contacts.html',
    'Контактная информация',
    tree(
      element('h1', text('Самовывоз')),
      element(
        'p',
        text(
          'Посёлок Развилка, дом 46. Цокольный этаж магазина Дикси. Вход с парковки под козырьком. Перед приездом обязательно позвонить.',
        ),
      ),
      element(
        'p',
        text(
          'Телефон +7 (495) 212-05-69. Для переписки доступны MAX, Telegram, WhatsApp, email office@balldecor.ru.',
        ),
      ),
    ),
  )
  const app = express()
  setupChat({ app, storage: chatStorage })
  app.post('/api', express.json(), async (req, res) => {
    res.json(
      await graphql({
        schema,
        source: req.body.query,
        variableValues: req.body.variables,
        operationName: req.body.operationName,
        contextValue: { db, req, currentUser: null },
      }),
    )
  })
  server = createServer(app)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Требуется адрес тестового сервера')
  }
  base = 'http://127.0.0.1:' + address.port
})

afterAll(async () => {
  if (server) {
    server.closeAllConnections()
    await new Promise<void>((resolve) => server.close(() => resolve()))
  }
  await db.destroy()
})

interface Dialogue {
  token?: string
  visitorKey: string
}
interface Turn {
  answer: string
  messages: StoredMessage[]
  calls: Array<{
    name: string
    arguments: {
      uri?: string
      id?: string
      contacts?: string
      message?: string
    }
  }>
}
export const dialogue = (): Dialogue => ({
  visitorKey: randomBytes(32).toString('hex'),
})

export async function ask(session: Dialogue, message: string): Promise<Turn> {
  const response = await fetch(base + '/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Visitor-Key': session.visitorKey,
      'X-Chat-Page-Url': 'https://balldecor.ru/',
      ...(session.token ? { 'dialog-token': session.token } : {}),
    },
    body: JSON.stringify({ message, stream: false }),
    signal: AbortSignal.timeout(130000),
  })
  const result = (await response.json()) as {
    id: string
    success: boolean
    content: string
  }
  expect(response.ok, JSON.stringify(result)).toBe(true)
  expect(result.success).toBe(true)
  session.token = response.headers.get('X-Dialog-Token') ?? session.token
  if (!session.token) {
    throw new Error('Требуется токен диалога')
  }
  const messages = (await chatStorage.read(
    session.token.split('.')[0],
  )) as StoredMessage[]
  const answer = messages.find((entry) => entry.id === result.id)
  const turnMessages = messages.filter(
    (entry) =>
      entry.id === answer?.replyToId || entry.replyToId === answer?.replyToId,
  )
  const calls = turnMessages
    .filter((entry) => entry.role === 'tool_call')
    .map(
      (entry) =>
        (JSON.parse(entry.content) as { function: Turn['calls'][number] })
          .function,
    )
  // Полный ответ остаётся в диагностике конкретного сценария.
  console.warn(message, result.content)
  return { answer: result.content, messages: turnMessages, calls }
}

export function readPage(turn: Turn, uri: string): void {
  expect(turn.calls, turn.answer).toContainEqual(
    expect.objectContaining({
      name: 'read_site_page',
      arguments: expect.objectContaining({ uri: expect.stringContaining(uri) }),
    }),
  )
  const pageResults = turn.messages
    .filter((entry) => entry.role === 'tool' && entry.success)
    .map(
      (entry) =>
        (
          JSON.parse(entry.content) as {
            result: {
              status?: string
              uri?: string
              content?: string
              complete?: boolean
            }
          }
        ).result,
    )
  expect(pageResults, turn.answer).toContainEqual(
    expect.objectContaining({
      status: 'found',
      uri,
      content: expect.any(String),
      complete: true,
    }),
  )
}
export function skill(turn: Turn, id: string): void {
  expect(turn.calls, turn.answer).toContainEqual(
    expect.objectContaining({
      name: 'read_skill',
      arguments: expect.objectContaining({ id }),
    }),
  )
}
