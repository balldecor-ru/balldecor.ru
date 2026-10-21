import type { Config } from '@react-router/dev/config'
import { readStaticPages, writeStaticPages } from './server/static/build'
import type { StaticPage } from './server/static/types'

let pages: StaticPage[] = []
export default {
  ssr: false,
  routeDiscovery: { mode: 'initial' },
  async prerender({ getStaticPaths }) {
    pages = await readStaticPages()
    for (const path of getStaticPaths()) {
      if (path === '/') {
        continue
      }
      if (pages.some((page) => page.path === path)) {
        throw new Error(
          `URL концепта конфликтует с маршрутом приложения: ${path}`,
        )
      }
      pages.push({ path, status: 200, noindex: false })
    }
    return pages.map((page) => decodeURI(page.path))
  },
  async buildEnd({ reactRouterConfig }) {
    await writeStaticPages(reactRouterConfig.buildDirectory, pages)
  },
} satisfies Config
