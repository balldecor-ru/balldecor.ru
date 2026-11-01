import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const PriceListConceptViewStyled = styled.div`
  .prices-table {
    margin-block: var(--section-gap);
  }
  .prices-table dl {
    margin: 0;
  }
  .prices-table dt {
    display: flex;
    flex-wrap: wrap;
    align-items: baseline;
    gap: 12px;
    padding: 14px 0;
    border-bottom: 1px solid ${theme.colors.divider};
  }
  .starting-price {
    margin-inline-start: auto;
  }
  .prices-table dd {
    margin: 0;
    padding: 8px 16px;
  }
  #front-banner {
    margin-bottom: var(--section-gap);
  }
  .modal_discount,
  .modal_discount__rules {
    display: none;
  }
`
