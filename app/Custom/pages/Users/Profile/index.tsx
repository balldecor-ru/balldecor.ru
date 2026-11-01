import type * as React from 'react'
import { Link } from 'react-router'
import { useAppContext } from 'app/Custom/hooks/useAppContext'
import { CustomLayoutSectionStyled } from 'app/Custom/Layout/styles'
import { UserPageView } from '../User/View'
import { CustomerProfileForm } from './Form'
import { SignOutButton } from 'app/Custom/components/Auth/SignOutButton'

export const ProfilePage: React.FC = () => {
  const { user, userLoading = true } = useAppContext() ?? {}
  return (
    <CustomLayoutSectionStyled>
      {userLoading ? (
        <p role="status">Загрузка профиля…</p>
      ) : user ? (
        <>
          <h1>Мой профиль</h1>
          {!user.email?.trim() && (
            <p>
              Вы используете анонимный аккаунт. Заполните email и пароль, чтобы
              сохранить доступ к заказам и диалогам. Если у вас уже есть
              аккаунт, <Link to="/signin?switch=1">войдите в него</Link>.
            </p>
          )}
          <CustomerProfileForm key={user.id} user={user} />
          <SignOutButton />
          <details>
            <summary>Расширенный профиль</summary>
            <UserPageView key={user.id} user={user} />
          </details>
        </>
      ) : (
        <p>
          Для просмотра профиля необходимо <Link to="/signin">войти</Link>.
        </p>
      )}
    </CustomLayoutSectionStyled>
  )
}
