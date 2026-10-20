import type { Knex } from 'knex'
import type { Context } from '../../../builder'
import type { OldResourceRow, ResourceFilter } from '../interfaces'

export function queryOldResources(
  ctx: Context,
  where: ResourceFilter = {},
): Knex.QueryBuilder<OldResourceRow, OldResourceRow[]> {
  if (!ctx.knex) {
    throw new Error('Клиент MySQL не передан в контекст')
  }
  const query = ctx.knex<OldResourceRow>('modx_site_content')
  for (const [key, value] of Object.entries(where)) {
    if (value !== null && value !== undefined) {
      query.where(key, value)
    }
  }
  return query
}
