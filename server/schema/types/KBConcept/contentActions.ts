import { builder } from '../../builder'

builder.mutationField('requestConceptCallback', (t) =>
  t.boolean({
    args: {
      conceptId: t.arg.string({ required: true }),
      name: t.arg.string(),
      phone: t.arg.string(),
    },
    resolve: () => null,
  }),
)

builder.mutationField('submitConceptFeedback', (t) =>
  t.boolean({
    args: {
      conceptId: t.arg.string({ required: true }),
      name: t.arg.string(),
      contact: t.arg.string({ required: true }),
      message: t.arg.string({ required: true }),
    },
    resolve: () => null,
  }),
)

builder.mutationField('requestConceptQuickOrder', (t) =>
  t.boolean({
    args: {
      conceptId: t.arg.string({ required: true }),
      name: t.arg.string(),
      contact: t.arg.string({ required: true }),
    },
    resolve: () => null,
  }),
)

const PrintOrder = builder.inputType('ConceptPrintOrderInput', {
  fields: (t) => ({
    name: t.string(),
    phone: t.string(),
    email: t.string(),
    comments: t.string(),
    colors: t.stringList(),
    printType: t.string(),
    amount: t.string(),
    extras: t.stringList(),
    logo: t.field({ type: 'Upload' }),
  }),
})

builder.mutationField('requestConceptPrintOrder', (t) =>
  t.boolean({
    args: {
      conceptId: t.arg.string({ required: true }),
      data: t.arg({ type: PrintOrder, required: true }),
    },
    resolve: () => null,
  }),
)

builder.mutationField('addConceptProductToCart', (t) =>
  t.boolean({
    args: {
      conceptId: t.arg.string({ required: true }),
      productId: t.arg.string({ required: true }),
      quantity: t.arg.int({ required: true }),
    },
    resolve: () => null,
  }),
)

for (const action of [
  'requestConceptRegistration',
  'requestConceptPasswordReset',
  'requestConceptPayment',
] as const) {
  builder.mutationField(action, (t) =>
    t.boolean({
      args: { conceptId: t.arg.string({ required: true }) },
      resolve: () => null,
    }),
  )
}
