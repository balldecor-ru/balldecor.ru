import { builder } from 'server/schema/builder'

export const UpdateOrderProductInput = builder.inputType(
  'UpdateOrderProductInput',
  {
    fields: (t) => ({
      orderId: t.string({ required: true }),
      id: t.string({ required: true }),
      quantity: t.int({ required: true }),
    }),
  },
)
