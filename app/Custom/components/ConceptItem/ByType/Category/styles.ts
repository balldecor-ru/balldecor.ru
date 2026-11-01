import { styled } from '@linaria/react'

export const CategoryConceptViewStyled = styled.div`
  .cl-item {
    margin-block: 0.5rem;
  }
  @media (min-width: 800px) {
    .text > .row:has(> .col-md-9) {
      grid-template-columns: minmax(180px, 1fr) minmax(0, 3fr);
    }
  }
`
