import test from 'node:test'
import assert from 'node:assert/strict'
import { loadOldResource } from '../app/Custom/pages/OldResource/load.server'
import { oldResourceMeta } from '../app/Custom/pages/OldResource/meta'
import type { OldResourceQuery } from '../app/gql/generated/oldResource'

type Resource = NonNullable<OldResourceQuery['oldResource']>
const resource: Resource = {
  __typename: 'OldResource',
  id: 1179,
  pagetitle: 'Баннер 1',
  longtitle: '',
  description: 'Игнат С. Топ-менеджер',
  uri: 'banner-1.html',
  published: 1,
  deleted: 0,
  hidemenu: 0,
  searchable: 1,
}

for (const flags of [
  { published: 0, deleted: 0 },
  { published: 1, deleted: 1 },
  { published: 0, deleted: 1 },
]) {
  test(`SSR отклоняет published=${flags.published}, deleted=${flags.deleted} до передачи данных`, async (t) => {
    t.mock.method(
      globalThis,
      'fetch',
      async () =>
        new Response(
          JSON.stringify({ data: { oldResource: { ...resource, ...flags } } }),
          { headers: { 'Content-Type': 'application/json' } },
        ),
    )
    await assert.rejects(
      loadOldResource(
        new Request('http://localhost/banner-1.html'),
        'banner-1.html',
      ),
      (error: unknown) => error instanceof Response && error.status === 404,
    )
  })
}

for (const hidemenu of [0, 1]) {
  for (const searchable of [0, 1]) {
    test(`hidemenu=${hidemenu}, searchable=${searchable}: доступ и robots независимы`, async (t) => {
      const document: Resource = { ...resource, hidemenu, searchable }
      t.mock.method(
        globalThis,
        'fetch',
        async () =>
          new Response(JSON.stringify({ data: { oldResource: document } }), {
            headers: { 'Content-Type': 'application/json' },
          }),
      )
      const result = await loadOldResource(
        new Request('http://localhost/banner-1.html'),
        'banner-1.html',
      )
      assert.equal(result.resource?.id, document.id)
      assert.ok(result.initialApolloState['OldResource:1179'])
      const tags = oldResourceMeta(result.resource)
      assert.ok(
        tags.some(
          (tag) =>
            'name' in tag &&
            tag.name === 'robots' &&
            tag.content === `${searchable ? 'index' : 'noindex'}, follow`,
        ),
      )
      assert.ok(
        tags.some(
          (tag) =>
            'tagName' in tag &&
            tag.rel === 'canonical' &&
            tag.href === 'https://balldecor.ru/banner-1.html',
        ),
      )
    })
  }
}

test('canonical сохраняет кириллицу и завершающий слеш, не подставляет сторонний origin', () => {
  for (const uri of ['каталог/шары/', '//example.org/page']) {
    const tags = oldResourceMeta({ ...resource, uri })
    const canonical = tags.find(
      (tag) => 'tagName' in tag && tag.rel === 'canonical',
    )
    assert.ok(canonical && 'href' in canonical)
    const url = new URL(String(canonical.href))
    assert.equal(url.origin, 'https://balldecor.ru')
    assert.equal(
      decodeURIComponent(url.pathname),
      `/${uri.replace(/^\/+/, '')}`,
    )
  }
})

test('404 и сбой API не получают canonical или индексируемые метатеги', () => {
  for (const status of [404, 500]) {
    const tags = oldResourceMeta(undefined, status)
    assert.ok(
      tags.some(
        (tag) =>
          'name' in tag &&
          tag.name === 'robots' &&
          tag.content === 'noindex, follow',
      ),
    )
    assert.ok(!tags.some((tag) => 'tagName' in tag && tag.rel === 'canonical'))
  }
})
