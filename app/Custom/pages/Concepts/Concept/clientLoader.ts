import type { ClientLoaderFunctionArgs } from 'react-router'
import type { loadConcept } from './loader.server'

export async function loadStaticConcept({
  request,
  serverLoader,
}: ClientLoaderFunctionArgs) {
  try {
    return await serverLoader<typeof loadConcept>()
  } catch (error) {
    if (import.meta.env.PROD) {
      // У SPA fallback нет данных концепта. Отличаем отсутствующий файл от ошибки загрузки.
      const url = new URL(request.url)
      url.pathname = `${url.pathname.replace(/\/+$/, '')}.data`
      const response = await fetch(url, {
        method: 'HEAD',
        signal: request.signal,
      })
      if (response.status === 404) {
        throw new Response('Страница не найдена', { status: 404 })
      }
    }
    throw error
  }
}
