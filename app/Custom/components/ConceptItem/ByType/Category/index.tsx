import { Link } from 'react-router'
import type { KbConceptCategoryFragment } from 'app/Custom/interfaces/concepts'
import { useConceptsQuery, type ConceptsQuery } from 'app/gql/generated'
import { CategoryConceptViewStyled, CategoryListStyled } from './styles'
import { getCategoryVariables } from './queryVariables'
import { ProductConceptView } from '../Product'
import { Markdown } from 'app/Custom/components/Markdown'
import { getResizedImagePath } from 'app/Custom/helpers/getResizedImagePath'
import { CustomKbConceptType } from 'app/Custom/interfaces/conceptType'

type CategoryConceptViewProps = {
  concept: KbConceptCategoryFragment
  initialItems?: ConceptsQuery['response']
}

export const CategoryConceptView: React.FC<CategoryConceptViewProps> = ({
  concept,
  initialItems = [],
}) => {
  const { data, error } = useConceptsQuery({
    variables: getCategoryVariables(concept.id),
    fetchPolicy: 'cache-and-network',
  })
  const items = data?.response ?? initialItems

  return (
    <CategoryConceptViewStyled>
      {concept.content && <Markdown>{concept.content}</Markdown>}
      {error ? (
        <p role="alert">
          Не удалось загрузить каталог. Попробуйте обновить страницу.
        </p>
      ) : (
        <>
          <CategoryListStyled aria-label="Каталог">
            {items.map((item) => (
              <li key={item.id}>
                {item.type ===
                CustomKbConceptType.OldPage31ModDocument.value ? (
                  <ProductConceptView concept={item} variant="short" />
                ) : (
                  <Link to={item.uri}>
                    {item.image && (
                      <img
                        src={getResizedImagePath({
                          path: item.image,
                          size: 'middle',
                        })}
                        alt=""
                        loading="lazy"
                      />
                    )}
                    <h2>{item.name}</h2>
                  </Link>
                )}
              </li>
            ))}
          </CategoryListStyled>
          {!items.length && <p>Ничего не найдено</p>}
        </>
      )}
    </CategoryConceptViewStyled>
  )
}
