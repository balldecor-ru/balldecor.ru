import { KbConceptFragment } from 'app/gql/generated'
import { Hast } from '../Hast'
import { Markdown } from '../Markdown'

type ConceptContentProps = {
  concept: KbConceptFragment
}

export const ConceptContent: React.FC<ConceptContentProps> = ({ concept }) => {
  return concept.contentMode === 'hast' ? (
    <Hast tree={concept.hast} />
  ) : concept.content ? (
    <Markdown>{concept.content}</Markdown>
  ) : null
}
