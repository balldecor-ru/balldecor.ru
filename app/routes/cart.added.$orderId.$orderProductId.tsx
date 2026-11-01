import type { MetaFunction } from 'react-router'
import { AddedProductPage } from 'app/Custom/pages/Orders/Added'
import { createSeoMeta } from '../components/seo/SeoHeaders'

export const meta: MetaFunction = () =>
  createSeoMeta({
    title: 'Товар добавлен в корзину',
    description: '',
    path: '/cart/added',
    noindex: true,
  })

export { AddedProductPage as default }
