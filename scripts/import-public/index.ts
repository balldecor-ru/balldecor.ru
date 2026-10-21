import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { knexClient } from '../../server/knex'
import { db } from '../../server/database'
import { parsePage } from './dom'
import { readWebLink } from './redirect'
import { resourceVisibility } from './visibility'
import type { ImportedResource } from '../../app/Custom/interfaces'
import type { OldTemplateValueRow } from '../../server/schema/types/OldTemplateValue/interfaces'

const root: string = fileURLToPath(new URL('../../', import.meta.url))
const output: string = join(root, 'uploads/old')
const fields = [
  'id',
  'uri',
  'published',
  'searchable',
  'hidemenu',
  'deleted',
  'privateweb',
  'parent',
  'template',
  'context_key',
  'class_key',
  'pub_date',
  'unpub_date',
] as const satisfies readonly (keyof ImportedResource)[]

async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      where: { type: 'string' },
      limit: { type: 'string' },
      'base-url': { type: 'string', default: 'http://localhost:8080' },
      selector: { type: 'string' },
      'author-id': { type: 'string' },
      force: { type: 'string', default: 'false' },
      flash: { type: 'string', default: 'false' },
    },
  })
  for (const name of ['force', 'flash'] as const) {
    if (!['true', 'false'].includes(values[name])) {
      throw new Error(`${name} должен быть true или false`)
    }
  }
  const force = values.force === 'true'
  const flash = values.flash === 'true'
  const limit = values.limit === undefined ? undefined : Number(values.limit)
  if (limit !== undefined && (!Number.isSafeInteger(limit) || limit < 1)) {
    throw new Error('limit должен быть положительным целым числом')
  }
  const where: unknown =
    values.where === undefined ? {} : JSON.parse(values.where)
  if (typeof where !== 'object' || where === null || Array.isArray(where)) {
    throw new Error('where должен быть JSON-объектом с равенствами полей')
  }
  const query = knexClient<ImportedResource>('modx_site_content')
    .select(...fields)
    .where({ published: 1, deleted: 0, privateweb: 0, context_key: 'web' })
    .whereNot('id', 23)
  for (const [key, value] of Object.entries(where)) {
    if (
      key === 'id' &&
      typeof value === 'object' &&
      value !== null &&
      !Array.isArray(value) &&
      Object.keys(value).length > 0 &&
      Object.entries(value).every(
        ([operator, operand]) =>
          ['not', 'gte'].includes(operator) &&
          typeof operand === 'number' &&
          Number.isSafeInteger(operand),
      )
    ) {
      for (const [operator, operand] of Object.entries(value)) {
        query.where('id', operator === 'not' ? '!=' : '>=', operand as number)
      }
      continue
    }
    if (
      !fields.some((field) => field === key) ||
      !(
        typeof value === 'string' ||
        (typeof value === 'number' && Number.isFinite(value))
      )
    ) {
      throw new Error(`Недопустимый фильтр: ${key}`)
    }
    query.where(key, value)
  }
  if (limit !== undefined) {
    query.limit(limit)
  }
  const resources = await query.orderBy('id')
  if (!resources.length) {
    throw new Error('По указанному фильтру страницы не найдены')
  }
  const setting = await knexClient('modx_system_settings')
    .select<{ value: string }[]>('value')
    .where({ key: 'site_start' })
    .first()
  const homepageId = Number(setting?.value)
  if (!Number.isSafeInteger(homepageId) || homepageId < 1) {
    throw new Error('Не определена главная страница site_start')
  }
  const base = new URL(values['base-url'])
  const authorId = values['author-id'] ?? 'old:importer'
  if (values['author-id']) {
    if (!(await db('User').where('id', authorId).first())) {
      throw new Error(`Автор ${authorId} не найден`)
    }
  } else {
    await db('User')
      .insert({ id: authorId, fullname: 'Импорт MODX', status: 'blocked' })
      .onConflict('id')
      .ignore()
  }
  if (flash) {
    await db.transaction(async (trx) => {
      await trx('KBConceptFile').delete()
      await trx('KBConcept').delete()
    })
    process.stdout.write('Очищены KBConceptFile и KBConcept\n')
  }
  const importedIds: string[] = []
  for (const resource of resources) {
    // hidemenu влияет только на меню, а не на доступность страницы.
    const visibility = resourceVisibility(resource)
    const homepage = resource.id === homepageId
    const path = homepage ? '/' : `/${resource.uri ?? ''}`
    const url = new URL(path, base)
    if (
      (!homepage && !resource.uri) ||
      url.origin !== base.origin ||
      decodeURI(url.pathname) !== decodeURI(path) ||
      url.search ||
      url.hash ||
      /[\\?]/.test(path) ||
      /\/:[\w-]+/.test(path) ||
      path.endsWith('*')
    ) {
      throw new Error(
        `Неподдерживаемый URI ресурса ${resource.id}: ${resource.uri}`,
      )
    }
    const id = `old:page:${resource.id}`
    const previous = await db('KBConcept')
      .select('id', 'data')
      .where('id', id)
      .first()
    if (previous && !force) {
      process.stdout.write(
        `Пропущен уже импортированный ресурс ${resource.id}: ${path}\n`,
      )
      continue
    }
    const conflict = await db('KBConcept')
      .select('id')
      .where('uri', path)
      .whereNot('id', id)
      .first()
    if (conflict) {
      throw new Error(`Маршрут ${path} уже принадлежит другому ресурсу`)
    }
    const tv: OldTemplateValueRow[] = await knexClient(
      'modx_site_tmplvar_contentvalues as value',
    )
      .leftJoin('modx_site_tmplvars as tv', 'tv.id', 'value.tmplvarid')
      .select('value.*', 'tv.name')
      .where('value.contentid', resource.id)
      .orderBy('value.id')
    const common = {
      id,
      uri: path,
      type: `old:page:${resource.template}:${resource.class_key}`,
      contentMode: 'hast',
      visibility,
      searchable: resource.searchable === 1,
      tv: JSON.stringify(tv),
      updatedAt: Date.now(),
    }
    const save = async (page: object): Promise<void> => {
      await db.transaction(async (trx) => {
        await trx('KBConcept')
          .insert({ createdById: authorId, ...common, ...page })
          .onConflict('id')
          .merge({ ...common, ...page })
      })
      importedIds.push(id)
    }
    if (visibility === 'unpublished') {
      await save({
        name: resource.uri ?? String(resource.id),
        data: JSON.stringify({ ...previous?.data, sourceResource: resource }),
      })
      process.stdout.write(
        `Сохранён неопубликованный ресурс ${resource.id}: ${path}\n`,
      )
      continue
    }
    const parsed =
      resource.class_key === 'modWebLink'
        ? { redirect: await readWebLink(resource, base, homepageId) }
        : await parsePage(url, output, resource, values.selector)
    if ('redirect' in parsed) {
      const redirect = {
        ...parsed.redirect,
        noindex: resource.searchable !== 1,
      }
      await save({
        name: path,
        hast: null,
        description: null,
        image: null,
        data: JSON.stringify({ sourceResource: resource, redirect }),
      })
      process.stdout.write(
        `Импортирован редирект ${resource.id}: ${path} → ${redirect.location} (${redirect.status})\n`,
      )
      continue
    }
    const page = parsed
    await save({
      name: page.title,
      description: page.description,
      image: page.image?.src ?? null,
      hast: JSON.stringify(page.hast),
      data: JSON.stringify({
        sourceResource: resource,
        httpStatus: page.httpStatus,
        noindex: page.noindex,
        image: page.image,
      }),
    })
    process.stdout.write(
      `Импортирован ресурс ${resource.id}: ${path}; HTTP ${page.httpStatus}; изображений: ${page.assetCount}\n`,
    )
  }
  // Связи устанавливаются после записи родителей, в том числе при продолжении импорта.
  await db('KBConcept')
    .whereIn('id', importedIds)
    .update({
      parentId: db.raw(`(
      SELECT parent.id FROM KBConcept AS parent
      WHERE parent.id = 'old:page:' || json_extract(KBConcept.data, '$.sourceResource.parent')
    )`),
    })
}

try {
  await run()
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await knexClient.destroy()
  await db.destroy()
}
