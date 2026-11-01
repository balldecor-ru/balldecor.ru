import { KbConceptEmptyFragment } from 'app/Custom/interfaces/concepts'
import { EmptyConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type EmptyConceptViewProps = {
  concept: KbConceptEmptyFragment
}

export const EmptyConceptView: React.FC<EmptyConceptViewProps> = ({
  concept,
}) => {
  return (
    <EmptyConceptViewStyled>
      <ConceptContent concept={concept} />
    </EmptyConceptViewStyled>
  )
}
