import { renderToReadableStream } from 'react-dom/server'
import { ServerRouter, type EntryContext } from 'react-router'

// Рендеринг документа после выполнения серверных загрузчиков маршрутов.
export default async function handleRequest(
  request: Request,
  status: number,
  headers: Headers,
  context: EntryContext,
) {
  const body = await renderToReadableStream(
    <ServerRouter context={context} url={request.url} />,
    {
      signal: request.signal,
      onError(error) {
        status = 500
        console.error(error)
      },
    },
  )
  await body.allReady
  headers.set('Content-Type', 'text/html; charset=utf-8')
  return new Response(body, { status, headers })
}
