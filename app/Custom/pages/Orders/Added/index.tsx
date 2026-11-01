import { useEffect } from 'react'
import { Link, useParams } from 'react-router'
import { useOrderQuery, OrderStatus } from 'app/gql/generated'
import { useAppContext } from 'app/Custom/hooks/useAppContext'
import { CustomLayoutSectionStyled } from 'app/Custom/Layout/styles'
import { AddedProductView } from './View'
import { AddedSkeleton } from './Skeleton'
import { AddedPageStyled } from './styles'

export const AddedProductPage: React.FC = () => {
  const { orderId = '', orderProductId = '' } = useParams()
  const { user, userLoading = true } = useAppContext() ?? {}
  const { data, loading, error } = useOrderQuery({
    variables: { id: orderId },
    skip: !user || !orderId,
    ssr: false,
    fetchPolicy: 'cache-first',
  })
  const order = data?.order?.userId === user?.id ? data?.order : undefined
  useEffect(() => {
    if (order?.status === OrderStatus.DRAFT) {
      localStorage.setItem('balldecor_current_order', order.id)
    }
  }, [order?.id, order?.status])
  const item = order?.Products.find((entry) => entry.id === orderProductId)

  return (
    <CustomLayoutSectionStyled>
      <AddedPageStyled>
        {userLoading || loading ? (
          <AddedSkeleton />
        ) : error || !item || order?.status !== OrderStatus.DRAFT ? (
          <p role="alert">
            Товар не найден в вашей корзине. Откройте корзину, чтобы проверить
            её состав. <Link to="/cart">Открыть корзину</Link>
          </p>
        ) : (
          <AddedProductView
            key={`${user?.id}:${order.id}:${item.id}`}
            orderId={order.id}
            item={item}
          />
        )}
      </AddedPageStyled>
    </CustomLayoutSectionStyled>
  )
}
