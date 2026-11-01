import type { ApolloClient } from '@apollo/client'
import { initializeApollo } from 'app/gql/apolloClient'
import { MeDocument } from 'app/gql/generated'

export function getVisitorKey(): string {
  let key = localStorage.getItem('balldecor_visitor_key')
  if (!key) {
    key = Array.from(crypto.getRandomValues(new Uint8Array(32)), (byte) =>
      byte.toString(16).padStart(2, '0'),
    ).join('')
    localStorage.setItem('balldecor_visitor_key', key)
  }
  return key
}

export async function handleAuthorization(
  token: string,
  userId?: string,
  client: ApolloClient = initializeApollo({ withWs: false }),
): Promise<void> {
  const previousToken = localStorage.getItem('token')
  if (userId) {
    const previousUser = localStorage.getItem('balldecor_chat_user')
    if (previousUser && previousUser !== userId) {
      localStorage.removeItem('chat_access_token')
    }
    localStorage.setItem('balldecor_chat_user', userId)
  }
  localStorage.setItem('token', token)
  if (previousToken !== token) {
    const previousUser = client.readQuery({ query: MeDocument })?.me
    const result = await client.query({
      query: MeDocument,
      fetchPolicy: 'network-only',
    })
    const nextUser = result.data?.me
    if (previousUser && previousUser.id !== nextUser?.id) {
      localStorage.removeItem('chat_access_token')
      localStorage.removeItem('balldecor_current_order')
      await client.resetStore()
    }
    if (nextUser) {
      localStorage.setItem('balldecor_chat_user', nextUser.id)
    }
  }
}
