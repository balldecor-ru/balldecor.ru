import { KbConceptGalleryCategoryFragment } from 'app/Custom/interfaces/concepts'
import { GalleryCategoryConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type GalleryCategoryConceptViewProps = {
  concept: KbConceptGalleryCategoryFragment
}

export const GalleryCategoryConceptView: React.FC<
  GalleryCategoryConceptViewProps
> = ({ concept }) => {
  return (
    <GalleryCategoryConceptViewStyled>
      <ConceptContent concept={concept} />
    </GalleryCategoryConceptViewStyled>
  )
}
