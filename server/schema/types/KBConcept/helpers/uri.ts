import type { ConceptRecord } from '..'

export function conceptUri(concept: Pick<ConceptRecord, 'id' | 'uri'>): string {
  return concept.uri || `/concepts/${concept.id}`
}
