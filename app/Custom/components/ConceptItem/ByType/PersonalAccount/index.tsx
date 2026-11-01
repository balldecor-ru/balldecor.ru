import { KbConceptPersonalAccountFragment } from 'app/Custom/interfaces/concepts'
import { PersonalAccountConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type PersonalAccountConceptViewProps = {
  concept: KbConceptPersonalAccountFragment
}

export const PersonalAccountConceptView: React.FC<
  PersonalAccountConceptViewProps
> = ({ concept }) => {
  return (
    <PersonalAccountConceptViewStyled>
      <ConceptContent concept={concept} />
    </PersonalAccountConceptViewStyled>
  )
}
