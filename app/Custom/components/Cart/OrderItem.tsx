import { useCallback, useState } from 'react'
import { Link } from 'react-router'
import {
  useUpdateOrderProductMutation,
  type OrderProductNoNestingFragment,
} from 'app/gql/generated'
import { Button } from '../Button'

export const OrderItem: React.FC<{
  item: OrderProductNoNestingFragment
  orderId: string
  editable: boolean
  refresh?: () => Promise<unknown>
}> = ({ item, orderId, editable, refresh }) => {
  const [update, { loading }] = useUpdateOrderProductMutation()
  const [error, setError] = useState('')
  const changeQuantity = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      const quantity = Number(event.currentTarget.dataset.quantity)
      setError('')
      try {
        await update({
          variables: { data: { orderId, id: item.id, quantity } },
        })
        await refresh?.()
      } catch (error) {
        setError(
          error instanceof Error
            ? error.message
            : 'Не удалось изменить количество',
        )
      }
    },
    [update, refresh, orderId, item.id],
  )
  return (
    <article role="listitem">
      {item.image && <img src={item.image} alt="" />}
      <Link to={item.uri || `/concepts/${item.productId}`}>{item.name}</Link>
      <span>
        {item.price.toLocaleString('ru-RU')} ₽ × {item.quantity}
      </span>
      {editable && (
        <>
          <Button
            disabled={loading || item.quantity <= 1}
            data-quantity={item.quantity - 1}
            onClick={changeQuantity}
            aria-label="Уменьшить количество"
          >
            −
          </Button>
          <Button
            disabled={loading || item.quantity >= 1000000}
            data-quantity={item.quantity + 1}
            onClick={changeQuantity}
            aria-label="Увеличить количество"
          >
            +
          </Button>
          <Button disabled={loading} data-quantity={0} onClick={changeQuantity}>
            Удалить
          </Button>
        </>
      )}
      <span>{(item.price * item.quantity).toLocaleString('ru-RU')} ₽</span>
      {error && <p role="alert">{error}</p>}
    </article>
  )
}
