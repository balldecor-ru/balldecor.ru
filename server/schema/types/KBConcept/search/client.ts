export class SearchHttpError extends Error {
  constructor(public readonly status: number) {
    super(`Search service returned HTTP ${status}`)
  }
}

export function searchConfigured(): boolean {
  return Boolean(process.env.TYPESENSE_URL && process.env.TYPESENSE_API_KEY)
}

export async function searchRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  if (!searchConfigured()) {
    throw new Error('Catalog search is not configured')
  }
  const response = await fetch(
    `${process.env.TYPESENSE_URL?.replace(/\/$/, '')}${path}`,
    {
      ...init,
      headers: {
        'X-TYPESENSE-API-KEY': process.env.TYPESENSE_API_KEY ?? '',
        'Content-Type': 'application/json',
        ...init.headers,
      },
      signal: AbortSignal.timeout(60000),
    },
  )
  if (!response.ok) {
    throw new SearchHttpError(response.status)
  }
  if (path.includes('/documents/import')) {
    return (await response.text()) as T
  }
  return (await response.json()) as T
}

export const conceptSearchType = 'old:page:31:modDocument'
export const collection = 'balldecor_concepts'

export async function searchConceptIds(query: string): Promise<string[]> {
  if (!query.trim()) {
    return []
  }
  const params = new URLSearchParams({
    q: query.trim(),
    query_by: 'name,description,content',
    query_by_weights: '8,2,1',
    prefix: 'true,false,false',
    num_typos: '2',
    drop_tokens_threshold: '0',
    include_fields: 'id',
    highlight_fields: 'none',
    limit: '250',
  })
  const ids: string[] = []
  let total = 0
  do {
    params.set('offset', String(ids.length))
    const result = await searchRequest<{
      found: number
      hits: { document: { id: string } }[]
    }>(`/collections/${collection}/documents/search?${params}`)
    total = result.found
    ids.push(...result.hits.map(({ document }) => document.id))
    if (!result.hits.length) {
      break
    }
  } while (ids.length < total)
  return ids
}
