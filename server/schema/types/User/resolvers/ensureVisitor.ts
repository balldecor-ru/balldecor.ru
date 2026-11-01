import { builder } from '../../../builder'
import { authenticate } from '../helpers/auth'
import { ensureVisitor } from '../helpers/ensureVisitor'
export { ensureVisitor } from '../helpers/ensureVisitor'

const VisitorAuthPayload = builder.simpleObject('VisitorAuthPayload', {
  fields: (t) => ({
    token: t.string({ nullable: false }),
    userId: t.string({ nullable: false }),
  }),
})

builder.mutationField('ensureVisitor', (t) =>
  t.field({
    type: VisitorAuthPayload,
    nullable: false,
    args: { key: t.arg.string({ required: true }) },
    resolve: async (_, { key }, ctx) => {
      const token = await ensureVisitor(key, ctx)
      const user = await authenticate(token, ctx.db)
      if (!user) {
        throw new Error('Не удалось создать сессию')
      }
      return { token, userId: user.id }
    },
  }),
)
