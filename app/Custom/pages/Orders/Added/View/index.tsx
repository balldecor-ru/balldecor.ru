import { useEffect, useState } from 'react'
import { Link } from 'react-router'
import {
  useOrderRecommendationsQuery,
  type OrderProductNoNestingFragment,
} from 'app/gql/generated'
import { OrderItem } from 'app/Custom/components/Cart/OrderItem'
import { CartStyled } from 'app/Custom/pages/Cart/styles'
import { Recommendations } from '../Recommendations'
import { AddedSkeleton } from '../Skeleton'
import { ActionsStyled } from '../styles'

type AddedProductViewProps = {
  orderId: string
  item: OrderProductNoNestingFragment
}

export const AddedProductView: React.FC<AddedProductViewProps> = ({
  orderId,
  item,
}) => {
  const { data, loading } = useOrderRecommendationsQuery({
    variables: { orderId, orderProductId: item.id },
    ssr: false,
    fetchPolicy: 'network-only',
  })
  const [waiting, setWaiting] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setWaiting(false), 3000)
    return () => clearTimeout(timer)
  }, [])

  if (loading && waiting) {
    return <AddedSkeleton />
  }

  return (
    <>
      <h1>
        {item.quantity > 0
          ? 'Товар добавлен в корзину'
          : 'Товар удалён из корзины'}
      </h1>
      <CartStyled data-variant="checkout" aria-label="Позиция корзины">
        <div role="list">
          <OrderItem item={item} orderId={orderId} editable />
        </div>
      </CartStyled>
      <Recommendations products={data?.orderRecommendations ?? []} />
      <ActionsStyled>
        <Link to="/cart">Перейти к оформлению</Link>
        <Link to="/katalog-sharov-i-figur.html">Продолжить покупки</Link>
      </ActionsStyled>
    </>
  )
}
