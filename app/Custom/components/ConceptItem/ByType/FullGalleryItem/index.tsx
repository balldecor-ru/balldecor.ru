import { KbConceptFullGalleryItemFragment } from 'app/Custom/interfaces/concepts'
import { FullGalleryItemConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type FullGalleryItemConceptViewProps = {
  concept: KbConceptFullGalleryItemFragment
}

export const FullGalleryItemConceptView: React.FC<
  FullGalleryItemConceptViewProps
> = ({ concept }) => {
  return (
    <FullGalleryItemConceptViewStyled>
      <ConceptContent concept={concept} />
    </FullGalleryItemConceptViewStyled>
  )
}
