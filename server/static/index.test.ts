import { afterAll, beforeAll, expect, test } from 'vitest'
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'node:http'
import express from 'express'
import { setupStaticSite } from './index'
import type { StaticPage } from './types'

let directory: string
let origin: string
const server = createServer()
beforeAll(async () => {
  directory = await mkdtemp(join(tmpdir(), 'balldecor-static-test-'))
  const pages: StaticPage[] = [
    { path: '/', status: 200, noindex: false },
    { path: '/about.html', status: 200, noindex: false },
    { path: '/%D1%82%D0%B5%D1%81%D1%82', status: 200, noindex: false },
    { path: '/gone', status: 410, noindex: true },
    {
      path: '/old',
      status: 200,
      noindex: true,
      redirect: { location: '/about.html', status: 301 },
    },
  ]
  await mkdir(join(directory, 'static'), { recursive: true })
  await writeFile(join(directory, 'static/pages.json'), JSON.stringify(pages))
  for (const page of pages) {
    const base = join(directory, 'client', page.path)
    await mkdir(base, { recursive: true })
    await writeFile(join(base, 'index.html'), `<h1>${page.path}</h1>`)
    await writeFile(
      join(
        directory,
        'client',
        page.path === '/' ? '_.data' : `${page.path}.data`,
      ),
      `data:${page.path}`,
    )
  }
  await writeFile(join(directory, 'client/__spa-fallback.html'), '<h1>SPA</h1>')
  const app = express()
  setupStaticSite(app, directory)
  server.on('request', app)
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve))
  const address = server.address()
  if (!address || typeof address === 'string') {
    throw new Error('Нет адреса сервера')
  }
  origin = `http://127.0.0.1:${address.port}`
})
afterAll(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()))
  await rm(directory, { recursive: true, force: true })
})

test('HTML и данные переходов отдаются из файлов без подключения БД', async () => {
  for (const path of ['/', '/about.html', '/тест']) {
    const response = await fetch(`${origin}${path}`)
    expect(response.status).toBe(200)
    expect(await response.text()).toContain('<h1>')
    const data = await fetch(
      `${origin}${path === '/' ? '/_.data' : `${path}.data`}?_routes=routes%2F%24`,
    )
    expect(data.status).toBe(200)
    expect(await data.text()).toMatch(/^data:/)
  }
})

test('статические страницы сохраняют HTTP-статусы и редиректы', async () => {
  const gone = await fetch(`${origin}/gone/`)
  expect(gone.status).toBe(410)
  expect(gone.headers.get('x-robots-tag')).toBe('noindex')
  const redirect = await fetch(`${origin}/old`, { redirect: 'manual' })
  expect(redirect.status).toBe(301)
  expect(redirect.headers.get('location')).toBe('/about.html')
})

test('SPA разрешена для динамических разделов, неизвестные URL и ресурсы возвращают 404', async () => {
  expect((await fetch(`${origin}/cart/added/order/item`)).status).toBe(200)
  expect((await fetch(`${origin}/users/example`)).status).toBe(200)
  expect(
    (await fetch(`${origin}/admin-panel/chat/dialogues/example`)).status,
  ).toBe(200)
  expect((await fetch(`${origin}/unknown`)).status).toBe(404)
  const missingAsset = await fetch(`${origin}/assets/missing.js`)
  expect(missingAsset.status).toBe(404)
  expect(missingAsset.headers.get('content-type')).toContain('text/plain')
  expect((await fetch(`${origin}/unknown.data`)).status).toBe(404)
})
