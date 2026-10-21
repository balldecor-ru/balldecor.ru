import { isRouteErrorResponse, useRouteError } from 'react-router'
import type { Route } from './+types/$'
import { ConceptPage } from '../Custom/pages/Concepts/Concept'
import { loadConcept } from '../Custom/pages/Concepts/Concept/loader.server'
import { createSeoMeta } from '../components/seo/SeoHeaders'

export const loader = loadConcept

export const headers: Route.HeadersFunction = ({ loaderHeaders }) => ({
  'Cache-Control': 'no-store',
  ...(loaderHeaders.has('X-Robots-Tag')
    ? { 'X-Robots-Tag': loaderHeaders.get('X-Robots-Tag') ?? '' }
    : {}),
})

export const meta: Route.MetaFunction = ({ loaderData: result, error }) =>
  error || !result
    ? createSeoMeta({
        title:
          isRouteErrorResponse(error) && error.status === 404
            ? 'Страница не найдена — BallDecor'
            : 'Не удалось загрузить страницу — BallDecor',
        description: '',
        noindex: true,
      })
    : createSeoMeta(result.seo)

const ResourceRoute: React.FC = ConceptPage

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
