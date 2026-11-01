import { KbConceptPrintPriceListFragment } from 'app/Custom/interfaces/concepts'
import { PrintPriceListConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type PrintPriceListConceptViewProps = {
  concept: KbConceptPrintPriceListFragment
}

export const PrintPriceListConceptView: React.FC<
  PrintPriceListConceptViewProps
> = ({ concept }) => {
  return (
    <PrintPriceListConceptViewStyled>
      <ConceptContent concept={concept} />
    </PrintPriceListConceptViewStyled>
  )
}
