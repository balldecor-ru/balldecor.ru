import { KbConceptServicesFragment } from 'app/Custom/interfaces/concepts'
import { ServicesConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ServicesConceptViewProps = {
  concept: KbConceptServicesFragment
}

export const ServicesConceptView: React.FC<ServicesConceptViewProps> = ({
  concept,
}) => {
  return (
    <ServicesConceptViewStyled>
      <ConceptContent concept={concept} />
    </ServicesConceptViewStyled>
  )
}
