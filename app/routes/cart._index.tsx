import type { MetaFunction } from 'react-router'
import { CartPage } from 'app/Custom/pages/Cart'
import { createSeoMeta } from '../components/seo/SeoHeaders'

export const meta: MetaFunction = () =>
  createSeoMeta({
    title: 'Корзина и заказы',
    description: '',
    path: '/cart',
    noindex: true,
  })
export { CartPage as default }
