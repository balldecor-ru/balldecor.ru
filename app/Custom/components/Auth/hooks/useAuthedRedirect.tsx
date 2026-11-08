import { useEffect } from 'react'
import { useNavigate } from 'react-router'
import { useAppContext } from 'app/Custom/components/AppContext'

export function useAuthedRedirect(redirectTo?: string, enabled = true): void {
  const navigate = useNavigate()
  const { user, userLoading = true } = useAppContext() ?? {}

  useEffect(() => {
    if (enabled && redirectTo && user && !userLoading) {
      void navigate(redirectTo, { replace: true })
    }
  }, [user, userLoading, navigate, redirectTo, enabled])
}
