import greatVibes400Url from '@fontsource/great-vibes/400.css?url'
import nunitoSans300Url from '@fontsource/nunito-sans/300.css?url'
import nunitoSans400Url from '@fontsource/nunito-sans/400.css?url'
import nunitoSans500Url from '@fontsource/nunito-sans/500.css?url'
import nunitoSans600Url from '@fontsource/nunito-sans/600.css?url'
import nunitoSans700Url from '@fontsource/nunito-sans/700.css?url'
import nunito400Url from '@fontsource/nunito/400.css?url'
import nunito600Url from '@fontsource/nunito/600.css?url'
import nunito700Url from '@fontsource/nunito/700.css?url'
import { loadRoot } from './request/rootLoader.server'
import { requestMiddleware } from './request/context.server'
import { App as CustomApp } from './Custom/components/pages/_App'
import { Statistics } from './components/Statistics'
import { errorPageStatusCode } from './components/Statistics/status'
import { HtmlStyled } from './Custom/theme/global'
import { SeoHeaders, unavailableSeoMeta } from './components/seo/SeoHeaders'

export const links = () => [
  { rel: 'stylesheet', href: greatVibes400Url },
  { rel: 'stylesheet', href: nunitoSans300Url },
  { rel: 'stylesheet', href: nunitoSans400Url },
  { rel: 'stylesheet', href: nunitoSans500Url },
  { rel: 'stylesheet', href: nunitoSans600Url },
  { rel: 'stylesheet', href: nunitoSans700Url },
  { rel: 'stylesheet', href: nunito400Url },
  { rel: 'stylesheet', href: nunito600Url },
  { rel: 'stylesheet', href: nunito700Url },
]

export const middleware = [requestMiddleware]
export const loader = loadRoot
export const clientLoader = async ({
  serverLoader,
}: ClientLoaderFunctionArgs): Promise<RootLoaderData> =>
  import.meta.env.DEV
    ? serverLoader<RootLoaderData>()
    : { initialApolloState: undefined }
// Refresh runtime configuration when leaving a prerendered page.
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => defaultShouldRevalidate || currentUrl.pathname !== nextUrl.pathname
export const meta = unavailableSeoMeta
import type { ReactNode } from 'react'
import type { ShouldRevalidateFunction } from 'react-router'
import type { ClientLoaderFunctionArgs } from 'react-router'
import type { RootLoaderData } from './request/rootLoader.server'
import { Layout as SiteLayout } from './Custom/Layout'
import {
  Links,
  Outlet,
  Scripts,
  ScrollRestoration,
  isRouteErrorResponse,
  useRouteError,
  useRouteLoaderData,
} from 'react-router'

export function Layout({ children }: { children: ReactNode }) {
  const rootData = useRouteLoaderData<typeof loader>('root')
  return (
    <HtmlStyled lang="ru">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon.png" />
        <SeoHeaders />
        <Links />
      </head>
      <body>
        <CustomApp initialApolloState={rootData?.initialApolloState}>
          <SiteLayout>{children}</SiteLayout>
        </CustomApp>
        <ScrollRestoration />
        <Scripts />
      </body>
    </HtmlStyled>
  )
}
export default function App() {
  return (
    <>
      <Outlet />
      <Statistics />
    </>
  )
}

export function ErrorBoundary() {
  const error = useRouteError()
  return (
    <>
      <Statistics statusCode={errorPageStatusCode(error)} />
      <h1 tabIndex={-1}>
        {isRouteErrorResponse(error)
          ? `${error.status} ${error.statusText}`
          : 'Something went wrong'}
      </h1>
      <p>Please reload the page to retry.</p>
      <a href="/">Return home</a>
    </>
  )
}
