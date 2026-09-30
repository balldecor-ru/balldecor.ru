import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { graphql } from 'graphql'
import { schema } from '../server/schema/index'
import { knexClient } from '../server/knex/index'

const contextValue = { knex: knexClient }
after(async () => {
  await knexClient.destroy()
})

test('Ресурсы: count, list, getOne, TV и проверка аргументов на реальной MySQL', async () => {
  const sql: string[] = []
  knexClient.on('query', (query: { sql: string }) => sql.push(query.sql))
  const list = await graphql({
    schema,
    contextValue,
    source: `{
    oldResourcesCount
    oldResources(take: 2) { id uri price }
  }`,
  })
  assert.equal(list.errors, undefined)
  const count = await knexClient('modx_site_content')
    .count({ count: 'id' })
    .first()
  assert.equal(list.data?.oldResourcesCount, Number(count?.count))
  assert.equal(
    sql.some((query) => query.includes('tmplvar')),
    false,
  )
  const rows = list.data?.oldResources as {
    id: number
    uri: string | null
  }[]
  assert.equal(rows.length, 2)
  assert.ok(rows[0].id < rows[1].id)

  const saved = await knexClient('modx_site_tmplvar_contentvalues as value')
    .join('modx_site_content as resource', 'resource.id', 'value.contentid')
    .select('value.contentid')
    .first()
  assert.ok(saved)
  const result = await graphql({
    schema,
    contextValue,
    source: `{
    oldResource(where: { id: ${saved.contentid} }) { id TVs { id contentid tmplvarid value name } }
  }`,
  })
  assert.equal(result.errors, undefined)
  const resource = result.data?.oldResource as {
    id: number
    TVs: { id: number; contentid: number; value: string }[]
  }
  const values = await knexClient('modx_site_tmplvar_contentvalues')
    .where('contentid', resource.id)
    .orderBy('id')
  assert.deepEqual(
    resource.TVs.map(({ id, contentid, value }) => ({ id, contentid, value })),
    values.map(({ id, contentid, value }) => ({ id, contentid, value })),
  )

  const filter = await graphql({
    schema,
    contextValue,
    source: `{ oldResourcesCount(where: {id: ${rows[0].id}}) oldResources(where: {id: ${rows[0].id}}) { id } }`,
  })
  assert.equal(filter.errors, undefined)
  assert.equal(filter.data?.oldResourcesCount, 1)
  assert.deepEqual(JSON.parse(JSON.stringify(filter.data?.oldResources)), [
    { id: rows[0].id },
  ])
  if (rows[0].uri !== null) {
    const byUri = await graphql({
      schema,
      contextValue,
      source:
        'query($uri: String!) { oldResource(where: { uri: $uri }) { uri } }',
      variableValues: { uri: rows[0].uri },
    })
    assert.equal(byUri.errors, undefined)
    assert.equal((byUri.data?.oldResource as { uri: string }).uri, rows[0].uri)
  }
  const missing = await graphql({
    schema,
    contextValue,
    source:
      '{ oldResource(where: { id: -1 }) { id } oldResources(take: 0) { id } }',
  })
  assert.equal(missing.errors, undefined)
  assert.equal(missing.data?.oldResource, null)
  assert.deepEqual(missing.data?.oldResources, [])
  for (const source of [
    '{ oldResource { id } }',
    '{ oldResource(where: null) { id } }',
  ]) {
    const queryCount = sql.length
    const invalid = await graphql({ schema, contextValue, source })
    assert.ok(invalid.errors?.length)
    assert.equal(invalid.data, undefined)
    assert.equal(sql.length, queryCount)
  }
  for (const source of [
    '{ oldResource(where: {}) { id } }',
    '{ oldResource(where: { id: null, uri: null }) { id } }',
    '{ oldResource(where: { context_key: "web" }) { id } }',
    '{ oldResources(take: 101) { id } }',
    '{ oldResources(skip: -1) { id } }',
  ]) {
    const queryCount = sql.length
    const invalid = await graphql({ schema, contextValue, source })
    assert.equal(invalid.errors?.[0].extensions.code, 'BAD_USER_INPUT')
    assert.equal(sql.length, queryCount)
  }
})
