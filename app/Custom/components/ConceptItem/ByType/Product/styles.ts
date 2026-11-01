import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const ProductConceptViewStyled = styled.div`
  &[data-variant='short'] {
    display: flex;
    flex-direction: column;
    gap: 12px;
    height: 100%;
    min-width: 0;
    padding: 16px;
    background: ${theme.colors.gray[50]};
    border-radius: ${theme.radii.lg};

    > a {
      flex: 1;
      color: inherit;
      text-decoration: none;
    }
    img {
      display: block;
      width: 100%;
      height: 160px;
      object-fit: contain;
    }
    h2 {
      margin: 12px 0 0;
      font-size: 18px;
      overflow-wrap: anywhere;
    }
    p {
      margin: 0;
    }
  }

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
