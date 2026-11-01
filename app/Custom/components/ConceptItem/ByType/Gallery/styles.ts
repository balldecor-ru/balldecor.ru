import { styled } from '@linaria/react'
import { theme } from '../../../../theme'

export const GalleryConceptViewStyled = styled.div`
  .row img {
    width: 100%;
    aspect-ratio: 4/3;
    object-fit: cover;
    border-radius: ${theme.radii.lg};
  }
  .gal-delim {
    margin-top: var(--section-gap);
  }
`
