import React, { useCallback } from 'react'
import { Link, useSearchParams, useNavigate } from 'react-router'
import { AuthProviders } from 'app/Custom/components/Auth/AuthProviders'
import { SignInForm } from 'app/Custom/components/Auth/SignInForm'
import { useAuthedRedirect } from 'app/Custom/components/Auth/hooks/useAuthedRedirect'
import { useAppContext } from 'app/Custom/hooks/useAppContext'
import { SignInPageStyled, SignInRegistrationStyled } from './styles'

export const SignInPage: React.FC = () => {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const success = useCallback(() => {
    void navigate('/panel/profile')
  }, [navigate])
  useAuthedRedirect('/panel/profile', params.get('switch') !== '1')
  const { user, userLoading = true } = useAppContext() ?? {}
  return (
    <SignInPageStyled>
      <h1 tabIndex={-1}>Войти</h1>
      <p>Войдите в свою учётную запись.</p>
      <SignInForm
        onSuccessHandler={success}
        loading={userLoading || (Boolean(user) && params.get('switch') !== '1')}
      />
      <AuthProviders
        onSuccessHandler={success}
        referrerToken={params.get('referrerToken')}
        disabled={
          userLoading || (Boolean(user) && params.get('switch') !== '1')
        }
      />
      <SignInRegistrationStyled>
        <p>Нет аккаунта?</p>
        <Link to={`/signup${params.size ? `?${params}` : ''}`}>
          Создать учётную запись
        </Link>
      </SignInRegistrationStyled>
    </SignInPageStyled>
  )
}
