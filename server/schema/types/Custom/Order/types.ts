import { builder } from 'server/schema/builder'
import { OrderProduct } from '../OrderProduct/types'
import type { OrderProductRecord, OrderRecord } from './interfaces'

export const OrderStatus = builder.enumType('OrderStatus', {
  values: ['draft', 'submitted'] as const,
})
export const Order = builder.objectRef<OrderRecord>('Order').implement({
  fields: (t) => ({
    id: t.exposeID('id', { nullable: false }),
    userId: t.exposeID('userId', { nullable: false }),
    status: t.expose('status', { type: OrderStatus, nullable: false }),
    createdAt: t.expose('createdAt', { type: 'DateTime', nullable: false }),
    updatedAt: t.expose('updatedAt', { type: 'DateTime', nullable: false }),
    submittedAt: t.field({
      type: 'DateTime',
      nullable: true,
      resolve: (order) =>
        order.submittedAt === null ? null : new Date(order.submittedAt),
    }),
    fullname: t.exposeString('fullname'),
    email: t.exposeString('email'),
    phone: t.exposeString('phone'),
    phoneAdditional: t.exposeString('phoneAdditional'),
    address: t.exposeString('address'),
    comment: t.exposeString('comment'),
    delivery: t.exposeString('delivery'),
    payment: t.exposeString('payment'),
    Products: t.field({
      type: [OrderProduct],
      nullable: false,
      resolve: (order, _, ctx) =>
        ctx
          .db<OrderProductRecord>('OrderProduct')
          .where({ orderId: order.id })
          .orderBy('rowid', 'asc'),
    }),
  }),
})
