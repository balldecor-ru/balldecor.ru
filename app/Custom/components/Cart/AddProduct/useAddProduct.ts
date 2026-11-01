import { useCallback } from 'react'
import { useNavigate } from 'react-router'
import { useApolloClient } from '@apollo/client/react'
import * as yup from 'yup'
import {
  useOrderAddProductMutation,
  OrdersDocument,
  type OrderAddProductMutationVariables,
} from 'app/gql/generated'
import { ensureVisitor } from '../../Auth/ensureVisitor'
import { handleAuthorization } from '../../Auth/handleAuthorization'

type FormData = OrderAddProductMutationVariables['data']

export const addProductSchema: yup.ObjectSchema<FormData> = yup.object({
  productId: yup.string().required('Не указан товар'),
  orderId: yup.string().nullable(),
  quantity: yup
    .number()
    .typeError('Укажите количество')
    .integer('Укажите целое количество')
    .min(1)
    .max(1000000)
    .required(),
})

export function useAddProduct(): (data: FormData) => Promise<void> {
  const navigate = useNavigate()
  const client = useApolloClient()
  const [addProduct] = useOrderAddProductMutation()

  return useCallback(
    async (data: FormData) => {
      const validated = await addProductSchema.validate(data)
      await ensureVisitor()
      const result = await addProduct({
        variables: {
          data: {
            ...validated,
            orderId: localStorage.getItem('balldecor_current_order'),
          },
        },
      })
      const payload = result.data?.orderAddProduct
      if (!payload) {
        throw new Error('Не удалось добавить товар')
      }
      await handleAuthorization(payload.token, payload.userId, client)
      localStorage.setItem('balldecor_current_order', payload.order.id)
      await client.refetchQueries({ include: [OrdersDocument] })
      const item = payload.order.Products.find(
        (row) => row.productId === validated.productId,
      )
      if (!item) {
        throw new Error('Добавленная позиция не найдена')
      }
      await navigate(
        `/cart/added/${encodeURIComponent(payload.order.id)}/${encodeURIComponent(item.id)}?quantity=${validated.quantity}`,
      )
    },
    [addProduct, client, navigate],
  )
}
