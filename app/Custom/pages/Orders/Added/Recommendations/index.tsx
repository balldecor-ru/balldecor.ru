import type { OrderRecommendationsQuery } from 'app/gql/generated'
import { Carousel } from 'app/Custom/components/Carousel'
import { ProductConceptView } from 'app/Custom/components/ConceptItem/ByType/Product'
import { RecommendationsStyled } from './styles'

type RecommendationsProps = {
  products: OrderRecommendationsQuery['orderRecommendations']
}

export const Recommendations: React.FC<RecommendationsProps> = ({
  products,
}) => (
  <>
    {products.length > 0 && (
      <RecommendationsStyled aria-label="Рекомендации к добавленному товару">
        <h2>С этим товаром покупают</h2>
        <Carousel label="Товары, рекомендуемые к покупке">
          {products.map((product) => (
            <ProductConceptView
              key={product.id}
              concept={product}
              variant="short"
            />
          ))}
        </Carousel>
      </RecommendationsStyled>
    )}
  </>
)
