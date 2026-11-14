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

export const CategoryListStyled = styled.ul`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  gap: 24px;
  padding: 0;
  list-style: none;
  > li {
    min-width: 0;
  }
  > li > a {
    display: block;
    color: inherit;
    text-decoration: none;
  }
  img {
    width: 100%;
    height: 180px;
    object-fit: contain;
  }
  h2 {
    font-size: 20px;
  }
  @media (min-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  @media (min-width: 1000px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`
