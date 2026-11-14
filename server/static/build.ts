import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { createDatabase, migrateDatabase } from '../database'
import { importedPageData } from '../../app/Custom/pages/Concepts/Concept/metadata'
import { pagePath, type StaticPage } from './types'

interface ConceptRow {
  id: string
  uri: string | null
  visibility: string
  searchable: boolean
  data: unknown
  updatedAt: Date
}

export async function readStaticPages(): Promise<StaticPage[]> {
  const database = createDatabase()
  await migrateDatabase(database)
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
          concept.visibility !== 'public' ||
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
}
