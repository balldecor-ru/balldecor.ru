import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import type { Express } from 'express'
import sirv from 'sirv'
import { pagePath, type StaticPage } from './types'

export function setupStaticSite(
  app: Express,
  buildDirectory = resolve('build'),
): void {
  const pages = JSON.parse(
    readFileSync(resolve(buildDirectory, 'static/pages.json'), 'utf8'),
  ) as StaticPage[]
  const byPath = new Map(
    pages.map((page) => [decodeURIComponent(page.path), page]),
  )
  const byDataPath = new Map(
    pages.map((page) => [
      decodeURIComponent(page.path === '/' ? '/_.data' : `${page.path}.data`),
      page,
    ]),
  )
  const clientDirectory = resolve(buildDirectory, 'client')
  app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return next()
    }
    let pathname: string
    try {
      pathname = pagePath(
        decodeURIComponent(
          new URL(req.originalUrl, 'http://static.local').pathname,
        ),
      )
    } catch {
      res.status(400).end()
      return
    }
    // Для URL с завершающим слешем React Router запрашивает /page/_.data.
    const dataPage =
      byDataPath.get(pathname) ??
      (pathname.endsWith('/_.data')
        ? byDataPath.get(pathname.replace(/\/_\.data$/, '.data'))
        : undefined)
    if (dataPage) {
      const file = dataPage.path === '/' ? '/_.data' : `${dataPage.path}.data`
      res.setHeader('Cache-Control', 'no-cache')
      res.type('text/x-script').sendFile(resolve(clientDirectory, `.${file}`))
      return
    }
    const page = byPath.get(pathname)
    if (!page) {
      return next()
    }
    res.setHeader('Cache-Control', 'no-cache')
    if (page.noindex) {
      res.setHeader('X-Robots-Tag', 'noindex')
    }
    if (page.redirect) {
      res.redirect(page.redirect.status, page.redirect.location)
      return
    }
    res
      .status(page.status)
      .sendFile(resolve(clientDirectory, `.${page.path}/index.html`))
  })
  app.use(
    sirv(clientDirectory, {
      extensions: [],
      setHeaders(res, pathname) {
        res.setHeader(
          'Cache-Control',
          /\.(?:html|data|xml)$/.test(pathname)
            ? 'no-cache'
            : 'public, max-age=3600',
        )
      },
    }),
  )
  app.use((req, res) => {
    const path = pagePath(
      new URL(req.originalUrl, 'http://static.local').pathname,
    )
    const clientRoute =
      /^\/cart\/added\/[^/]+\/[^/]+$/.test(path) ||
      /^\/users\/[^/]+$/.test(path) ||
      /^\/admin-panel\/chat\/dialogues\/[^/]+$/.test(path)
    res.setHeader('Cache-Control', 'no-cache')
    res.setHeader('X-Robots-Tag', 'noindex')
    if (
      !['GET', 'HEAD'].includes(req.method) ||
      path.endsWith('.data') ||
      (!clientRoute &&
        (/\.[^/]+$/.test(path) || /^\/(assets|images)\//.test(path)))
    ) {
      res.status(404).type('text').send('Не найдено')
      return
    }
    res
      .status(clientRoute ? 200 : 404)
      .sendFile(resolve(clientDirectory, '__spa-fallback.html'))
  })
}
