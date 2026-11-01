import { KbConceptMainFragment } from 'app/Custom/interfaces/concepts'
import { MainConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type MainConceptViewProps = {
  concept: KbConceptMainFragment
}

export const MainConceptView: React.FC<MainConceptViewProps> = ({
  concept,
}) => {
  return (
    <MainConceptViewStyled>
      <ConceptContent concept={concept} />
    </MainConceptViewStyled>
  )
}
