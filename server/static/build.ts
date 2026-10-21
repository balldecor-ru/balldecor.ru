import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createDatabase } from '../database'
import { importedPageData } from '../../app/Custom/pages/Concepts/Concept/metadata'
import { generateUrls } from '../sitemap'
import { site } from '../../app/components/seo/site'
import { pagePath, type StaticPage } from './types'

interface ConceptRow {
  id: string
  uri: string | null
  searchable: boolean
  data: unknown
  updatedAt: Date
}

export async function readStaticPages(): Promise<StaticPage[]> {
  const database = createDatabase()
  try {
    const concepts = await database<ConceptRow>('KBConcept').whereNot(
      'visibility',
      'unpublished',
    )
    const pages = new Map<string, StaticPage>()
    for (const concept of concepts) {
      const metadata = importedPageData(concept.data)
      const path = concept.uri || `/concepts/${encodeURIComponent(concept.id)}`
      const url = new URL(path, 'http://build.local')
      if (
        !path.startsWith('/') ||
        url.origin !== 'http://build.local' ||
        url.search ||
        url.hash
      ) {
        throw new Error(`Некорректный URL концепта: ${path}`)
      }
      const normalized = pagePath(url.pathname)
      if (pages.has(normalized)) {
        continue
      }
      pages.set(normalized, {
        path: normalized,
        status: metadata.httpStatus ?? 200,
        noindex:
          !concept.searchable ||
          metadata.noindex === true ||
          metadata.redirect?.noindex === true,
        redirect: metadata.redirect,
      })
    }
    if (!pages.has('/')) {
      throw new Error('В БД отсутствует опубликованная главная страница')
    }
    return [...pages.values()]
  } finally {
    await database.destroy()
  }
}

export async function writeStaticPages(
  buildDirectory: string,
  pages: StaticPage[],
): Promise<void> {
  await mkdir(resolve(buildDirectory, 'static'), { recursive: true })
  await writeFile(
    resolve(buildDirectory, 'static/pages.json'),
    JSON.stringify(pages),
  )
  const database = createDatabase()
  try {
    const concepts = await database<ConceptRow>('KBConcept')
      .whereNot('visibility', 'unpublished')
      .where('searchable', 1)
    const items = concepts
      .filter((concept) => {
        const metadata = importedPageData(concept.data)
        return (
          !metadata.noindex &&
          !metadata.redirect &&
          (metadata.httpStatus ?? 200) === 200
        )
      })
      .map((concept) => ({
        uri: concept.uri || `/concepts/${encodeURIComponent(concept.id)}`,
        updatedAt: concept.updatedAt,
      }))
    await writeFile(
      resolve(buildDirectory, 'client/sitemap.xml'),
      generateUrls(items, site.origin),
    )
  } finally {
    await database.destroy()
  }
}
