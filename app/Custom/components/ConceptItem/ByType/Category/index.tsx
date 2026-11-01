import { KbConceptCategoryFragment } from 'app/Custom/interfaces/concepts'
import { CategoryConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type CategoryConceptViewProps = {
  concept: KbConceptCategoryFragment
}

export const CategoryConceptView: React.FC<CategoryConceptViewProps> = ({
  concept,
}) => {
  return (
    <CategoryConceptViewStyled>
      <ConceptContent concept={concept} />
    </CategoryConceptViewStyled>
  )
}
