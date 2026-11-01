import { Link, useLocation } from 'react-router'
import { useEffect, useRef } from 'react'
import { CircleAlert, ShoppingCart, UserRound } from 'lucide-react'
import { useAppContext } from 'app/Custom/hooks/useAppContext'
import { useOrdersQuery, OrderStatus } from 'app/gql/generated'
import { SignOutButton } from '../Auth/SignOutButton'
import { AccountActionsStyled } from './styles'

export const AccountActions: React.FC = () => {
  const location = useLocation()
  const menu = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (menu.current) {
      menu.current.open = false
    }
  }, [location.pathname])
  const { user, userLoading } = useAppContext() ?? {}
  const { data } = useOrdersQuery({
    variables: { status: OrderStatus.DRAFT },
    skip: !user,
  })
  const quantity = user
    ? (data?.orders
        .filter((order) => order.status === OrderStatus.DRAFT)
        .reduce(
          (sum, order) =>
            sum +
            order.Products.reduce((total, item) => total + item.quantity, 0),
          0,
        ) ?? 0)
    : 0
  const anonymous = !!user && !user.email?.trim()
  return (
    <AccountActionsStyled aria-label="Личный кабинет и корзина">
      <Link to="/cart" aria-label={`Корзина, товаров ${quantity}`}>
        <ShoppingCart size={20} />
        {quantity ? <span>{quantity}</span> : null}
      </Link>
      {!userLoading &&
        (user ? (
          <details ref={menu}>
            <summary
              aria-label="Меню пользователя"
              title={
                anonymous
                  ? 'Заполните профиль, чтобы сохранить доступ'
                  : 'Мой аккаунт'
              }
            >
              <UserRound size={20} />
              {anonymous && (
                <CircleAlert size={16} aria-label="Анонимный аккаунт" />
              )}
            </summary>
            <div className="account-dropdown">
              <p>{user.fullname || user.email || 'Анонимный пользователь'}</p>
              <Link to="/panel/profile">
                {anonymous ? 'Заполнить профиль' : 'Мой профиль'}
              </Link>
              <Link to="/cart">Корзина и заказы</Link>
              {user.sudo && <Link to="/admin-panel">Админка</Link>}
              <SignOutButton />
            </div>
          </details>
        ) : (
          <Link to="/signin">Войти</Link>
        ))}
    </AccountActionsStyled>
  )
}
