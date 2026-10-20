import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parseArgs } from 'node:util'
import { format } from 'prettier'
import { knexClient } from '../../server/knex'
import { parsePage, replaceAssetTokens } from './dom'
import { readWebLink } from './redirect'
import { ImportedResource, ImportedRoute } from 'app/Custom/interfaces'

const root: string = fileURLToPath(new URL('../../', import.meta.url))
const output: string = join(root, 'app/Custom/pages/Imported')
const marker =
  '// Создано scripts/import-public; повторный импорт перезаписывает этот файл.\n'
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

async function writeGenerated(path: string, source: string): Promise<void> {
  let previous: string | undefined
  try {
    previous = await readFile(path, 'utf8')
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
  if (previous !== undefined && !previous.startsWith(marker)) {
    throw new Error(
      `Отказ перезаписывать файл, созданный не импортером: ${path}`,
    )
  }
  const formatted = await format(marker + source, {
    parser: 'typescript',
    semi: false,
    singleQuote: true,
  })
  await mkdir(dirname(path), { recursive: true })
  await writeFile(path, formatted)
}

async function run(): Promise<void> {
  const { values } = parseArgs({
    options: {
      where: { type: 'string' },
      limit: { type: 'string' },
      'base-url': { type: 'string', default: 'http://localhost:8080' },
      selector: { type: 'string' },
    },
  })
  if (!values.where || !values.limit) {
    throw new Error('Укажите --where \'{"id":1}\' --limit 1')
  }
  const limit = Number(values.limit)
  if (!Number.isSafeInteger(limit) || limit < 1) {
    throw new Error('limit должен быть положительным целым числом')
  }
  const where: unknown = JSON.parse(values.where)
  if (typeof where !== 'object' || where === null || Array.isArray(where)) {
    throw new Error('where должен быть JSON-объектом с равенствами полей')
  }
  const query = knexClient<ImportedResource>('modx_site_content').select(
    ...fields,
  )
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
  const resources = await query.orderBy('id').limit(limit)
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
  let routes: ImportedRoute[] = []
  try {
    routes = JSON.parse(
      await readFile(join(output, 'routes.json'), 'utf8'),
    ) as ImportedRoute[]
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') {
      throw error
    }
  }
  try {
    for (const resource of resources) {
      // hidemenu влияет только на меню, а не на доступность страницы.
      const now = Math.floor(Date.now() / 1000)
      if (
        !resource.published ||
        resource.deleted ||
        resource.privateweb ||
        resource.context_key !== 'web' ||
        !['modDocument', 'modWebLink'].includes(resource.class_key) ||
        resource.pub_date > now ||
        (resource.unpub_date > 0 && resource.unpub_date <= now)
      ) {
        throw new Error(
          `Ресурс ${resource.id} не является доступной публичной страницей`,
        )
      }
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
      if (
        routes.some((entry) => entry.id !== resource.id && entry.path === path)
      ) {
        throw new Error(`Маршрут ${path} уже принадлежит другому ресурсу`)
      }
      const directory = join(output, `Resource${resource.id}`)
      const parsed =
        resource.class_key === 'modWebLink'
          ? { redirect: await readWebLink(resource, base, homepageId) }
          : await parsePage(url, directory, resource, values.selector)
      if ('redirect' in parsed) {
        const redirect = {
          ...parsed.redirect,
          noindex: resource.searchable !== 1,
        }
        await writeGenerated(
          join(directory, 'data.ts'),
          `
        import type { ImportedResource, ImportedRedirect } from '../types'
        export const sourceResource: ImportedResource = ${JSON.stringify(resource)}
        export const redirectData: ImportedRedirect = ${JSON.stringify(redirect)}
      `,
        )
        await writeGenerated(
          join(directory, 'route.tsx'),
          `
        import { redirect } from 'react-router'
        import { redirectData } from './data'
        export function loader(): Response {
          return redirect(redirectData.location, {
            status: redirectData.status,
            headers: redirectData.noindex ? { 'X-Robots-Tag': 'noindex' } : {},
          })
        }
      `,
        )
        routes = routes.filter((entry) => entry.id !== resource.id)
        routes.push({
          id: resource.id,
          path,
          file: `Custom/pages/Imported/Resource${resource.id}/route.tsx`,
        })
        process.stdout.write(
          `Импортирован редирект ${resource.id}: ${path} → ${redirect.location} (${redirect.status})\n`,
        )
        continue
      }
      const page = parsed
      const seo = {
        title: page.title,
        description: page.description,
        path,
        noindex: resource.searchable !== 1 || page.noindex,
        image: page.image,
      }
      await writeGenerated(join(directory, 'assets.ts'), page.assetsSource)
      await writeGenerated(
        join(directory, 'data.ts'),
        `
      import type { ImportedResource } from '../types'
      import type { SeoHeadersProps } from '../../../../components/seo/SeoHeaders'
      ${page.image ? "import { importedAssets } from './assets'" : ''}
      export const sourceResource: ImportedResource = ${JSON.stringify(resource)}
      export const seo: SeoHeadersProps = ${replaceAssetTokens(JSON.stringify(seo))}
      export const httpStatus: number = ${page.httpStatus}
    `,
      )
      await writeGenerated(
        join(directory, 'index.tsx'),
        `
      import type * as React from 'react'
      ${page.jsx.includes('<NoIndex') ? "import { NoIndex } from '../NoIndex'" : ''}
      ${page.jsx.includes('<Link ') ? "import { Link } from 'react-router'" : ''}
      ${page.jsx.includes('importedAssets[') ? "import { importedAssets } from './assets'" : ''}
      export const Resource${resource.id}Page: React.FC = () => (
        <>${page.jsx}</>
      )
    `,
      )
      await writeGenerated(
        join(directory, 'route.tsx'),
        `
      import type { MetaFunction } from 'react-router'
      import { createSeoMeta, unavailableSeoMeta, type SeoHandle } from '../../../../components/seo/SeoHeaders'
      import { seo${page.httpStatus !== 200 ? ', httpStatus' : ''} } from './data'
      ${page.httpStatus !== 200 ? "import { data } from 'react-router'" : ''}
      ${page.httpStatus !== 200 ? 'export function loader() { return data(null, { status: httpStatus }) }' : ''}
      export { Resource${resource.id}Page as default } from './index'
      export const handle: SeoHandle = { seo }
      export const meta: MetaFunction = ({ error }) => error ? unavailableSeoMeta() : createSeoMeta(seo)
    `,
      )
      routes = routes.filter((entry) => entry.id !== resource.id)
      routes.push({
        id: resource.id,
        path,
        file: `Custom/pages/Imported/Resource${resource.id}/route.tsx`,
      })
      process.stdout.write(
        `Импортирован ресурс ${resource.id}: ${path}; HTTP ${page.httpStatus}; изображений: ${page.assetCount}\n`,
      )
    }
  } finally {
    await writeFile(
      join(output, 'routes.json'),
      JSON.stringify(
        routes.sort((a, b) => a.id - b.id),
        null,
        2,
      ) + '\n',
    )
  }
}

try {
  await run()
} catch (error) {
  console.error(error)
  process.exitCode = 1
} finally {
  await knexClient.destroy()
}
