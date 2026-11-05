import { describe, expect, it, vi } from 'vitest'
import type { Root, Element, Text } from 'hast'
import { readSitePageTool } from './readSitePage'
import { pageContent } from './helpers/pageContent'
import { createToolContext } from '../testing/context'
import { MemoryStorage } from '../testing/MemoryStorage'
import { buildSystemMessage } from '../systemMessage'
import { readSkill } from '../skills/registry'

const text = (value: string): Text => ({ type: 'text', value })
const element = (
  tagName: string,
  ...children: Array<Element | Text>
): Element => ({ type: 'element', tagName, properties: {}, children })
const tree: Root = {
  type: 'root',
  children: [
    element('h2', text('Печать 2+0')),
    element(
      'table',
      element('tr', element('th', text('Тираж')), element('th', text('Цена'))),
      element(
        'tr',
        element('td', text('100')),
        element('td', text('3500 руб.')),
      ),
    ),
    element('a', text('Контакты')),
    element('script', text('скрытый скрипт')),
  ],
}
const readSitePage = vi.fn()
const context = () =>
  createToolContext({
    storage: new MemoryStorage(),
    chatId: 'same-dialogue',
    readSitePage,
  })

describe('единое чтение страниц', () => {
  it('сохраняет заголовок и таблицу из HAST и Markdown с HTML', () => {
    const result = pageContent({ contentMode: 'hast', hast: tree })
    expect(result).toContain('## Печать 2+0')
    expect(result).toContain('| Тираж | Цена |')
    expect(result).toContain('| 100 | 3500 руб. |')
    expect(result).not.toContain('скрытый скрипт')
    expect(
      pageContent({
        contentMode: 'default',
        content:
          '## Печать 2+0\n\n<table><tr><th>Тираж</th><th>Цена</th></tr><tr><td>100</td><td>3500 руб.</td></tr></table>',
      }),
    ).toContain('| 100 | 3500 руб. |')
    expect(
      pageContent({
        contentMode: 'default',
        content: '## Печать\n\n| Тираж | Цена |\n| --- | --- |\n| 100 | 3500 |',
      }),
    ).toContain('| 100 | 3500 |')
  })

  it('сохраняет принадлежность ячеек с объединением строк и колонок', () => {
    const wide = element('th', text('Печать'))
    wide.properties.colSpan = 2
    const tall = element('td', text('1+0'))
    tall.properties.rowSpan = 2
    const result = pageContent({
      contentMode: 'hast',
      hast: {
        type: 'root',
        children: [
          element(
            'table',
            element('tr', wide),
            element('tr', tall, element('td', text('100 — 2200'))),
            element('tr', element('td', text('200 — 3700'))),
          ),
        ],
      },
    })
    expect(result).toContain('| Печать | Печать |')
    expect(result).toContain('| 1+0 | 100 — 2200 |')
    expect(result).toContain('| 1+0 | 200 — 3700 |')
  })

  it('читает страницу через серверный хелпер и продолжает большую страницу', async () => {
    const content = Array.from(
      { length: 800 },
      (_, n) => 'Строка ' + n + ' с описанием товара.',
    ).join('\n\n')
    readSitePage.mockResolvedValue({
      id: 'page',
      name: 'Страница',
      uri: '/page',
      visibility: 'public',
      updatedAt: new Date('2026-11-05T00:00:00.000Z'),
      contentMode: 'default',
      content,
    })
    const first = JSON.parse(
      await readSitePageTool
        .prepare({
          reasoning: 'Читаю страницу',
          uri: 'https://balldecor.ru/page?x=1',
        })
        .execute(context()),
    ) as {
      content: string
      complete: boolean
      nextOffset: number
      version: string
    }
    expect(first.complete).toBe(false)
    expect(readSitePage).toHaveBeenCalledWith('/page')
    expect(first.version).toBe('2026-11-05T00:00:00.000Z')
    const next = JSON.parse(
      await readSitePageTool
        .prepare({
          reasoning: 'Продолжаю чтение',
          uri: '/page',
          offset: first.nextOffset,
          version: first.version,
        })
        .execute(context()),
    ) as { content: string; complete: boolean }
    expect(next.complete).toBe(true)
    expect(first.content + next.content).toBe(
      pageContent({ contentMode: 'default', content }),
    )
  })

  it('возвращает состояние страницы с учётом видимости и версии', async () => {
    readSitePage.mockResolvedValue({
      uri: '/page',
      visibility: 'hidden',
      contentMode: 'default',
      content: 'private',
    })
    const read = () =>
      readSitePageTool
        .prepare({ reasoning: 'Читаю', uri: '/page', version: 'old' })
        .execute(context())
    expect(JSON.parse(await read()).status).toBe('not_found')
    readSitePage.mockResolvedValue({
      uri: '/page',
      visibility: 'public',
      contentMode: 'default',
      content: 'new',
      updatedAt: new Date('2026-11-05T00:00:00.000Z'),
    })
    expect(JSON.parse(await read())).toMatchObject({
      status: 'changed',
      nextOffset: 0,
    })
    await expect(
      readSitePageTool
        .prepare({ reasoning: 'Читаю', uri: 'https://other.example/page' })
        .execute(context()),
    ).rejects.toThrow('текущего сайта')
  })
})

it('формулирует системные установки и навыки через положительные действия', () => {
  const instructions = [
    buildSystemMessage(''),
    ...[
      'balldecor-catalog',
      'balldecor-printing',
      'balldecor-delivery-pickup',
      'balldecor-event-decoration',
      'balldecor-compositions',
      'balldecor-order-contact',
    ].map((id) => readSkill(id).content),
  ]
  for (const value of instructions) {
    expect(value).not.toMatch(
      /(?:^|\s)(?:не|нельзя|запрещено|запрещается|никогда)(?:\s|[.,:])/iu,
    )
  }
})
