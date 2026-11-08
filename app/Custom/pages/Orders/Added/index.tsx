import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { useOrderQuery, OrderStatus } from 'app/gql/generated'
import { useAppContext } from 'app/Custom/components/AppContext'
import { CustomLayoutSectionStyled } from 'app/Custom/Layout/styles'
import { AddedProductView } from './View'
import { AddedSkeleton } from './Skeleton'
import { AddedPageStyled } from './styles'

export const AddedProductPage: React.FC = () => {
  const { orderId = '', orderProductId = '' } = useParams()
  const { user, userLoading = true } = useAppContext() ?? {}
  return (
    <CustomLayoutSectionStyled>
      <AddedPageStyled>
        {userLoading ? (
          <AddedSkeleton />
        ) : user && orderId ? (
          <OrderProduct
            userId={user.id}
            orderId={orderId}
            orderProductId={orderProductId}
          />
        ) : (
          <MissingProduct />
        )}
      </AddedPageStyled>
    </CustomLayoutSectionStyled>
  )
}

const MissingProduct: React.FC = () => {
  return (
    <p role="alert">
      Товар не найден в вашей корзине. Откройте корзину, чтобы проверить её
      состав. <Link to="/cart">Открыть корзину</Link>
    </p>
  )
}

const OrderProduct: React.FC<{
  userId: string
  orderId: string
  orderProductId: string
}> = ({ userId, orderId, orderProductId }) => {
  const { data, loading, error } = useOrderQuery({
    variables: { id: orderId },
    ssr: false,
    fetchPolicy: 'cache-first',
  })
  const order = data?.order?.userId === userId ? data?.order : undefined
  useEffect(() => {
    if (order?.status === OrderStatus.DRAFT) {
      localStorage.setItem('balldecor_current_order', order.id)
    }
  }, [order?.id, order?.status])
  const item = order?.Products.find((entry) => entry.id === orderProductId)

  if (loading) {
    return <AddedSkeleton />
  }
  if (error || !item || order?.status !== OrderStatus.DRAFT) {
    return <MissingProduct />
  }
  return (
    <AddedProductView
      key={`${userId}:${order.id}:${item.id}`}
      orderId={order.id}
      item={item}
    />
  )
}
