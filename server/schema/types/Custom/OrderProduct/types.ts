import { builder } from 'server/schema/builder'
import type { OrderProductRecord } from '../Order/interfaces'

export const OrderProduct = builder
  .objectRef<OrderProductRecord>('OrderProduct')
  .implement({
    fields: (t) => ({
      id: t.exposeID('id', { nullable: false }),
      orderId: t.exposeID('orderId', { nullable: false }),
      productId: t.exposeID('productId', { nullable: false }),
      name: t.exposeString('name', { nullable: false }),
      image: t.exposeString('image'),
      uri: t.exposeString('uri'),
      price: t.float({ nullable: false, resolve: (item) => item.price / 100 }),
      oldPrice: t.float({
        nullable: true,
        resolve: (item) =>
          item.oldPrice === null ? null : item.oldPrice / 100,
      }),
      quantity: t.exposeInt('quantity', { nullable: false }),
    }),
  })
