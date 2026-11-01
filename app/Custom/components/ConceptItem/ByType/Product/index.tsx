/* eslint-disable no-console */
import { KbConceptProductFragment } from 'app/Custom/interfaces/concepts'
import { ProductConceptViewStyled } from './styles'
import { Markdown } from 'app/Custom/components/Markdown'
import { ConceptData } from 'app/Custom/hooks/useConceptData'

type ProductConceptViewProps = {
  concept: KbConceptProductFragment
  data: ConceptData
}

export const ProductConceptView: React.FC<ProductConceptViewProps> = ({
  concept,
  data,
}) => {
  console.log('ProductConceptView concept', concept)

  const { name, content, available, size, packCount, price } = concept

  const { imageSrc } = data

  return (
    <ProductConceptViewStyled>
      {imageSrc && <img src={imageSrc} title={name ?? undefined} alt={name} />}

      {content && <Markdown>{content}</Markdown>}
    </ProductConceptViewStyled>
  )
}
