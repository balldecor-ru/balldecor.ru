import { GraphQLError } from 'graphql'
import { builder } from '../../../builder'
import { queryOldResources } from '../helpers/queryOldResources'
import { OldResourceWhereUniqueInput } from '../inputs'
import { OldResource } from '../types'

builder.queryField('oldResource', (t) =>
  t.field({
    type: OldResource,
    nullable: true,
    args: {
      where: t.arg({ type: OldResourceWhereUniqueInput, required: true }),
    },
    resolve: (_, { where }, ctx) => {
      const query = queryOldResources(ctx, where)
        .select('*')
        .orderBy('id')
        .first()

      if (
        (where.id !== null && where.id !== undefined) ||
        (where.uri !== null && where.uri !== undefined)
      ) {
        return query
      }

      throw new GraphQLError('Укажите id или uri ресурса.', {
        extensions: { code: 'BAD_USER_INPUT' },
      })
    },
  }),
)
