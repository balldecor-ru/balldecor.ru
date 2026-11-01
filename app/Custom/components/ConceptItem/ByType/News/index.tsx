import { KbConceptNewsFragment } from 'app/Custom/interfaces/concepts'
import { NewsConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type NewsConceptViewProps = {
  concept: KbConceptNewsFragment
}

export const NewsConceptView: React.FC<NewsConceptViewProps> = ({
  concept,
}) => {
  return (
    <NewsConceptViewStyled>
      <ConceptContent concept={concept} />
    </NewsConceptViewStyled>
  )
}
