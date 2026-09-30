import { ApolloProvider } from '@apollo/client/react'
// import { useApollo } from 'app/gql/apolloClient'
import { useApollo } from '../../gql/apolloClient'
import { AppContextProvider } from '../AppContext'

const withWs = false

type AppProvidersProps = React.PropsWithChildren

export const AppProviders: React.FC<AppProvidersProps> = ({ children }) => {
  // const apolloClient = useApollo(pageProps.initialApolloState, withWs)
  const apolloClient = useApollo(undefined, withWs)

  return (
    <ApolloProvider client={apolloClient}>
      <AppContextProvider
        // user={user}
        userLoading={false}
        // appData={appData}
      >
        {children}
      </AppContextProvider>
    </ApolloProvider>
  )
}
