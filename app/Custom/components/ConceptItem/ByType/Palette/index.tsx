import { KbConceptPaletteFragment } from 'app/Custom/interfaces/concepts'
import { PaletteConceptViewStyled } from './styles'
import { ConceptContent } from 'app/Custom/components/ConceptContent'

type PaletteConceptViewProps = {
  concept: KbConceptPaletteFragment
}

function updateSummary(event: React.SyntheticEvent<HTMLDivElement>) {
  const input = event.target
  if (!(input instanceof HTMLInputElement) || !input.form) {
    return
  }
  const summaryIds: Record<string, string> = {
    'print-color[]': 'value-color',
    'print-type': 'value-type',
    amount: 'value-amount',
    'related[]': 'value-related',
  }
  const id = summaryIds[input.name]
  if (!id) {
    return
  }
  const summary = input.form.querySelector('#' + id)
  if (summary) {
    const values = new FormData(input.form).getAll(input.name)
    summary.textContent = values.filter(Boolean).join(', ') || 'не указано'
  }
}

export const PaletteConceptView: React.FC<PaletteConceptViewProps> = ({
  concept,
}) => {
  return (
    <PaletteConceptViewStyled onChange={updateSummary}>
      <ConceptContent concept={concept} />
    </PaletteConceptViewStyled>
  )
}
