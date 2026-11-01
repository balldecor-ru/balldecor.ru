import { KbConceptPriceListFragment } from 'app/Custom/interfaces/concepts'
import { PriceListConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type PriceListConceptViewProps = {
  concept: KbConceptPriceListFragment
}

export const PriceListConceptView: React.FC<PriceListConceptViewProps> = ({
  concept,
}) => {
  return (
    <PriceListConceptViewStyled>
      <ConceptContent concept={concept} />
    </PriceListConceptViewStyled>
  )
}
