import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppContext } from '../../../hooks/useAppContext'

export function useAuthedRedirect(redirectTo?: string, enabled = true): void {
  const navigate = useNavigate()
  const { user, userLoading = true } = useAppContext() ?? {}

  useEffect(() => {
    if (enabled && redirectTo && user && !userLoading) {
      void navigate(redirectTo, { replace: true })
    }
  }, [user, userLoading, navigate, redirectTo, enabled])
}
