import {
  KbConceptVisibility,
  type ConceptsQueryVariables,
} from 'app/gql/generated'

export function getCategoryVariables(id: string): ConceptsQueryVariables {
  return {
    where: { parentId: { equals: id }, visibility: KbConceptVisibility.PUBLIC },
    detailedInfo: false,
  }
}
