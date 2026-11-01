import { KbConceptServiceGalleryFragment } from 'app/Custom/interfaces/concepts'
import { ServiceGalleryConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ServiceGalleryConceptViewProps = {
  concept: KbConceptServiceGalleryFragment
}

export const ServiceGalleryConceptView: React.FC<
  ServiceGalleryConceptViewProps
> = ({ concept }) => {
  return (
    <ServiceGalleryConceptViewStyled>
      <ConceptContent concept={concept} />
    </ServiceGalleryConceptViewStyled>
  )
}
