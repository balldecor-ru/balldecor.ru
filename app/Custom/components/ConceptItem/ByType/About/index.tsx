import { KbConceptAboutFragment } from 'app/Custom/interfaces/concepts'
import { AboutConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type AboutConceptViewProps = {
  concept: KbConceptAboutFragment
}

export const AboutConceptView: React.FC<AboutConceptViewProps> = ({
  concept,
}) => {
  return (
    <AboutConceptViewStyled>
      <ConceptContent concept={concept} />
    </AboutConceptViewStyled>
  )
}
