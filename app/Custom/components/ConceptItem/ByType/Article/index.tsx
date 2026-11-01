import { KbConceptArticleFragment } from 'app/Custom/interfaces/concepts'
import { ArticleConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ArticleConceptViewProps = {
  concept: KbConceptArticleFragment
}

export const ArticleConceptView: React.FC<ArticleConceptViewProps> = ({
  concept,
}) => {
  return (
    <ArticleConceptViewStyled>
      <ConceptContent concept={concept} />
    </ArticleConceptViewStyled>
  )
}
