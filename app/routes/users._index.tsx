import type { MetaFunction } from 'react-router'
import { UsersPage } from 'app/Custom/pages/Users'
import { usersPageClientLoader } from 'app/Custom/pages/Users/usersPageClientLoader'
import { createSeoMeta, unavailableSeoMeta } from '../components/seo/SeoHeaders'
export const clientLoader = usersPageClientLoader
export const meta: MetaFunction<typeof clientLoader> = ({
  loaderData: data,
  error,
}) =>
  error
    ? unavailableSeoMeta()
    : createSeoMeta({
        title: 'Пользователи',
        description: '',
        noindex: true,
        path: `/users${data && data.page > 1 ? `?page=${data.page}` : ''}`,
      })
export default UsersPage
