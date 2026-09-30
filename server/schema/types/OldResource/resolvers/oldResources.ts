import { GraphQLError } from 'graphql'
import { builder } from '../../../builder'
import { queryOldResources } from '../helpers/queryOldResources'
import { OldResource } from '../types'
import { OldResourceWhereInput } from '../inputs'

builder.queryField('oldResources', (t) =>
  t.field({
    type: [OldResource],
    nullable: false,
    args: {
      where: t.arg({ type: OldResourceWhereInput }),
      take: t.arg.int({ defaultValue: 20 }),
      skip: t.arg.int({ defaultValue: 0 }),
    },
    resolve: (_, { where, take, skip }, ctx) => {
      const limit = take ?? 20
      const offset = skip ?? 0
      if (limit < 0 || limit > 100 || offset < 0) {
        throw new GraphQLError(
          'take должен быть от 0 до 100, skip — неотрицательным.',
          {
            extensions: { code: 'BAD_USER_INPUT' },
          },
        )
      }
      return queryOldResources(ctx, where ?? {})
        .select('*')
        .orderBy('id')
        .limit(limit)
        .offset(offset)
    },
  }),
)
