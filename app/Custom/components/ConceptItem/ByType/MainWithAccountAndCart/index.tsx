import { KbConceptMainWithAccountAndCartFragment } from 'app/Custom/interfaces/concepts'
import { MainWithAccountAndCartConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type MainWithAccountAndCartConceptViewProps = {
  concept: KbConceptMainWithAccountAndCartFragment
}

export const MainWithAccountAndCartConceptView: React.FC<
  MainWithAccountAndCartConceptViewProps
> = ({ concept }) => {
  return (
    <MainWithAccountAndCartConceptViewStyled>
      <ConceptContent concept={concept} />
    </MainWithAccountAndCartConceptViewStyled>
  )
}
