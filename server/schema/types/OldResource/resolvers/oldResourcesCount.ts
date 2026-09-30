import { builder } from '../../../builder'
import { queryOldResources } from '../helpers/queryOldResources'
import { OldResourceWhereInput } from '../inputs'

builder.queryField('oldResourcesCount', (t) =>
  t.int({
    nullable: false,
    args: { where: t.arg({ type: OldResourceWhereInput }) },
    resolve: async (_, { where }, ctx) => {
      const row = await queryOldResources(ctx, where ?? {})
        .count<{ count: number | string }>({ count: 'id' })
        .first()
      return Number(row?.count ?? 0)
    },
  }),
)
