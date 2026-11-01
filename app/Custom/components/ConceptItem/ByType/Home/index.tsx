import { KbConceptHomeFragment } from 'app/Custom/interfaces/concepts'
import { HomeConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type HomeConceptViewProps = {
  concept: KbConceptHomeFragment
}

export const HomeConceptView: React.FC<HomeConceptViewProps> = ({
  concept,
}) => {
  return (
    <HomeConceptViewStyled>
      <ConceptContent concept={concept} />
    </HomeConceptViewStyled>
  )
}
