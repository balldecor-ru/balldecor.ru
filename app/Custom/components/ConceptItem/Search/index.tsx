import type * as React from 'react'
import type { KbConceptSearchFragment } from 'app/gql/generated'
import { Card } from './styles'
export const ConceptSearchCard: React.FC<{
  concept: KbConceptSearchFragment
}> = ({ concept }) => (
  <Card>
    {concept.searchImage && (
      <img src={concept.searchImage} alt="" loading="lazy" />
    )}
    <span>{concept.name}</span>
    {concept.price !== null && concept.price !== undefined && (
      <span>
        {new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
        }).format(concept.price)}
      </span>
    )}
  </Card>
)
