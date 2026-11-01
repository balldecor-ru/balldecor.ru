import { KbConceptPriceItemFragment } from 'app/Custom/interfaces/concepts'
import { PriceItemConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type PriceItemConceptViewProps = {
  concept: KbConceptPriceItemFragment
}

export const PriceItemConceptView: React.FC<PriceItemConceptViewProps> = ({
  concept,
}) => {
  return (
    <PriceItemConceptViewStyled>
      <ConceptContent concept={concept} />
    </PriceItemConceptViewStyled>
  )
}
