import { KbConceptServiceGalleryItemFragment } from 'app/Custom/interfaces/concepts'
import { ServiceGalleryItemConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ServiceGalleryItemConceptViewProps = {
  concept: KbConceptServiceGalleryItemFragment
}

export const ServiceGalleryItemConceptView: React.FC<
  ServiceGalleryItemConceptViewProps
> = ({ concept }) => {
  return (
    <ServiceGalleryItemConceptViewStyled>
      <ConceptContent concept={concept} />
    </ServiceGalleryItemConceptViewStyled>
  )
}
