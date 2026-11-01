import { KbConceptServiceCategoryFragment } from 'app/Custom/interfaces/concepts'
import { ServiceCategoryConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ServiceCategoryConceptViewProps = {
  concept: KbConceptServiceCategoryFragment
}

export const ServiceCategoryConceptView: React.FC<
  ServiceCategoryConceptViewProps
> = ({ concept }) => {
  return (
    <ServiceCategoryConceptViewStyled>
      <ConceptContent concept={concept} />
    </ServiceCategoryConceptViewStyled>
  )
}
