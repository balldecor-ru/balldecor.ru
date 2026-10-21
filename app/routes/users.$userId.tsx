import type { MetaFunction } from 'react-router'
import { UserPage } from 'app/Custom/pages/Users/User'
import { userPageClientLoader } from 'app/Custom/pages/Users/User/userPageClientLoader'
import { createSeoMeta, unavailableSeoMeta } from '../components/seo/SeoHeaders'
export { userPageClientLoader as clientLoader } from 'app/Custom/pages/Users/User/userPageClientLoader'
export const meta: MetaFunction<typeof userPageClientLoader> = ({
  loaderData: data,
  error,
}) =>
  error || !data
    ? unavailableSeoMeta()
    : !data.user
      ? createSeoMeta({
          title: 'Профиль пользователя',
          description: '',
          path: `/users/${encodeURIComponent(data.userId)}`,
          noindex: true,
        })
      : [
          ...createSeoMeta({
            title: data.user.fullname || data.user.username || data.user.id,
            description: data.user.intro || '',
            path: `/users/${encodeURIComponent(data.userId)}`,
            noindex: true,
          }),
          {
            'script:ld+json': {
              '@context': 'https://schema.org',
              '@type': 'Person',
              name: data.user.fullname || data.user.username || data.user.id,
            },
          },
        ]
export default UserPage
