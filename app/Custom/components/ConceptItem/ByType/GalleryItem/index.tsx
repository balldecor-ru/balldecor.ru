import { KbConceptGalleryItemFragment } from 'app/Custom/interfaces/concepts'
import { GalleryItemConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type GalleryItemConceptViewProps = {
  concept: KbConceptGalleryItemFragment
}

export const GalleryItemConceptView: React.FC<GalleryItemConceptViewProps> = ({
  concept,
}) => {
  return (
    <GalleryItemConceptViewStyled>
      <ConceptContent concept={concept} />
    </GalleryItemConceptViewStyled>
  )
}
