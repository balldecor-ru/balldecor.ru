import { logEvent } from 'server/observability'
import { randomUUID } from 'node:crypto'
import type { Knex } from 'knex'
import {
  collection,
  conceptSearchType,
  searchRequest,
  SearchHttpError,
} from './client'

interface IndexRow {
  price: number | null
  id: string
  name: string
  description: string | null
  intro: string | null
  content: string | null
}
function plainText(value: string | null): string {
  return (value ?? '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export async function replaceIndex(rows: IndexRow[]): Promise<void> {
  const name = `${collection}_${randomUUID().replaceAll('-', '')}`
  let previous: string | undefined
  try {
    previous = (
      await searchRequest<{ collection_name: string }>(`/aliases/${collection}`)
    ).collection_name
  } catch (error) {
    if (!(error instanceof SearchHttpError && error.status === 404)) {
      throw error
    }
  }
  await searchRequest('/collections', {
    method: 'POST',
    body: JSON.stringify({
      name,
      fields: [
        { name: 'price', type: 'float', optional: true },
        ...['name', 'description', 'content'].map((name) => ({
          name,
          type: 'string',
          locale: 'ru',
        })),
      ],
    }),
  })
  let publishing = false
  try {
    for (let offset = 0; offset < rows.length; offset += 250) {
      const documents = rows.slice(offset, offset + 250).map((row) => ({
        id: row.id,
        ...(row.price === null ? {} : { price: row.price }),
        name: plainText(row.name),
        description: plainText(
          [row.description, row.intro].filter(Boolean).join(' '),
        ),
        content: plainText(row.content),
      }))
      const response = await searchRequest<string>(
        `/collections/${name}/documents/import?action=upsert`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: documents.map((row) => JSON.stringify(row)).join('\n'),
        },
      )
      const statuses = response
        .trim()
        .split('\n')
        .map((line) => JSON.parse(line) as { success: boolean; error?: string })
      if (
        statuses.length !== documents.length ||
        statuses.some((status) => !status.success)
      ) {
        throw new Error('Ошибка импорта поискового индекса', {
          cause: statuses.filter((status) => !status.success),
        })
      }
    }
    // При таймауте переключение могло завершиться: сохраняем новую коллекцию.
    publishing = true
    await searchRequest(`/aliases/${collection}`, {
      method: 'PUT',
      body: JSON.stringify({ collection_name: name }),
    })
    logEvent('info', 'concept_search_index_published', { count: rows.length })
  } finally {
    if (!publishing) {
      await searchRequest(`/collections/${name}`, { method: 'DELETE' })
    }
  }
  if (previous?.startsWith(`${collection}_`)) {
    await searchRequest(`/collections/${previous}`, { method: 'DELETE' })
  }
}

export async function reindexConcepts(db: Knex): Promise<void> {
  // Транзакция записи сериализует ручные индексации между процессами.
  await db.transaction(async (trx) => {
    await trx('KBConcept').whereRaw('0 = 1').update({ name: '' })
    const rows = await trx<IndexRow>('KBConcept')
      .select('id', 'name', 'description', 'intro', 'content', 'price')
      .where('type', conceptSearchType)
      .where('visibility', 'public')
      .where('searchable', true)
      .orderBy('id')
    await replaceIndex(rows)
  })
}
