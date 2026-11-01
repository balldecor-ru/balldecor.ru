/* eslint-disable no-console */
import { AddProductButton } from '../../../Cart/AddProduct'
import type { KbConceptNoNestingFragment } from 'app/gql/generated'
import { Link } from 'react-router'
import { ProductConceptViewStyled } from './styles'
import { Markdown } from 'app/Custom/components/Markdown'
import { useConceptData } from 'app/Custom/hooks/useConceptData'
import { ConceptItemVariant } from '../../interfaces'

type ProductConceptViewProps = {
  concept: KbConceptNoNestingFragment
  variant: ConceptItemVariant
}

export const ProductConceptView: React.FC<ProductConceptViewProps> = ({
  concept,
  variant,
}) => {
  console.log('ProductConceptView concept', concept)

  const data = useConceptData({
    concept,
  })

  const { name, content, available, size, packCount, price } = concept

  const { imageSrc } = data

  const heading = (
    <>
      {imageSrc && (
        <img
          src={imageSrc}
          title={name ?? undefined}
          alt={name}
          loading={variant === 'short' ? 'lazy' : undefined}
        />
      )}
      <h2>{name}</h2>
    </>
  )

  return (
    <ProductConceptViewStyled data-variant={variant}>
      {variant === 'short' ? <Link to={concept.uri}>{heading}</Link> : heading}
      {price !== null && price !== undefined && (
        <p>{price.toLocaleString('ru-RU')} ₽</p>
      )}
      {size && <p>Размер {size}</p>}
      {packCount && <p>В упаковке {packCount} шт.</p>}
      {available === false && <p>Нет в наличии</p>}
      <AddProductButton product={concept} />
      {variant === 'full' && content && <Markdown>{content}</Markdown>}
    </ProductConceptViewStyled>
  )
}
