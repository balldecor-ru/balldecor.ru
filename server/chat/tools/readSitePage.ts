import type { ChatTool } from '../types'
import { pageContent } from './helpers/pageContent'

const chunkSize = 16000

export const readSitePageTool: ChatTool = {
  definition: {
    type: 'function',
    function: {
      name: 'read_site_page',
      description:
        'Прочитай страницу сайта по адресу. Инструмент возвращает готовый текст, таблицы, ссылки и параметры товара. Для продолжения большой страницы используй nextOffset и version из результата.',
      parameters: {
        type: 'object',
        properties: {
          reasoning: {
            type: 'string',
            description: 'Объясни, какие сведения ищешь для посетителя.',
          },
          uri: {
            type: 'string',
            description: 'Путь страницы или полный адрес страницы этого сайта.',
          },
          offset: {
            type: 'integer',
            minimum: 0,
            description: 'Позиция продолжения из nextOffset. Начало — 0.',
          },
          version: {
            type: 'string',
            description: 'Версия страницы из предыдущего фрагмента.',
          },
        },
        required: ['reasoning', 'uri'],
        additionalProperties: false,
      },
    },
  },
  prepare(args) {
    if (
      typeof args.uri !== 'string' ||
      !args.uri.trim() ||
      args.uri.length > 8192
    ) {
      throw new Error('Укажи адрес страницы сайта')
    }
    const offset = args.offset ?? 0
    if (
      typeof offset !== 'number' ||
      !Number.isSafeInteger(offset) ||
      offset < 0
    ) {
      throw new Error('Укажи целую позицию продолжения от нуля')
    }
    if (args.version !== undefined && typeof args.version !== 'string') {
      throw new Error('Укажи строковую версию страницы')
    }
    const uri = args.uri.trim()
    const version = args.version
    return {
      reasoning: args.reasoning,
      execute: async ({ readSitePage, signal, pageUrl }) => {
        signal.throwIfAborted()
        if (!readSitePage) {
          throw new Error(
            'Для чтения требуется серверный доступ к страницам сайта',
          )
        }
        const origin = new URL(pageUrl ?? 'https://balldecor.ru').origin
        const url = new URL(uri, origin)
        if (
          !['http:', 'https:'].includes(url.protocol) ||
          url.username ||
          url.password ||
          (url.origin !== origin &&
            !['balldecor.ru', 'www.balldecor.ru'].includes(url.hostname))
        ) {
          throw new Error('Укажи страницу текущего сайта')
        }
        const page = await readSitePage(url.pathname)
        signal.throwIfAborted()
        if (!page || page.visibility !== 'public') {
          return JSON.stringify({ status: 'not_found', uri: url.pathname })
        }
        const content = pageContent(page)
        const currentVersion = page.updatedAt.toISOString()
        if (version && version !== currentVersion) {
          return JSON.stringify({
            status: 'changed',
            uri: page.uri,
            version: currentVersion,
            nextOffset: 0,
          })
        }
        if (offset > content.length) {
          throw new Error('Начни чтение с позиции 0')
        }
        let end = Math.min(offset + chunkSize, content.length)
        if (end < content.length) {
          const boundary = content.lastIndexOf('\n', end)
          if (boundary > offset + chunkSize / 2) {
            end = boundary + 1
          }
        }
        return JSON.stringify({
          status: 'found',
          id: page.id,
          title: page.name,
          uri: page.uri,
          version: currentVersion,
          description: page.description,
          intro: page.intro,
          content: content.slice(offset, end),
          offset,
          totalCharacters: content.length,
          complete: end === content.length,
          nextOffset: end < content.length ? end : null,
          product: {
            price: page.price,
            currency: 'RUB',
            packCount: page.packCount,
            size: page.size,
            available: page.available,
          },
        })
      },
    }
  },
}
