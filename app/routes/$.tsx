import {
  data,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from 'react-router'
import type { Route } from './+types/$'
import { OldResourcePage } from '../Custom/pages/OldResource'
import { loadOldResource } from '../Custom/pages/OldResource/load.server'
import { oldResourceMeta } from '../Custom/pages/OldResource/meta'

export const loader = async ({ request, params }: Route.LoaderArgs) => {
  const result = await loadOldResource(request, params['*'] ?? '')
  return data(result, { status: result.resource ? 200 : 404 })
}

export const headers: Route.HeadersFunction = () => ({
  'Cache-Control': 'no-store',
})

export const meta: Route.MetaFunction = ({ loaderData: result, error }) =>
  oldResourceMeta(
    result?.resource,
    error ? (isRouteErrorResponse(error) ? error.status : 500) : 200,
  )

const ResourceRoute: React.FC = () => {
  const loaderData = useLoaderData<typeof loader>()
  return <OldResourcePage variables={loaderData.variables} />
}

export const ErrorBoundary: React.FC = () => {
  const error: unknown = useRouteError()
  const notFound: boolean = isRouteErrorResponse(error) && error.status === 404
  return (
    <>
      <h1 tabIndex={-1}>
        {notFound ? 'Страница не найдена' : 'Не удалось загрузить страницу'}
      </h1>
      {!notFound && <p>Попробуйте обновить страницу позже.</p>}
    </>
  )
}

// React Router требует default-экспорт компонента в модуле маршрута.
export { ResourceRoute as default }
