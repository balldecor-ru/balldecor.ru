import { createElement } from 'react'
import { describe, expect, it } from 'vitest'
import { JSDOM } from 'jsdom'
import { renderToStaticMarkup } from 'react-dom/server'
import { MemoryRouter } from 'react-router'
import { Hast } from '../../app/Custom/components/Hast'
import { contentToHast } from '../../scripts/import-public/hast'
import { resourceVisibility } from '../../scripts/import-public/visibility'
import type { ImportedResource } from '../../app/Custom/interfaces'

const resource: ImportedResource = {
  id: 1,
  uri: 'index.html',
  template: 1,
  class_key: 'modDocument',
  parent: 0,
  published: 1,
  deleted: 0,
  privateweb: 0,
  hidemenu: 0,
  searchable: 1,
  pub_date: 0,
  unpub_date: 0,
  context_key: 'web',
}

describe('Импорт HAST', () => {
  it('сохраняет комментарии и рендерит ссылки, SVG и HTML-атрибуты через React', () => {
    const dom = new JSDOM(
      '<main><!-- оригинал --><a href="/test?q=1#anchor">Текст &amp; ссылка</a><input size="4"><svg viewBox="0 0 1 1"><path d="M0 0" /></svg></main>',
    )
    const main = dom.window.document.querySelector('main')
    if (!main) {
      throw new Error('Отсутствует main')
    }
    const tree = contentToHast([main])
    const stored = JSON.parse(JSON.stringify(tree))
    expect(JSON.stringify(stored)).toContain('оригинал')
    const html = renderToStaticMarkup(
      createElement(MemoryRouter, null, createElement(Hast, { tree: stored })),
    )
    expect(html).toContain('<div>')
    expect(html).toContain('href="/test?q=1#anchor"')
    expect(html).toContain('size="4"')
    expect(html).toContain('viewBox="0 0 1 1"')
    expect(html).toContain('Текст &amp; ссылка')
    dom.window.close()
  })

  it('отделяет доступность, скрытие в меню и индексацию', () => {
    expect(resourceVisibility(resource, 100)).toBe('public')
    expect(
      resourceVisibility({ ...resource, hidemenu: 1, searchable: 0 }, 100),
    ).toBe('hidden')
    for (const overrides of [
      { published: 0 },
      { deleted: 1 },
      { privateweb: 1 },
      { pub_date: 101 },
      { unpub_date: 100 },
    ]) {
      expect(resourceVisibility({ ...resource, ...overrides }, 100)).toBe(
        'unpublished',
      )
    }
  })
})
