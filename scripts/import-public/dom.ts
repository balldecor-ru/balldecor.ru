import { createHash } from 'node:crypto'
import { mkdir, writeFile } from 'node:fs/promises'
import { extname, join } from 'node:path'
import { JSDOM } from 'jsdom'
import { contentToJsx } from './jsx'
import { selectContentRoots, type ContentResource } from './templates'

export interface ParsedPage {
  jsx: string
  httpStatus: number
  title: string
  description: string
  noindex: boolean
  image?: { src: string; alt: string; width: number; height: number }
  assetsSource: string
  assetCount: number
}

export async function fetchPublic(url: URL): Promise<Response> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(30_000),
    redirect: 'manual',
  })
  if (
    !response.ok &&
    ![301, 302, 303, 307, 308].includes(response.status) &&
    (response.status < 400 || response.status >= 500)
  ) {
    throw new Error(`HTTP ${response.status}: ${url.href}`)
  }
  return response
}

export async function parsePage(
  url: URL,
  directory: string,
  resource: ContentResource,
  selector?: string,
): Promise<ParsedPage | { redirect: { location: string; status: number } }> {
  const response = await fetchPublic(url)
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get('location')
    if (!location) {
      throw new Error(`HTTP ${response.status} без Location: ${url.href}`)
    }
    const target = new URL(location, url)
    if (!['http:', 'https:'].includes(target.protocol)) {
      throw new Error(`Неподдерживаемый протокол редиректа: ${target.protocol}`)
    }
    const local = new Set([
      url.host,
      'balldecor.ru',
      'www.balldecor.ru',
      'balldecor.localhost:8080',
    ]).has(target.host)
    const destination = local
      ? `${target.pathname}${target.search}${target.hash}`
      : target.href
    if (destination === `${url.pathname}${url.search}${url.hash}`) {
      throw new Error(`Редирект на самого себя: ${url.href}`)
    }
    await response.body?.cancel()
    return { redirect: { location: destination, status: response.status } }
  }
  const contentType = response.headers
    .get('content-type')
    ?.split(';')[0]
    .trim()
    .toLowerCase()
  if (resource.template === 0 && contentType === 'text/plain') {
    const content = await response.text()
    return {
      jsx: `{${JSON.stringify(content)}}`,
      httpStatus: response.status,
      title: resource.uri ?? '',
      description: '',
      noindex: false,
      assetsSource:
        'export const importedAssets: Record<string, string> = {}\n',
      assetCount: 0,
    }
  }
  if (contentType !== 'text/html') {
    throw new Error(`Ожидался HTML: ${url.href}`)
  }
  const dom = new JSDOM(await response.text(), { url: url.href })
  const document = dom.window.document
  for (const element of document.querySelectorAll('script, style, iframe')) {
    element.remove()
  }
  const roots = selectContentRoots(document, resource, selector)
  if (
    roots.some((root) =>
      roots.some((other) => root !== other && other.contains(root)),
    )
  ) {
    throw new Error(
      'Селектор одновременно выбрал родительский и вложенный блок',
    )
  }
  const assets = new Map<string, { key: string; file: string }>()
  async function download(value: string): Promise<string | undefined> {
    const assetUrl = new URL(value, url)
    if (!['http:', 'https:'].includes(assetUrl.protocol)) {
      throw new Error(`Неподдерживаемый адрес изображения: ${value}`)
    }
    assetUrl.hash = ''
    const existing = assets.get(assetUrl.href)
    if (existing) {
      return `__IMPORTED_${existing.key}__`
    }
    let result: Response
    try {
      result = await fetch(assetUrl, { signal: AbortSignal.timeout(30_000) })
    } catch (error) {
      const cause =
        error instanceof Error && error.cause instanceof Error
          ? error.cause.message
          : String(error)
      console.warn(
        `Ресурс ${resource.id}, template=${resource.template}, URI=${resource.uri}: удалено недоступное изображение: ${assetUrl.href}; ${cause}`,
      )
      return undefined
    }
    if (result.status !== 200) {
      console.warn(
        `Ресурс ${resource.id}, template=${resource.template}, URI=${resource.uri}: удалено изображение с HTTP ${result.status}: ${assetUrl.href}`,
      )
      await result.body?.cancel()
      return undefined
    }
    if (!result.headers.get('content-type')?.startsWith('image/')) {
      throw new Error(`Вместо изображения получен другой тип: ${assetUrl.href}`)
    }
    const suffix = extname(assetUrl.pathname).toLowerCase()
    if (!/^\.(png|jpe?g|gif|webp|svg|avif|ico)$/.test(suffix)) {
      throw new Error(`Неизвестное расширение изображения: ${assetUrl.href}`)
    }
    const bytes = Buffer.from(await result.arrayBuffer())
    const key = `asset${assets.size}`
    const file = `${createHash('sha256').update(bytes).digest('hex').slice(0, 20)}${suffix}`
    await mkdir(join(directory, 'assets'), { recursive: true })
    await writeFile(join(directory, 'assets', file), bytes)
    assets.set(assetUrl.href, { key, file })
    return `__IMPORTED_${key}__`
  }
  const legacyHosts = new Set([url.host, 'balldecor.ru', 'www.balldecor.ru'])
  function localLink(value: string): string {
    if (value.startsWith('#')) {
      return value
    }
    const target = new URL(value, url)
    if (
      ['http:', 'https:'].includes(target.protocol) &&
      legacyHosts.has(target.host)
    ) {
      return `${target.pathname === '/index.html' ? '/' : target.pathname}${target.search}${target.hash}`
    }
    return value
  }
  for (const root of roots) {
    for (const element of [root, ...root.querySelectorAll('*')]) {
      if (['OBJECT', 'EMBED'].includes(element.tagName)) {
        throw new Error(
          `Блок содержит ${element.tagName}; требуется явное правило переноса`,
        )
      }
      for (const attribute of Array.from(element.attributes)) {
        if (
          attribute.name === 'style' ||
          attribute.name === 'tabindex' ||
          /^on/i.test(attribute.name)
        ) {
          element.removeAttribute(attribute.name)
        }
      }
      if (element.tagName === 'A' && element.hasAttribute('name')) {
        const anchor = element.getAttribute('name') ?? ''
        if (anchor) {
          if (element.id && element.id !== anchor) {
            const alias = document.createElement('span')
            alias.id = anchor
            element.before(alias)
          } else {
            element.id = anchor
          }
        }
        element.removeAttribute('name')
      }
      for (const name of [
        'href',
        'src',
        'action',
        'formaction',
        'xlink:href',
      ]) {
        const value = Array.from(element.getAttribute(name) ?? '')
          .filter((character) => character.charCodeAt(0) > 32)
          .join('')
        if (value && /^javascript:/i.test(value)) {
          element.removeAttribute(name)
        }
      }
      if (element.hasAttribute('srcset')) {
        throw new Error('Для srcset требуется отдельное правило переноса')
      }
      if (element.tagName === 'IMG') {
        const src = element.getAttribute('src')
        if (!src?.trim()) {
          console.warn(
            `Ресурс ${resource.id}, template=${resource.template}, URI=${resource.uri}: пропущено скачивание изображения с пустым src; alt=${JSON.stringify(element.getAttribute('alt') ?? '')}`,
          )
          element.removeAttribute('src')
        } else {
          const importedSrc = await download(src)
          if (importedSrc === undefined) {
            element.remove()
            continue
          }
          element.setAttribute('src', importedSrc)
        }
      }
      if (element.hasAttribute('href')) {
        const href = element.getAttribute('href') ?? ''
        if (href.trim()) {
          element.setAttribute('href', localLink(href))
        } else {
          element.removeAttribute('href')
        }
      }
    }
  }
  const imageUrl = document
    .querySelector('meta[property="og:image"]')
    ?.getAttribute('content')
  const imageSrc = imageUrl ? await download(imageUrl) : undefined
  const image = imageSrc
    ? {
        src: imageSrc,
        alt:
          document
            .querySelector('meta[property="og:image:alt"]')
            ?.getAttribute('content') ?? '',
        width:
          Number(
            document
              .querySelector('meta[property="og:image:width"]')
              ?.getAttribute('content'),
          ) || 0,
        height:
          Number(
            document
              .querySelector('meta[property="og:image:height"]')
              ?.getAttribute('content'),
          ) || 0,
      }
    : undefined
  const jsx = contentToJsx(roots)
  const title =
    document.title.trim() ||
    (resource.template === 0 ? (resource.uri ?? '') : '')
  if (!title || !roots.some((root) => root.textContent?.trim())) {
    throw new Error('Пустой заголовок или контент страницы')
  }
  dom.window.close()
  return {
    jsx,
    httpStatus: response.status,
    title,
    description:
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute('content') ?? '',
    noindex: /\bnoindex\b/i.test(
      document.querySelector('meta[name="robots"]')?.getAttribute('content') ??
        '',
    ),
    image,
    assetCount: assets.size,
    assetsSource: `${Array.from(assets.values(), ({ key, file }) => `import ${key} from './assets/${file}'`).join('\n')}\nexport const importedAssets: Record<string, string> = {${Array.from(assets.values(), ({ key }) => key).join(',')}}\n`,
  }
}

export function replaceAssetTokens(source: string): string {
  return source.replace(/"__IMPORTED_(asset\d+)__"/g, 'importedAssets["$1"]')
}
