import type { ClientLoaderFunctionArgs } from 'react-router'

export function usersPageClientLoader({ request }: ClientLoaderFunctionArgs): {
  page: number
} {
  const raw = new URL(request.url).searchParams.get('page')
  const page = raw === null ? 1 : Number(raw)
  if (!Number.isSafeInteger(page) || page < 1 || (page - 1) * 10 > 2147483647) {
    throw new Response('Страница не найдена', { status: 404 })
  }
  return { page }
}
