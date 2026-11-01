import { builder } from 'server/schema/builder'
import { Concept } from '../../../KBConcept'
import { recommendCategoryProducts } from '../helpers/categoryRecommendations'

builder.queryField('orderRecommendations', (t) =>
  t.field({
    authScopes: { authenticated: true },
    type: [Concept],
    nullable: false,
    args: {
      orderId: t.arg.string({ required: true }),
      orderProductId: t.arg.string({ required: true }),
    },
    resolve: (_, { orderId, orderProductId }, ctx) =>
      recommendCategoryProducts(ctx, orderId, orderProductId),
  }),
)
