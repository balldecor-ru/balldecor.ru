import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const GalleryCategoryConceptViewStyled = styled.div`
  .row a img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: ${theme.radii.lg};
  }
`
