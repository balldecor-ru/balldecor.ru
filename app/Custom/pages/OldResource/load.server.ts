import type { NormalizedCacheObject, TypedDocumentNode } from '@apollo/client'
import { initializeApollo } from '../../../gql/apolloClient'
import {
  OldResourceDocument,
  type OldResourceQuery,
  type OldResourceQueryVariables,
} from '../../../gql/generated/oldResource'
import type { OldResourcePageData } from './interfaces'

export function resourceVariables(
  url: string,
  uri: string,
): OldResourceQueryVariables {
  const pathname: string = new URL(url).pathname
  try {
    // Закодированный разделитель не должен превращаться в новый сегмент.
    if (/%2f|%5c/i.test(pathname)) {
      throw new URIError('Недопустимый разделитель URI')
    }
    decodeURIComponent(pathname)
  } catch {
    throw new Response('Страница не найдена', { status: 404 })
  }
  return {
    where: { uri, context_key: 'web' },
  }
}

export async function loadOldResource(
  request: Request,
  uri: string,
): Promise<OldResourcePageData> {
  const variables: OldResourceQueryVariables = resourceVariables(
    request.url,
    uri,
  )
  // На каждый запрос создаётся собственный клиент: SSR-кэш не общий для посетителей.
  const client = initializeApollo({ withWs: false })
  try {
    const result = await client.query({
      query: OldResourceDocument as TypedDocumentNode<
        OldResourceQuery,
        OldResourceQueryVariables
      >,
      variables,
      context: { fetchOptions: { signal: request.signal } },
    })
    const resource = result.data?.oldResource ?? null
    if (resource && (resource.published !== 1 || resource.deleted !== 0)) {
      // Не передаём закрытый документ ни в loaderData, ни в Apollo-кэш браузера.
      throw new Response('Страница не найдена', { status: 404 })
    }
    return {
      variables,
      resource,
      initialApolloState: client.extract() as NormalizedCacheObject,
    }
  } finally {
    client.stop()
  }
}
