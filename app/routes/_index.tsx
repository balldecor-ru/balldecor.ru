import type { MetaFunction } from 'react-router'
import { createSeoMeta, unavailableSeoMeta } from '../components/seo/SeoHeaders'
import type { SeoHandle } from '../components/seo/SeoHeaders'
import { MainPageCustom } from '../Custom/pages/MainPage'
import delivery from '../pages/MainPage/Hero/delivery.webp'
import { site } from '../components/seo/site'

export const handle = {
  seo: {
    title: 'HAIH — Building websites with AI, from requirements',
    description: site.description,
    path: '/',
    image: {
      src: delivery,
      alt: 'A conceptual illustration of the HAIH website delivery architecture.',
      width: 1200,
      height: 800,
    },
  },
} satisfies SeoHandle

export const meta: MetaFunction = ({ error }) =>
  error ? unavailableSeoMeta() : createSeoMeta(handle.seo)

export default MainPageCustom
