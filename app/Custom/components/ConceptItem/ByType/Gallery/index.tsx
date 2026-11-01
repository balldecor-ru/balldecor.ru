import { KbConceptGalleryFragment } from 'app/Custom/interfaces/concepts'
import { GalleryConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type GalleryConceptViewProps = {
  concept: KbConceptGalleryFragment
}

export const GalleryConceptView: React.FC<GalleryConceptViewProps> = ({
  concept,
}) => {
  return (
    <GalleryConceptViewStyled>
      <ConceptContent concept={concept} />
    </GalleryConceptViewStyled>
  )
}
