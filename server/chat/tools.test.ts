import { createToolContext as createAgentContext } from './testing/context'
import { MemoryStorage } from './testing/MemoryStorage'
import { expect, it, vi } from 'vitest'
import { executeGraphql } from './tools/graphqlRequest'
import { prepareTool } from './tools/registry'
import type { ToolCall } from './types'
import { contextMessages } from './agent/helpers/contextMessages'

it('requires a purpose before executing a tool', () => {
  const call: ToolCall = {
    id: 'call',
    type: 'function',
    function: {
      name: 'graphql_request',
      arguments: JSON.stringify({ query: '{ __typename }', reasoning: '  ' }),
    },
  }
  expect(() => prepareTool(call)).toThrow('reasoning')
})

it('rejects mutations and ambiguous operations before contacting the API', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  try {
    for (const query of [
      'mutation { signup }',
      'query A { __typename } query B { __typename }',
    ]) {
      await expect(
        executeGraphql(
          { reasoning: 'Check', query },
          'http://127.0.0.1/api',
          new AbortController().signal,
        ),
      ).rejects.toThrow('read-only')
    }
    expect(fetchSpy).not.toHaveBeenCalled()
  } finally {
    fetchSpy.mockRestore()
  }
})

it('preserves completed conversation pairs with intervening tool logs', () => {
  expect(
    contextMessages(
      [
        { role: 'user', content: 'Search' },
        { role: 'tool_call', content: 'query' },
        { role: 'tool', content: 'result' },
        { role: 'assistant', content: 'Answer' },
      ],
      { role: 'user', content: 'Continue' },
    ),
  ).toEqual([
    { role: 'user', content: 'Search' },
    { role: 'assistant', content: 'Answer' },
    { role: 'user', content: 'Continue' },
  ])
})

it('does not use failed answers as successful conversation context', () => {
  expect(
    contextMessages(
      [
        { id: 'question', role: 'user', content: 'Search' },
        {
          role: 'assistant',
          content: 'Provider failed',
          success: false,
          replyToId: 'question',
        },
      ],
      { role: 'user', content: 'Retry' },
    ),
  ).toEqual([{ role: 'user', content: 'Retry' }])
})

it('возвращает сведения о помощнике с готовыми Markdown-ссылками без сетевых запросов', async () => {
  const fetchSpy = vi.spyOn(globalThis, 'fetch')
  vi.stubEnv('CHAT_MODEL', 'test-model')
  try {
    const call: ToolCall = {
      id: 'system-info',
      type: 'function',
      function: {
        name: 'get_system_info',
        arguments: JSON.stringify({
          reasoning: 'Уточню сведения о помощнике.',
        }),
      },
    }
    const tool = prepareTool(call)
    const controller = new AbortController()
    const context = createAgentContext({
      storage: new MemoryStorage(),
      chatId: 'tools',
      endpoint: 'http://unused.invalid',
      signal: controller.signal,
    })
    const result = JSON.parse(await tool.execute(context))
    expect(result.content).toContain('test-model')
    expect(result.content).toMatch(/\[[^\]]+\]\(https?:\/\/[^)]+\)/)
    controller.abort()
    await expect(tool.execute(context)).rejects.toThrow()
    expect(fetchSpy).not.toHaveBeenCalled()
    expect(() =>
      prepareTool({
        ...call,
        function: { ...call.function, arguments: '{}' },
      }),
    ).toThrow('reasoning')
  } finally {
    fetchSpy.mockRestore()
    vi.unstubAllEnvs()
  }
})
