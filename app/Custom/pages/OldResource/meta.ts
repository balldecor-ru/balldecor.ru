import type { MetaDescriptor } from 'react-router'
import type { OldResourceQuery } from '../../../gql/generated/oldResource'

export function oldResourceMeta(
  resource: OldResourceQuery['oldResource'],
  status: number = 200,
): MetaDescriptor[] {
  if (!resource || status !== 200) {
    const notFound: boolean = status === 404 || status === 200
    return [
      { title: `${notFound ? 'Страница не найдена' : 'Ошибка'} — BallDecor` },
      {
        name: 'description',
        content: notFound
          ? 'По этому адресу нет доступной страницы.'
          : 'Не удалось загрузить страницу.',
      },
      { name: 'robots', content: 'noindex, follow' },
    ]
  }

  // Canonical берём из БД, а не из Host, query или регистра входящего URL.
  const path: string =
    resource.id === 1 ? '/' : `/${(resource.uri ?? '').replace(/^\/+/, '')}`
  const canonical: string = new URL(`https://balldecor.ru${path}`).href
  const title: string = `${resource.pagetitle} — BallDecor`
  return [
    { title },
    { name: 'description', content: resource.description },
    {
      name: 'robots',
      content: resource.searchable === 1 ? 'index, follow' : 'noindex, follow',
    },
    { tagName: 'link', rel: 'canonical', href: canonical },
    { property: 'og:type', content: 'website' },
    { property: 'og:site_name', content: 'BallDecor' },
    { property: 'og:title', content: title },
    { property: 'og:description', content: resource.description },
    { property: 'og:url', content: canonical },
  ]
}
