import type { MetaFunction } from 'react-router'
import { AdminConceptsPage } from 'app/Custom/pages/AdminConcepts'

export const meta: MetaFunction = () => [
  { title: 'Концепты — Админка' },
  { name: 'robots', content: 'noindex, nofollow' },
]
export { AdminConceptsPage as default }
