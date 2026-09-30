import { useApolloClient } from '@apollo/client/react'
import React, { useCallback, useMemo, useRef, useState } from 'react'

// import { AuthModal } from 'src/components/Auth/AuthModal'

export type AppContextValue = {
  // user: MeQuery['me']
  userLoading: boolean

  onAuth: ((token: string) => Promise<void>) | undefined
  onSignOut: (() => Promise<void>) | undefined

  isLoginFormOpen: boolean
  openLoginForm: () => void
  closeLoginForm: () => void
  // appData: AppDataQuery | undefined
  // categoriesTree: CategoryTreeNode | undefined
}

export const Context = React.createContext<AppContextValue | null>(null)

type AppContextProviderProps = React.PropsWithChildren<{
  // user: AppContextValue['user']
  userLoading: boolean
  // appData: AppDataQuery | undefined
}>

export const AppContextProvider: React.FC<AppContextProviderProps> = ({
  // user,
  userLoading,
  children,
  // appData,
}) => {
  // const router = useRouter()
  const [isLoginFormOpen, setIsLoginFormOpen] = useState(false)

  const openLoginForm = useCallback(() => {
    setIsLoginFormOpen(true)
  }, [])

  const closeLoginForm = useCallback(() => {
    setIsLoginFormOpen(false)
  }, [])

  // const routerRef = useRef(router)

  // routerRef.current = router

  const apolloClient = useApolloClient()

  const apolloClientRef = useRef(apolloClient)

  apolloClientRef.current = apolloClient

  const onAuth = useCallback(
    async (token: string) => {
      global.localStorage?.setItem('token', token)
      await apolloClient.resetStore().catch(console.error)
    },
    [apolloClient],
  )

  const onSignOut = useCallback(async () => {
    global.localStorage?.removeItem('token')
    await apolloClient.resetStore().catch(console.error)
  }, [apolloClient])

  const context = useMemo<AppContextValue>(() => {
    return {
      // user,
      userLoading,
      onAuth,
      onSignOut,
      isLoginFormOpen,
      openLoginForm,
      closeLoginForm,
      // appData,
    }
  }, [
    closeLoginForm,
    isLoginFormOpen,
    onAuth,
    onSignOut,
    openLoginForm,
    userLoading,
  ])

  return (
    <Context.Provider value={context}>{children}</Context.Provider>
    // <AuthModal isOpen={isLoginFormOpen} onClose={closeLoginForm} />
  )
}

export const useAppContext = () => {
  const context = React.useContext(Context)

  if (!context) {
    throw new Error('Please, provide AppContextProvider')
  }

  return context
}
