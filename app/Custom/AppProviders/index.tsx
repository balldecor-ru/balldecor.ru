import { useMemo } from 'react'
import { useMatches } from 'react-router'
import type { NormalizedCacheObject } from '@apollo/client'
import { ApolloProvider } from '@apollo/client/react'
import { useApollo } from '../../gql/apolloClient'
import { mergeApolloState } from '../../gql/apolloClient/mergeApolloState'
import { AppContextProvider } from '../AppContext'

type AppProvidersProps = React.PropsWithChildren

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  const matches = useMatches()
  const initialState: NormalizedCacheObject = useMemo(() => {
    let state: NormalizedCacheObject = {}
    for (const { loaderData: data } of matches) {
      if (data && typeof data === 'object' && 'initialApolloState' in data) {
        state = mergeApolloState(
          state,
          data.initialApolloState as NormalizedCacheObject,
        )
      }
    }
    return state
  }, [matches])
  const apolloClient = useApollo(initialState, false)

  return (
    <ApolloProvider client={apolloClient}>
      <AppContextProvider userLoading={false}>{children}</AppContextProvider>
    </ApolloProvider>
  )
}
