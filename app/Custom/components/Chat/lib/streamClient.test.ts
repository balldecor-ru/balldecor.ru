// @vitest-environment jsdom
import { afterEach, beforeEach, expect, it, vi } from 'vitest'
import { CHAT_TOKEN_STORAGE_KEY, sendMessageStream } from './streamClient'

beforeEach(() => localStorage.clear())
afterEach(() => vi.unstubAllGlobals())

it('получает токен с первым ответом и повторно использует сессию', async () => {
  const requests: Headers[] = []
  const fetchMock = vi.fn(async (_url: string, options?: RequestInit) => {
    requests.push(new Headers(options?.headers))
    return new Response('data: [DONE]\n\n', {
      headers: {
        'Content-Type': 'text/event-stream',
        'X-Dialog-Token': 'signed-token',
      },
    })
  })
  vi.stubGlobal('fetch', fetchMock)
  const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
  await sendMessageStream('Вопрос', 'session', callbacks)
  await sendMessageStream('Вопрос', 'session', callbacks)
  expect(requests[0].get('dialog-token')).toBeNull()
  expect(requests[1].get('dialog-token')).toBe('signed-token')
  expect(requests[0].get('X-Visitor-Key')).toMatch(/^[a-f0-9]{64}$/)
  expect(requests[1].get('X-Visitor-Key')).toBe(
    requests[0].get('X-Visitor-Key'),
  )
  expect(callbacks.onDone).toHaveBeenCalledTimes(2)
  expect(callbacks.onError).not.toHaveBeenCalled()
})

it('показывает ошибку выдачи сессии при первом запросе', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 503 }))
  vi.stubGlobal('fetch', fetchMock)
  const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
  await sendMessageStream('Вопрос', 'session', callbacks)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(callbacks.onError).toHaveBeenCalledOnce()
  expect(callbacks.onDone).not.toHaveBeenCalled()
})

it('does not refresh on an unrelated HTTP 401', async () => {
  localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, 'invalid')
  const fetchMock = vi
    .fn()
    .mockResolvedValue(new Response(null, { status: 401 }))
  vi.stubGlobal('fetch', fetchMock)
  const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
  await sendMessageStream('Вопрос', 'session', callbacks)
  expect(localStorage.getItem(CHAT_TOKEN_STORAGE_KEY)).toBe('invalid')
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(callbacks.onError).toHaveBeenCalledOnce()
})

it('отклоняет ответ с ошибкой вместо потока', async () => {
  const fetchMock = vi
    .fn()
    .mockResolvedValue(Response.json({ error: 'Ошибка хранилища' }))
  vi.stubGlobal('fetch', fetchMock)
  const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
  await sendMessageStream('Вопрос', 'session', callbacks)
  expect(fetchMock).toHaveBeenCalledTimes(1)
  expect(localStorage.getItem(CHAT_TOKEN_STORAGE_KEY)).toBeNull()
  expect(callbacks.onError).toHaveBeenCalledOnce()
  expect(callbacks.onDone).not.toHaveBeenCalled()
})

it('sends the current page URL on every message after client-side navigation', async () => {
  localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, 'signed-token')
  const originalUrl = window.location.href
  const pages: string[] = []
  vi.stubGlobal(
    'fetch',
    vi.fn(async (_url: string, options: RequestInit) => {
      pages.push(new Headers(options.headers).get('X-Chat-Page-Url') ?? '')
      return new Response('data: [DONE]\n\n', {
        headers: { 'Content-Type': 'text/event-stream' },
      })
    }),
  )
  const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
  try {
    for (const path of [
      '/city/kirov/bath?tab=reviews#form',
      '/map?lat=58&lng=49',
    ]) {
      history.pushState({}, '', path)
      await sendMessageStream('This page', 'session', callbacks)
      expect(pages.at(-1)).toBe(window.location.href)
    }
    expect(pages[0]).not.toBe(pages[1])
    expect(callbacks.onError).not.toHaveBeenCalled()
  } finally {
    history.replaceState({}, '', originalUrl)
  }
})

it.each([true, false])(
  'доставляет ответ и передаёт режим stream=%s',
  async (stream) => {
    localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, 'signed-token')
    const controller = new AbortController()
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_url: string, options: RequestInit) => {
        expect(JSON.parse(options.body as string)).toEqual({
          message: 'Вопрос',
          stream,
        })
        expect(new Headers(options.headers).get('Accept')).toBe(
          stream ? 'text/event-stream' : 'application/json',
        )
        expect(options.signal).toBe(controller.signal)
        return stream
          ? new Response(
              'data: {"choices":[{"delta":{"content":"Ответ"}}]}\n\ndata: [DONE]\n\n',
              { headers: { 'Content-Type': 'text/event-stream' } },
            )
          : Response.json({
              id: 'answer',
              success: true,
              content: 'Ответ',
              usage: {},
            })
      }),
    )
    const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
    await sendMessageStream(
      'Вопрос',
      'session',
      callbacks,
      controller.signal,
      stream,
    )
    expect(callbacks.onChunk).toHaveBeenCalledExactlyOnceWith('Ответ')
    expect(callbacks.onDone).toHaveBeenCalledOnce()
    expect(callbacks.onError).not.toHaveBeenCalled()
  },
)

it.each([true, false])(
  'сообщает об ошибке ответа в режиме stream=%s',
  async (stream) => {
    localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, 'signed-token')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () =>
        stream
          ? new Response('data: {"error":{"message":"Ошибка"}}\n\n', {
              headers: { 'Content-Type': 'text/event-stream' },
            })
          : Response.json({ success: false, error: 'Ошибка' }),
      ),
    )
    const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
    await sendMessageStream('Вопрос', 'session', callbacks, undefined, stream)
    expect(callbacks.onChunk).not.toHaveBeenCalled()
    expect(callbacks.onDone).not.toHaveBeenCalled()
    expect(callbacks.onError).toHaveBeenCalledOnce()
  },
)

it.each([false, true])(
  'показывает исходную ошибку чата, поток: %s',
  async (stream) => {
    localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, 'signed-token')
    const message = 'Недействительный токен чата'
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(Response.json({ error: message }, { status: 401 })),
    )
    const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
    await sendMessageStream('Вопрос', 'session', callbacks, undefined, stream)
    expect(callbacks.onError).toHaveBeenCalledWith(
      expect.objectContaining({ message }),
    )
    expect(callbacks.onDone).not.toHaveBeenCalled()
  },
)

it.each([false, true])(
  'refreshes an invalid dialogue token once, second failure=%s',
  async (failsAgain) => {
    localStorage.setItem(CHAT_TOKEN_STORAGE_KEY, 'old-token')
    localStorage.setItem('token', 'user-jwt')
    const invalid = () =>
      Response.json(
        { error: 'Invalid dialogue token', code: 'INVALID_DIALOG_TOKEN' },
        { status: 401 },
      )
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(invalid())
      .mockResolvedValueOnce(
        failsAgain
          ? invalid()
          : new Response(
              'data: {"choices":[{"delta":{"content":"Profile"}}]}\n\ndata: [DONE]\n\n',
              {
                headers: {
                  'Content-Type': 'text/event-stream',
                  'X-Dialog-Token': 'new-token',
                },
              },
            ),
      )
    vi.stubGlobal('fetch', fetchMock)
    const callbacks = { onChunk: vi.fn(), onDone: vi.fn(), onError: vi.fn() }
    await sendMessageStream('My profile', 'session', callbacks)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    for (const [index, token] of [
      [0, 'old-token'],
      [1, undefined],
    ] as const) {
      expect(fetchMock.mock.calls[index][1].headers).toMatchObject({
        ...(token ? { 'dialog-token': token } : {}),
        Authorization: 'Bearer user-jwt',
      })
      expect(JSON.parse(fetchMock.mock.calls[index][1].body)).toEqual({
        message: 'My profile',
        stream: true,
      })
    }
    expect(localStorage.getItem('token')).toBe('user-jwt')
    expect(localStorage.getItem(CHAT_TOKEN_STORAGE_KEY)).toBe(
      failsAgain ? null : 'new-token',
    )
    expect(callbacks.onError).toHaveBeenCalledTimes(failsAgain ? 1 : 0)
    expect(callbacks.onDone).toHaveBeenCalledTimes(failsAgain ? 0 : 1)
  },
)
