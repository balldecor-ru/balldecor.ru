import { KbConceptProductFragment } from 'app/Custom/interfaces/concepts'
import { ProductConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ProductConceptViewProps = {
  concept: KbConceptProductFragment
}

export const ProductConceptView: React.FC<ProductConceptViewProps> = ({
  concept,
}) => {
  return (
    <ProductConceptViewStyled>
      <ConceptContent concept={concept} />
    </ProductConceptViewStyled>
  )
}
