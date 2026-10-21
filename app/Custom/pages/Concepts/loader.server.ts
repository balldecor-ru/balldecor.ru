import type { TypedDocumentNode } from '@apollo/client'
import { data, type LoaderFunctionArgs } from 'react-router'
import {
  ConceptsConnectionDocument,
  type ConceptsConnectionQuery,
  type ConceptsConnectionQueryVariables,
} from '../../../gql/generated'
import { getInitialProps } from '../../components/pages/_App/getInitialProps.server'
import { getListVariables, type ConceptListKind } from './queryVariables'

export function createListLoader(kind: ConceptListKind) {
  return async function loadConceptList({
    request,
    context,
  }: LoaderFunctionArgs) {
    const pageParam = new URL(request.url).searchParams.get('page')
    const parsedPage = pageParam === null ? 1 : Number.parseInt(pageParam, 10)
    const page = parsedPage > 0 ? parsedPage : 1
    const variables = getListVariables(kind, page)
    if (
      !Number.isSafeInteger(variables.skip) ||
      (variables.skip ?? 0) > 2_147_483_647
    ) {
      throw new Response('Страница не найдена', { status: 404 })
    }
    const props = await getInitialProps(context, async (client) => {
      try {
        const result = await client.query({
          query: ConceptsConnectionDocument as unknown as TypedDocumentNode<
            ConceptsConnectionQuery,
            ConceptsConnectionQueryVariables
          >,
          // Полный список нужен для пагинации без запросов к БД в проде.
          variables: { ...variables, skip: undefined, take: undefined },
        })
        return {
          page,
          kind,
          initialError: false,
          concepts: result.data?.concepts ?? [],
          notFound:
            page > 1 &&
            (page - 1) * (variables.take ?? 12) >=
              (result.data?.concepts.length ?? 0),
        }
      } catch (error) {
        console.error('Failed to load concept list', error)
        throw new Response('Не удалось загрузить публикации', { status: 503 })
      }
    })
    if (props.notFound) {
      throw new Response('Страница не найдена', { status: 404 })
    }
    return data(props, { status: props.initialError ? 503 : 200 })
  }
}
