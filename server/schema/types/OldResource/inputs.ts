import { builder } from '../../builder'
import type { ResourceFilter } from './interfaces'

export const OldResourceWhereInput = builder
  .inputRef<ResourceFilter>('OldResourceWhereInput')
  .implement({
    fields: (t) => ({
      id: t.int(),
      uri: t.string(),
      parent: t.int(),
      template: t.int(),
      published: t.int(),
      deleted: t.int(),
      context_key: t.string(),
      class_key: t.string(),
    }),
  })

export const OldResourceWhereUniqueInput = builder.inputType(
  'OldResourceWhereUniqueInput',
  {
    fields: (t) => ({
      id: t.int(),
      uri: t.string(),
      context_key: t.string(),
    }),
  },
)
