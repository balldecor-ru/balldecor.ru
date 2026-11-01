import { KbConceptContactsFragment } from 'app/Custom/interfaces/concepts'
import { ContactsConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type ContactsConceptViewProps = {
  concept: KbConceptContactsFragment
}

export const ContactsConceptView: React.FC<ContactsConceptViewProps> = ({
  concept,
}) => {
  return (
    <ContactsConceptViewStyled>
      <ConceptContent concept={concept} />
    </ContactsConceptViewStyled>
  )
}
