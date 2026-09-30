import test from 'node:test'
import assert from 'node:assert/strict'
import {
  ApolloClient,
  ApolloLink,
  InMemoryCache,
  Observable,
} from '@apollo/client'
import type { TypedDocumentNode } from '@apollo/client'
import { mergeApolloState } from '../app/gql/apolloClient/mergeApolloState'
import {
  OldResourceDocument,
  type OldResourceQuery,
  type OldResourceQueryVariables,
} from '../app/gql/generated/oldResource'

const base: string = process.env.TEST_URL || 'http://localhost:3000'

test('явный маршрут главной имеет приоритет перед MODX fallback', async () => {
  const response = await fetch(`${base}/`)
  assert.equal(response.status, 200)
  const html: string = await response.text()
  assert.match(html, /MainPageCustom/)
  assert.doesNotMatch(html, /initialApolloState/)
})

test('fallback отдаёт SSR-название документа и Apollo-кэш без учёта query', async () => {
  for (const path of [
    '/services.html',
    '/services.html?page=2',
    '/%73ervices.html',
  ]) {
    const response = await fetch(`${base}${path}`)
    assert.equal(response.status, 200, path)
    const html: string = await response.text()
    assert.match(html, /<h1[^>]*>Услуги<\/h1>/)
    assert.match(html, /<title>Услуги — BallDecor<\/title>/)
    assert.match(html, /initialApolloState/)
    assert.match(html, /OldResource:4/)
  }
})

test('SPA-запрос ищет исходный URI без служебного суффикса .data', async () => {
  const response = await fetch(`${base}/services.html.data`)
  assert.equal(response.status, 200)
  const payload: string = await response.text()
  assert.match(payload, /Услуги/)
  assert.match(payload, /OldResource:4/)
  assert.doesNotMatch(payload, /services\.html\.data/)
})

test('неизвестные документы и отсутствующие файлы возвращают 404', async () => {
  for (const path of [
    '/__missing_document_test__',
    '/assets/__missing_test__.js',
    '/__missing_document_test__.data',
  ]) {
    const response = await fetch(`${base}${path}`)
    assert.equal(response.status, 404, path)
    await response.text()
  }
})

test('восстановленный Apollo-кэш обслуживает запрос без сети и сохраняет предыдущие страницы', async () => {
  const query = OldResourceDocument as TypedDocumentNode<
    OldResourceQuery,
    OldResourceQueryVariables
  >
  const previous = new InMemoryCache()
  const incoming = new InMemoryCache()
  const services: OldResourceQueryVariables = {
    where: { uri: 'services.html', context_key: 'web' },
  }
  const missing: OldResourceQueryVariables = {
    where: { uri: 'missing.html', context_key: 'web' },
  }
  previous.writeQuery({
    query,
    variables: services,
    data: {
      oldResource: {
        __typename: 'OldResource',
        id: 4,
        pagetitle: 'Услуги',
        longtitle: '',
        published: 1,
        deleted: 0,
        hidemenu: 1,
        searchable: 1,
        description: '',
        uri: 'services.html',
      },
    },
  })
  incoming.writeQuery({
    query,
    variables: missing,
    data: { oldResource: null },
  })
  let requests: number = 0
  const client = new ApolloClient({
    cache: new InMemoryCache().restore(
      mergeApolloState(previous.extract(), incoming.extract()),
    ),
    link: new ApolloLink(() => {
      requests++
      return new Observable((observer) =>
        observer.error(new Error('Неожиданный сетевой запрос')),
      )
    }),
  })
  try {
    assert.equal(
      (await client.query({ query, variables: services })).data?.oldResource
        ?.pagetitle,
      'Услуги',
    )
    assert.equal(
      (await client.query({ query, variables: missing })).data?.oldResource,
      null,
    )
    assert.equal(requests, 0)
  } finally {
    client.stop()
  }
})

test('неопубликованный баннер и удалённый документ не раскрываются в HTML и SPA-данных', async () => {
  for (const [uri, title, description, id] of [
    ['banner-1.html', 'Баннер 1', 'Игнат С. Топ-менеджер', 1179],
    [
      'dostavka-vozdushnyh-sharov-po-moskve.html',
      'Доставка воздушных шаров в поселке Развилка',
      '',
      120,
    ],
  ] as const) {
    for (const suffix of ['', '.data']) {
      const response = await fetch(`${base}/${uri}${suffix}`)
      assert.equal(response.status, 404, `${uri}${suffix}`)
      const body: string = await response.text()
      assert.ok(!body.includes(title))
      assert.ok(!body.includes(`OldResource:${id}`))
      if (description) {
        assert.ok(!body.includes(description))
      }
      if (!suffix) {
        assert.match(body, /name="robots" content="noindex, follow"/)
        assert.doesNotMatch(body, /rel="canonical"/)
      }
    }
  }
})

test('SSR SEO использует description и сохранённый URI без query и регистра входящего URL', async () => {
  const response = await fetch(`${base}/GALLERY.html?page=2&scroll=test`)
  assert.equal(response.status, 200)
  const html: string = await response.text()
  assert.match(html, /name="description" content="Галерея работ BallDecor"/)
  assert.match(
    html,
    /rel="canonical" href="https:\/\/balldecor\.ru\/gallery\.html"/,
  )
  assert.match(html, /name="robots" content="index, follow"/)
  assert.match(
    html,
    /property="og:url" content="https:\/\/balldecor\.ru\/gallery\.html"/,
  )
})

test('hidemenu не запрещает доступ или индексацию опубликованной страницы', async () => {
  const response = await fetch(`${base}/services.html`)
  assert.equal(response.status, 200)
  const html: string = await response.text()
  assert.match(html, /<h1[^>]*>Услуги<\/h1>/)
  assert.match(html, /name="robots" content="index, follow"/)
})
