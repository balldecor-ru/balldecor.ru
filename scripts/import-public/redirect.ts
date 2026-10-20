import { ImportedRedirect, ImportedResource } from 'app/Custom/interfaces'
import { knexClient } from '../../server/knex'

interface WebLinkData {
  id: number
  content: string | null
  properties: string | null
}

export async function readWebLink(
  resource: ImportedResource,
  base: URL,
  homepageId: number,
): Promise<ImportedRedirect> {
  const row = await knexClient<WebLinkData>('modx_site_content')
    .select('content', 'properties')
    .where({ id: resource.id })
    .first()
  let destination = row?.content?.trim() ?? ''
  if (/^\d+$/.test(destination)) {
    const target = await knexClient<ImportedResource>('modx_site_content')
      .select('id', 'uri', 'context_key')
      .where({ id: Number(destination) })
      .first()
    if (!target || target.context_key !== 'web' || !target.uri) {
      throw new Error(
        `Веблинк ${resource.id}: не найден целевой URI ресурса ${destination}`,
      )
    }
    destination = target.id === homepageId ? '/' : `/${target.uri}`
  }
  destination = destination.replaceAll('[[++site_url]]', `${base.origin}/`)
  if (!destination || destination.includes('[[')) {
    throw new Error(
      `Веблинк ${resource.id}: неизвестное назначение ${destination}`,
    )
  }
  const target = new URL(destination, base)
  if (!['http:', 'https:'].includes(target.protocol)) {
    throw new Error(
      `Веблинк ${resource.id}: неподдерживаемый протокол ${target.protocol}`,
    )
  }
  const hosts = new Set([
    base.host,
    'balldecor.ru',
    'www.balldecor.ru',
    'balldecor.localhost:8080',
  ])
  const location = hosts.has(target.host)
    ? `${target.pathname}${target.search}${target.hash}`
    : target.href
  if (location === `/${resource.uri}`) {
    throw new Error(`Веблинк ${resource.id}: редирект на самого себя`)
  }
  let status = 301
  if (row?.properties) {
    const properties: { core?: { responseCode?: unknown } } = JSON.parse(
      row.properties,
    )
    const responseCode = properties.core?.responseCode
    if (responseCode !== undefined) {
      const match = String(responseCode).match(
        /^(?:HTTP\/\d(?:\.\d)?\s+)?(301|302|303|307|308)(?:\s|$)/,
      )
      if (!match) {
        throw new Error(
          `Веблинк ${resource.id}: неизвестный код ${String(responseCode)}`,
        )
      }
      status = Number(match[1])
    }
  }
  return { location, status, noindex: resource.searchable !== 1 }
}
