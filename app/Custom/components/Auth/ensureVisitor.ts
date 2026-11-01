import { getVisitorKey, handleAuthorization } from './handleAuthorization'
import { initializeApollo } from 'app/gql/apolloClient'
import { EnsureVisitorDocument } from 'app/gql/generated'

let pending: Promise<string> | undefined
let establishedToken: string | undefined

// Первый чат и первая корзина используют одну сессию, даже при одновременных действиях.
export function ensureVisitor(): Promise<string> {
  const existing = localStorage.getItem('token')
  if (existing && existing === establishedToken) {
    return Promise.resolve(existing)
  }
  if (pending) {
    return pending
  }
  pending = (async () => {
    const key = getVisitorKey()
    const client = initializeApollo({ withWs: false })
    const response = await client.mutate({
      mutation: EnsureVisitorDocument,
      variables: { key },
    })
    const session = response.data?.ensureVisitor
    const token = session?.token
    if (!token) {
      throw new Error('Не удалось создать сессию пользователя')
    }
    await handleAuthorization(token, session.userId, client)
    establishedToken = token
    return token
  })().finally(() => {
    pending = undefined
  })
  return pending
}
