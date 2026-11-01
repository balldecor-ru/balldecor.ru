import { useCallback } from 'react'
import { Link } from 'react-router'
import { useOrdersQuery, type OrderFragment } from 'app/gql/generated'
import { useAppContext } from 'app/Custom/hooks/useAppContext'
import { OrderItem } from 'app/Custom/components/Cart/OrderItem'
import { Checkout } from './Checkout'
import { CartStyled } from './styles'

export const CartPage: React.FC = () => {
  const { user, userLoading } = useAppContext() ?? {}
  const { data, loading, error, refetch } = useOrdersQuery({
    skip: !user,
    fetchPolicy: 'cache-and-network',
  })
  const refresh = useCallback(() => refetch(), [refetch])
  if (userLoading || (loading && !data)) {
    return (
      <CartStyled>
        <p role="status">Загрузка корзины…</p>
      </CartStyled>
    )
  }
  return (
    <CartStyled>
      <h1>Корзина и заказы</h1>
      {error && <p role="alert">{error.message}</p>}
      {!user || !data?.orders.length ? (
        <p>
          Корзина пуста.{' '}
          <Link to="/katalog-sharov-i-figur.html">Перейти в каталог</Link>
        </p>
      ) : (
        data.orders.map((order) => (
          <OrderCart key={order.id} order={order} refresh={refresh} />
        ))
      )}
    </CartStyled>
  )
}

const OrderCart: React.FC<{
  order: OrderFragment
  refresh: () => Promise<unknown>
}> = ({ order, refresh }) => {
  return (
    <section>
      <h2>
        {order.status === 'draft' ? 'Корзина' : 'Заказ принят'}{' '}
        {order.id.slice(0, 8)}
      </h2>
      {order.Products.map((item) => (
        <OrderItem
          key={item.id}
          item={item}
          orderId={order.id}
          editable={order.status === 'draft'}
          refresh={refresh}
        />
      ))}
      <p>
        Итого{' '}
        {order.Products.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        ).toLocaleString('ru-RU')}{' '}
        ₽
      </p>
      {order.status === 'draft' && order.Products.length > 0 && (
        <Checkout key={order.id} order={order} onSubmitted={refresh} />
      )}
    </section>
  )
}
