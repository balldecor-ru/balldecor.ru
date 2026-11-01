import { builder } from 'server/schema/builder'

export const OrderAddProductInput = builder.inputType('OrderAddProductInput', {
  fields: (t) => ({
    orderId: t.string(),
    productId: t.string({ required: true }),
    quantity: t.int({ required: true }),
  }),
})
const OrderDelivery = builder.enumType('OrderDelivery', {
  values: ['courier', 'pickup', 'transport'] as const,
})
const OrderPayment = builder.enumType('OrderPayment', {
  values: ['cash', 'card', 'invoice'] as const,
})
export const SubmitOrderInput = builder.inputType('SubmitOrderInput', {
  fields: (t) => ({
    orderId: t.string({ required: true }),
    fullname: t.string({ required: true }),
    phone: t.string({ required: true }),
    email: t.string(),
    phoneAdditional: t.string(),
    address: t.string(),
    comment: t.string(),
    delivery: t.field({ type: OrderDelivery, required: true }),
    payment: t.field({ type: OrderPayment, required: true }),
  }),
})
