import './orderRecommendations'
import { authorizeAction } from '../../../User/helpers/ensureVisitor'
import { builder } from 'server/schema/builder'
import { Order, OrderStatus } from '../types'
import { OrderAddProductInput, SubmitOrderInput } from '../inputs'
import { UpdateOrderProductInput } from '../../OrderProduct/inputs'
import { ownedOrder, requireUser } from '../helpers/access'
import {
  addProduct,
  createOrder,
  submitOrder,
  updateProduct,
} from '../helpers/service'
import { notifyOrder } from '../helpers/notifications'
import type { OrderRecord } from '../interfaces'

builder.queryField('orders', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: [Order],
    nullable: false,
    args: { status: t.arg({ type: OrderStatus }) },
    resolve: (_, { status }, ctx) => {
      const query = ctx
        .db<OrderRecord>('Order')
        .where({ userId: requireUser(ctx).id })
        .orderBy('createdAt', 'desc')
        .orderBy('id')
      if (status) {
        query.where({ status })
      }
      return query
    },
  }),
)
builder.queryField('order', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: Order,
    nullable: true,
    args: { id: t.arg.string({ required: true }) },
    resolve: (_, { id }, ctx) => ownedOrder(ctx.db, id, requireUser(ctx).id),
  }),
)
builder.mutationField('createOrder', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: Order,
    nullable: false,
    resolve: (_, __, ctx) => createOrder(ctx),
  }),
)
const OrderAddProductPayload = builder.simpleObject('OrderAddProductPayload', {
  fields: (t) => ({
    token: t.string({ nullable: false }),
    userId: t.string({ nullable: false }),
    order: t.field({ type: Order, nullable: false }),
  }),
})

builder.mutationField('orderAddProduct', (t) =>
  t.field({
    type: OrderAddProductPayload,
    nullable: false,
    args: { data: t.arg({ type: OrderAddProductInput, required: true }) },
    resolve: async (_, { data }, ctx) => {
      const { token, user } = await authorizeAction(ctx)
      const order = await addProduct({ ...ctx, currentUser: user }, data)
      return { token, userId: user.id, order }
    },
  }),
)
builder.mutationField('updateOrderProduct', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: Order,
    nullable: true,
    args: { data: t.arg({ type: UpdateOrderProductInput, required: true }) },
    resolve: (_, { data }, ctx) =>
      updateProduct(ctx, data.orderId, data.id, data.quantity),
  }),
)
builder.mutationField('submitOrder', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: Order,
    nullable: false,
    args: { data: t.arg({ type: SubmitOrderInput, required: true }) },
    resolve: async (_, { data }, ctx) => {
      const order = await submitOrder(ctx, data)
      void notifyOrder(ctx.db, order)
      return order
    },
  }),
)
