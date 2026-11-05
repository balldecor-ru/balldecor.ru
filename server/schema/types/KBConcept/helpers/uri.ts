import type { Knex } from 'knex'
import type { ConceptRecord } from '..'

export async function conceptUri(
  db: Knex,
  concept: Pick<ConceptRecord, 'id' | 'uri'>,
): Promise<string> {
  if (concept.uri) {
    return concept.uri
  }
  const route = await db<{ path: string }>('SiteRoute')
    .select('path')
    .where('kBConceptId', concept.id)
    .first()
  return route?.path || `/concepts/${concept.id}`
}
