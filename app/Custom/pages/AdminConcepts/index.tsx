import type React from 'react'
import { Link } from 'react-router'
import { useAppContext } from 'app/Custom/components/AppContext'
import { ConceptList } from './ConceptList'
import { AdminConceptsStyled } from './styles'

export const AdminConceptsPage: React.FC = () => {
  const { user, userLoading = true } = useAppContext() ?? {}
  return (
    <AdminConceptsStyled>
      <h1 tabIndex={-1}>Концепты</h1>
      {userLoading ? (
        <p role="status">Проверка доступа…</p>
      ) : user?.sudo === true ? (
        <>
          <nav>
            <Link to="/admin-panel">← Админка</Link>
          </nav>
          <ConceptList />
        </>
      ) : (
        <p>
          Доступ разрешён только администраторам.{' '}
          {!user && <Link to="/signin">Войти</Link>}
        </p>
      )}
    </AdminConceptsStyled>
  )
}
