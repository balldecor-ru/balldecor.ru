import './contentActions'
import { conceptSearchImage } from './search/image'
import { conceptSearchType, searchConceptIds } from './search/client'
import { GraphQLError } from 'graphql'
import { builder } from '../../builder'
import { conceptUri } from './helpers/uri'
import { conceptsQuery, findConcept } from './helpers/queries'
import { User } from '../User/types'
import type { UserRecord } from '../User/interfaces'
import type { FileRecord } from '../files'
import '../files'

export interface ConceptRecord {
  id: string
  createdAt: Date
  updatedAt: Date
  name: string
  type: string | null
  uri: string | null
  description: string | null
  intro: string | null
  hast: unknown
  tv: unknown
  contentMode: 'hast' | 'default'
  searchable: boolean
  content: string | null
  image: string | null
  price: number | null
  packCount: number | null
  size: string | null
  available: boolean | null
  createdById: string
  code: string | null
  parentId: string | null
  rootId: string | null
  path: string | null
  quality: number
  visibility: 'public' | 'hidden' | 'unpublished'
  data: unknown
  lat: number | null
  lng: number | null
}
interface ConceptFileRecord {
  id: string
  fileId: string
  kBConceptId: string
}

const ContentMode = builder.enumType('KBConceptContentMode', {
  values: ['hast', 'default'] as const,
})

const Visibility = builder.enumType('KBConceptVisibility', {
  values: ['public', 'hidden', 'unpublished'] as const,
})
const StringFilter = builder.inputType('KBConceptStringFilter', {
  fields: (t) => ({
    equals: t.string(),
    startsWith: t.string(),
    contains: t.string(),
    in: t.stringList(),
  }),
})
const Coordinates = builder.inputType('CoordsInput', {
  fields: (t) => ({
    lat: t.float({ required: true }),
    lng: t.float({ required: true }),
  }),
})
const Where = builder.inputType('KBConceptWhereInput', {
  fields: (t) => ({
    id: t.field({ type: StringFilter }),
    type: t.field({ type: StringFilter }),
    name: t.field({ type: StringFilter }),
    description: t.field({ type: StringFilter }),
    content: t.field({ type: StringFilter }),
    code: t.field({ type: StringFilter }),
    createdById: t.field({ type: StringFilter }),
    parentId: t.field({ type: StringFilter }),
    rootId: t.field({ type: StringFilter }),
    coords: t.field({ type: Coordinates }),
    visibility: t.field({ type: Visibility }),
  }),
})
export type ConceptWhere = typeof Where.$inferInput

const SortOrder = builder.enumType('SortOrder', {
  values: ['asc', 'desc'] as const,
})
const OrderBy = builder.inputType('KBConceptOrderByInput', {
  fields: (t) => ({
    name: t.field({ type: SortOrder }),
    uri: t.field({ type: SortOrder }),
    updatedAt: t.field({ type: SortOrder }),
    createdAt: t.field({ type: SortOrder }),
    type: t.field({ type: SortOrder }),
  }),
})

const FileType = builder.configStore.getOutputTypeRef('File') as ReturnType<
  typeof builder.objectRef<FileRecord>
>
const ConceptFile = builder
  .objectRef<ConceptFileRecord>('KBConceptFile')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      File: t.field({
        type: FileType,
        nullable: true,
        resolve: async (relation, _args, ctx) =>
          (await ctx
            .db<FileRecord>('File')
            .where('id', relation.fileId)
            .first()) ?? null,
      }),
    }),
  })
export const Concept = builder.objectRef<ConceptRecord>('KBConcept').implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    name: t.exposeString('name', { nullable: false }),
    type: t.exposeString('type', { nullable: true }),
    uri: t.string({
      nullable: false,
      resolve: (concept) => conceptUri(concept),
    }),
    description: t.exposeString('description', { nullable: true }),
    intro: t.exposeString('intro', { nullable: true }),
    hast: t.expose('hast', { type: 'Json', nullable: true }),
    tv: t.expose('tv', { type: 'Json', nullable: true }),
    contentMode: t.field({
      type: ContentMode,
      nullable: false,
      resolve: (concept) => concept.contentMode,
    }),
    searchable: t.exposeBoolean('searchable', { nullable: false }),
    content: t.exposeString('content', { nullable: true }),
    image: t.exposeString('image', { nullable: true }),
    price: t.exposeFloat('price', { nullable: true }),
    packCount: t.exposeInt('packCount', { nullable: true }),
    size: t.exposeString('size', { nullable: true }),
    available: t.exposeBoolean('available', { nullable: true }),
    searchImage: t.string({ nullable: true, resolve: conceptSearchImage }),
    createdById: t.exposeID('createdById', { nullable: false }),
    code: t.exposeString('code', { nullable: true }),
    parentId: t.exposeID('parentId', { nullable: true }),
    rootId: t.exposeID('rootId', { nullable: true }),
    path: t.exposeString('path', { nullable: true }),
    quality: t.exposeFloat('quality'),
    visibility: t.field({
      type: Visibility,
      resolve: (concept) => concept.visibility,
    }),
    data: t.expose('data', { type: 'Json', nullable: true }),
    lat: t.exposeFloat('lat', { nullable: true }),
    lng: t.exposeFloat('lng', { nullable: true }),
    CreatedBy: t.field({
      type: User,
      nullable: true,
      resolve: async (concept, _args, ctx) =>
        (await ctx
          .db<UserRecord>('User')
          .where('id', concept.createdById)
          .first()) ?? null,
    }),
    Files: t.field({
      type: [ConceptFile],
      nullable: false,
      resolve: (concept, _args, ctx) =>
        ctx
          .db<ConceptFileRecord>('KBConceptFile')
          .select('id', 'fileId', 'kBConceptId')
          .where('kBConceptId', concept.id)
          .orderBy('createdAt', 'asc')
          .orderBy('id', 'asc'),
    }),
  }),
})

builder.queryField('concepts', (t) =>
  t.field({
    type: [Concept],
    nullable: false,
    args: {
      where: t.arg({ type: Where }),
      orderBy: t.arg({ type: OrderBy }),
      skip: t.arg.int(),
      take: t.arg.int(),
    },
    resolve: (_root, { where, orderBy, skip, take }, ctx) => {
      if ((skip ?? 0) < 0 || (take ?? 0) < 0) {
        throw new GraphQLError('Invalid pagination', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      const query = conceptsQuery(ctx, where).select('KBConcept.*')
      for (const field of [
        'createdAt',
        'updatedAt',
        'name',
        'uri',
        'type',
      ] as const) {
        if (orderBy?.[field]) {
          query.orderBy(field, orderBy[field])
        }
      }
      if (typeof take === 'number') {
        query.limit(take)
      }
      if (typeof skip === 'number') {
        query.offset(skip)
      }
      return query
    },
  }),
)
builder.queryField('kBConceptsCount', (t) =>
  t.int({
    nullable: false,
    args: { where: t.arg({ type: Where }) },
    resolve: async (_root, { where }, ctx) => {
      const rows = await conceptsQuery(ctx, where).count<{ count: string }[]>({
        count: '*',
      })
      return Number(rows[0]?.count ?? 0)
    },
  }),
)

const WhereUnique = builder.inputType('KBConceptWhereUniqueInput', {
  fields: (t) => ({ id: t.string(), uri: t.string() }),
})

export type ConceptWhereUnique = typeof WhereUnique.$inferInput

const UpdateData = builder.inputType('KBConceptUpdateInput', {
  fields: (t) => ({
    visibility: t.field({ type: Visibility }),
    available: t.boolean(),
    price: t.float(),
    quality: t.float(),
  }),
})

builder.mutationField('updateConcept', (t) =>
  t.field({
    type: Concept,
    nullable: false,
    authScopes: { active: true },
    args: {
      where: t.arg({ type: WhereUnique, required: true }),
      data: t.arg({ type: UpdateData, required: true }),
    },
    resolve: async (_root, { where, data }, ctx) => {
      if (!ctx.currentUser || ctx.currentUser.status !== 'active') {
        throw new GraphQLError(
          'Доступ разрешён только активным пользователям',
          {
            extensions: { code: 'FORBIDDEN' },
          },
        )
      }
      if (!where.id) {
        throw new GraphQLError('Не указан ID концепта', {
          extensions: { code: 'BAD_USER_INPUT' },
        })
      }
      const concept = await ctx
        .db<ConceptRecord>('KBConcept')
        .where('id', where.id)
        .first()
      if (
        !concept ||
        (!ctx.currentUser.sudo && concept.createdById !== ctx.currentUser.id)
      ) {
        throw new GraphQLError(
          'Концепт не найден или недоступен для изменения',
          {
            extensions: { code: 'FORBIDDEN' },
          },
        )
      }
      const changes: Partial<ConceptRecord> = {}
      if (data.visibility !== undefined) {
        if (data.visibility === null) {
          throw new GraphQLError('Видимость не может быть пустой', {
            extensions: { code: 'BAD_USER_INPUT' },
          })
        }
        changes.visibility = data.visibility
      }
      if (data.available !== undefined) {
        changes.available = data.available
      }
      if (data.price !== undefined) {
        if (
          data.price !== null &&
          (!Number.isFinite(data.price) || data.price < 0)
        ) {
          throw new GraphQLError('Цена должна быть неотрицательным числом', {
            extensions: { code: 'BAD_USER_INPUT' },
          })
        }
        changes.price = data.price
      }
      if (data.quality !== undefined) {
        if (
          data.quality === null ||
          !Number.isFinite(data.quality) ||
          data.quality < 0 ||
          data.quality > 1
        ) {
          throw new GraphQLError('Качество должно быть числом от 0 до 1', {
            extensions: { code: 'BAD_USER_INPUT' },
          })
        }
        changes.quality = data.quality
      }
      if (Object.keys(changes).length === 0) {
        return concept
      }
      changes.updatedAt = new Date()
      const query = ctx.db<ConceptRecord>('KBConcept').where('id', where.id)
      if (!ctx.currentUser.sudo) {
        query.where('createdById', ctx.currentUser.id)
      }
      const [updated] = await query.update(changes).returning('*')
      if (!updated) {
        throw new GraphQLError(
          'Концепт не найден или недоступен для изменения',
          {
            extensions: { code: 'FORBIDDEN' },
          },
        )
      }
      return updated
    },
  }),
)

builder.queryField('concept', (t) =>
  t.field({
    type: Concept,
    nullable: true,
    args: { where: t.arg({ type: WhereUnique, required: true }) },
    resolve: (_root, { where }, ctx) => findConcept(ctx, where),
  }),
)

const SearchResult = builder
  .objectRef<{ items: ConceptRecord[]; total: number }>('KBConceptSearchResult')
  .implement({
    fields: (t) => ({
      items: t.field({
        type: [Concept],
        nullable: false,
        resolve: (result) => result.items,
      }),
      total: t.exposeInt('total', { nullable: false }),
    }),
  })
builder.queryField('searchConcepts', (t) =>
  t.field({
    type: SearchResult,
    nullable: false,
    args: {
      query: t.arg.string({ required: true }),
      take: t.arg.int(),
      skip: t.arg.int(),
    },
    resolve: async (_root, { query, take, skip }, ctx) => {
      if ((take ?? 0) < 0 || (skip ?? 0) < 0 || query.length > 500) {
        throw new GraphQLError('Некорректные параметры поиска')
      }
      const ids = await searchConceptIds(query)
      // Перепроверяем видимость по актуальной базе даже до следующей индексации.
      const records: ConceptRecord[] = []
      for (let offset = 0; offset < ids.length; offset += 250) {
        records.push(
          ...(await ctx
            .db<ConceptRecord>('KBConcept')
            .whereIn('id', ids.slice(offset, offset + 250))
            .where('type', conceptSearchType)
            .where('visibility', 'public')
            .where('searchable', true)),
        )
      }
      const byId = new Map(records.map((record) => [record.id, record]))
      const ordered = ids.flatMap((id) => {
        const row = byId.get(id)
        return row ? [row] : []
      })
      return {
        total: ordered.length,
        items: ordered.slice(
          skip ?? 0,
          take === null || take === undefined ? undefined : (skip ?? 0) + take,
        ),
      }
    },
  }),
)
