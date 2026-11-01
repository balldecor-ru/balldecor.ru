import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const ProductConceptViewStyled = styled.div`
  .product-card-page {
    align-items: start;
  }
  .product-card-page img {
    width: 100%;
    max-height: 65vh;
    object-fit: contain;
  }
  .product-page {
    padding: clamp(16px, 3vw, 36px);
    background: ${theme.colors.gray[50]};
    border-radius: ${theme.radii.lg};
  }
`
