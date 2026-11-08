import { GraphQLError } from 'graphql'
import type { Knex } from 'knex'
import type { Context } from '../../../builder'
import type { ConceptRecord, ConceptWhere, ConceptWhereUnique } from '..'

export function conceptsQuery(
  ctx: Pick<Context, 'db' | 'currentUser'>,
  where: ConceptWhere | null | undefined,
): Knex.QueryBuilder<ConceptRecord, ConceptRecord[]> {
  const query = ctx.db<ConceptRecord>('KBConcept')
  if (!ctx.currentUser?.sudo) {
    query.whereNot('visibility', 'unpublished')
  }
  if (where?.visibility) {
    query.where('visibility', where.visibility)
  }
  for (const field of [
    'id',
    'type',
    'name',
    'description',
    'content',
    'code',
    'createdById',
    'parentId',
    'rootId',
  ] as const) {
    const filter = where?.[field]
    if (typeof filter?.equals === 'string') {
      query.where(field, filter.equals)
    }
    if (typeof filter?.startsWith === 'string') {
      query.whereRaw('substr(??, 1, length(?)) = ?', [
        field,
        filter.startsWith,
        filter.startsWith,
      ])
    }
    if (typeof filter?.contains === 'string') {
      query.whereRaw(
        `${ctx.db.client.config.client === 'pg' ? 'strpos' : 'instr'}(lower(??), lower(?)) > 0`,
        [field, filter.contains],
      )
    }
    if (filter?.in) {
      query.whereIn(field, filter.in)
    }
  }
  if (where?.coords) {
    const { lat, lng } = where.coords
    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new GraphQLError('Invalid coordinates', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    }
    query
      .whereNotNull('lat')
      .whereNotNull('lng')
      .whereRaw(
        `6371 * acos(${ctx.db.client.config.client === 'pg' ? 'least' : 'min'}(1.0, ${ctx.db.client.config.client === 'pg' ? 'greatest' : 'max'}(-1.0,
      cos(radians(?)) * cos(radians(lat)) * cos(radians(lng) - radians(?))
      + sin(radians(?)) * sin(radians(lat))))) < ?`,
        [lat, lng, lat, 10],
      )
  }
  return query
}

export async function findConcept(
  ctx: Pick<Context, 'db' | 'currentUser'>,
  { id, uri }: ConceptWhereUnique,
): Promise<ConceptRecord | null> {
  if (!id && !uri) {
    throw new GraphQLError('An id or uri is required', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }
  // Apply the same visibility rules to direct URLs and legacy aliases.
  const query = conceptsQuery(ctx, undefined)
  if (id) {
    query.where('id', id)
  }
  if (uri) {
    const normalizedUri = uri.replace(/\/+$/, '') || '/'
    const uris = [...new Set([uri, normalizedUri, `${normalizedUri}/`])]
    query.where(function () {
      this.whereIn('uri', uris).orWhereIn(
        'id',
        ctx.db('SiteRoute').select('kBConceptId').whereIn('path', uris),
      )
      const fallback = /^\/concepts\/([^/]+)$/.exec(normalizedUri)
      if (fallback) {
        this.orWhere('id', fallback[1])
      }
    })
  }
  return (await query.first()) ?? null
}
